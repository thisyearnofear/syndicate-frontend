"use client";

import { createPublicClient, fallback, http } from 'viem';
import { base } from 'viem/chains';

// Private Alchemy RPC URL for Base chain
const ALCHEMY_BASE_RPC_URL = 'https://base-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH';

// Use multiple RPC providers with fallback for reliability
const client = createPublicClient({
  chain: base,
  transport: fallback([
    // Primary: Private Alchemy RPC
    http(ALCHEMY_BASE_RPC_URL),
    // Fallbacks: Public RPCs
    http('https://base.llamarpc.com'),
    http('https://base.rpc.thirdweb.com'),
    http('https://base.publicnode.com'),
    // Last resort: Default RPC
    http(),
  ]),
  batch: {
    multicall: true, // Enable multicall to batch requests
  },
});

export default client;
