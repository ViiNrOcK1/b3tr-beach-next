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

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <head>
        {/* MOBILE FIX: Ensures proper scaling on phones/tablets */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DAppKitProviderWrapper>
          {children}
        </DAppKitProviderWrapper>
      </body>
    </html>
  );
}