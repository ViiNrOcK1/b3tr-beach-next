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
  const b3trContractAddress = '0x5ef79995FE8a89e0812330E4378eB2660ceDe699';
  const b3trDecimals = 18;

  // Debounce refetch to prevent rapid calls
  const lastRefetch = useRef<number>(0);
  const debounceRefetch = useCallback((refetchFn: () => Promise<any>) => {
    const now = Date.now();
    if (now - lastRefetch.current > 10000) { // 10-second debounce
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
    refetchInterval: false, // Disable automatic refetching
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
    refetchInterval: false, // Disable automatic refetching
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

  // Ensure ThankYouPage modal persists
  useEffect(() => {
    if (showThankYou) {
      console.log('ThankYouPage modal opened, setting minimum display timeout');
      const timer = setTimeout(() => {
        console.log('ThankYouPage minimum display timeout completed');
      }, 30000); // 30-second minimum display
      return () => clearTimeout(timer);
    }
  }, [showThankYou]);

  // Handle transaction receipt updates with error boundary
  const handleTransactionUpdate = useMemo(() => {
    return () => {
      console.log('handleTransactionUpdate triggered with receipt:', receipt, 'txId:', txId, 'selectedProduct:', selectedProduct, 'transactionComplete:', transactionComplete, 'showThankYou:', showThankYou);
      if (transactionComplete) {
        console.log('Transaction already complete, skipping update');
        return;
      }
      if (!receipt || !selectedProduct || !txId || !account) {
        console.log('handleTransactionUpdate condition not met:', { receipt, selectedProduct, txId, account });
        return;
      }
      try {
        const status = receipt.reverted ? 'reverted' : 'success';
        console.log('Transaction update status:', status);
        if (status === 'success') {
          console.log('Transaction successful, setting ThankYouPage states');
          // Set ThankYouPage states
          setThankYouTxId(txId);
          setThankYouProduct({ ...selectedProduct });
          setShowThankYou(true);
          setTransactionComplete(true);
          setPaymentStatus('Transaction completed successfully!');

          // Save to Firebase and send email
          console.log('Saving purchase and sending email');
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
              // Send email with template-compatible fields
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
              console.log('Attempting to send EmailJS confirmation with payload:', emailPayload);
              try {
                emailjs
                  .send('B3TRBEACH', 'B3TRConfirm', emailPayload, '-yJ3RZmkCyvjwXcnb')
                  .then((response) => {
                    console.log('Confirmation email sent:', response.status, response.text);
                    setEmailError(null);
                  })
                  .catch((err) => {
                    console.error('Email send error:', err, 'Error details:', err.text || err.message);
                    setEmailError(err.text || err.message || 'Failed to send confirmation email.');
                    setPaymentStatus('Transaction completed, but failed to send confirmation email. Please contact support.');
                  });
              } catch (err) {
                console.error('EmailJS send failed with uncaught error:', err);
                setEmailError('Uncaught error sending email.');
                setPaymentStatus('Transaction completed, but failed to send confirmation email. Please contact support.');
              }
            })
            .catch(err => {
              console.error('Firebase save error:', err);
              setPaymentStatus('Transaction completed, but failed to record purchase. Contact support.');
            });

          // Refetch balance after transaction
          console.log('Refetching balance post-transaction');
          debounceRefetch(refetchRefs.current.refetchB3TR).then((result) => {
            const newBalance = result.data || '0';
            const balanceDifference = Number(balanceData || '0') - Number(newBalance);
            console.log('Balance check:', { balanceDifference, required: selectedProduct.priceB3TR, newBalance, previousBalance: balanceData });
            if (balanceDifference < selectedProduct.priceB3TR) {
              console.error('Insufficient balance difference:', { balanceDifference, required: selectedProduct.priceB3TR });
              setPaymentStatus('Error: Insufficient balance change detected.');
              // Do not reset critical states
            }
          }).catch(err => {
            console.error('Balance refetch error:', err);
            setPaymentStatus('Error checking balance. Transaction completed, but verification failed.');
            // Do not reset critical states
          });
        } else if (status === 'reverted') {
          console.log('Transaction reverted');
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
        setPaymentStatus('Error processing transaction. Please try again.');
        // Do not reset critical states
      }
    };
  }, [receipt, selectedProduct, txId, account, balanceData, userDetails, transactionComplete, debounceRefetch]);

  // Load products from Firebase with real-time updates
  useEffect(() => {
    console.log('Setting up Firebase products listener');
    const productsRef = ref(database, 'products');
    const listener = onValue(productsRef, (snapshot) => {
      console.log('Firebase onValue triggered');
      const data = snapshot.val();
      console.log('Firebase snapshot data:', data);
      if (data) {
        const loadedProducts = Object.keys(data).map(key => {
          const productData = data[key];
          const id = isNaN(Number(key)) ? key : Number(key);
          console.log(`Loading product with id: ${id}, name: ${productData.name}, key: ${key}`);
          return {
            id,
            name: productData.name || '',
            priceUSD: productData.priceUSD || 0,
            priceB3TR: productData.priceB3TR || 0,
            description: productData.description || '',
            soldOut: productData.soldOut || false,
          };
        }).filter(p => p && p.name && typeof p.name.trim === 'function' && p.name.trim() !== '');
        console.log('Loaded products:', loadedProducts);
        setProducts(loadedProducts);
      } else {
        console.log('No products found in Firebase');
        setProducts([]);
      }
    }, (err) => {
      const firebaseErr = err as FirebaseError;
      console.error('Firebase listener error:', firebaseErr);
      setError(`Could not fetch products: ${firebaseErr.message}`);
    });
    return () => {
      console.log('Cleaning up Firebase products listener');
      off(productsRef, 'value', listener);
    };
  }, []);

  // Handle auth state for admin functionality
  useEffect(() => {
    console.log('Setting up Firebase auth listener');
    const init = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('Auth state changed, user:', user ? 'logged in' : 'not logged in');
        setIsAdminLoggedIn(!!user);
      });
      return () => {
        console.log('Cleaning up Firebase auth listener');
        unsubscribe();
      };
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
      console.log('Admin login successful');
    } catch (err) {
      setError('Login failed. Check credentials or network connection.');
      console.error('Login error:', err);
    }
  }, [loginEmail, loginPassword]);

  const handleAdminLogout = useCallback(async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await signOut(auth);
      setShowManageForm(false);
      console.log('Admin logged out');
    }
  }, []);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submit triggered, formProduct:', formProduct, 'editProductId:', editProductId);
    if (!formProduct.name.trim() || formProduct.priceUSD <= 0 || formProduct.priceB3TR <= 0) {
      alert('Please fill in all fields with valid values.');
      return;
    }
    try {
      if (editProductId !== null) {
        const productRef = ref(database, `products/${editProductId}`);
        console.log(`Updating product with id: ${editProductId}`);
        await update(productRef, {
          name: formProduct.name,
          priceUSD: formProduct.priceUSD,
          priceB3TR: formProduct.priceB3TR,
          description: formProduct.description,
          soldOut: formProduct.soldOut,
        });
        console.log('Firebase update successful for edit');
        const snapshot = await get(productRef);
        const updatedProduct = snapshot.val();
        console.log('Updated product from Firebase:', updatedProduct);
        setProducts(prevProducts =>
          prevProducts.map(p =>
            p.id === editProductId ? { id: editProductId, ...updatedProduct } : p
          )
        );
        setEditProductId(null);
      } else {
        const productsRef = ref(database, 'products');
        const newProductRef = push(productsRef);
        const newId = newProductRef.key || Date.now().toString();
        console.log(`Adding new product with id: ${newId}`);
        await set(newProductRef, {
          id: newId,
          name: formProduct.name,
          priceUSD: formProduct.priceUSD,
          priceB3TR: formProduct.priceB3TR,
          description: formProduct.description,
          soldOut: formProduct.soldOut,
        });
        console.log('New product added to Firebase');
        if (!window.confirm('Product added successfully! Add another?')) {
          setShowManageForm(false);
        }
        setFormProduct({ id: 0, name: '', priceUSD: 0, priceB3TR: 0, description: '', soldOut: false });
      }
      const productsRef = ref(database, 'products');
      const snapshot = await get(productsRef);
      const data = snapshot.val();
      if (data) {
        const updatedProducts = Object.keys(data).map(key => {
          const productData = data[key];
          const id = isNaN(Number(key)) ? key : Number(key);
          return {
            id,
            name: productData.name || '',
            priceUSD: productData.priceUSD || 0,
            priceB3TR: productData.priceB3TR || 0,
            description: productData.description || '',
            soldOut: productData.soldOut || false,
          };
        }).filter(p => p && p.name && typeof p.name.trim === 'function' && p.name.trim() !== '');
        console.log('Refreshed products:', updatedProducts);
        setProducts(updatedProducts);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Form submission error:', err);
      if (errorMsg && !errorMsg.includes('Cannot read properties of undefined')) {
        alert(`Failed to save product: ${errorMsg}. Check console for details.`);
      }
    }
  }, [formProduct, editProductId]);

  const handleEditProduct = useCallback((product: Product) => {
    console.log('Edit product triggered, product:', product);
    setEditProductId(product.id);
    setFormProduct({ ...product });
    setShowManageForm(true);
  }, []);

  const handleDeleteProduct = useCallback(async (productId: number | string) => {
    console.log('Delete product triggered, productId:', productId);
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const productRef = ref(database, `products/${productId}`);
        console.log(`Attempting to delete product with id: ${productId}`);
        await remove(productRef);
        console.log('Product deletion successful in Firebase');
        const productsRef = ref(database, 'products');
        const snapshot = await get(productsRef);
        const data = snapshot.val();
        if (data) {
          const updatedProducts = Object.keys(data).map(key => {
            const productData = data[key];
            const id = isNaN(Number(key)) ? key : Number(key);
            return {
              id,
              name: productData.name || '',
              priceUSD: productData.priceUSD || 0,
              priceB3TR: productData.priceB3TR || 0,
              description: productData.description || '',
              soldOut: productData.soldOut || false,
            };
          }).filter(p => p && p.name && typeof p.name.trim === 'function' && p.name.trim() !== '');
          console.log('Updated products after deletion:', updatedProducts);
          setProducts(updatedProducts);
        } else {
          console.log('No products remain in Firebase');
          setProducts([]);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('Delete error:', err);
        if (errorMsg && !errorMsg.includes('Cannot read properties of undefined')) {
          alert(`Failed to delete product: ${errorMsg}. Check console for details.`);
        }
      }
    }
  }, []);

  const handlePurchase = useCallback((product: Product) => {
    console.log('Buy Now clicked for:', JSON.stringify(product), { account });
    if (!product.soldOut) {
      setPaymentStatus('');
      setEmailError(null);
      setSelectedProduct({ ...product });
      setUserDetails({ name: '', email: '', address: '' });
      setShowThankYou(false);
      setTransactionComplete(false);
      setThankYouTxId(null);
      setThankYouProduct(null);
      console.log('Selected product updated to:', product, 'Modal should appear now');
    } else {
      alert('This product is sold out!');
    }
  }, [account]);

  const handleB3TRPayment = useCallback(async () => {
    console.log('Pay with B3TR clicked:', { account, thor: !!thor, signer: !!signer, selectedProduct: JSON.stringify(selectedProduct) });
    if (!account) {
      setPaymentStatus('Please connect your wallet first.');
      openWalletModal();
      await handleWalletConnect();
      return;
    }
    if (!thor || !signer || !selectedProduct) {
      setPaymentStatus('Error: Missing required components for transaction.');
      console.error('Missing requirements:', { account, thor: !!thor, signer: !!signer, selectedProduct });
      alert('Error initiating transaction. Please try again.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userDetails.email || !emailRegex.test(userDetails.email.trim())) {
      setPaymentStatus('Please enter a valid email address (e.g., user@example.com).');
      console.error('Invalid or missing email:', userDetails.email);
      alert('Please enter a valid email address (e.g., user@example.com).');
      return;
    }
    if (!userDetails.address || userDetails.address.trim() === '') {
      setPaymentStatus('Please enter a shipping address.');
      console.error('Missing address:', userDetails.address);
      alert('Please enter a shipping address.');
      return;
    }
    if (balanceError) {
      setPaymentStatus('Failed to fetch B3TR balance. Please try again.');
      console.error('B3TR balance error:', balanceError);
      alert('Failed to fetch B3TR balance. Please try again.');
      return;
    }
    if (balanceData === null || balanceData === undefined) {
      setPaymentStatus('B3TR balance unavailable. Please try again.');
      console.error('B3TR balance unavailable');
      alert('B3TR balance unavailable. Please try again.');
      return;
    }
    if (Number(balanceData) < selectedProduct.priceB3TR) {
      setPaymentStatus(`Insufficient B3TR balance. Required: ${selectedProduct.priceB3TR}, Available: ${balanceData}`);
      console.error('Insufficient B3TR balance:', { required: selectedProduct.priceB3TR, available: balanceData });
      alert(`Insufficient B3TR balance. Required: ${selectedProduct.priceB3TR} B3TR, Available: ${balanceData} B3TR. Please acquire more B3TR.`);
      return;
    }
    if (vthoError) {
      setPaymentStatus('Failed to fetch VTHO balance. Please try again.');
      console.error('VTHO balance error:', vthoError);
      alert('Failed to fetch VTHO balance. Please try again.');
      return;
    }
    if (vthoData && Number(vthoData) < 1) {
      setPaymentStatus('Insufficient VTHO for gas. Please acquire more VTHO.');
      console.error('Insufficient VTHO:', vthoData);
      alert('Insufficient VTHO for gas. Please acquire more VTHO.');
      return;
    }
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
      console.log('Attempting to sign transaction with VeWorld:', JSON.stringify(tx));
      // Refetch balances before transaction
      await debounceRefetch(refetchRefs.current.refetchB3TR);
      await debounceRefetch(refetchRefs.current.refetchVTHO);
      if (Number(balanceData) < selectedProduct.priceB3TR) {
        throw new Error('Balance insufficient after refresh');
      }
      let txId;
      try {
        txId = await signer.signTransaction(tx);
        console.log('Transaction signed result:', txId);
      } catch (signError) {
        console.error('Initial signTransaction failed:', signError);
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Retrying signTransaction...');
        txId = await signer.signTransaction(tx);
        console.log('Retry transaction signed result:', txId);
      }
      if (!txId) {
        throw new Error('No transaction ID returned');
      }
      setTxId(txId);
      setPaymentStatus(`Transaction sent: ${txId}. Awaiting confirmation...`);
      console.log('Transaction sent:', txId);
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message || 'Unknown error';
        if (error.message.includes('connection')) {
          errorMessage = 'Wallet connection issue. Please check VeWorld extension.';
        } else if (errorMessage.includes('method not supported')) {
          errorMessage = 'VeWorld does not support the requested transaction method. Please ensure VeWorld is updated or contact support@veworld.net.';
        } else if (errorMessage.includes('User cancelled')) {
          errorMessage = 'Transaction rejected by user.';
        } else if (errorMessage.includes('node') || errorMessage.includes('CORS')) {
          errorMessage = 'Unable to connect to VeChain node. Check network connection or try a different node URL.';
        } else if (errorMessage.includes('Balance insufficient')) {
          errorMessage = `Insufficient B3TR balance. Required: ${selectedProduct.priceB3TR}, Available: ${balanceData}. Please acquire more B3TR.`;
        }
      }
      setPaymentStatus(`Error: ${errorMessage}`);
      console.error('Payment failed:', error);
      setTxId(null);
      setSelectedProduct(null);
      setThankYouTxId(null);
      setThankYouProduct(null);
      setUserDetails({ name: '', email: '', address: '' });
      setTransactionComplete(false);
    }
  }, [account, thor, signer, selectedProduct, userDetails, balanceError, balanceData, vthoError, vthoData, b3trContractAddress, b3trDecimals, openWalletModal, debounceRefetch]);

  const closeModal = useCallback(() => {
    console.log('Closing PurchaseModal, resetting states, showThankYou:', showThankYou);
    setPaymentStatus('');
    setEmailError(null);
    setUserDetails({ name: '', email: '', address: '' });
    if (!showThankYou) {
      setTxId(null);
      setSelectedProduct(null);
      setThankYouTxId(null);
      setThankYouProduct(null);
      setTransactionComplete(false);
    }
  }, [showThankYou]);

  const handleWalletConnect = useCallback(async () => {
    console.log('Attempting manual wallet connection');
    try {
      await connect('veworld');
      console.log('Manual connection attempt completed');
      // Refetch balances on connect
      await debounceRefetch(refetchRefs.current.refetchB3TR);
      await debounceRefetch(refetchRefs.current.refetchVTHO);
    } catch (err) {
      console.error('Manual connection failed:', (err as Error).message);
    }
  }, [connect, debounceRefetch]);

  const handleManageProductsClick = useCallback(() => {
    console.log('Manage Products clicked, checking auth state');
    if (!isAdminLoggedIn) {
      alert('Please log in as an admin to access this feature.');
    } else {
      setShowManageForm(true);
      console.log('Admin logged in, showing manage form');
    }
  }, [isAdminLoggedIn]);

  const handleViewTxClick = useCallback(() => {
    console.log('View Tx clicked, checking auth state');
    if (!isAdminLoggedIn) {
      alert('Please log in as an admin to access this feature.');
    } else {
      window.location.href = '/transactions';
      console.log('Navigating to /transactions');
    }
  }, [isAdminLoggedIn]);

  const handleDisconnect = useCallback(() => {
    console.log('Disconnecting wallet');
    disconnect();
  }, [disconnect]);

  console.log('Rendering StorePage with state:', { products: products.length, account, balanceData, showManageForm, showLoginModal, showThankYou });
  if (error) {
    console.log('Error state triggered, rendering error message:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-2xl text-red-600 font-bold">Error: {error}</p>
      </div>
    );
  }

  // Monitor state changes for debugging
  useEffect(() => {
    console.log('State changed:', { showThankYou, txId, selectedProduct, thankYouTxId, thankYouProduct, transactionComplete });
  }, [showThankYou, txId, selectedProduct, thankYouTxId, thankYouProduct, transactionComplete]);

  // Trigger handleTransactionUpdate when receipt is available
  useEffect(() => {
    if (!transactionComplete && receipt && selectedProduct && txId && account) {
      console.log('Triggering handleTransactionUpdate from useEffect');
      handleTransactionUpdate();
    }
  }, [receipt, selectedProduct, txId, account, handleTransactionUpdate, transactionComplete]);

  // Fade-in logic
  useEffect(() => {
    console.log('Setting up IntersectionObserver for fade-in');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('Fade-in triggered for:', entry.target);
            entry.target.classList.add('fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-content').forEach((element) => {
      console.log('Observing element:', element);
      observer.observe(element);
    });
    return () => {
      console.log('Cleaning up IntersectionObserver');
      observer.disconnect();
    };
  }, []);

  console.log('Rendering main content');
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
                  <span className="text-green-500 text-outline-black">Connected (Network: mainnet) <button onClick={handleDisconnect} className="ml-2 bg-red-500 text-white px-2 py-1 rounded">Disconnect</button></span>
                ) : (
                  <span className="text-red-500">Not Connected</span>
                )}
              </p>
              {!account && <WalletButton />}
              {balanceError && (
                <p className="text-xl mb-4 text-red-500">
                  Error fetching B3TR balance: {balanceError.message}
                </p>
              )}
              {balanceData !== null && balanceData !== undefined && (
                <p className="text-xl mb-4">
                  B3TR Balance: {balanceData} <span className="text-custom-blue text-outline-amber">B3TR</span>
                </p>
              )}
              {balanceData === null && !balanceError && (
                <p className="text-xl mb-4 text-yellow-500 text-outline-amber">
                  B3TR Balance: Loading...
                </p>
              )}
              {vthoError && (
                <p className="text-xl mb-4 text-red-500">Error fetching VTHO balance: {vthoError.message}</p>
              )}
              {vthoData && (
                <p className="text-xl mb-4">
                  VTHO Balance: {vthoData} VTHO
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.length > 0 ? (
                  products.map((product) => (
                    <div key={product.id} className="bg-custom-blue p-4 rounded-lg shadow text-center relative text-outline-black">
                      <p className="text-2xl font-bold text-white">
                        {product.name.split(' ').map((word, i) =>
                          word === 'BEACH' ? <span key={i} className="text-amber-400">{word}</span> : word + ' '
                        )}
                      </p>
                      <p className="text-xl text-white">
                        {product.priceB3TR} <span className="text-custom-blue text-outline-amber">B3TR</span>
                      </p>
                      <p className="text-xl text-white">{product.description}</p>
                      <button
                        type="button"
                        className={product.soldOut ? 'bg-red-500 text-black text-2xl font-bold px-4 py-2 rounded-lg mt-4' : 'bg-amber-400 text-green-500 text-2xl font-bold px-4 py-2 rounded-lg mt-4 hover:bg-black hover:text-green-500 text-outline-black'}
                        onClick={() => !product.soldOut && handlePurchase(product)}
                        disabled={product.soldOut}
                      >
                        {product.soldOut ? 'SOLD OUT' : 'Buy Now'}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xl">No products available. Log in as admin to add products.</p>
                )}
              </div>
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
                    onClick={() => {
                      const newSoldOut = !formProduct.soldOut;
                      console.log(`Toggling add form soldOut to: ${newSoldOut}`);
                      setFormProduct(prev => ({ ...prev, soldOut: newSoldOut }));
                    }}
                  >
                    {formProduct.soldOut ? 'In Stock' : 'Sold Out'}
                  </button>
                </div>
                <button
                  type="submit"
                  className="bg-amber-400 text-green-500 px-4 py-2 rounded-lg font-bold hover:bg-black hover:text-green-500"
                  onClick={(e) => {
                    e.preventDefault();
                    handleFormSubmit(e).then(() => {
                      console.log('Add form submission completed successfully');
                    }).catch(err => console.error('Add submission error:', err));
                  }}
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
                        console.log(`Toggling soldOut to: ${newSoldOut} for product id: ${product.id}`);
                        const productRef = ref(database, `products/${product.id}`);
                        update(productRef, { soldOut: newSoldOut }).then(() => {
                          console.log(`Firebase updated soldOut to: ${newSoldOut} for id: ${product.id} successfully`);
                          setProducts(prevProducts =>
                            prevProducts.map(p =>
                              p.id === product.id ? { ...p, soldOut: newSoldOut } : p
                            )
                          );
                          const productsRef = ref(database, 'products');
                          get(productsRef).then(snapshot => {
                            const data = snapshot.val();
                            if (data) {
                              const refreshedProducts = Object.keys(data).map(key => {
                                const productData = data[key];
                                const id = isNaN(Number(key)) ? key : Number(key);
                                return {
                                  id,
                                  name: productData.name || '',
                                  priceUSD: productData.priceUSD || 0,
                                  priceB3TR: productData.priceB3TR || 0,
                                  description: productData.description || '',
                                  soldOut: productData.soldOut || false,
                                };
                              }).filter(p => p && p.name && typeof p.name.trim === 'function' && p.name.trim() !== '');
                              console.log('Refreshed products after toggle:', refreshedProducts);
                              setProducts(refreshedProducts);
                            }
                          }).catch(err => console.error('Refresh error after toggle:', err));
                        }).catch(err => {
                          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                          console.error('Toggle update error:', err);
                          if (errorMsg) alert(`Failed to toggle status: ${errorMsg}. Check console for details.`);
                        });
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
                    onClick={() => {
                      const newSoldOut = !formProduct.soldOut;
                      console.log(`Toggling edit form soldOut to: ${newSoldOut} for id: ${editProductId}`);
                      setFormProduct(prev => ({ ...prev, soldOut: newSoldOut }));
                    }}
                  >
                    {formProduct.soldOut ? 'In Stock' : 'Sold Out'}
                  </button>
                </div>
                <button
                  type="submit"
                  className="bg-amber-400 text-green-500 px-4 py-2 rounded-lg font-bold hover:bg-black hover:text-green-500"
                  onClick={(e) => {
                    e.preventDefault();
                    handleFormSubmit(e).then(() => {
                      console.log('Edit form submission completed successfully');
                      setEditProductId(null);
                    }).catch(err => console.error('Edit submission error:', err));
                  }}
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
                  console.log('ThankYouPage onClose triggered, resetting states');
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
      </div>
    </>
  );
}