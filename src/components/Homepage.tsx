"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

function SplashScreen({ onFadeOut }: { onFadeOut: () => void }) {
  useEffect(() => {
    // Force autoplay on mobile
    const timer = setTimeout(onFadeOut, 5000);
    return () => clearTimeout(timer);
  }, [onFadeOut]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        className="w-full h-full object-cover"
        style={{ objectFit: 'cover' }}
      >
        <source src="/assets/B3TRBEACHSplashGif.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

function Header() {
  return (
    <header className="relative h-[700px] bg-black overflow-hidden">
      <video
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/assets/NewB3TRBEACHBannerGif.mp4" type="video/mp4" />
      </video>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-gray-100 py-16 text-center">
      <h2 className="text-5xl font-bold text-amber-400">
        Our Mission to Become <span className="text-custom-blue">B3TR</span>
      </h2>
      <p className="mt-4 text-lg max-w-2xl mx-auto">
        Welcome to B3TR BEACH! We fight pollution with a "Clean to Earn" model.
      </p>
      <Link
        href="/instructions"
        className="mt-6 inline-block bg-amber-300 text-green-500 px-6 py-3 rounded-lg text-xl font-bold"
      >
        Get Started
      </Link>
    </section>
  );
}

export default function Homepage() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="min-h-screen">
      {showSplash && <SplashScreen onFadeOut={() => setShowSplash(false)} />}
      {!showSplash && (
        <>
          <Header />
          <Hero />
        </>
      )}
    </div>
  );
}