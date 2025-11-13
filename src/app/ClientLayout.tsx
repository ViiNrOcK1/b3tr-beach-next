// src/app/ClientLayout.tsx
'use client';

import { ReactNode, useState, useEffect } from 'react';
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
  const [showMascots, setShowMascots] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowMascots(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {children}

      {/* MASCOTS: Appear after 5s with fade-in */}
      {showMascots && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="animate-fadeIn">
            <DraggableMascot
              idleImageSrc={inkyIdleGif}
              factImageSrcs={inkyFactGifs}
              altText="Inky the Octopus"
              facts={inkyFacts}
              initialPosition={{ x: 30, y: 200 }}
              animationType="jump"
            />
          </div>
          <div className="animate-fadeIn">
            <DraggableMascot
              idleImageSrc={rangerIdleGif}
              factImageSrcs={rangerFactGifs}
              altText="Ranger Bear"
              facts={rangerFacts}
              initialPosition={{ x: 150, y: 350 }}
              animationType="slide"
            />
          </div>
        </div>
      )}
    </>
  );
}