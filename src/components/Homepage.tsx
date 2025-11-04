"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

/* -------------------------------------------------
   SPLASH SCREEN – full‑screen, autoplay, 5‑second fade
   ------------------------------------------------- */
function SplashScreen({ onFadeOut }: SplashScreenProps) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = "/assets/B3TRBEACHSplashGif.mp4";
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
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          objectPosition: "center",
        }}
      >
        <source src="/assets/B3TRBEACHSplashGif.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {showError && (
        <div className="absolute top-4 left-4 bg-red-600 text-white p-3 rounded z-10">
          Splash video failed to load.
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------
   HEADER – looping MP4, 700 px tall
   ------------------------------------------------- */
function Header() {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = "/assets/NewB3TRBEACHBannerGif.mp4";
    video.onloadeddata = () => setShowError(false);
    video.onerror = () => setShowError(true);
  }, []);

  return (
    <header className="relative bg-black overflow-hidden" style={{ height: "700px" }}>
      <video
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          width: "100%",
          height: "700px",
          objectFit: "cover",
          objectPosition: "center",
        }}
      >
        <source src="/assets/NewB3TRBEACHBannerGif.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {showError && (
        <div className="absolute top-4 left-4 z-10 bg-red-600 text-white p-3 rounded">
          Banner video not loaded.
        </div>
      )}
    </header>
  );
}

/* -------------------------------------------------
   HERO – original text, link, and fade animation
   ------------------------------------------------- */
function Hero() {
  return (
    <section
      className="bg-gray-100 py-16 hero wave-bottom wave-top"
      style={{
        backgroundImage: `url('/assets/B3TRBEACHAlter.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container mx-auto px-4 text-center">
        <div className="fade-content">
          <h2 className="text-6xl text-amber-400 font-bold mb-4 text-outline-black">
            Our Mission to Become <span className="text-custom-blue">B3TR</span>
          </h2>
          <p className="text-xl mb-6">
            𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 <span className="text-custom-blue">𝐁𝟑𝐓𝐑 </span>
            <span className="text-amber-400">𝐁𝐄𝐀𝐂𝐇</span>! 🏝️
            𝐎𝐮𝐫 𝐌𝐢𝐬𝐬𝐢𝐨𝐧 𝐢𝐬 𝐭𝐨 𝐜𝐨𝐦𝐛𝐚𝐭 𝐛𝐞𝐚𝐜𝐡 𝐩𝐨𝐥𝐥𝐮𝐭𝐢𝐨𝐧 𝐚𝐧𝐝 𝐩𝐫𝐨𝐭𝐞𝐜𝐭 𝐦𝐚𝐫𝐢𝐧𝐞 𝐞𝐜𝐨𝐬𝐲𝐬𝐭𝐞𝐦𝐬 𝐭𝐡𝐫𝐨𝐮𝐠𝐡 𝐚 𝐝𝐞𝐜𝐲𝐧𝐭𝐫𝐚𝐥𝐢𝐳𝐞𝐝 “𝐂𝐥𝐞𝐚𝐧 𝐭𝐨 𝐄𝐚𝐫𝐧” 𝐦𝐨𝐝𝐞𝐥 𝐩𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲
            <span className="text-custom-blue">𝐁𝟑𝐓𝐑</span>.
            𝐖𝐞 𝐚𝐢𝐦 𝐭𝐨 𝐢𝐧𝐜𝐞𝐧𝐭𝐢𝐯𝐢𝐳𝐞 𝐠𝐥𝐨𝐛𝐚𝐥 𝐜𝐨𝐦𝐦𝐮𝐧𝐢𝐭𝐢𝐞𝐬 𝐭𝐨 𝐫𝐞𝐦𝐨𝐯𝐞 𝐦𝐚𝐫𝐢𝐧𝐞 𝐝𝐞𝐛𝐫𝐢𝐬, 𝐩𝐫𝐞𝐯𝐞𝐧𝐭 𝐦𝐢𝐜𝐫𝐨𝐩𝐥𝐚𝐬𝐭𝐢𝐜 𝐩𝐨𝐥𝐥𝐮𝐭𝐢𝐨𝐧, 𝐚𝐧𝐝 𝐫𝐞𝐬𝐭𝐨𝐫𝐞 𝐜𝐨𝐚𝐬𝐭𝐚𝐥 𝐡𝐚𝐛𝐢𝐭𝐚𝐭𝐬 𝐛𝐲 𝐢𝐧𝐜𝐞𝐧𝐭𝐢𝐯𝐢𝐳𝐢𝐧𝐠 𝐮𝐬𝐞𝐫𝐬 𝐭𝐨 𝐚𝐬𝐬𝐢𝐬𝐭 𝐢𝐧 𝐭𝐡𝐞 𝐜𝐥𝐞𝐚𝐧 𝐮𝐩 𝐞𝐟𝐟𝐨𝐫𝐭𝐬 𝐚𝐧𝐝 𝐞𝐦𝐩𝐨𝐰𝐞𝐫 𝐢𝐧𝐝𝐢𝐯𝐢𝐝𝐮𝐚𝐥𝐬 𝐭𝐨 𝐝𝐫𝐢𝐯𝐞 𝐥𝐚𝐬𝐭𝐢𝐧𝐠 𝐞𝐧𝐯𝐢𝐫𝐨𝐧𝐦𝐞𝐧𝐭𝐚𝐥 𝐢𝐦𝐩𝐚𝐜𝐭.
            𝐄𝐧𝐣𝐨𝐲𝐢𝐧𝐠 𝐚 𝐝𝐚𝐲 𝐚𝐭 𝐭𝐡𝐞 𝐛𝐞𝐚𝐜𝐡 𝐚𝐥𝐥 𝐭𝐡𝐞 𝐰𝐡𝐢𝐥𝐞 𝐜𝐨𝐧𝐭𝐫𝐢𝐛𝐮𝐭𝐢𝐧𝐠 𝐭𝐨 𝐚 𝐫𝐞𝐚𝐥 𝐬𝐮𝐬𝐭𝐚𝐢𝐧𝐚𝐛𝐥𝐞 𝐜𝐚𝐮𝐬𝐞 𝐛𝐲 𝐝𝐨𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐩𝐚𝐫𝐭 𝐚𝐧𝐝 𝐦𝐚𝐤𝐢𝐧𝐠 𝐨𝐮𝐫 𝐛𝐞𝐚𝐜𝐡𝐞𝐬
            <span className="text-custom-blue">𝐁𝟑𝐓𝐑</span>.
            <br />
            𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐟𝐨𝐫 𝐣𝐨𝐢𝐧𝐢𝐧𝐠 𝐮𝐬 🤟🏽.
          </p>
          <div className="flex justify-center mt-6">
            <Link
              href="/instructions"
              className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 rounded-lg text-outline-black"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}