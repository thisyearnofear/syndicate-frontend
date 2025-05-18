"use client";

import React from "react";
import { motion } from "framer-motion";
import { CurrentJackpot } from "./CurrentJackpot";
import { Countdown } from "./Countdown";
import { OddsCalculator } from "./OddsCalculator";
import { useTicketPrice } from "@/lib/jackpot-queries";
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
 * FullJackpotDisplay component that shows more detailed jackpot information
 * for the dedicated Megapot page
 */
export function FullJackpotDisplay() {
  const { data: ticketPrice = 1 } = useTicketPrice();

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <MegapotWrapper>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl mx-auto"
          >
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-xl">
        <CurrentJackpot />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-6">
            <div className="border-t border-white/10 pt-4">
              <Countdown />
            </div>

            <div className="border-t border-white/10 pt-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center"
              >
                <h2 className="text-sm font-medium text-white/70 mb-1">
                  Ticket Price
                </h2>
                <p className="text-xl font-bold text-white">
                  ${ticketPrice.toFixed(2)} USDC
                </p>
              </motion.div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <h2 className="text-sm font-medium text-white/70 mb-1">
                  How It Works
                </h2>
                <p className="text-sm text-white/80">
                  Join a syndicate to pool resources with others and buy 100+
                  tickets as a group, dramatically increasing your chances of
                  winning.
                </p>
              </motion.div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-t border-white/10 pt-4 md:border-t-0 md:pt-0">
              <OddsCalculator />
            </div>

            <div className="border-t border-white/10 pt-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center"
              >
                <h2 className="text-sm font-medium text-white/70 mb-1">
                  Powered by Megapot
                </h2>
                <p className="text-sm text-white/80">
                  Syndicate leverages Megapot's onchain lottery system to create
                  transparent, fair, and impactful prize pools on Lens Chain.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
          </motion.div>
        </MegapotWrapper>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
