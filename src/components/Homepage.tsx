"use client";
import React, { useState, useEffect } from 'react';
// import Link from 'next/link'; // Removed to fix build error

interface SplashScreenProps {
  onFadeOut: () => void;
}

// --- SplashScreen (No changes needed here) ---
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
        className="min-w-full min-h-full"
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'contain',
          objectPosition: 'center',
          transform: 'scale(1.2)',
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

// --- Header (Mobile Responsive Fix) ---
function Header() {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/assets/NewB3TRBEACHBannerGif.mp4';
    video.onloadeddata = () => setShowError(false);
    video.onerror = () => setShowError(true);
  }, []);

  return (
    <header className="relative bg-black overflow-hidden">
      {/* FIX: Replaced fixed height '700px' with responsive Tailwind classes.
        h-[400px] = 400px height on mobile
        md:h-[550px] = 550px height on tablet
        lg:h-[700px] = 700px height on desktop
      */}
      <div className="w-full h-[400px] md:h-[550px] lg:h-[700px]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full"
          style={{
            /* FIX: Changed from 'cover' to 'contain'.
              'contain' ensures the entire video fits inside the container,
              preventing any part of it from being cut off.
              This will show the full video, possibly with black bars
              on the sides if the aspect ratio doesn't match the container.
            */
            objectFit: 'contain',
            objectPosition: 'center',
          }}
        >
          <source src="/assets/NewB3TRBEACHBannerGif.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </header>
  );
}

// --- Hero (No changes needed) ---
function Hero() {
  return (
    <section
      className="bg-gray-100 py-16 hero wave-bottom wave-top"
      style={{
        backgroundImage: `url('/assets/B3TRBEACHAlter.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
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
            {/* FIX: Replaced Link with <a> tag */}
            <a
              href="/instructions"
              className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 rounded-lg text-outline-black"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Features (No changes needed) ---
function Features() {
  return (
    <section
      className="bg-gray-100 py-16 features wave-bottom wave-top"
      style={{
        backgroundImage: `url('/assets/SeaShell.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="container mx-auto px-4 text-center">
        <div className="fade-content">
          <h2 className="text-6xl text-amber-400 font-bold mb-12 text-outline-black">
            Why Choose <span className="text-custom-blue">B3TR</span> BEACH
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-custom-blue p-4 rounded-lg shadow">
              {/* FIX: Replaced Link with <a> tag */}
              <a
                href="/events"
                className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 rounded-lg text-outline-black"
              >
                Clean Up Events
              </a>
              <p className="mt-2 text-white">
                𝐄𝐧𝐠𝐚𝐠𝐞 𝐰𝐢𝐭𝐡 𝐜𝐮𝐫𝐚𝐭𝐞𝐝 𝐜𝐨𝐦𝐦𝐮𝐧𝐢𝐭𝐲 𝐞𝐯𝐞𝐧𝐭𝐬 𝐭𝐡𝐫𝐨𝐮𝐠𝐡 𝐚 𝐬𝐢𝐦𝐩𝐥𝐞, 𝐠𝐚𝐦𝐢𝐟𝐢𝐞𝐝 𝐬𝐲𝐬𝐭𝐞𝐦 𝐰𝐢𝐭𝐡 𝐣𝐮𝐬𝐭 𝐭𝐡𝐫𝐞𝐞 𝐚𝐜𝐭𝐢𝐨𝐧𝐬 𝐩𝐞𝐫 𝐝𝐚𝐲.
              </p>
            </div>
            <div className="bg-custom-blue p-4 rounded-lg shadow">
              {/* FIX: Replaced Link with <a> tag */}
              <a
                href="/store"
                className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 rounded-lg text-outline-black"
              >
                B3TR Rewards
              </a>
              <p className="mt-2 text-white">
                𝐄𝐚𝐫𝐧 𝐗𝐏 𝐩𝐨𝐢𝐧𝐭𝐬 𝐚𝐭 𝐞𝐯𝐞𝐧𝐭𝐬, 𝐫𝐞𝐝𝐞𝐞𝐦𝐚𝐛𝐥𝐞 𝐟𝐨𝐫 <span className="text-amber-400">𝐁𝟑𝐓𝐑</span> 𝐭𝐨𝐤𝐞𝐧𝐬 𝐨𝐫 𝐝𝐢𝐬𝐜𝐨𝐮𝐧𝐭𝐬 𝐨𝐧 𝐥𝐢𝐦𝐢𝐭𝐞𝐝-𝐞𝐝𝐢𝐭𝐢𝐨𝐧 <span className="text-amber-400">𝐁𝟑𝐓𝐑</span> 𝐁𝐄𝐀𝐂𝐇 𝐦𝐞𝐫𝐜𝐡𝐚𝐧𝐝𝐢𝐬𝐞.
              </p>
            </div>
            <div className="bg-custom-blue p-4 rounded-lg shadow">
              {/* FIX: Replaced Link with <a> tag */}
              <a
                href="#"
                className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 rounded-lg text-outline-black"
              >
                Adopt-A-Beach/Park
              </a>
              <p className="mt-2 text-white">
                Want to make an even <span className="text-amber-400">𝐁𝟑𝐓𝐑</span> lasting impact? Become an Adopter! Own a piece of beach, river, lake, or park
                and be apart of the soultion!
              </p>
              <p className="text-amber-400 text-3xl">COMING SOON...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Sponsors (Mobile Responsive Fix) ---
function Sponsors() {
  const [showError, setShowError] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/B3TRBEACHAlter.png';
    img.onload = () => setShowError(false);
    img.onerror = () => setShowError(true);
  }, []);
  return (
    <section
      id="sponsors"
      className="py-16 wave-bottom wave-top relative"
      style={{
        backgroundImage: `url('/assets/B3TRBEACHAlter.png')`,
        backgroundSize: 'cover', // FIX: Changed from fixed pixels to 'cover'
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="fade-content">
          <h2 className="text-center text-6xl text-amber-400 font-bold mb-12 text-outline-black">
            Our Sponsor Partners
          </h2>
          <p className="text-center mb-8 text-amber-400 text-outline-blue">
            We partner with local and eco-conscious brands to bring you the best events. Interested in sponsoring?{' '}
            <a href="mailto:sponsors@b3trbeach.com" className="text-custom-blue">
              Contact us
            </a>
            .
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg shadow text-center">Eco Bag</div>
            <div className="bg-white p-4 rounded-lg shadow text-center">B3TR Transit</div>
            <div className="bg-white p-4 rounded-lg shadow text-center">Forest and Beach</div>
            <div className="bg-white p-4 rounded-lg shadow text-center">Turtle Labs</div>
          </div>
        </div>
        {showError && (
          <div className="error-message visible text-white bg-red-600 p-4 rounded absolute top-4 left-4 z-10">
            Background image not loaded. Check file path: /assets/B3TRBEACHAlter.png
          </div>
        )}
      </div>
    </section>
  );
}

// --- Download (No changes needed) ---
function Download() {
  return (
    <section
      id="download"
      className="py-16 wave-bottom wave-top"
      style={{
        backgroundImage: `url('/assets/SeaShell.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="container mx-auto px-4 text-center">
        <div className="fade-content">
          <h2 className="text-4xl text-amber-400 font-bold mb-4 text-outline-black">
            Download the <span className="text-custom-blue">VeWorld</span> App and{' '}
            <span className="text-custom-blue text-outline-black">B3TR</span> BEACH App (Coming Soon)
          </h2>
          <p className="text-lg mb-6">
            Available on iOS and Android. Start exploring events, earning rewards, and joining the{' '}
            <span className="text-custom-blue text-outline-black">B3TR</span> ecosystem!
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://apps.apple.com/us/app/veworld/id6446854569"
              className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 rounded-lg text-outline-black"
            >
              App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=org.vechain.veworld.app"
              className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 rounded-lg text-outline-black"
            >
              Google Play
            </a>
            <a
              href="https://b3trbeach.com/"
              className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 rounded-lg text-outline-black"
            >
              B3TR BEACH DApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Footer (No changes needed) ---
function Footer() {
  return (
    <footer className="bg-amber-400 py-6 text-center wave-top">
      <div className="container mx-auto px-4">
        <div className="fade-content">
          <p className="text-xl mb-4">
            © 2025 <span className="text-custom-blue">B3TR</span> BEACH. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-white hover:text-amber-400">
              Privacy Policy
            </a>
            <a href="#" className="text-white hover:text-amber-400">
              Terms of Service
            </a>
            <a href="mailto:support@b3trbeach.com" className="text-white hover:text-amber-400">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- Homepage (Splash Screen Logic Fix) ---
export default function Homepage() {
  // FIX: Start with splash screen visible if it hasn't loaded this session
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('hasLoaded');
    }
    return false;
  });

  // FIX: Removed 'contentReady' state. We only need 'showSplash'.
  // The main content is visible by default unless the splash is showing.

  useEffect(() => {
    // Logic to hide splash screen and set session storage
    if (showSplash) {
      sessionStorage.setItem('hasLoaded', 'true');
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 5000); // 5-second duration

      return () => clearTimeout(timer);
    }
  }, [showSplash]); // Only run this logic when showSplash changes

  useEffect(() => {
    // Fade-in content observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    // We querySelectorAll *after* the component has rendered
    const elements = document.querySelectorAll('.fade-content');
    elements.forEach((element) => {
      observer.observe(element);
    });
    
    return () => {
      elements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []); // Run this once on mount

  return (
    <div className="min-h-screen">
      {/* Splash screen is shown based on state */}
      {showSplash && <SplashScreen onFadeOut={() => setShowSplash(false)} />}
      
      {/* FIX: Main content is now controlled by 'showSplash' state.
        It starts invisible and fades in, but is NEVER 'display: none'.
      */}
      <div className={`main-content ${!showSplash ? 'visible' : 'hidden'}`}>
        <Header />
        <Hero />
        <Features />
        <Sponsors />
        <Download />
        <Footer />
      </div>

      <style jsx>{`
        .main-content {
          opacity: 0;
          visibility: hidden; /* FIX: Use visibility instead of display */
          transition: opacity 0.5s ease-in-out;
        }
        .main-content.visible {
          opacity: 1;
          visibility: visible; /* FIX: Make visible when ready */
        }
        .main-content.hidden {
          opacity: 0;
          visibility: hidden; /* FIX: Keep hidden but in DOM */
        }
        .fade-in {
          animation: fadeIn 1s ease-in-out forwards; /* Added 'forwards' to hold state */
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .error-message {
          display: none;
        }
        .error-message.visible {
          display: block;
        }
      `}</style>
    </div>
  );
}




