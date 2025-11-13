// src/app/mission/page.tsx
import Mission from '@/components/Mission';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mission | B3TR Beach',
  description:
    'Learn about B3TR Beach’s mission to fund local cleanups, educate youth through mascots, and create lasting environmental impact.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function MissionPage() {
  return <Mission />;
}