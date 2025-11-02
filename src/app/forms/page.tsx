"use client"; // Matches client-side rendering

import Head from 'next/head';
import Forms from '@/components/Forms'; // Import the Forms component
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function FormsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [event, setEvent] = useState<string | null>(null);

  useEffect(() => {
    console.log('useEffect triggered, checking event param');
    const eventParam = searchParams.get('event');
    console.log('Event param from searchParams:', eventParam);
    if (eventParam) {
      const decodedEvent = decodeURIComponent(eventParam);
      setEvent(decodedEvent);
      console.log('Event set to:', decodedEvent);
    }
  }, [searchParams]);

  console.log('FormsPage rendering with event:', event); // Debug log

  return (
    <>
      <Head>
        <title>{event ? `B3TR BEACH - ${event} Registration` : 'B3TR BEACH Forms'}</title>
      </Head>
      <div className="flex flex-col min-h-screen">
        <header className="py-40 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/assets/AltBEACHBanner.png')", backgroundSize: '1700px 500px' }}> {/* Match globals.css */}
          <div className="container mx-auto px-4 text-center bg-opacity-30 p-4"> {/* Reduced opacity for better text visibility */}
            <div className="fade-content fade-in"> {/* Force fade-in for visibility */}
              <h1 className="text-6xl font-bold mb-4 text-outline-black text-white">
                <span className="text-custom-blue text-outline-black ">B3TR</span>
                <span className="text-amber-400"> BEACH  {event || 'Event'} Registration</span>
              </h1>
              <p className="text-lg mb-6 text-white text-outline-black">Register to join our clean-up events and make a difference!</p>
            </div>
          </div>
        </header>
        <section className="flex-grow wave-top wave-bottom min-h-[90vh] pt-16 relative bg-gray-100">
          <div className="container mx-auto px-4 text-center relative z-20">
            <div className="fade-content fade-in"> {/* Force fade-in for visibility */}
              <h2 className="text-4xl text-amber-400 font-bold mb-8 text-outline-black">
                {event ? `Register for ${event}` : 'Register for B3TR BEACH Events'}
              </h2>
              <p className="text-lg mb-6 text-white text-outline-black">Fill out the form below to join our clean-up events and start earning B3TR tokens!</p>
              <div className="form-container bg-white p-4 rounded-lg shadow mx-auto max-w-2xl z-30" style={{ position: 'relative', opacity: 1 }}>
                <Forms initialEvent={event} />
              </div>
            </div>
          </div>
        </section>
        <footer className="bg-custom-blue py-6 wave-top">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xl text-amber-400 text-outline-blue mb-4">© {new Date().getFullYear()} <span className="text-black">B3TR</span> BEACH Events. All rights reserved.</p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-white hover:text-amber-400">Privacy Policy</a>
              <a href="#" className="text-white hover:text-amber-400">Terms of Service</a>
              <a href="mailto:support@b3trbeach.com" className="text-white hover:text-amber-400">Contact Us</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  )}