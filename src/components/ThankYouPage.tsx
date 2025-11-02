"use client"; // For client-side effects
import React, { useEffect } from 'react';

interface ThankYouPageProps {
  txId: string | null;
  selectedProduct: Product | null;
  userDetails: { name: string; email: string; address: string };
  emailError: string | null; // Added to fix type error
  onClose: () => void; // Close handler
}

interface Product {
  id: number | string;
  name: string;
  priceUSD: number;
  priceB3TR: number;
  description: string;
  soldOut?: boolean;
}

export default function ThankYouPage({ txId, selectedProduct, userDetails, emailError, onClose }: ThankYouPageProps) {
  useEffect(() => {
    console.log('ThankYouPage rendered with props:', { txId, selectedProduct, userDetails, emailError });
    if (emailError) {
      alert(`Failed to send confirmation email: ${emailError} Please contact support@b3trbeach.org.`);
    }
  }, [emailError]);

  const timestamp = new Date();
  const formattedTime = timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const formattedDate = timestamp.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const displayTimestamp = `${formattedTime} ${formattedDate}`;

  return (
    <div>
      <h2 className="text-4xl font-bold text-amber-400 mb-6">
        <span className="text-custom-blue text-outline-amber">B3TR</span>{' '}
        <span className="text-amber-400">Thank You</span>
      </h2>
      <p className="text-2xl text-green-600 mb-4">Your purchase was successful!</p>
      <p className="text-lg mb-4 break-all">Transaction ID: {txId || 'N/A'}</p>
      <div className="bg-gray-100 p-4 rounded-lg shadow mx-auto">
        <h3 className="text-xl font-semibold mb-2">Purchase Summary</h3>
        <p><strong>Item:</strong> {selectedProduct?.name || 'N/A'}</p>
        <p><strong>Amount:</strong> {selectedProduct?.priceB3TR || 'N/A'} B3TR</p>
        <p><strong>Name:</strong> {userDetails.name || 'N/A'}</p>
        <p><strong>Email:</strong> {userDetails.email || 'N/A'}</p>
        <p><strong>Address:</strong> {userDetails.address || 'N/A'}</p>
        <p><strong>Timestamp:</strong> {displayTimestamp}</p>
      </div>
      {emailError ? (
        <p className="text-xl text-red-500 mb-4">
          Failed to send confirmation email: {emailError} Please contact{' '}
          <a href="mailto:support@b3trbeach.org" className="text-blue-500 underline">support@b3trbeach.org</a>.
        </p>
      ) : (
        <p className="text-xl text-custom-blue mb-4">A confirmation email was sent to you!</p>
      )}
      <div className="mt-6">
        <button
          onClick={onClose}
          className="bg-gray-400 text-red-500 px-4 py-2 rounded-lg font-bold hover:bg-red-600 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}