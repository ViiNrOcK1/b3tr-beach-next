"use client"; // Required for client-side interactivity
import React from 'react';
import Link from 'next/link';

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

interface TransactionsProps {
  transactions: Purchase[];
}

export default function Transactions({ transactions }: TransactionsProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="py-40 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/assets/AltBEACHBanner.png')", backgroundSize: '1700px 500px' }}>
        <div className="container mx-auto px-4 text-center bg-opacity-30 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}>
          <div className="fade-content fade-in">
            <h1 className="text-6xl font-bold mb-4 text-outline-black text-white">
              <span className="text-custom-blue text-outline-black">B3TR</span>
              <span className="text-amber-400"> Transactions</span>
            </h1>
          </div>
        </div>
      </header>
      {/* Section with Table */}
      <section className="flex-grow wave-top wave-bottom min-h-[70vh] pt-16" style={{ backgroundImage: "url('/assets/SeaShell.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="container mx-auto px-4">
          <div className="fade-content fade-in">
            <div className="w-full">
              <h3 className="text-2xl font-bold mb-4 text-amber-400 text-outline-black">Purchase Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-custom-blue text-white min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-amber-400">
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-left">Amount (B3TR)</th>
                      <th className="px-4 py-2 text-left">Wallet Address</th>
                      <th className="px-4 py-2 text-left">Tx ID</th>
                      <th className="px-4 py-2 text-left">Timestamp</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((purchase, index) => (
                      <tr key={index} className="border-b border-amber-300 hover:bg-amber-500 transition duration-300">
                        <td className="px-4 py-2 whitespace-normal break-words max-w-[120px]">{purchase.item}</td>
                        <td className="px-4 py-2 whitespace-normal break-words max-w-[80px]">{purchase.amount}</td>
                        <td className="px-4 py-2 whitespace-normal break-words max-w-[150px] overflow-hidden text-ellipsis">{purchase.account}</td>
                        <td className="px-4 py-2 whitespace-normal break-words max-w-[150px] overflow-hidden text-ellipsis">{purchase.txId}</td>
                        <td className="px-4 py-2 whitespace-normal break-words max-w-[150px]">{new Date(purchase.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-2 whitespace-normal break-words max-w-[120px]">{purchase.userName}</td>
                        <td className="px-4 py-2 whitespace-normal break-words max-w-[150px] overflow-hidden text-ellipsis">{purchase.userEmail}</td>
                        <td className="px-4 py-2 whitespace-normal break-words max-w-[150px] overflow-hidden text-ellipsis">{purchase.userAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {transactions.length === 0 && <p className="text-center text-amber-400 mt-4">No transactions found.</p>}
              <div className="text-center mt-4">
                <Link href="/store" className="bg-amber-400 text-green-500 px-4 py-2 rounded-lg hover:bg-black hover:text-green-500">Back to Store</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-custom-blue py-9 text-center wave-top min-h-[15vh]">
        <div className="container mx-auto px-4">
          <div className="fade-content" style={{ position: 'relative', zIndex: 20 }}>
            <p className="text-xl text-amber-400 text-outline-blue mb-4">
              © 2025 <span className="text-black">B3TR Beach.org</span>. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/privacy-policy" className="text-white hover:text-green-500">Privacy Policy</Link>
              <Link href="/terms-of-service" className="text-white hover:text-green-500">Terms of Service</Link>
              <Link href="/store" className="text-white hover:text-green-500">Back to Store</Link>
              <Link href="mailto:support@b3trbeach.org" className="text-white hover:text-green-500">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}