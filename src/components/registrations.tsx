"use client"; // Required for useState, useEffect, and localStorage

import React, { useState, useEffect } from 'react';
// import Link from 'next/link'; // Removed for broader compatibility

export default function Registrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRegistrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    setRegistrations(storedRegistrations);
    setIsLoading(false);
  }, []);

  const handleDelete = (event: string, index: number) => {
    const eventRegistrations = registrations.filter(reg => reg.events && reg.events.includes(event));
    const updatedEventRegistrations = [...eventRegistrations];
    updatedEventRegistrations.splice(index, 1);
    const updatedRegistrations = registrations.filter(reg => !(reg.events && reg.events.includes(event))).concat(updatedEventRegistrations);
    localStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
    setRegistrations(updatedRegistrations);
    const counterKey = event.toLowerCase().replace(/\s+/g, '_') + '_counter';
    const currentCount = parseInt(localStorage.getItem(counterKey) || '0', 10);
    localStorage.setItem(counterKey, Math.max(0, currentCount - 1).toString());
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all registrations and counters? This action cannot be undone.')) {
      localStorage.removeItem('registrations');
      const storedCounts = localStorage.getItem('eventCounts');
      if (storedCounts) {
        const eventCounts = JSON.parse(storedCounts);
        Object.keys(eventCounts).forEach(event => {
          const counterKey = event.toLowerCase().replace(/\s+/g, '_') + '_counter';
          localStorage.setItem(counterKey, '0');
        });
        localStorage.setItem('eventCounts', JSON.stringify({}));
      }
      const storedEvents = JSON.parse(localStorage.getItem('b3tr_events') || '[]');
      storedEvents.forEach((event: any) => {
        const counterKey = event.name.toLowerCase().replace(/\s+/g, '_') + '_counter';
        localStorage.setItem(counterKey, '0');
      });
      setRegistrations([]);
      window.dispatchEvent(new CustomEvent('registrationsUpdated'));
    }
  };

  // FIX: Replaced spread syntax with Array.from() for better compatibility.
  const allEvents = registrations.flatMap(reg => reg.events || []);
  const uniqueEvents = Array.from(new Set(allEvents)).filter(event => event);

  return (
    <div>
      <header className="py-40 wave-top relative" style={{ backgroundImage: "url('/assets/AltBEACHBanner.png')", backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#000' }}>
        <div className="container mx-auto px-4 text-center">
          <div className="fade-content fade-in">
            <h1 className="text-6xl text-amber-400 font-bold text-outline-blue">
              B3TR{' '}
              <span className="text-custom-blue">BEACH</span> - Registrant Details
            </h1>
            <p className="text-lg text-white mb-6">View all registrations for our clean-up events.</p>
            {isLoading && <p className="text-lg mb-6">Loading B3TR BEACH... If this message persists, please enable JavaScript or check your internet connection.</p>}
          </div>
        </div>
      </header>
      {!isLoading && (
        <section id="registrations" className="bg-gray-100 py-16 wave-bottom wave-top">
          <div className="container mx-auto px-4 text-center">
            <div className="fade-content fade-in">
              <h2 className="text-4xl text-amber-400 font-bold mb-8 text-outline-blue">Registrant Details</h2>
              <p className="text-lg mb-6">Below is a list of all registered participants for each event.</p>
              {uniqueEvents.length > 0 ? (
                uniqueEvents.map(event => {
                  const eventRegistrations = registrations.filter(reg => reg.events && reg.events.includes(event));
                  return (
                    <div key={event} className="mb-8">
                      <h3 className="text-2xl font-bold mb-4 text-custom-blue">{event}</h3>
                      <table className="w-full border-collapse mb-8">
                        <thead>
                          <tr>
                            <th className="border border-custom-blue p-2 bg-amber-400 text-custom-blue font-semibold">Name</th>
                            <th className="border border-custom-blue p-2 bg-amber-400 text-custom-blue font-semibold">Age</th>
                            <th className="border border-custom-blue p-2 bg-amber-400 text-custom-blue font-semibold">Email</th>
                            <th className="border border-custom-blue p-2 bg-amber-400 text-custom-blue font-semibold">VeChain Wallet</th>
                            <th className="border border-custom-blue p-2 bg-amber-400 text-custom-blue font-semibold">X Handle</th>
                            <th className="border border-custom-blue p-2 bg-amber-400 text-custom-blue font-semibold">Merchandise</th>
                            <th className="border border-custom-blue p-2 bg-amber-400 text-custom-blue font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eventRegistrations.map((reg, index) => (
                            <tr key={index}>
                              <td className="border border-custom-blue p-2">{`${reg.firstName || '-'} ${reg.lastName || '-'}`}</td>
                              <td className="border border-custom-blue p-2">{reg.age || '-'}</td>
                              <td className="border border-custom-blue p-2">{reg.email || '-'}</td>
                              <td className="border border-custom-blue p-2">{reg.vechain || '-'}</td>
                              <td className="border border-custom-blue p-2">{reg.xhandle || '-'}</td>
                              <td className="border border-custom-blue p-2">{reg.merchandise ? 'Yes' : 'No'}</td>
                              <td className="border border-custom-blue p-2">
                                <button className="delete-button" onClick={() => handleDelete(event, index)}>Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })
              ) : (
                <p className="text-lg">No registrations found.</p>
              )}
              <div className="text-center">
                <button className="reset-button" onClick={handleReset}>Reset All Registrations</button>
              </div>
              <div className="text-center space-x-6">
                {/* FIX: Replaced Link components with standard <a> tags */}
                <a href="/" className="back-link">Back to Main Page</a>
                <a href="/events" className="back-link">Back to Events</a>
                <a href="/events?manage=true" className="back-link">Back to Manage</a>
              </div>
            </div>
          </div>
        </section>
      )}
      <footer className="bg-amber-400 py-6 wave-top">
        <div className="container mx-auto px-4 text-center">
          <div className="fade-content fade-in">
            <p className="text-xl text-amber-400 text-outline-blue mb-4">
              © 2025{' '}
              <span className="text-black">B3TR</span> BEACH. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-white hover:text-amber-400 text-xl">Privacy Policy</a>
              <a href="#" className="text-white hover:text-amber-400 text-xl">Terms of Service</a>
              <a href="mailto:support@b3trbeach.com" className="text-white hover:text-amber-400 text-xl">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
