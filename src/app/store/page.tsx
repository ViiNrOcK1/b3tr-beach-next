// @ts-nocheck
"use client";
import Head from 'next/head';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, QueryObserverResult } from '@tanstack/react-query'; 
import { WalletButton, useWallet, useThor, useWalletModal } from '@vechain/dapp-kit-react';
import { Clause, Units, Address, ABIItem, ABIFunction, FixedPointNumber } from '@vechain/sdk-core';
import { TransactionReceipt } from '@vechain/sdk-network';
import emailjs from '@emailjs/browser';
import PurchaseModal from '@/components/PurchaseModal';
import ThankYouPage from '@/components/ThankYouPage';
import Link from 'next/link';
import { RECIPIENT_ADDRESS } from '@/app/config';
import { useBeats } from '@/hooks/useBeats';
import { auth, database } from '@/firebase';
import { ref, onValue, set, push, update, remove, off, get } from 'firebase/database';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

// --- SVG Icons for Cart ---
const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);


// Extend TransactionReceipt type
declare module '@vechain/sdk-network' {
  interface TransactionReceipt {
    transferSuccess?: boolean;
  }
}

// Custom type for executeCall result
interface CallResult {
  success: boolean;
  result?: bigint | { plain?: unknown; array?: unknown[] | undefined; errorMessage?: string | undefined } | string | undefined;
}

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
  };
}

// Product interface with id as number or string
interface Product {
  id: number | string;
  name: string;
  priceUSD: number;
  priceB3TR: number;
  description: string;
  soldOut?: boolean;
}

// --- NEW: CartItem Interface ---
interface CartItem extends Product {
  quantity: number;
}

interface UserDetails {
  name: string;
  email: string;
  address: string;
}

interface Purchase {
  item: string;
  amount: number;
  account: string;
  txId: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  userAddress: string;
}

interface RefetchRefs {
  refetchB3TR: () => Promise<QueryObserverResult<string | null, Error>>;
  refetchVTHO: () => Promise<QueryObserverResult<string | null, Error>>;
  refetchReceipt: () => Promise<QueryObserverResult<TransactionReceipt | null, Error>>;
}

// --- NEW: CartModal Component ---
interface CartModalProps {
  cart: CartItem[];
  onClose: () => void;
  onAdjustQuantity: (productId: string | number, newQuantity: number) => void;
  onCheckout: () => void;
  cartTotal: number;
}

function CartModal({ cart, onClose, onAdjustQuantity, onCheckout, cartTotal }: CartModalProps) {
  return (
    // FIX 1: Darkened backdrop
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-2xl font-bold mb-4 text-center">Your Cart</h3>
        
        {cart.length === 0 ? (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto mb-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b py-2">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.priceB3TR} B3TR</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onAdjustQuantity(item.id, item.quantity - 1)} 
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    {item.quantity === 1 ? <TrashIcon /> : <MinusIcon />}
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => onAdjustQuantity(item.id, item.quantity + 1)} 
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <>
            <div className="flex justify-between items-center text-xl font-bold my-4">
              <span>Total:</span>
              <span>{cartTotal} B3TR</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-amber-400 text-green-500 text-lg font-bold px-4 py-2 rounded-lg hover:bg-black hover:text-green-500"
            >
              Make Purchase
            </button>
          </>
        )}
        
        <button
          type="button"
          className="w-full bg-gray-400 text-red-500 px-4 py-2 rounded-lg font-bold mt-2 hover:bg-red-600 hover:text-white"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}


export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [thankYouProduct, setThankYouProduct] = useState<Product | null>(null);
  const [thankYouTxId, setThankYouTxId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formProduct, setFormProduct] = useState<Omit<Product, 'id'> & { id?: string | number }>({
    id: 0,
    name: '',
    priceUSD: 0,
    priceB3TR: 0,
    description: '',
    soldOut: false,
  });
  const [editProductId, setEditProductId] = useState<string | number | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    email: '',
    address: '',
  });
  const [showThankYou, setShowThankYou] = useState(false);
  const [showManageForm, setShowManageForm] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { account, signer, connect, disconnect } = useWallet();
  const thor = useThor();
  const { open: openWalletModal } = useWalletModal();
  const b3trContractAddress = '0x5ef79995FE8a89e0812330E4378eB2660ceDe699';
  const b3trDecimals = 18;

  const lastRefetch = useRef(0);
  const debounceRefetch = useCallback((refetchFn: () => Promise<any>) => {
    const now = Date.now();
    if (now - lastRefetch.current > 10000) {
      lastRefetch.current = now;
      return refetchFn();
    }
    return Promise.resolve();
  }, []);

  const refetchRefs = useRef<RefetchRefs>({
    refetchB3TR: () => Promise.resolve({ data: null } as QueryObserverResult<string | null, Error>),
    refetchVTHO: () => Promise.resolve({ data: null } as QueryObserverResult<string | null, Error>),
    refetchReceipt: () => Promise.resolve({ data: null } as QueryObserverResult<TransactionReceipt | null, Error>),
  });

  useEffect(() => {
    emailjs.init('-yJ3RZmkCyvjwXcnb');
  }, []);

  const addresses = account && txId ? [account] : [];
  const beat = useBeats(addresses);

  useEffect(() => {
    if (beat && account && txId && !transactionComplete) {
      debounceRefetch(refetchRefs.current.refetchReceipt);
    }
  }, [beat, account, txId, transactionComplete, debounceRefetch]);

  // FIX 2: Restored original working balance query
  const { data: balanceData, error: balanceError, refetch: initialRefetchB3TR } = useQuery({
    queryKey: ['b3trBalance', account],
    queryFn: async () => {
      if (!account || !thor) return null;
      try {
        const result: CallResult = await thor.contracts.executeCall(
          b3trContractAddress,
          ABIItem.ofSignature(ABIFunction, 'function balanceOf(address owner) view returns (uint256)'),
          [Address.of(account).toString()]
        );
        let balanceValue = '0';
        if (result.success && result.result !== undefined) {
          if (typeof result.result === 'bigint') {
            balanceValue = result.result.toString();
          } else if (typeof result.result === 'object' && 'plain' in result.result) {
            balanceValue = result.result.plain !== undefined ? String(result.result.plain) : '0';
          } else if (typeof result.result === 'string' && result.result.startsWith('0x')) {
            balanceValue = BigInt(result.result).toString();
          } else {
            console.warn('Unexpected B3TR balance result format:', result.result);
            return '0';
          }
        } else {
          console.warn('B3TR balance call failed or returned no result:', result);
          return '0';
        }
        const balance = FixedPointNumber.of(balanceValue);
        return Number(Units.formatUnits(balance, b3trDecimals)).toFixed(2);
      } catch (err) {
        console.error('B3TR balance query failed:', err);
        return null;
      }
    },
    enabled: !!account && !!thor,
    refetchInterval: false,
  });

  const { data: vthoData, error: vthoError, refetch: initialRefetchVTHO } = useQuery({
    queryKey: ['vthoBalance', account],
    queryFn: async () => {
      if (!account || !thor) return null;
      try {
        const accountInfo = await thor.accounts.getAccount(Address.of(account));
        const vthoBalance = FixedPointNumber.of(accountInfo.energy.toString());
        return Number(Units.formatUnits(vthoBalance, 18)).toFixed(2);
      } catch (err) {
        console.error('VTHO balance query failed:', err);
        return null;
      }
    },
    enabled: !!account && !!thor,
    refetchInterval: false,
  });

  const { data: receipt, refetch: initialRefetchReceipt } = useQuery({
    queryKey: ['transaction', txId],
    queryFn: async () => {
      if (!txId || !thor) return null;
      try {
        return await thor.transactions.getTransactionReceipt(txId);
      } catch (err) {
        console.error('Transaction receipt query failed:', err);
        return null;
      }
    },
    refetchInterval: (query) => (query.state.data?.reverted !== undefined || transactionComplete ? false : 2000),
    placeholderData: (previousData) => previousData || null,
    enabled: !!txId && !!thor && !transactionComplete,
  });

  useEffect(() => {
    refetchRefs.current = {
      refetchB3TR: initialRefetchB3TR as any, 
      refetchVTHO: initialRefetchVTHO as any,
      refetchReceipt: initialRefetchReceipt as any
    };
  }, [initialRefetchB3TR, initialRefetchVTHO, initialRefetchReceipt]);

  
  const handleTransactionUpdate = useCallback(() => {
    if (!receipt || !selectedProduct || !txId || !account || transactionComplete) return;

    const status = receipt.reverted ? 'reverted' : 'success';
    
    if (status === 'success') {
      setTransactionComplete(true);
      setPaymentStatus('Transaction completed successfully!');
      setThankYouTxId(txId);
      setThankYouProduct(selectedProduct);
      setShowThankYou(true);
      setCart([]); // Clear the cart

      const newPurchase: Purchase = {
        item: selectedProduct.name,
        amount: selectedProduct.priceB3TR,
        account,
        txId,
        timestamp: new Date().toISOString(),
        userName: userDetails.name,
        userEmail: userDetails.email,
        userAddress: userDetails.address,
      };

      const purchasesRef = ref(database, 'purchases');
      push(purchasesRef, newPurchase)
        .then(() => {
          console.log('Purchase recorded in Firebase');
          
          // --- FIX 6: Send email with JS object (emailjs.send) ---
          const emailPayload = {
            from_name: userDetails.name, // Use 'from_name' if your template expects it
            to_name: userDetails.name,
            email: userDetails.email,
            userEmail: userDetails.email,
            to_email: userDetails.email, // Send to the user's email
            user_address: userDetails.address,
            itemName: selectedProduct.name,
            priceB3TR: `${selectedProduct.priceB3TR} B3TR`,
            totalPriceB3TR: `${selectedProduct.priceB3TR} B3TR`,
            transactionId: txId, // Now txId is available
            shipping: 'Free',
            timestamp: new Date().toISOString(),
          };
          
          emailjs.send('B3TRBEACH', 'B3TRConfirm', emailPayload, '-yJ3RZmkCyvjwXcnb')
            .then((res) => {
              console.log('Confirmation email sent:', res.text);
              setEmailError(null);
            })
            .catch((err) => {
              console.error('Email send error:', err);
              setEmailError('Failed to send confirmation email.');
            });
        })
        .catch(err => console.error('Firebase save error:', err));
      
      debounceRefetch(refetchRefs.current.refetchB3TR);
      
    } else if (status === 'reverted') {
      setPaymentStatus('Payment failed: Transaction reverted.');
      setTxId(null);
      setSelectedProduct(null);
      setTransactionComplete(false);
    }
  }, [receipt, selectedProduct, txId, account, transactionComplete, userDetails, debounceRefetch]);


  useEffect(() => {
    if (receipt) {
      handleTransactionUpdate();
    }
  }, [receipt, handleTransactionUpdate]);


  useEffect(() => {
    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded: Product[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          name: value.name || 'Unnamed',
          priceUSD: value.priceUSD || 0,
          priceB3TR: value.priceB3TR || 0,
          description: value.description || '',
          soldOut: value.soldOut || false,
        }));
        setProducts(loaded);
      } else {
        setProducts([]);
      }
    }, (err) => {
        const firebaseErr = err as FirebaseError; // Cast to FirebaseError
        console.error('Firebase read error:', firebaseErr);
        if (firebaseErr.code !== 'permission_denied') {
            setError('Could not fetch products.');
        } else {
            setProducts([]); // Silently fail on permission denied
        }
    });

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdminLoggedIn(!!user);
    });

    return () => {
        unsubscribe(); // Detach the onValue listener
        authUnsubscribe(); // Detach the auth listener
    };
  }, []);

  // --- FIX 5: Re-added IntersectionObserver useEffect for fade-in ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-content');
    elements.forEach((element) => observer.observe(element));
    
    return () => {
      elements.forEach((element) => observer.unobserve(element));
    };
  }, []); // Run this once on mount

  const handleAdminLogin = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setShowLoginModal(false);
      setError(null);
    } catch (err) {
      setError('Login failed. Check credentials.');
      console.error('Login error:', err);
    }
  }, [loginEmail, loginPassword]);

  const handleAdminLogout = useCallback(async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await signOut(auth);
      setShowManageForm(false);
    }
  }, []);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct.name || formProduct.priceUSD <= 0 || formProduct.priceB3TR <= 0) {
      alert('Please fill in all fields with valid values.');
      return;
    }

    const productData = {
        name: formProduct.name,
        priceUSD: formProduct.priceUSD,
        priceB3TR: formProduct.priceB3TR,
        description: formProduct.description,
        soldOut: formProduct.soldOut || false,
    };

    try {
        if (editProductId) {
            const productRef = ref(database, `products/${editProductId}`);
            await update(productRef, productData);
        } else {
            const productsRef = ref(database, 'products');
            const newProductRef = push(productsRef);
            await set(newProductRef, productData);
        }
        setFormProduct({ name: '', priceUSD: 0, priceB3TR: 0, description: '', soldOut: false });
        setEditProductId(null);
        setShowManageForm(false);
    } catch (err) {
        console.error("Firebase write error:", err);
        alert("Failed to save product.");
    }
  }, [formProduct, editProductId]);


  const handleEditProduct = useCallback((product: Product) => {
    setEditProductId(product.id);
    setFormProduct({ ...product }); // Spread the product to fill the form
    setShowManageForm(true);
  }, []);

  const handleDeleteProduct = useCallback(async (productId: string | number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const productRef = ref(database, `products/${productId}`);
      await remove(productRef);
    }
  }, []);

  const addToCart = useCallback((product: Product) => {
    if (product.soldOut) return;
    setCart((prev: CartItem[]) => { // Added type
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const adjustQuantity = useCallback((productId: string | number, newQuantity: number) => {
    setCart((prevCart: CartItem[]) => { // Added type
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.id !== productId);
      }
      return prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  }, []);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.priceB3TR * item.quantity, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const handleCheckout = useCallback(() => { // Replaced makePurchase
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    const virtualProduct: Product = {
      id: 'cart-summary',
      name: `B3TR BEACH Order (${cartItemCount} Item${cartItemCount > 1 ? 's' : ''})`,
      priceUSD: cart.reduce((total, item) => total + (item.priceUSD * item.quantity), 0),
      priceB3TR: cartTotal,
      description: cart.map(item => `${item.name} (x${item.quantity})`).join(', '),
      soldOut: false
    };
    setSelectedProduct(virtualProduct);
    setPaymentStatus('');
    setEmailError(null);
    setUserDetails({ name: '', email: '', address: '' });
    setShowThankYou(false);
    setTransactionComplete(false);
    setThankYouTxId(null);
    setThankYouProduct(null);
    setShowCartModal(false);
  }, [cart, cartTotal, cartItemCount]);


  // --- FIX 3: Restored original, working handleB3TRPayment ---
  const handleB3TRPayment = useCallback(async () => {
    if (!account) {
      openWalletModal();
      return;
    }
    if (!thor || !signer || !selectedProduct) {
        alert("Payment system error. Please refresh.");
        return;
    }
    if (!userDetails.name || !userDetails.email || !userDetails.address.trim()) {
        alert("Please fill in your name, email, and address.");
        return;
    }
    if (balanceData === null || Number(balanceData) < selectedProduct.priceB3TR) {
        alert(`Insufficient B3TR balance. Required: ${selectedProduct.priceB3TR}`);
        return;
    }
    if (vthoData === null || Number(vthoData) < 1) {
        alert("Insufficient VTHO for transaction fees.");
        return;
    }

    setPaymentStatus('Processing transaction...');
    
    // This is the transaction object from your "original" working file
    const tx = {
      clauses: [
        Clause.callFunction(
          Address.of(b3trContractAddress),
          ABIItem.ofSignature(ABIFunction, 'function transfer(address to, uint256 amount) returns (bool)'),
          [Address.of(RECIPIENT_ADDRESS).toString(), Units.parseUnits(selectedProduct.priceB3TR.toString(), b3trDecimals).toString()]
        ),
      ],
      chainTag: 0x186a9,
      blockRef: '0x0000000000000000',
      expiration: 32,
      gas: 150000,
      gasPriceCoef: 128,
      nonce: Math.floor(Math.random() * 1000000000),
      dependsOn: undefined,
    };

    try {
      // This is the DAppKit flow that uses the transaction object
      const txId = await signer.signTransaction(tx);
      if (!txId) {
        throw new Error('No transaction ID returned');
      }
      setTxId(txId);
      setPaymentStatus(`Transaction sent: ${txId}. Awaiting confirmation...`);
    } catch (error: any) {
      setPaymentStatus(`Error: ${error.message || 'Transaction failed.'}`);
      console.error('Payment failed:', error);
    }
  }, [account, thor, signer, selectedProduct, userDetails, balanceData, vthoData, openWalletModal]); // Added openWalletModal

  const closeModal = useCallback(() => {
    setSelectedProduct(null);
    setPaymentStatus('');
    setTxId(null);
    setUserDetails({ name: '', email: '', address: '' });
    setTransactionComplete(false);
    setThankYouProduct(null);
    setThankYouTxId(null);
  }, []);

  const handleWalletConnect = useCallback(async () => {
    try {
      await connect('veworld');
    } catch (err) {
      console.error('Manual connect failed:', err);
    }
  }, [connect]);

  const handleManageProductsClick = useCallback(() => {
    if (!isAdminLoggedIn) {
      setShowLoginModal(true);
    } else {
      setShowManageForm(true);
    }
  }, [isAdminLoggedIn]);

  const handleViewTxClick = useCallback(() => {
    if (!isAdminLoggedIn) {
      setShowLoginModal(true);
    } else {
      window.location.href = '/transactions';
    }
  }, [isAdminLoggedIn]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return (
    <>
      <Head><title>B3TR BEACH Store</title></Head>
      <div className="flex flex-col min-h-screen">
        <header className="py-48 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/assets/AltBEACHBanner.png')", backgroundSize: '1900px 700px' }}>
          <div className="container mx-auto px-4 text-center">
            <div className="fade-content">
              <h1 className="text-6xl font-bold mb-4 text-outline-black text-white">
                <span className="text-custom-blue">B3TR</span>
                <span className="text-amber-400"> BEACH Store</span>
              </h1>
            </div>
          </div>
        </header>
        <section className="flex-grow wave-top wave-bottom min-h-[70vh] pt-16" style={{ backgroundImage: "url('/assets/SeaShell.png')", backgroundSize: 'cover' }}>
          <div className="container mx-auto px-4 text-center">
            <div className="fade-content">
              <h2 className="text-4xl text-amber-400 font-bold mb-8 text-outline-black">
                Explore B3TR Rewards
              </h2>
              <p className="text-xl mb-6 text-outline-amber">
                Redeem B3TR Tokens for exclusive B3TR BEACH merchandise.
              </p>
              <p className="text-xl mb-4 text-outline-amber">
                Wallet Status: {account ? (
                  <span className="text-green-500 text-outline-black">Connected <button onClick={handleDisconnect} className="ml-2 bg-red-500 text-white px-2 py-1 rounded">Disconnect</button></span>
                ) : (
                  <span className="text-red-500">Not Connected</span>
                )}
              </p>
              {!account && <WalletButton />}
              
              {/* --- FIX 2: Restored Balance Display Logic --- */}
              {balanceError && (
                <p className="text-xl mb-4 text-red-500">
                  Error fetching B3TR balance.
                </p>
              )}
              {account && balanceData !== null && balanceData !== undefined && (
                <p className="text-xl mb-4">
                  B3TR Balance: {balanceData} <span className="text-custom-blue text-outline-amber">B3TR</span>
                </p>
              )}
              {account && balanceData === null && !balanceError && (
                <p className="text-xl mb-4 text-yellow-500 text-outline-amber">
                  B3TR Balance: Loading...
                </p>
              )}
              {vthoError && (
                <p className="text-xl mb-4 text-red-500">Error fetching VTHO balance.</p>
              )}
              {account && vthoData && (
                <p className="text-xl mb-4">
                  VTHO Balance: {vthoData} VTHO
                </p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.length > 0 ? products.map((product) => (
                  <div key={product.id} className="bg-custom-blue p-4 rounded-lg shadow text-center">
                    <p className="text-2xl font-bold text-white">
                      {product.name.split(' ').map((word, i) =>
                        word === 'BEACH' ? <span key={i} className="text-amber-400">{word}</span> : word + ' '
                      )}
                    </p>
                    <p className="text-xl text-white">{product.priceB3TR} B3TR</p>
                    <p className="text-xl text-white">{product.description}</p>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.soldOut}
                      className={`text-2xl font-bold px-4 py-2 rounded-lg mt-4 ${product.soldOut ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-amber-400 text-green-500 hover:bg-black hover:text-green-500'}`}
                    >
                      {product.soldOut ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                )) : <p className="text-xl">Loading products...</p>}
              </div>
              <Link
                href="/"
                className="bg-amber-400 text-green-500 text-2xl font-bold px-4 py-2 rounded-lg mt-4 mb-12 inline-block"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        </section>
        <footer className="bg-custom-blue py-9 text-center wave-top">
          <div className="container mx-auto px-4">
            <div className="fade-content">
              <p className="text-xl text-amber-400 text-outline-blue mb-4">
                © {new Date().getFullYear()} <span className="text-black">B3TR</span> BEACH. All rights reserved.
              </p>
              <div className="flex justify-center space-x-6">
                <Link href="#" className="text-white hover:text-green-500">Privacy Policy</Link>
                <Link href="#" className="text-white hover:text-green-500">Terms of Service</Link>
                {/* --- FIX 4: Changed Links to buttons --- */}
                <button className="text-white hover:text-green-500 bg-transparent border-none p-0 cursor-pointer" onClick={handleManageProductsClick}>Manage Products</button>
                <button className="text-white hover:text-green-500 bg-transparent border-none p-0 cursor-pointer" onClick={handleViewTxClick}>View Tx</button>
                <Link href="mailto:support@b3trbeach.org" className="text-white hover:text-green-500">Contact Us</Link>
                <button className="text-white hover:text-green-500 bg-transparent border-none p-0 cursor-pointer" onClick={() => isAdminLoggedIn ? handleAdminLogout() : setShowLoginModal(true)}>Admin</button>
              </div>
            </div>
          </div>
        </footer>

        {/* --- MODALS --- */}

        {/* Cart Modal */}
        {showCartModal && (
          <CartModal
            cart={cart}
            onClose={() => setShowCartModal(false)}
            onAdjustQuantity={adjustQuantity}
            onCheckout={handleCheckout} // Use handleCheckout
            cartTotal={cartTotal}
          />
        )}

        {/* Login Modal */}
        {showLoginModal && (
          // FIX 1: Darkened backdrop
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Admin Login</h3>
              <form onSubmit={handleAdminLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                  required
                />
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Login</button>
                <button type="button" onClick={() => setShowLoginModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
              </form>
            </div>
          </div>
        )}

        {/* --- FIX 3: Restored original Manage Products Modals (with scroll fix) --- */}
        {/* Manage Products Modal (Add) */}
        {isAdminLoggedIn && showManageForm && !editProductId && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
            {/* FIX 1: Added overflow-y-auto and max-h-[90vh] for mobile scrolling */}
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4 text-center">Manage Products - Add New</h3>
              <form onSubmit={handleFormSubmit}>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formProduct.name}
                    onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Price (USD)</label>
                  <input
                    type="number"
                    name="priceUSD"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formProduct.priceUSD}
                    onChange={(e) => setFormProduct({ ...formProduct, priceUSD: Number(e.target.value) || 0 })}
                    required
                    min="0"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Price (B3TR)</label>
                  <input
                    type="number"
                    name="priceB3TR"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formProduct.priceB3TR}
                    onChange={(e) => setFormProduct({ ...formProduct, priceB3TR: Number(e.target.value) || 0 })}
                    required
                    min="0"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Description</label>
                  <textarea
                    name="description"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formProduct.description}
                    onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Status</label>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${formProduct.soldOut ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} hover:${formProduct.soldOut ? 'bg-red-600' : 'bg-green-600'}`}
                    onClick={() => {
                      setFormProduct(prev => ({ ...prev, soldOut: !prev.soldOut }));
                    }}
                  >
                    {formProduct.soldOut ? 'In Stock' : 'Sold Out'}
                  </button>
                </div>
                <button
                  type="submit"
                  className="bg-amber-400 text-green-500 px-4 py-2 rounded-lg font-bold hover:bg-black hover:text-green-500"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  className="bg-gray-400 text-red-500 px-4 py-2 rounded-lg font-bold ml-2 hover:bg-red-600 hover:text-white"
                  onClick={() => setShowManageForm(false)}
                >
                  Close
                </button>
              </form>
              <h4 className="text-xl font-semibold mt-6 mb-4">Existing Products</h4>
              {/* FIX 1: Added max-h-48 for list scrolling */}
              <ul className="list-disc pl-5 max-h-48 overflow-y-auto">
                {products.map((product) => (
                  <li key={product.id} className="mb-2">
                    {product.name} - ${product.priceUSD} (${product.priceB3TR} B3TR)
                    <button
                      className="bg-amber-400 text-green-500 px-2 py-1 rounded-lg ml-2 hover:bg-black hover:text-green-500"
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded-lg ml-2 hover:bg-red-600"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </button>
                    <button
                      className={`ml-2 px-2 py-1 rounded-lg ${product.soldOut ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} hover:${product.soldOut ? 'bg-red-600' : 'bg-green-600'}`}
                      onClick={() => {
                        const newSoldOut = !product.soldOut;
                        const productRef = ref(database, `products/${product.id}`);
                        update(productRef, { soldOut: newSoldOut });
                      }}
                    >
                      {product.soldOut ? 'In Stock' : 'Sold Out'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Manage Products Modal (Edit) */}
        {isAdminLoggedIn && showManageForm && editProductId && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
            {/* FIX 1: Added overflow-y-auto and max-h-[90vh] for mobile scrolling */}
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4 text-center">Manage Products - Edit</h3>
              <form onSubmit={handleFormSubmit}>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formProduct.name}
                    onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Price (USD)</label>
                  <input
                    type="number"
                    name="priceUSD"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formProduct.priceUSD}
                    onChange={(e) => setFormProduct({ ...formProduct, priceUSD: Number(e.target.value) || 0 })}
                    required
                    min="0"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Price (B3TR)</label>
                  <input
                    type="number"
                    name="priceB3TR"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formProduct.priceB3TR}
                    onChange={(e) => setFormProduct({ ...formProduct, priceB3TR: Number(e.target.value) || 0 })}
                    required
                    min="0"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Description</label>
                  <textarea
                    name="description"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formProduct.description}
                    onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Status</label>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${formProduct.soldOut ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} hover:${formProduct.soldOut ? 'bg-red-600' : 'bg-green-600'}`}
                    onClick={() => {
                      setFormProduct(prev => ({ ...prev, soldOut: !prev.soldOut }));
                    }}
                  >
                    {formProduct.soldOut ? 'In Stock' : 'Sold Out'}
                  </button>
                </div>
                <button
                  type="submit"
                  className="bg-amber-400 text-green-500 px-4 py-2 rounded-lg font-bold hover:bg-black hover:text-green-500"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="bg-gray-400 text-red-500 px-4 py-2 rounded-lg font-bold ml-2 hover:bg-red-600 hover:text-white"
                  onClick={() => {
                    setShowManageForm(false);
                    setEditProductId(null);
                    setFormProduct({ name: '', priceUSD: 0, priceB3TR: 0, description: '', soldOut: false });
                  }}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Purchase Modal */}
        {selectedProduct && !showThankYou && !showCartModal && (
          <PurchaseModal
            selectedProduct={selectedProduct}
            userDetails={userDetails}
            setUserDetails={setUserDetails}
            paymentStatus={paymentStatus}
            account={account}
            formRef={formRef}
            handleB3TRPayment={handleB3TRPayment}
            openWalletModal={openWalletModal}
            closeModal={closeModal}
            cartTotal={cartTotal} // Pass cartTotal
          />
        )}
        
        {/* Thank You Modal */}
        {showThankYou && (
          // FIX 1: Darkened backdrop
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-3/4 text-center overflow-auto">
              <ThankYouPage
                txId={thankYouTxId}
                selectedProduct={thankYouProduct}
                userDetails={userDetails}
                emailError={emailError}
                onClose={() => {
                  setShowThankYou(false);
                  setTxId(null);
                  setSelectedProduct(null);
                  setThankYouTxId(null);
                  setThankYouProduct(null);
                  setUserDetails({ name: '', email: '', address: '' });
                  setTransactionComplete(false);
                  setEmailError(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Floating Cart Button */}
        <button
          onClick={() => setShowCartModal(true)}
          className="fixed bottom-6 right-6 bg-custom-blue text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 z-40"
          aria-label="Open Cart"
        >
          <CartIcon />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>

      </div>
      
      {/* --- FIX 5: Added global style for fade-in --- */}
      <style jsx global>{`
        .fade-content {
          opacity: 0;
          transition: opacity 1s ease-in-out;
        }
        .fade-content.fade-in {
          opacity: 1;
        }
      `}</style>
    </>
  );
}