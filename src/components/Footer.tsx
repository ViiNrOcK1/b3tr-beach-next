// src/components/Footer.tsx
"use client";

import React from 'react';
import Link from 'next/link';

interface FooterProps {
  setShowManageForm?: (value: boolean) => void; // Optional
  setShowTransactions?: (value: boolean) => void; // Optional
}

const Footer: React.FC<FooterProps> = ({ setShowManageForm, setShowTransactions }) => {
  const handleManageProductsClick = () => {
    if (setShowManageForm) {
      setShowManageForm(true);
    } else {
      console.log('Manage Products not available in this context');
    }
  };

  const handleViewTxClick = () => {
    if (setShowTransactions) {
      setShowTransactions(true);
    } else {
      console.log('View Transactions not available in this context');
    }
  };

  return (
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
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;