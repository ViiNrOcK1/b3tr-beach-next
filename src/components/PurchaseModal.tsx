"use client"; // For client-side effects
import React, { useEffect } from 'react';
import Link from 'next/link';

interface PurchaseModalProps {
  selectedProduct: Product | null;
  userDetails: { name: string; email: string; address: string };
  setUserDetails: React.Dispatch<React.SetStateAction<{ name: string; email: string; address: string }>>;
  paymentStatus: string;
  account: string | null;
  formRef: React.RefObject<HTMLFormElement>;
  handleB3TRPayment: () => void;
  openWalletModal: () => void;
  closeModal: () => void;
}

interface Product {
  id: number | string;
  name: string;
  priceUSD: number;
  priceB3TR: number;
  description: string;
  soldOut?: boolean;
}

export default function PurchaseModal({
  selectedProduct,
  userDetails,
  setUserDetails,
  paymentStatus,
  account,
  formRef,
  handleB3TRPayment,
  openWalletModal,
  closeModal,
}: PurchaseModalProps) {
  useEffect(() => {
    console.log('PurchaseModal rendered with props:', { selectedProduct, userDetails, paymentStatus, account });
  }, [selectedProduct, userDetails, paymentStatus, account]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleB3TRPayment();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-3/4">
        <h3 className="text-2xl font-bold mb-4 text-center">Please provide the following to process your order:</h3>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-lg font-semibold">Name</label>
            <input
              type="text"
              name="name"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={userDetails.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-semibold">Email</label>
            <input
              type="email"
              name="email"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={userDetails.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-semibold">Shipping Address</label>
            <textarea
              name="address"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={userDetails.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <input type="hidden" name="item" value={selectedProduct?.name || ''} />
          <input type="hidden" name="amount" value={selectedProduct?.priceB3TR || ''} />
          <input type="hidden" name="txId" value={''} />
          <input type="hidden" name="timestamp" value={new Date().toISOString()} />
          <p className="text-lg mb-4">Price: {selectedProduct?.priceB3TR} B3TR</p>
          <p className="text-lg mb-4">Wallet: {account || 'Not connected'}</p>
          {paymentStatus && <p className="text-lg mb-4 text-red-500">{paymentStatus}</p>}
          <div className="flex justify-center space-x-4">
            {!account && (
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600"
                onClick={openWalletModal}
              >
                Connect Wallet
              </button>
            )}
            {account && (
              <button
                type="submit"
                className="bg-amber-400 text-green-500 px-4 py-2 rounded-lg font-bold hover:bg-black hover:text-green-500"
              >
                Pay with B3TR
              </button>
            )}
            <button
              type="button"
              className="bg-gray-400 text-red-500 px-4 py-2 rounded-lg font-bold hover:bg-red-600 hover:text-white"
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
        </form>
        <p className="text-lg mt-4 text-green-500 font-semibold text-center" style={{ textShadow: '1px 1px 0 black' }}>
          Want to use Credit/Debit Instead? Check out the{' '}
          <Link href="https://vmerch.shop/collections/b3tr-beach" className="underline">
            V-Merch Shop
          </Link>
        </p>
      </div>
    </div>
  );
}