// src/app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import DAppKitProviderWrapper from './DAppKitProviderWrapper';
import { APP_DESCRIPTION } from './config';
import MascotsWrapper from '@/components/MascotsWrapper';

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
          <MascotsWrapper />
        </DAppKitProviderWrapper>
      </body>
    </html>
  );
}