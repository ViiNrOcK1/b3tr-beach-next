"use client";

import React from 'react';
import { DAppKitProvider } from '@vechain/dapp-kit-react';
import { ThorClient } from '@vechain/sdk-network';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NODE_URL, WALLET_CONNECT_PROJECT_ID, APP_TITLE, APP_DESCRIPTION, APP_ICONS } from './config';

const queryClient = new QueryClient();
const thor = ThorClient.fromUrl(NODE_URL);

const walletConnectOptions = WALLET_CONNECT_PROJECT_ID
  ? {
      projectId: WALLET_CONNECT_PROJECT_ID,
      metadata: {
        name: APP_TITLE,
        description: APP_DESCRIPTION,
        url: window.location.origin,
        icons: APP_ICONS,
      },
    }
  : undefined;

export default function DAppKitProviderWrapper({ children }: { children: React.ReactNode }) {
  console.log('DAppKitProviderWrapper initialized with node:', NODE_URL, 'walletConnectOptions:', walletConnectOptions);
  return (
    <QueryClientProvider client={queryClient}>
      <DAppKitProvider
        node={NODE_URL}
        usePersistence={true}
        walletConnectOptions={walletConnectOptions}
        logLevel="DEBUG"
      >
        {children}
      </DAppKitProvider>
    </QueryClientProvider>
  );
}