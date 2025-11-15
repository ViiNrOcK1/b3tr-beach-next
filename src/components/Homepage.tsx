"use client";
import React, { useState, useEffect } from 'react';
// import Link from 'next/link'; // Removed to fix build error

interface SplashScreenProps {
  onFadeOut: () => void;
}

// --- SplashScreen ---
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
          className="min-w-full min-h-full"
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'contain',      // ← SHOWS FULL VIDEO
          objectPosition: 'center',
          transform: 'scale(1.2)',   // ← ZOOM IN to fill screen
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
      {/* FIX 1: Added 'relative' class to this div. 
        This makes it the positioning parent for the absolute video. 
      */}
      <div className="relative w-full h-[400px] md:h-[550px] lg:h-[700px]">
        <video
          autoPlay
          loop
          muted
          playsInline
    preload="auto"
          className="header-video" // This class is now targeted by the *global* style below
        >
          <source src="/assets/NewB3TRBEACHBannerGif.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </header>
  );
}

// --- Hero ---
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
          <p className="text-2xl mb-6">
            Welcome to <span className="text-custom-blue">B3TR </span>
            <span className="text-amber-400">Beach</span>! 🏝️
            Our Mission is to combat beach, river, stream and park pollution and protect marine and land ecosystems through a decentralized “Clean to Earn” initiative that rewards real-world impact for the
            <span className="text-custom-blue text-outline-black"> B3TR</span>.  We promote and feature organizations making a difference — locally and globally. We facilitate, collaborate and act as a central environmental fund, raising capital and awareness to support community-led
outreach programs dedicated to cleaning beaches, parks, rivers, and any natural habitats impacted by waste. Educating through clean up events to help spread awareness, and to showcase our Proof of Work.  We always have been about action as we feel everyone can do just a small part to make a big difference.   Our vision is a world with pristine natural environments where local communities are empowered and funded to protect their ecosystems, ensuring wildlife can  thrive in a clean and healthy world. Our mascot characters (Ranger Bear & Inky the Octopus) help make education fun and relatable for kids and appeal to anyone in between.  In order to do B3TR we must KNOW B3TR.  Educate, Demonstrate, Collaborate is the mindset we carry for success. With your help we can truly make our planet B3TR.
            <br />
            Thank You for Joining Us! 🤟🏽.
          </p>
        </div>
      </div>
    </section>
  );
}

// --- Features ---
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
         <div className="mb-2 p-16 flex justify-center">
	<div className="bg-custom-blue p-4 rounded-xl shadow w-full max-w-2xl">
              <a
                href="/mission"
                className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 rounded-lg text-outline-black">
                What We Do B3TR
              </a>
              <p className="mt-2 text-white text-xl">
                Here's a glimpse of what we do first hand! Putting our actions where our mouth is! 
              </p>
            </div>
</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-custom-blue p-4 rounded-lg shadow">
              <a
                href="/events"
                className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 rounded-lg text-outline-black"
              >
                Clean Up Events
              </a>
              <p className="mt-2 text-white text-xl">
                Engage with curated community events sponsored by us and/or our partners and directly helping to educate and reward for real impact
              </p>
            </div>
            <div className="bg-custom-blue p-4 rounded-lg shadow">
              <a
                href="/store"
                className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 rounded-lg text-outline-black"
              >
                B3TR Rewards
              </a>
              <p className="mt-2 text-white text-xl">
                Earn XP Points and rewards at events that are redeemable for <span className="text-custom-blue text-outline-black">B3TR</span>  <span className="text-amber-400">𝐁EACH</span>  merchandise. 75% of all net proceeds go directly towards clean up events(including tools and equipment) and initiatives to continue our planetary duty to the environment!
              </p>
            </div>
            <div className="bg-custom-blue p-4 rounded-lg shadow">
              <a
                href="#"
                className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 rounded-lg text-outline-black"
              >
                Adopt-A-Beach/Park
              </a>
              <p className="mt-2 text-white text-xl">
                Want to make an even <span className="text-amber-400">B3TR</span> lasting impact? Become an Adopter! Own a piece of beach, river, lake, or park
                and be apart of the solution!
              </p>
              <p className="text-amber-400 text-3xl">COMING SOON...</p>
	    
            </div>
	<p className="p-8"></p>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Sponsors ---
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
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="fade-content">
          <h2 className="text-center text-6xl text-amber-400 font-bold mb-8 text-outline-black">
            WE....EDUCATE, DEMONSTRATE, COLLABORATE, PARTICPATE AND IF YOU SUPPORT OUR CAUSE FEEL FREE TO DONATE, WHICH ALLOWS US TO GENERATE IN ORDER TO REGENERATE 
          </h2>
          <p className="text-center mb-16 text-amber-400 text-outline-black text-2xl">
            We partner with local and eco-conscious brands to bring you the best events. Interested in sponsoring?{' '}
            <a href="mailto:b3tr.beach@gmail.com" className="text-custom-black">
              Contact us
            </a>
            .
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <a href="#" className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 rounded-lg text-outline-black">
                EDUCATE
              </a>

            <div className="bg-white p-4 rounded-lg shadow text-center">DEMONSTRATE</div>
            <div className="bg-white p-4 rounded-lg shadow text-center">COLLABORATE</div>
            <div className="bg-white p-4 rounded-lg shadow text-center">PARTICIPATE</div>
	    <div className="bg-white p-4 rounded-lg shadow text-center">DONATE</div>
          </div>
	<p className="p-8"></p>
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

// --- Download ---
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
          <p className="text-xl mb-6">
            Available on iOS and Android. Start exploring events, earning rewards, and joining the{' '}
            <span className="text-custom-blue text-outline-black">B3TR</span> ecosystem!
          </p>
	<div className="flex justify-center mt-6">
            <a href="/instructions"
              className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 mb-2 rounded-lg text-outline-black">
              Get Started
            </a>
	
	</div>
          <div className="flex justify-center space-x-4">
            <a
              href="https://apps.apple.com/us/app/veworld/id6446854569"
              className="bg-amber-300 hover:bg-black text-green-500 text-2xl font-bold px-2 py-1 rounded-lg text-outline-black">
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

// --- Footer ---
function Footer() {
  return (
    <footer className="bg-amber-400 py-10 text-center wave-top">
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
            <a href="mailto:b3tr.beach@gmail.com" className="text-white hover:text-amber-400">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- Homepage ---
export default function Homepage() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('hasLoaded');
    }
    return false;
  });

  useEffect(() => {
    if (showSplash) {
      sessionStorage.setItem('hasLoaded', 'true');
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 5000); 

      return () => clearTimeout(timer);
    }
  }, [showSplash]); 

  useEffect(() => {
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

    const elements = document.querySelectorAll('.fade-content');
    elements.forEach((element) => {
      observer.observe(element);
    });
    
    return () => {
      elements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []); 

  return (
    <div className="min-h-screen">
      {showSplash && <SplashScreen onFadeOut={() => setShowSplash(false)} />}
      
      <div className={`main-content ${!showSplash ? 'visible' : 'hidden'}`}>
        <Header />
        <Hero />
        <Features />
        <Sponsors />
        <Download />
        <Footer />
      </div>

      {/* FIX 2: Added 'global' keyword to <style jsx>.
        This allows the .header-video styles to apply to the child Header component.
      */}
      <style jsx global>{`
        .main-content {
          opacity: 0;
          visibility: hidden; 
          transition: opacity 0.5s ease-in-out;
        }
        .main-content.visible {
          opacity: 1;
          visibility: visible;
        }
        .main-content.hidden {
          opacity: 0;
          visibility: hidden;
        }
        .fade-in {
          animation: fadeIn 1s ease-in-out forwards;
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

        /* These styles are now GLOBAL and will apply to .header-video 
        */
        .header-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-position: center;
          object-fit: cover; /* This is the mobile-first default (no distortion) */
        }

        @media (min-width: 768px) { /* md: breakpoint */
          .header-video {
            object-fit: fill; /* This is the desktop override (fills space) */
          }
        }
      `}</style>
    </div>
  );
}

