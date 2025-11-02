"use client"; // Mark as Client Component to use useSearchParams

import Events from '@/components/Events'; // Assume file is Events.tsx
import { useSearchParams } from 'next/navigation';

export default function EventsPage() {
  const searchParams = useSearchParams();
  const manage = searchParams.get('manage');

  return <Events manage={manage === 'true'} />; // Pass manage state as a prop
}