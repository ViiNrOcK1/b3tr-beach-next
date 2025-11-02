"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';

function Header() {
  useEffect(() => {
    // Trigger fade-in animation on mount
    const elements = document.querySelectorAll('.fade-content');
    elements.forEach((el) => el.classList.add('fade-in'));
  }, []);

  return (
    <header className="relative bg-black bg-no-repeat wave-top">
      <Image
        src="/assets/AltBEACHBanner.png"
        alt="Alt BEACH Banner"
        fill
        style={{ objectFit: 'contain', objectPosition: 'center' }}
        sizes="1700px"
        priority
      />
      <div className="container mx-auto px-4 relative z-10 py-40">
        <div className="fade-content block text-center">
          <h1 className="text-6xl font-bold text-amber-400 inline-block">
            <span className="text-custom-blue text-outline-blue">B3TR</span>{' '}
            <span className="text-amber-400">BEACH</span> {' '}
            <span className="text-amber-400">Store</span>
          </h1>
          <div className="mt-4 text-center">
            <p className="text-xl text-white inline-block">Eco-friendly merchandise powered by VeChain!</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;