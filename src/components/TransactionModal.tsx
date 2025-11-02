"use client"; // Required for interactivity

import React from 'react';

interface TransactionModalProps {
  txId: string | null;
  status?: string;
  onClose: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ txId, status, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-3/4 text-center">
        <h3 className="text-2xl font-bold mb-4 text-amber-400 text-outline-black">Transaction Status</h3>
        <p className="text-xl mb-4">{status || 'Pending...'}</p>
        {txId && <p className="text-xl mt-4">Transaction ID: {txId}</p>}
        <button
          className="bg-amber-400 text-green-500 px-4 py-2 rounded-lg font-bold mt-4 hover:bg-black hover:text-green-500"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TransactionModal;