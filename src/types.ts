// src/types.ts
import { QueryObserverResult } from '@tanstack/react-query';
import { TransactionReceipt } from '@vechain/sdk-network';

export interface CallResult {
  success: boolean;
  result?: bigint | { plain?: unknown; array?: unknown[] | undefined; errorMessage?: string | undefined } | string | undefined;
}

export interface Product {
  id: number | string;
  name: string;
  priceUSD: number;
  priceB3TR: number;
  description: string;
  soldOut?: boolean;
}

export interface UserDetails {
  name: string;
  email: string;
  address: string;
}

export interface Purchase {
  item: string;
  amount: number;
  account: string;
  txId: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  userAddress: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface RefetchRefs {
  refetchB3TR: () => Promise<QueryObserverResult<string | null, Error>>;
  refetchVTHO: () => Promise<QueryObserverResult<string | null, Error>>;
  refetchReceipt: () => Promise<QueryObserverResult<TransactionReceipt | null, Error>>;
}