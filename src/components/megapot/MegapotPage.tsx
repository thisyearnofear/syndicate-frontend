"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { base } from "viem/chains";
import { WagmiProvider } from "wagmi";
import { MegapotWrapper } from "./MegapotWrapper";
import { FullJackpotDisplay } from "../jackpot/FullJackpotDisplay";
import { motion } from "framer-motion";

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
 * MegapotPage component that sets up the necessary providers
 * and displays the Megapot Jackpot components
 */
export function MegapotPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <MegapotWrapper>
          <div className="container mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 text-center"
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Megapot Jackpots
              </h1>
              <p className="text-white/70 max-w-2xl mx-auto">
                Join our Syndicate pools to increase your chances of winning
                these jackpots while supporting causes you care about.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FullJackpotDisplay />
            </motion.div>
          </div>
        </MegapotWrapper>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
