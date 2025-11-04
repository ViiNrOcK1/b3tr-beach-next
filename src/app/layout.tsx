import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DAppKitProviderWrapper from './DAppKitProviderWrapper';
import { APP_DESCRIPTION } from './config';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'B3TR BEACH',
  description: APP_DESCRIPTION,
  viewport: 'width=device-width, initial-scale=1.0',  // ← MOBILE FIX: Add here
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ← TEMP DEBUG: Remove after fix */}
        <div style={{ padding: '20px', background: 'yellow' }}>
          <h1 style={{ color: 'red' }}>DEBUG: Layout Loading</h1>
          <p>Site is rendering — check console for errors.</p>
        </div>
        <DAppKitProviderWrapper>
          {children}
        </DAppKitProviderWrapper>
        {/* ← END DEBUG */}
      </body>
    </html>
  );
}