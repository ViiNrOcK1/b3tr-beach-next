"use client";
import React, { useState, useEffect } from 'react';
// import Head from 'next/head'; // Removed, not used in App Router
import Transactions from '../../components/Transactions'; // Changed path
import { auth, database } from '../../firebase'; // Changed path
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from 'firebase/auth';
import { ref, onValue } from 'firebase/database';

interface Transaction {
  item: string;
  amount: number;
  account: string;
  txId: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  userAddress: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Set page title
  useEffect(() => {
    document.title = 'B3TR BEACH Transactions';
  }, []);

  // Auth + data listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        setIsAdminLoggedIn(!!user);
        if (user) {
          const purchasesRef = ref(database, 'purchases');
          const unsubscribeDb = onValue(
            purchasesRef,
            (snapshot) => {
              const data = snapshot.val();
              const loaded: Transaction[] = data ? Object.values(data) : [];
              setTransactions(loaded);
            },
            (dbErr) => {
              console.error('Database error:', dbErr);
              setError('Permission denied or database issue.');
            }
          );
          return () => unsubscribeDb();
        } else {
          setTransactions([]);
        }
      },
      (authErr) => {
        console.error('Auth error:', authErr);
        setError('Authentication initialization failed.');
      }
    );
    return () => unsubscribeAuth();
  }, []);

  const handleAdminLogin = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      setError(null);
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Check credentials.');
    }
  };

  // Login screen
  if (!isAdminLoggedIn) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h3 className="text-2xl font-bold text-amber-400 mb-4">
          Admin Login Required
        </h3>
        <p className="mb-4">Please log in as admin to view transactions.</p>
        <div className="mt-4">
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded-lg mr-2"
          />
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border rounded-lg mr-2"
          />
          <button
            onClick={handleAdminLogin}
            className="bg-amber-400 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white"
          >
            Admin Login
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  // FIX: Render the <Transactions> component instead of <ThankYouPage>
  return (
    <>
      {/* <Head> -- Removed
        <title>B3TR BEACH Transactions</title>
      </Head> */}
      <Transactions transactions={transactions} />
    </>
  );
}

