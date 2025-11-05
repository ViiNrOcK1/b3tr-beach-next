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

declare module '@vechain/sdk-network' {
  interface TransactionReceipt {
    transferSuccess?: boolean;
  }
}

interface CallResult {
  success: boolean;
  result?: bigint | { plain?: unknown; array?: unknown[] | undefined; errorMessage?: string | undefined } | string | undefined;
}

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
  };
}

interface Product {
  id: number | string;
  name: string;
  priceUSD: number;
  priceB3TR: number;
  description: string;
  soldOut?: boolean;
}

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

interface CartModalProps {
  cart: CartItem[];
  onClose: () => void;
  onAdjustQuantity: (productId: string | number, newQuantity: number) => void;
  onCheckout: () => void;
  cartTotal: number;
}

function CartModal({ cart, onClose, onAdjustQuantity, onCheckout, cartTotal }: CartModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { account, signer, connect, disconnect } = useWallet();
  const thor = useThor();
  const { open: openWalletModal } = useWalletModal();
  const b3trContractAddress = '0x5ef79995FE8a089e0812330E4378eB2660ceDe699';
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

  const { data: balanceData, error: balanceError, refetch: initialRefetchB3TR } = useQuery({
    queryKey: ['b3trBalance', account],
    queryFn: async () => {
      if (!account || !thor) return null;
      try {
        const result: any = await thor.contracts.executeCall(
          b3trContractAddress,
          ABIItem.ofSignature(ABIFunction, 'function balanceOf(address) view returns (uint256)'),
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
    refetchRefs.current = { refetchB3TR: initialRefetchB3TR, refetchVTHO: initialRefetchVTHO, refetchReceipt: initialRefetchReceipt };
  }, [initialRefetchB3TR, initialRefetchVTHO, initialRefetchReceipt]);

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

  const addToCart = useCallback((product: Product) => {
    if (product.soldOut) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const adjustQuantity = useCallback((productId: string | number, newQuantity: number) => {
    setCart(prev => {
      if (newQuantity <= 0) return prev.filter(item => item.id !== productId);
      return prev.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
    });
  }, []);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.priceB3TR * item.quantity, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + item.priceB3TR * item.quantity, 0);
    setSelectedProduct({ ...cart[0], priceB3TR: total });
    setShowCartModal(false);
  }, [cart]);

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

  const handleViewTxClick = useCallback(() => {
    if (!isAdminLoggedIn) {
      setShowLoginModal(true);
    } else {
      window.location.href = '/transactions';
    }
  }, [isAdminLoggedIn]);

  const handleManageProductsClick = useCallback(() => {
    if (!isAdminLoggedIn) {
      setShowLoginModal(true);
    } else {
      setShowManageForm(true);
    }
  }, [isAdminLoggedIn]);

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
                <button className="text-white hover:text-green-500 bg-transparent border-none p-0" onClick={handleManageProductsClick}>Manage Products</button>
                <button className="text-white hover:text-green-500 bg-transparent border-none p-0" onClick={handleViewTxClick}>View Tx</button>
                <Link href="mailto:support@b3trbeach.org" className="text-white hover:text-green-500">Contact Us</Link>
                <button className="text-white hover:text-green-500 bg-transparent border-none p-0" onClick={() => isAdminLoggedIn ? handleAdminLogout() : setShowLoginModal(true)}>Admin</button>
              </div>
            </div>
          </div>
        </footer>

        {showCartModal && (
          <CartModal
            cart={cart}
            onClose={() => setShowCartModal(false)}
            onAdjustQuantity={adjustQuantity}
            onCheckout={handleCheckout}
            cartTotal={cartTotal}
          />
        )}

        {selectedProduct && !showThankYou && (
          <PurchaseModal
            selectedProduct={selectedProduct}
            userDetails={userDetails}
            setUserDetails={setUserDetails}
            paymentStatus={paymentStatus}
            account={account}
            formRef={formRef}
            handleB3TRPayment={handleB3TRPayment}
            openWalletModal={openWalletModal}
            closeModal={() => {
              setPaymentStatus('');
              setUserDetails({ name: '', email: '', address: '' });
              setSelectedProduct(null);
            }}
          />
        )}

        {/* Original Manage Products Modal */}
        {isAdminLoggedIn && showManageForm && editProductId === null && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-3/4">
              <h3 className="text-2xl font-bold mb-4 text-center">Manage Products - Add New</h3>
              <form onSubmit={handleFormSubmit} ref={formRef}>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Name</label>
                  <input type="text" name="name" className="w-full p-2 border border-gray-300 rounded-lg" value={formProduct.name} onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })} required />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Price (USD)</label>
                  <input type="number" name="priceUSD" className="w-full p-2 border border-gray-300 rounded-lg" value={formProduct.priceUSD} onChange={(e) => setFormProduct({ ...formProduct, priceUSD: Number(e.target.value) || 0 })} required min="0" />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Price (B3TR)</label>
                  <input type="number" name="priceB3TR" className="w-full p-2 border border-gray-300 rounded-lg" value={formProduct.priceB3TR} onChange={(e) => setFormProduct({ ...formProduct, priceB3TR: Number(e.target.value) || 0 })} required min="0" />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Description</label>
                  <textarea name="description" className="w-full p-2 border border-gray-300 rounded-lg" value={formProduct.description} onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })} required />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Status</label>
                  <button type="button" className={`px-4 py-2 rounded-lg ${formProduct.soldOut ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} hover:${formProduct.soldOut ? 'bg-red-600' : 'bg-green-600'}`} onClick={() => setFormProduct(prev => ({ ...prev, soldOut: !prev.soldOut }))}>
                    {formProduct.soldOut ? 'In Stock' : 'Sold Out'}
                  </button>
                </div>
                <button type="submit" className="bg-amber-400 text-green-500 px-4 py-2 rounded-lg font-bold hover:bg-black hover:text-green-500">Add Product</button>
                <button type="button" className="bg-gray-400 text-red-500 px-4 py-2 rounded-lg font-bold ml-2 hover:bg-red-600 hover:text-white" onClick={() => setShowManageForm(false)}>Close</button>
              </form>
              <h4 className="text-xl font-semibold mt-6 mb-4">Existing Products</h4>
              <ul className="list-disc pl-5">
                {products.map((product) => (
                  <li key={product.id} className="mb-2">
                    {product.name} - ${product.priceUSD} (${product.priceB3TR} B3TR)
                    <button className="bg-amber-400 text-green-500 px-2 py-1 rounded-lg ml-2 hover:bg-black hover:text-green-500" onClick={() => handleEditProduct(product)}>Edit</button>
                    <button className="bg-red-500 text-white px-2 py-1 rounded-lg ml-2 hover:bg-red-600" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                    <button className={`ml-2 px-2 py-1 rounded-lg ${product.soldOut ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} hover:${product.soldOut ? 'bg-red-600' : 'bg-green-600'}`} onClick={() => {
                      const productRef = ref(database, `products/${product.id}`);
                      update(productRef, { soldOut: !product.soldOut });
                    }}>
                      {product.soldOut ? 'In Stock' : 'Sold Out'}
                    </button>
                  </li>
                ))}
              </ul>
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

