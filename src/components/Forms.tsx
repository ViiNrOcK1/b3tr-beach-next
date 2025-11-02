"use client"; // Required for useState and client-side interactivity

import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // Removed for broader compatibility

interface FormsProps {
  initialEvent?: string | null;
}

export default function Forms({ initialEvent }: FormsProps) {
  // const router = useRouter(); // Removed for broader compatibility
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    vechain: '',
    xhandle: '',
    merchandise: false,
    events: [] as string[],
  });

  useEffect(() => {
    if (initialEvent && !formData.events.includes(initialEvent)) {
      setFormData((prev) => ({
        ...prev,
        events: [initialEvent, ...prev.events],
      }));
    }
  }, [initialEvent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const updatedEvents = checked
        ? [...prev.events, value]
        : prev.events.filter((event) => event !== value);
      return { ...prev, events: updatedEvents };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.age) {
      alert('Please fill in First Name, Last Name, Email, and Age fields.');
      return;
    }
    if (formData.vechain && !/^0x[a-fA-F0-9]{40}$/.test(formData.vechain)) {
      alert('Please enter a valid VeChain wallet address (0x followed by 40 hexadecimal characters) or leave it blank.');
      return;
    }

    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    const newRegistration = { ...formData, timestamp: Date.now() };
    registrations.push(newRegistration);
    localStorage.setItem('registrations', JSON.stringify(registrations));

    const storedCounts = localStorage.getItem('eventCounts');
    const eventCounts = storedCounts ? JSON.parse(storedCounts) : {};
    formData.events.forEach((event) => {
      eventCounts[event] = (eventCounts[event] || 0) + 1;
      const counterKey = event.toLowerCase().replace(/\s+/g, '_') + '_counter';
      localStorage.setItem(counterKey, (eventCounts[event]).toString());
    });
    localStorage.setItem('eventCounts', JSON.stringify(eventCounts));

    window.dispatchEvent(new CustomEvent('registrationsUpdated', { detail: registrations }));

    setTimeout(() => {
      // Replaced router.push with window.location.href for universal compatibility
      window.location.href = `/thankyou?event=${encodeURIComponent(formData.events.join(', '))}`;
    }, 500);
  };

  const handleCancel = () => {
    // Replaced router.push with window.location.href for universal compatibility
    window.location.href = '/events';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-lg font-bold">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-lg font-bold">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-lg font-bold">Age</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-lg font-bold">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-lg font-bold">VeChain Wallet Address</label>
        <input
          type="text"
          name="vechain"
          value={formData.vechain}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block text-lg font-bold">X Handle</label>
        <input
          type="text"
          name="xhandle"
          value={formData.xhandle}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div className="mb-4 text-left">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="merchandise"
            checked={formData.merchandise}
            onChange={handleChange}
            className="form-checkbox"
          />
          <span className="ml-2 text-lg">Purchase Clean-Up Merchandise for XP Boost</span>
        </label>
      </div>
      <div className="flex space-x-6">
        <button
          type="submit"
          className="bg-amber-400 text-green-500 px-4 py-2 rounded-lg font-bold hover:bg-black hover:text-white"
        >
          Submit
        </button>
        <button
          type="button"
          className="bg-gray-400 text-red-500 px-4 py-2 rounded-lg font-bold hover:bg-red-600 hover:text-white"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

