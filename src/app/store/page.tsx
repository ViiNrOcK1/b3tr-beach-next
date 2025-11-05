<DOCUMENT filename="page.tsx">
"use client"; // Required for useState, useEffect, and client-side interactivity
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
import type { 
  CallResult,
  Window, 
  Product, 
  UserDetails, 
  Purchase, 
  CartItem, 
  RefetchRefs 
} from '@/types';



export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [thankYouProduct, setThankYouProduct] = useState<Product | null>(null);
  const [thankYouTxId, setThankYouTxId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formProduct, setFormProduct] = useState<Product>({
    id: 0,
    name: '',
    priceUSD: 0,
    priceB3TR: 0,
    description: '',
    soldOut: false,
  });
  const [editProductId, setEditProductId] = useState<number | string | null>(null);
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
  const formRef = useRef<HTMLFormElement>(null);
  const { account, signer, connect, disconnect } = useWallet();
  const thor = useThor();
  const { open: openWalletModal } = useWalletModal();
  const b3trContractAddress = '0x5ef79995FE8a089e0812330E4378eB2660ceDe699';
  const b3trDecimals = 18;

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);

  // Debounce refetch to prevent rapid calls
  const lastRefetch = useRef<number>(0);
  const debounceRefetch = useCallback((refetchFn: () => Promise<any>) => {
    const now = Date.now();
    if (now - lastRefetch.current > 10000) {
      lastRefetch.current = now;
      console.log('Executing refetch');
      return refetchFn();
    }
    console.log('Refetch debounced');
    return Promise.resolve();
  }, []);

  // Ref to store refetch functions
  const refetchRefs = useRef<RefetchRefs>({
    refetchB3TR: () => Promise.resolve({ data: null } as QueryObserverResult<string | null, Error>),
    refetchVTHO: () => Promise.resolve({ data: null } as QueryObserverResult<string | null, Error>),
    refetchReceipt: () => Promise.resolve({ data: null } as QueryObserverResult<TransactionReceipt | null, Error>),
  });

  // Initialize EmailJS
  useEffect(() => {
    console.log('Initializing EmailJS with public key: -yJ3RZmkCyvjwXcnb');
    try {
      emailjs.init('-yJ3RZmkCyvjwXcnb');
      console.log('EmailJS initialized successfully');
    } catch (err) {
      console.error('EmailJS initialization failed:', err);
      setError('Failed to initialize EmailJS. Please try again later.');
    }
  }, []);

  // Use useBeats only when transaction is pending
  const addresses = account && txId ? [account] : [];
  const beat = useBeats(addresses);

  useEffect(() => {
    if (beat && account && txId && !transactionComplete) {
      console.log('New block detected with pending transaction:', beat);
      debounceRefetch(refetchRefs.current.refetchReceipt);
    } else if (!beat && account && txId) {
      console.warn('WebSocket connection to beat2 failed, retrying...');
    }
  }, [beat, account, txId, transactionComplete, debounceRefetch]);

  // Fetch B3TR balance only on wallet connection or transaction
  const { data: balanceData, error: balanceError, refetch: initialRefetchB3TR } = useQuery({
    queryKey: ['b3trBalance', account],
    queryFn: async () => {
      if (!account || !thor) return null;
      console.log('Fetching B3TR balance for:', account);
      try {
        const result: CallResult = await thor.contracts.executeCall(
          b3trContractAddress,
          ABIItem.ofSignature(ABIFunction, 'function balanceOf(address owner) view returns (uint256)'),
          [Address.of(account).toString()]
        );
        console.log('Raw B3TR balance result:', result);
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
        console.log('Parsed B3TR balance value:', balanceValue);
        const balance = FixedPointNumber.of(balanceValue);
        const formattedBalance = Number(Units.formatUnits(balance, b3trDecimals)).toFixed(2);
        console.log('Formatted B3TR Balance:', formattedBalance);
        return formattedBalance;
      } catch (err) {
        console.error('B3TR balance query failed:', err);
        return null;
      }
    },
    enabled: !!account && !!thor,
    refetchInterval: false,
  });

  // Fetch VTHO balance only on wallet connection or transaction
  const { data: vthoData, error: vthoError, refetch: initialRefetchVTHO } = useQuery({
    queryKey: ['vthoBalance', account],
    queryFn: async () => {
      if (!account || !thor) return null;
      console.log('Fetching VTHO balance for:', account);
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

  // Track transaction status
  const { data: receipt, refetch: initialRefetchReceipt } = useQuery({
    queryKey: ['transaction', txId],
    queryFn: async () => {
      if (!txId || !thor) return null;
      console.log('Fetching transaction receipt for txId:', txId);
      try {
        const receipt = await thor.transactions.getTransactionReceipt(txId);
        console.log('Receipt fetched:', receipt);
        return receipt;
      } catch (err) {
        console.error('Transaction receipt query failed:', err);
        return null;
      }
    },
    refetchInterval: (query) => (query.state.data?.reverted !== undefined || transactionComplete ? false : 2000),
    placeholderData: (previousData) => previousData || null,
    enabled: !!txId && !!thor && !transactionComplete,
  });

  // Update refetch functions after initialization
  useEffect(() => {
    refetchRefs.current = { refetchB3TR: initialRefetchB3TR, refetchVTHO: initialRefetchVTHO, refetchReceipt: initialRefetchReceipt };
  }, [initialRefetchB3TR, initialRefetchVTHO, initialRefetchReceipt]);

  // Handle transaction receipt updates with error boundary
  const handleTransactionUpdate = useMemo(() => {
    return () => {
      console.log('handleTransactionUpdate triggered with receipt:', receipt, 'txId:', txId, 'selectedProduct:', selectedProduct, 'transactionComplete:', transactionComplete, 'showThankYou:', showThankYou);
      if (transactionComplete) return;
      if (!receipt || !selectedProduct || !txId || !account) return;
      try {
        const status = receipt.reverted ? 'reverted' : 'success';
        console.log('Transaction update status:', status);
        if (status === 'success') {
          setThankYouTxId(txId);
          setThankYouProduct(selectedProduct);
          setShowThankYou(true);
          setTransactionComplete(true);
          setPaymentStatus('Transaction completed successfully!');

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
              const emailPayload = {
                from_name: userDetails.name,
                to_name: userDetails.name,
                email: userDetails.email,
                userEmail: userDetails.email,
                to_email: userDetails.email,
                user_address: userDetails.address,
                itemName: selectedProduct.name,
                priceB3TR: `${selectedProduct.priceB3TR} B3TR`,
                totalPriceB3TR: `${selectedProduct.priceB3TR} B3TR`,
                transactionId: txId,
                shipping: 'Free',
                timestamp: new Date().toISOString(),
              };
              emailjs.send('B3TRBEACH', 'B3TRConfirm', emailPayload, '-yJ3RZmkCyvjwXcnb')
                .then(() => setEmailError(null))
                .catch((err) => {
                  console.error('Email send error:', err);
                  setEmailError(err.text || 'Failed to send confirmation email.');
                  setPaymentStatus('Transaction completed, but email failed. Contact support.');
                });
            })
            .catch((err) => {
              console.error('Firebase save error:', err);
              setPaymentStatus('Transaction completed, but save failed. Contact support.');
            });

          debounceRefetch(refetchRefs.current.refetchB3TR).then((result) => {
            const newBalance = result.data || '0';
            const balanceDifference = Number(balanceData || '0') - Number(newBalance);
            if (balanceDifference < selectedProduct.priceB3TR) {
              console.error('Insufficient balance change:', balanceDifference, selectedProduct.priceB3TR);
              setPaymentStatus('Error: Balance mismatch.');
            }
          }).catch((err) => console.error('Balance refetch error:', err));
        } else if (status === 'reverted') {
          setPaymentStatus('Payment failed: Transaction reverted.');
          setTransactionComplete(false);
          setShowThankYou(false);
          setTxId(null);
          setSelectedProduct(null);
          setThankYouTxId(null);
          setThankYouProduct(null);
        }
      } catch (err) {
        console.error('Error in handleTransactionUpdate:', err);
        setPaymentStatus('Error processing transaction.');
      }
    };
  }, [receipt, selectedProduct, txId, account, balanceData, userDetails, transactionComplete, debounceRefetch]);

  // Load products from Firebase
  useEffect(() => {
    const productsRef = ref(database, 'products');
    const listener = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedProducts = Object.keys(data).map(key => ({
          id: isNaN(Number(key)) ? key : Number(key),
          name: data[key].name || '',
          priceUSD: data[key].priceUSD || 0,
          priceB3TR: data[key].priceB3TR || 0,
          description: data[key].description || '',
          soldOut: data[key].soldOut || false,
        })).filter(p => p.name.trim());
        setProducts(loadedProducts);
      } else {
        setProducts([]);
      }
    }, (err) => {
      console.error('Firebase listener error:', err);
      setError(`Could not fetch products: ${err.message}`);
    });
    return () => off(productsRef, 'value', listener);
  }, []);

  // Handle auth state
  useEffect(() => {
    const init = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onAuthStateChanged(auth, (user) => setIsAdminLoggedIn(!!user));
    };
    init();
  }, []);

  const handleAdminLogin = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setShowLoginModal(false);
      setError(null);
    } catch (err) {
      setError('Login failed.');
      console.error('Login error:', err);
    }
  }, [loginEmail, loginPassword]);

  const handleAdminLogout = useCallback(async () => {
    if (window.confirm('Log out?')) {
      await signOut(auth);
      setShowManageForm(false);
    }
  }, []);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct.name.trim() || formProduct.priceUSD <= 0 || formProduct.priceB3TR <= 0) {
      alert('Fill all fields with valid values.');
      return;
    }
    try {
      if (editProductId !== null) {
        const productRef = ref(database, `products/${editProductId}`);
        await update(productRef, formProduct);
        setProducts(prev => prev.map(p => p.id === editProductId ? formProduct : p));
        setEditProductId(null);
      } else {
        const productsRef = ref(database, 'products');
        const newProductRef = push(productsRef);
        await set(newProductRef, { id: newProductRef.key || Date.now(), ...formProduct });
        if (!window.confirm('Add another?')) setShowManageForm(false);
        setFormProduct({ id: 0, name: '', priceUSD: 0, priceB3TR: 0, description: '', soldOut: false });
      }
      const snapshot = await get(ref(database, 'products'));
      setProducts(Object.keys(snapshot.val() || {}).map(key => ({
        id: isNaN(Number(key)) ? key : Number(key),
        ...snapshot.val()[key],
      })).filter(p => p.name.trim()));
    } catch (err) {
      console.error('Form submit error:', err);
      alert(`Failed: ${err.message}`);
    }
  }, [formProduct, editProductId]);

  const handleEditProduct = useCallback((product: Product) => {
    setEditProductId(product.id);
    setFormProduct(product);
    setShowManageForm(true);
  }, []);

  const handleDeleteProduct = useCallback(async (productId: number | string) => {
    if (window.confirm('Delete this product?')) {
      try {
        await remove(ref(database, `products/${productId}`));
        setProducts(prev => prev.filter(p => p.id !== productId));
      } catch (err) {
        console.error('Delete error:', err);
        alert(`Failed: ${err.message}`);
      }
    }
  }, []);

  const handlePurchase = useCallback((product: Product) => {
    if (!product.soldOut) {
      setPaymentStatus('');
      setEmailError(null);
      setSelectedProduct(product);
      setUserDetails({ name: '', email: '', address: '' });
      setShowThankYou(false);
      setTransactionComplete(false);
    } else {
      alert('Sold out!');
    }
  }, []);

  const handleB3TRPayment = useCallback(async () => {
    if (!account) {
      setPaymentStatus('Connect wallet.');
      openWalletModal();
      return;
    }
    if (!thor || !signer || !selectedProduct) {
      setPaymentStatus('Error: Missing components.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userDetails.email || !emailRegex.test(userDetails.email.trim())) {
      setPaymentStatus('Valid email required.');
      return;
    }
    if (!userDetails.address.trim()) {
      setPaymentStatus('Enter shipping address.');
      return;
    }
    if (balanceError || !balanceData) {
      setPaymentStatus('Balance fetch failed.');
      return;
    }
    if (Number(balanceData) < selectedProduct.priceB3TR) {
      setPaymentStatus(`Insufficient B3TR: ${selectedProduct.priceB3TR} needed, ${balanceData} available.`);
      return;
    }
    if (vthoError || !vthoData || Number(vthoData) < 1) {
      setPaymentStatus('Insufficient VTHO.');
      return;
    }
    try {
      const clause = Clause.callFungible(
        b3trContractAddress,
        RECIPIENT_ADDRESS,
        Units.parseUnits(selectedProduct.priceB3TR.toString(), b3trDecimals)
      );
      const tx = await signer.sendTransaction([clause]);
      setTxId(tx.id);
      setPaymentStatus(`Transaction sent: ${tx.id}. Awaiting confirmation...`);
    } catch (error) {
      setPaymentStatus(`Error: ${error.message || 'Unknown'}`);
      setTxId(null);
      setSelectedProduct(null);
    }
  }, [account, thor, signer, selectedProduct, userDetails, balanceError, balanceData, vthoError, vthoData, b3trContractAddress, RECIPIENT_ADDRESS]);

  const closeModal = useCallback(() => {
    setPaymentStatus('');
    setEmailError(null);
    setUserDetails({ name: '', email: '', address: '' });
    if (!showThankYou) {
      setTxId(null);
      setSelectedProduct(null);
    }
  }, [showThankYou]);

  const handleWalletConnect = useCallback(async () => {
    try {
      await connect('veworld');
      await debounceRefetch(refetchRefs.current.refetchB3TR);
      await debounceRefetch(refetchRefs.current.refetchVTHO);
    } catch (err) {
      console.error('Wallet connect failed:', err);
    }
  }, [connect, debounceRefetch]);

  const handleManageProductsClick = useCallback(() => {
    if (!isAdminLoggedIn) alert('Admin login required.');
    else setShowManageForm(true);
  }, [isAdminLoggedIn]);

  const handleViewTxClick = useCallback(() => {
    if (!isAdminLoggedIn) alert('Admin login required.');
    else window.location.href = '/transactions';
  }, [isAdminLoggedIn]);

  const handleDisconnect = useCallback(() => disconnect(), [disconnect]);

  const addToCart = useCallback((product: Product) => {
    if (product.soldOut) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: number | string, delta: number) => {
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0));
  }, []);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.priceB3TR * item.quantity, 0), [cart]);

  const makePurchase = useCallback(() => {
    if (cart.length === 0) return;
    setSelectedProduct({ ...cart[0], priceB3TR: cartTotal }); // Use first item as reference, adjust price
    handleB3TRPayment();
    setShowCartModal(false);
  }, [cart, cartTotal, handleB3TRPayment]);

  return (
    <>
      <Head>
        <title>B3TR BEACH Store</title>
      </Head>
      <div className="flex flex-col min-h-screen">
        <header className="py-48 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/assets/AltBEACHBanner.png')", backgroundSize: '1900px 700px' }}>
          <div className="container mx-auto px-4 text-center bg-opacity-30 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}>
            <div className="fade-content">
              <h1 className="text-6xl font-bold mb-4 text-outline-black text-white">
                <span className="text-custom-blue">B3TR</span>
                <span className="text-amber-400"> BEACH Store</span>
              </h1>
            </div>
          </div>
        </header>
        <section className="flex-grow wave-top wave-bottom min-h-[70vh] pt-16" style={{ backgroundImage: "url('/assets/SeaShell.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
          <div className="container mx-auto px-4 text-center">
            <div className="fade-content">
              <h2 className="text-4xl text-amber-400 font-bold mb-8 text-outline-black">
                Explore B3TR Rewards
              </h2>
              <p className="text-xl mb-6 text-outline-amber">
                Redeem B3TR Tokens for exclusive B3TR BEACH merchandise. Click below to start your purchase!
              </p>
              <p className="text-xl mb-4 text-outline-amber">
                Wallet Status: {account ? (
                  <span className="text-green-500 text-outline-black">Connected <button onClick={handleDisconnect} className="ml-2 bg-red-500 text-white px-2 py-1 rounded">Disconnect</button></span>
                ) : (
                  <span className="text-red-500">Not Connected</span>
                )}
              </p>
              {!account && <WalletButton />}
              {balanceError && <p className="text-xl mb-4 text-red-500">Error fetching B3TR: {balanceError.message}</p>}
              {balanceData !== null && <p className="text-xl mb-4">B3TR: {balanceData} B3TR</p>}
              {balanceData === null && !balanceError && <p className="text-xl mb-4 text-yellow-500">B3TR: Loading...</p>}
              {vthoError && <p className="text-xl mb-4 text-red-500">Error fetching VTHO: {vthoError.message}</p>}
              {vthoData && <p className="text-xl mb-4">VTHO: {vthoData} VTHO</p>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-custom-blue p-4 rounded-lg shadow text-center relative text-outline-black">
                    <p className="text-2xl font-bold text-white">
                      {product.name.split(' ').map((word, i) =>
                        word === 'BEACH' ? <span key={i} className="text-amber-400">{word}</span> : word + ' '
                      )}
                    </p>
                    <p className="text-xl text-white">{product.priceB3TR} B3TR</p>
                    <p className="text-xl text-white">{product.description}</p>
                    <button
                      type="button"
                      className={product.soldOut ? 'bg-red-500 text-black text-xl font-bold px-4 py-2 rounded-lg mt-4' : 'bg-amber-400 text-green-500 text-xl font-bold px-4 py-2 rounded-lg mt-4 hover:bg-black hover:text-green-500 text-outline-black'}
                      onClick={() => !product.soldOut && addToCart(product)}
                      disabled={product.soldOut}
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="bg-amber-400 text-green-500 text-2xl font-bold px-4 py-2 rounded-lg mt-4 hover:bg-black hover:text-green-500 text-outline-black"
                onClick={() => setShowCartModal(true)}
              >
                🛒 Cart {cart.length > 0 && <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">{cart.length}</span>}
              </button>
              <Link
                href="/"
                className="bg-amber-400 text-green-500 text-2xl font-bold px-4 py-2 rounded-lg mt-4 mb-12 inline-block hover:bg-black hover:text-green-500 text-outline-black"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        </section>
        <footer className="bg-custom-blue py-9 text-center wave-top min-h-[15vh]">
          <div className="container mx-auto px-4">
            <div className="fade-content">
              <p className="text-xl text-amber-400 text-outline-blue mb-4">
                © {new Date().getFullYear()} <span className="text-black">B3TR</span> BEACH. All rights reserved.
              </p>
              <div className="flex justify-center space-x-6">
                <Link href="#" className="text-white hover:text-green-500">Privacy Policy</Link>
                <Link href="#" className="text-white hover:text-green-500">Terms of Service</Link>
                <Link href="#" className="text-white hover:text-green-500" onClick={handleManageProductsClick}>Manage Products</Link>
                <Link href="#" className="text-white hover:text-green-500" onClick={handleViewTxClick}>View Tx</Link>
                <Link href="mailto:support@b3trbeach.org" className="text-white hover:text-green-500">Contact Us</Link>
                <Link href="#" className="text-white hover:text-green-500" onClick={isAdminLoggedIn ? handleAdminLogout : () => setShowLoginModal(true)}>Admin</Link>
              </div>
            </div>
          </div>
        </footer>
        {isAdminLoggedIn && showManageForm && editProductId === null && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-3/4">
              <h3 className="text-2xl font-bold mb-4 text-center">Manage Products - Add New</h3>
              <form onSubmit={handleFormSubmit} ref={formRef}>
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
                    onClick={() => setFormProduct({ ...formProduct, soldOut: !formProduct.soldOut })}
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
              <ul className="list-disc pl-5">
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
                        update(ref(database, `products/${product.id}`), { soldOut: newSoldOut });
                        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, soldOut: newSoldOut } : p));
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
        {isAdminLoggedIn && showManageForm && editProductId !== null && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-3/4">
              <h3 className="text-2xl font-bold mb-4 text-center">Manage Products - Edit</h3>
              <form onSubmit={handleFormSubmit} ref={formRef}>
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
                    onClick={() => setFormProduct({ ...formProduct, soldOut: !formProduct.soldOut })}
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
                  }}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
        {selectedProduct && !showThankYou && (
          <PurchaseModal
            selectedProduct={selectedProduct}
            userDetails={userDetails}
            setUserDetails={setUserDetails}
            paymentStatus={paymentStatus}
            account={account}
            formRef={formRef as React.RefObject<HTMLFormElement>}
            handleB3TRPayment={handleB3TRPayment}
            openWalletModal={openWalletModal}
            closeModal={closeModal}
          />
        )}
        {showThankYou && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
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
        {showLoginModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-white">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-3/4">
              <h3 className="text-2xl font-bold mb-4 text-center">Admin Login</h3>
              <form onSubmit={handleAdminLogin}>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Password</label>
                  <input
                    type="password"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button
                  type="submit"
                  className="bg-amber-400 text-green-500 px-4 py-2 rounded-lg font-bold hover:bg-black hover:text-green-500"
                >
                  Login
                </button>
                <button
                  type="button"
                  className="bg-gray-400 text-red-500 px-4 py-2 rounded-lg font-bold ml-2 hover:bg-red-600 hover:text-white"
                  onClick={() => setShowLoginModal(false)}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
        {showCartModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-3/4">
              <h3 className="text-2xl font-bold mb-4 text-center">Shopping Cart</h3>
              {cart.length === 0 ? (
                <p className="text-center">Your cart is empty.</p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center mb-4">
                      <span>{item.name} - {item.priceB3TR} B3TR x {item.quantity}</span>
                      <div>
                        <button
                          className="bg-green-500 text-white px-2 py-1 rounded-lg mr-2 hover:bg-green-600"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          +
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          -
                        </button>
                      </div>
                    </div>
                  ))}
                  <p className="text-xl font-bold mt-4">Total: {cartTotal} B3TR</p>
                  <button
                    className="bg-amber-400 text-green-500 px-4 py-2 rounded-lg mt-4 font-bold hover:bg-black hover:text-green-500"
                    onClick={makePurchase}
                  >
                    Make Purchase
                  </button>
                </>
              )}
              <button
                className="bg-gray-400 text-red-500 px-4 py-2 rounded-lg mt-4 font-bold hover:bg-red-600 hover:text-white"
                onClick={() => setShowCartModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
</DOCUMENT>