"use client";
import React, { useState, useEffect } from 'react';

function SplashScreen({ onFadeOut }: { onFadeOut: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onFadeOut, 3000);
    return () => clearTimeout(timer);
  }, [onFadeOut]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <video
        autoPlay
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      >
        <source src="/assets/B3TRBEACHSplashGif.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

export default function Homepage() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="min-h-screen">
      {showSplash && <SplashScreen onFadeOut={() => setShowSplash(false)} />}
      {!showSplash && (
        <div className="bg-green-500 text-white p-8">
          <h1 className="text-4xl font-bold">SPLASH WORKS</h1>
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="relative h-screen">
      <video
        autoPlay
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/assets/NewB3TRBEACHBannerGif.mp4" type="video/mp4" />
      </video>
    </header>
  );
}

{!showSplash && (
  <>
    <Header />
    <div className="bg-yellow-500 p-8">HEADER WORKS</div>
  </>
)}

{!showSplash && (
  <>
    <Header />
    <Hero />
    <div className="bg-pink-500 p-8">HERO WORKS</div>
  </>
)}