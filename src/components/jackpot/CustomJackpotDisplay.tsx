"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CurrentJackpot } from './CurrentJackpot';
import { Countdown } from './Countdown';
import { OddsCalculator } from './OddsCalculator';
import Link from 'next/link';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { base } from "viem/chains";
import { WagmiProvider } from "wagmi";
import { MegapotWrapper } from "@/components/megapot/MegapotWrapper";

// Private Alchemy RPC URL for Base chain
const ALCHEMY_BASE_RPC_URL =
  "https://base-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH";

// Create a client for React Query with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Configure Wagmi with Base chain using Alchemy RPC
const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(ALCHEMY_BASE_RPC_URL),
  },
});

/**
 * CustomJackpotDisplay component that shows only the essential jackpot information
 * without the ticket buying UI or FAQ dropdown
 */
export function CustomJackpotDisplay() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <MegapotWrapper>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
              <CurrentJackpot />
              
              <div className="my-4 border-t border-white/10 pt-4">
                <Countdown />
              </div>
              
              <div className="my-4 border-t border-white/10 pt-4">
                <OddsCalculator />
              </div>
              
              <div className="mt-6 flex justify-center">
                <Link 
                  href="/megapot"
                  className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:opacity-90 transition-opacity text-sm"
                >
                  View Full Jackpot Details
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
        </MegapotWrapper>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
