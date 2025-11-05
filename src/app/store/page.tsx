// @ts-nocheck
"use client";
import Head from 'next/head';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [thankYouProduct, setThankYouProduct] = useState(null);
  const [thankYouTxId, setThankYouTxId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [formProduct, setFormProduct] = useState({
    id: 0,
    name: '',
    priceUSD: 0,
    priceB3TR: 0,
    description: '',
    soldOut: false,
  });
  const [editProductId, setEditProductId] = useState(null);
  const [txId, setTxId] = useState(null);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState({
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
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const formRef = useRef(null);
  const { account, signer, connect, disconnect } = useWallet();
  const thor = useThor();
  const { open: openWalletModal } = useWalletModal();
  const b3trContractAddress = '0x5ef79995FE8a089e0812330E4378eB2660ceDe699';
  const b3trDecimals = 18;

  const lastRefetch = useRef(0);
  const debounceRefetch = useCallback((refetchFn: any) => {
    const now = Date.now();
    if (now - lastRefetch.current > 10000) {
      lastRefetch.current = now;
      return refetchFn();
    }
    return Promise.resolve();
  }, []);

  const refetchRefs = useRef({
    refetchB3TR: () => Promise.resolve({ data: null }),
    refetchVTHO: () => Promise.resolve({ data: null }),
    refetchReceipt: () => Promise.resolve({ data: null }),
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

  const { data: balanceData, error: balanceError, refetch: initialRefetchB3TR } = useQuery({
    queryKey: ['b3trBalance', account],
    queryFn: async () => {
      if (!account || !thor) return null;
      try {
        const result: any = await thor.contracts.executeCall(
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
          }
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
      refetchB3TR: initialRefetchB3TR, 
      refetchVTHO: initialRefetchVTHO, 
      refetchReceipt: initialRefetchReceipt 
    };
  }, [initialRefetchB3TR, initialRefetchVTHO, initialRefetchReceipt]);

  useEffect(() => {
    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setProducts(loaded);
      } else {
        setProducts([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const init = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onAuthStateChanged(auth, (user) => setIsAdminLoggedIn(!!user));
    };
    init();
  }, []);

  const addToCart = useCallback((product) => {
    if (product.soldOut) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId, delta) => {
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0));
  }, []);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.priceB3TR * item.quantity, 0), [cart]);

  const makePurchase = useCallback(() => {
    if (cart.length === 0) return;
    setSelectedProduct({ ...cart[0], priceB3TR: cartTotal });
    setShowCartModal(false);
  }, [cart, cartTotal]);

  const handleB3TRPayment = useCallback(async () => {
    if (!account) {
      openWalletModal();
      return;
    }
    if (!thor || !signer || !selectedProduct) return;
    if (!userDetails.email || !userDetails.address.trim()) return;
    if (Number(balanceData) < selectedProduct.priceB3TR) return;
    try {
      const clause = Clause.callFungible(
        b3trContractAddress,
        RECIPIENT_ADDRESS,
        Units.parseUnits(selectedProduct.priceB3TR.toString(), b3trDecimals)
      );
      const tx = await signer.sendTransaction([clause]);
      setTxId(tx.id);
      setPaymentStatus(`Transaction sent: ${tx.id}`);
    } catch (error) {
      setPaymentStatus(`Error: ${error.message}`);
    }
  }, [account, thor, signer, selectedProduct, userDetails, balanceData]);

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
                  <span className="text-green-500 text-outline-black">Connected <button onClick={disconnect} className="ml-2 bg-red-500 text-white px-2 py-1 rounded">Disconnect</button></span>
                ) : (
                  <span className="text-red-500">Not Connected</span>
                )}
              </p>
              {!account && <WalletButton />}
              {balanceData && <p className="text-xl mb-4">B3TR: {balanceData}</p>}
              {vthoData && <p className="text-xl mb-4">VTHO: {vthoData}</p>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product) => (
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
                      className="bg-amber-400 text-green-500 px-4 py-2 rounded-lg mt-4"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowCartModal(true)}
                className="bg-amber-400 text-green-500 px-6 py-3 rounded-lg mt-6"
              >
                Cart {cart.length > 0 && <span className="ml-2 bg-red-500 text-white rounded-full w-6 h-6">{cart.length}</span>}
              </button>
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
                <Link href="#" className="text-white hover:text-green-500" onClick={() => isAdminLoggedIn && setShowManageForm(true)}>Manage Products</Link>
                <Link href="#" className="text-white hover:text-green-500" onClick={() => isAdminLoggedIn && (window.location.href = '/transactions')}>View Tx</Link>
                <Link href="mailto:support@b3trbeach.org" className="text-white hover:text-green-500">Contact Us</Link>
                <Link href="#" className="text-white hover:text-green-500" onClick={() => isAdminLoggedIn ? handleAdminLogout() : setShowLoginModal(true)}>Admin</Link>
              </div>
            </div>
          </div>
        </footer>
        {showCartModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Cart</h3>
              {cart.map(item => (
                <div key={item.id} className="flex justify-between mb-2">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{item.priceB3TR * item.quantity} B3TR</span>
                </div>
              ))}
              <p className="font-bold">Total: {cartTotal} B3TR</p>
              <button
                onClick={makePurchase}
                className="bg-green-500 text-white px-4 py-2 rounded mt-4"
              >
                Make Purchase
              </button>
              <button
                onClick={() => setShowCartModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded mt-2 ml-2"
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