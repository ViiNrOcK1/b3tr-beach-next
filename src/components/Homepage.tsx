"use client";
import React, { useState, useEffect } from 'react';

// ← ADD THIS
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
        muted
        playsInline
        loop
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      >
        <source src="/assets/B3TRBEACHSplashGif.mp4" type="video/mp4" />
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
    <header className="relative bg-black overflow-hidden" style={{ height: '100vh' }}>
      <video
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      >
        <source src="/assets/NewB3TRBEACHBannerGif.mp4" type="video/mp4" />
      </video>
      {showError && (
        <div className="absolute top-4 left-4 z-10 bg-red-600 text-white p-3 rounded">
          Banner video failed.
        </div>
      )}
    </header>
  );
}

// === ADD YOUR ORIGINAL HERO, FEATURES, SPONSORS, DOWNLOAD, FOOTER BELOW ===

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
          {/* Add Hero, Features, etc. here */}
        </>
      )}
    </div>
  );
}