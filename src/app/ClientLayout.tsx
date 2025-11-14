// src/app/ClientLayout.tsx
'use client';

import { ReactNode } from 'react';
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
  // We've removed the useState, useEffect, and all the wrapper <div>s.
  // The mascot components will now render immediately,
  // use their own CSS animations to appear, and be fully interactive.
  return (
    <>
      {children}

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
  );
}