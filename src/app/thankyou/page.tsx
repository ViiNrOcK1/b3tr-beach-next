"use client"; // For client-side rendering and localStorage

import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [event, setEvent] = useState<string | null>(null);

  useEffect(() => {
    console.log('ThankYouPage useEffect triggered');
    const eventParam = searchParams.get('event');
    console.log('Event param from searchParams:', eventParam);
    if (eventParam) {
      setEvent(decodeURIComponent(eventParam));
      console.log('Event set to:', decodeURIComponent(eventParam));
    }
  }, [searchParams]);

  const handleBackToEvents = () => {
    console.log('Back to Events clicked, navigating to /events');
    router.push('/events');
  };

  const handleBackToHome = () => {
    console.log('Back to Homepage clicked, navigating to /');
    router.push('/');
  };

  console.log('ThankYouPage rendering with event:', event);

  return (
    <>
      <Head>
        <title>{event ? `B3TR BEACH - Thank You for ${event}` : 'B3TR BEACH - Thank You'}</title>
      </Head>
      <div className="flex flex-col min-h-screen">
        <header className="py-40 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/assets/AltBEACHBanner.png')", backgroundSize: '1700px 360px' }}>
          <div className="container mx-auto px-4 text-center bg-black bg-opacity-30 p-4">
            <div className="fade-content fade-in">
              <h1 className="text-6xl font-bold mb-4 text-outline-blue text-white">
                <span className="text-custom-blue">B3TR</span>
                <span className="text-amber-400"> Thank You</span>
              </h1>
            </div>
          </div>
        </header>
        <section className="flex-grow wave-top wave-bottom min-h-[70vh] pt-16" style={{ backgroundImage: "url('/assets/SeaShell.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
          <div className="container mx-auto px-4 text-center">
            <div className="fade-content fade-in">
              <h2 className="text-2xl text-green-600 mb-4">Thank You for Registering for {event || 'our Event'}!</h2>
              <p className="text-lg mb-4 text-white">We're excited to have you join us! You'll receive a confirmation email soon with event details.</p>
              <div className="mt-6">
                <button onClick={handleBackToEvents} className="bg-amber-400 text-green-500 px-4 py-2 rounded-lg font-bold hover:bg-black hover:text-green-500 mr-2">
                  Back to Events
                </button>
                <button onClick={handleBackToHome} className="bg-amber-400 text-green-500 px-4 py-2 rounded-lg font-bold hover:bg-black hover:text-green-500">
                  Back to Homepage
                </button>
              </div>
            </div>
          </div>
        </section>
        <footer className="bg-custom-blue py-6 text-center wave-top">
          <div className="container mx-auto px-4">
            <p className="text-xl text-amber-400 text-outline-blue mb-4">
              © {new Date().getFullYear()} <span className="text-black">B3TR</span> BEACH. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="mailto:support@b3trbeach.org" className="text-white hover:text-amber-400">Contact Us</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}