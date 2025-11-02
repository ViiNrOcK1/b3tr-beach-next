"use client";  // Required for useEffect and client-side DOM manipulation

import React, { useEffect } from 'react';
import Link from 'next/link';  // For client-side navigation

export default function Instructions() {
  useEffect(() => {
    console.log('Intersection Observer initialized');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            console.log('Fade-in applied to', entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-content').forEach((element) => {
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  console.log('Rendering Instructions');

  return (
    <div>
      <header className="py-40 wave-bottom">
        <div className="container mx-auto px-4 text-center">
          <div className="fade-content">
            <h1 className="text-6xl text-amber-400 font-bold text-outline-black">
              Get Started with{' '}
              <span className="text-custom-blue text-outline-black">B3TR</span> BEACH
            </h1>
          </div>
        </div>
      </header>
      <section id="instructions" className="py-16 wave-top wave-bottom" style={{ backgroundImage: "url('/assets/SeaShell.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="container mx-auto px-4 text-center">
          <div className="fade-content">
            <h2 className="text-4xl text-amber-400 font-bold mb-8 text-outline-black"> {/* Changed to text-outline-black */}
              How to Download VeWorld and Join B3TR BEACH
            </h2>
            <p className="text-xl mb-6">
              To get started with the{' '}
              <span className="text-custom-blue text-outline-black">B3TR BEACH</span> Dapp and the VeBetterDAO ecosystem, download the
              VeWorld App, VeChain’s official non-custodial wallet. Follow these steps:
            </p>
            <ol className="text-center mb-6">
              <li className="text-xl">
                Visit the official{' '}
                <a href="https://vebetterdao.org/" className="text-custom-blue text-outline-black">
                  VeBetterDAO.ORG
                </a>{' '}
                page.
              </li>
              <li className="text-xl">
                Choose your platform: Download the app from the{' '}
                <a href="https://apps.apple.com/us/app/veworld/id6446854569" className="text-custom-blue text-outline-black">
                  App Store
                </a>{' '}
                for iOS or{' '}
                <a
                  href="https://play.google.com/store/apps/details?id=org.vechain.veworld.app&pcampaignid=web_share"
                  className="text-custom-blue text-outline-black"
                >
                  Google Play
                </a>{' '}
                for Android.
              </li>
              <li className="text-xl">Install the app and create a new wallet or import an existing one using your recovery phrase.</li>
              <li className="text-xl">
                Once installed, use VeWorld to connect to the{' '}
                <span className="text-custom-blue text-outline-black">B3TR BEACH</span> Dapp and explore the VeBetterDAO ecosystem for
                sustainable actions.
              </li>
            </ol>
            <div className="video-container flex justify-center">
              <iframe
                id="instruction-video"
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/g65AgOY-SlQ?si=ROPhDJxlthYgEyLg"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ maxWidth: '560px', width: '100%' }}
              ></iframe>
            </div>
          </div>
        </div>
      </section>
      <section id="info" className="py-16 wave-top wave-bottom" style={{ backgroundImage: "url('/assets/SeaShell.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="container mx-auto px-4 text-center">
          <div className="fade-content">
            <h2 className="text-4xl text-amber-400 font-bold mb-8 text-outline-black"> {/* Changed to text-outline-black */}
              About VeChain and the VeBetter Initiative
            </h2>
            <p className="text-xl mb-6">
              VeChain, founded in 2015 by Sunny Lu, is a leading blockchain ecosystem focused on real-world adoption,
              particularly in sustainability. Since 2015, VeChain has evolved to drive Web3 adoption with a focus on
              tokenization and enterprise dApps, building hundreds of applications to support this mission. The
              VeBetter initiative, launched in 2024, is a community-driven platform that incentivizes sustainable
              actions through its “X-to-Earn” model, where “X” represents actions like cleaning beaches or reducing
              waste.
            </p>
            <p className="text-xl mb-6">
              VeBetter is powered by the{' '}
              <span className="text-custom-blue text-outline-black">B3TR</span> token, which rewards users for eco-friendly actions, and
              the VOT3 token, used for governance within the VeBetterDAO ecosystem. This decentralized autonomous
              organization allows users to vote on proposals and allocations, shaping the future of sustainability
              dApps. With over 28 million tokenized actions and 4 million users, VeBetter aims to reach one million
              daily active users and onboard a billion users by 2030, aligning with the UN’s Sustainable Development
              Goals.
            </p>
            <p className="text-xl mb-6">
              The VeWorld App serves as the gateway to this ecosystem, offering gas fee abstraction and cross-chain
              interoperability with over 40 blockchains. By connecting to{' '}
              <span className="text-custom-blue text-outline-black">B3TR BEACH</span> via VeWorld, you can participate in cleaning
              beaches, earn{' '}
              <span className="text-custom-blue text-outline-black">B3TR</span> tokens, and contribute to a thriving aquatic economy
              while enjoying a day at the beach.
            </p>
            <Link href="/" className="back-link text-outline-black">
              Back to Main Page
            </Link>
          </div>
        </div>
      </section>
      <footer className="bg-custom-blue py-6 text-center wave-top">
        <div className="container mx-auto px-4">
          <div className="fade-content">
            <p className="text-xl text-amber-400 text-outline-blue mb-4">
              © 2025{' '}
              <span className="text-black">B3TR</span> BEACH. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-white hover:text-amber-400">Privacy Policy</a>
              <a href="#" className="text-white hover:text-amber-400">Terms of Service</a>
              <a href="mailto:support@b3trbeach.com" className="text-white hover:text-amber-400">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}