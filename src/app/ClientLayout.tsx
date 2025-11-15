// src/app/ClientLayout.tsx
'use client';

import { ReactNode, useState, useEffect } from 'react'; // <-- Import useState/useEffect
import DraggableMascot from '@/components/DraggableMascot';
import {
  inkyFacts,
  rangerFacts,
  inkyIdleGif,
  inkyFactGifs,
  rangerIdleGif,
  rangerFactGifs
} from '@/lib/mascots';

export default function ClientLayout({ children }: { children: ReactNode }) {
  // 1. Add the state and timer back in
  const [showMascots, setShowMascots] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowMascots(true), 5000); // 5-second delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {children}

      {/* 2. Conditionally render the mascots when the timer is done */}
      {showMascots && (
        <>
          <DraggableMascot
            idleImageSrc={inkyIdleGif}
            factImageSrcs={inkyFactGifs}
            altText="Inky the Octopus"
            facts={inkyFacts}
            initialPosition={{ x: 30, y: 200 }}
            animationType="jump"
          />
          <DraggableMascot
            idleImageSrc={rangerIdleGif}
            factImageSrcs={rangerFactGifs}
            altText="Ranger Bear"
            facts={rangerFacts}
            initialPosition={{ x: 150, y: 350 }}
            animationType="slide"
          />
        </>
      )}
    </>
  );
}