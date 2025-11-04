// src/components/Homepage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Homepage() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <video
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/assets/B3TRBEACHSplashGif.mp4" type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-green-400">
      <header className="relative h-screen">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/assets/NewB3TRBEACHBannerGif.mp4" type="video/mp4" />
        </video>
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-6xl font-bold text-white drop-shadow-lg">
            B3TR BEACH
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-8 text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome!</h2>
        <p className="text-xl mb-8">Your site is now mobile-ready.</p>
        <Link
          href="/store"
          className="bg-yellow-400 text-blue-600 px-6 py-3 rounded-lg text-xl font-bold"
        >
          Go to Store
        </Link>
      </main>
    </div>
  );
}