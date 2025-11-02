// src/app/config.ts
export const RECIPIENT_ADDRESS = process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS ?? '0x8d5fb3e576bbe08279a3a64194c01b36d4bbb0c9';
if (!RECIPIENT_ADDRESS) {
  throw new Error('NEXT_PUBLIC_RECIPIENT_ADDRESS must be set');
}
export const NODE_URL = process.env.NEXT_PUBLIC_NODE_URL ?? 'https://mainnet.vechain.org';
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK ?? 'main';
export const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? ''; // Expose to client
export const DELEGATION_URL = process.env.DELEGATION_URL ?? '';
export const APP_TITLE = process.env.NEXT_PUBLIC_APP_TITLE ?? 'B3TR BEACH Store';
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? 'Shop for eco-friendly merchandise and pay with B3TR tokens!';
export const APP_ICONS = process.env.NEXT_PUBLIC_APP_ICONS ? process.env.NEXT_PUBLIC_APP_ICONS.split(',') : [];