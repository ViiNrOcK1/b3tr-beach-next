// src/components/MascotsWrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import DraggableMascot from '@/components/DraggableMascot';
import { inkyFacts, rangerFacts, inkyIdleGif, inkyFactGifs, rangerIdleGif, rangerFactGifs } from '@/app/layout';

export default function MascotsWrapper() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 flex justify-center gap-8 pointer-events-none">
      <div className="pointer-events-auto animate-fadeIn">
        <DraggableMascot
          idleImageSrc={inkyIdleGif}
          factImageSrcs={inkyFactGifs}
          altText="Inky the Octopus"
          facts={inkyFacts}
          initialPosition={{ x: 30, y: 200 }}
          animationType="jump"
        />
      </div>
      <div className="pointer-events-auto animate-fadeIn">
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
  );
}