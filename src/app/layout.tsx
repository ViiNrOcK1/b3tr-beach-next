// src/app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import DAppKitProviderWrapper from './DAppKitProviderWrapper';
import { APP_DESCRIPTION } from './config';

// 1. Import the mascot component and all the data
import DraggableMascot from '@/components/DraggableMascot';
import { 
  inkyFacts, 
  rangerFacts, 
  inkyIdleGif, 
  inkyFactGifs, 
  rangerIdleGif, 
  rangerFactGifs 
} from '@/lib/mascots';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = { title: 'B3TR BEACH', description: APP_DESCRIPTION };
export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <DAppKitProviderWrapper>
          {children}

          {/* 2. Add the mascots directly here. 
            We removed the broken MascotsWrapper. 
          */}
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

        </DAppKitProviderWrapper>
      </body>
    </html>
  );
}