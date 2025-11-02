"use client"; // For potential payment confirmation logic and URL params
import ThankYouPage from '@/components/ThankYouPage'; // Import the merchandise thank you component
import Header from '@/components/Header'; // Reuse your Header
import Footer from '@/components/Footer'; // Reuse your Footer
import { useSearchParams } from 'next/navigation'; // For URL params

export default function ThankYouPageRoute() {
  const searchParams = useSearchParams();
  const txId = searchParams.get('txId');
  const item = searchParams.get('item') || 'N/A';
  const amount = searchParams.get('amount') || 'N/A';
  const userName = searchParams.get('userName') || 'N/A';
  const userEmail = searchParams.get('userEmail') || 'N/A';
  const userAddress = searchParams.get('userAddress') || 'N/A';

  const handleClose = () => {
    // Redirect to homepage or close logic
    window.location.href = '/';
  };

  // Default no-op implementations for Footer props
  const setShowManageForm = () => {
    console.log('Manage form not available on thank you page');
  };
  const setShowTransactions = () => {
    console.log('Transactions view not available on thank you page');
  };

  return (
    <div>
      <Header />
      <ThankYouPage
        txId={txId}
        selectedProduct={{ id: 0, name: item, priceUSD: 0, priceB3TR: parseFloat(amount) || 0, description: '' }}
        userDetails={{ name: userName, email: userEmail, address: userAddress }}
        emailError={null} // Added to fix type error
        onClose={handleClose}
      />
      <Footer setShowManageForm={setShowManageForm} setShowTransactions={setShowTransactions} />
    </div>
  );
}