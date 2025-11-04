"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SplashScreenProps {
  onFadeOut: () => void;
}

function SplashScreen({ onFadeOut }: SplashScreenProps) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/assets/B3TRBEACHSplashGif.mp4';
    video.onloadeddata = () => setShowError(false);
    video.onerror = () => setShowError(true);

    const timer = setTimeout(() => onFadeOut(), 5000);
    return () => clearTimeout(timer);
  }, [onFadeOut]);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
        }}
      >
        <source src="/assets/B3TRBEACHSplashGif.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {showError && (
        <div className="absolute top-4 left-4 bg-red-600 text-white p-3 rounded z-10">
          Splash video failed.
        </div>
      )}
    </div>
  );
}

function Header() {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/assets/NewB3TRBEACHBannerGif.mp4';
    video.onloadeddata = () => setShowError(false);
    video.onerror = () => setShowError(true);
  }, []);

  return (
    <header className="relative bg-black overflow-hidden" style={{ height: '700px' }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          width: '100%',
          height: '700px',
          objectFit: 'cover',
        }}
      >
        <source src="/assets/NewB3TRBEACHBannerGif.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {showError && (
        <div className="absolute top-4 left-4 z-10 bg-red-600 text-white p-3 rounded">
          Banner video failed.
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-5xl font-bold text-amber-400 mb-4">
          Our Mission to Become <span className="text-custom-blue">B3TR</span>
        </h2>
        <p className="text-lg mb-6 max-w-3xl mx-auto">
          Welcome to <span className="text-custom-blue">B3TR BEACH</span>! Our mission is to combat beach pollution and protect marine ecosystems through a decentralized “Clean to Earn” model powered by <span className="text-custom-blue">B3TR</span>.
        </p>
        <Link
          href="/instructions"
          className="bg-amber-300 hover:bg-black text-green-500 text-xl font-bold px-6 py-3 rounded-lg"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}

// Keep other sections (Features, Sponsors, etc.) as they are — they’re safe

export default function Homepage() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {showSplash && <SplashScreen onFadeOut={() => setShowSplash(false)} />}
      {!showSplash && (
        <>
          <Header />
          <Hero />
          {/* Add back your other sections here */}
        </>
      )}
    </div>
  );
}