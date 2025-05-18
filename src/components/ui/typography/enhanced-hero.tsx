"use client";

import React from "react";
import { Button } from "@/components/ui/inputs/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { JackpotHeroDisplay } from "@/components/megapot/JackpotHeroDisplay";
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

export function EnhancedHero() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <MegapotWrapper>
          <section className="pt-12 pb-16 relative overflow-hidden">
            {/* Glowing orbs - positioned to match your existing design */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500 rounded-full filter blur-[100px] opacity-20 z-0" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500 rounded-full filter blur-[100px] opacity-20 z-0" />

            <div className="container mx-auto px-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left column - Text content */}
                <div className="text-left">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4 inline-block px-3 py-1 bg-white/10 text-cyan-400 hover:bg-white/20 backdrop-blur-sm rounded-full text-sm"
                  >
                    Built on Lens Protocol 🌿
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
                  >
                    Rally Your Cause,{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                      Raise Your Odds
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg text-white/80 mb-8"
                  >
                    Join a syndicate to pool resources, dramatically increase
                    your chances of winning, and support causes you care about.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-3 mb-8"
                  >
                    <Link href="/explore">
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white">
                        Join a Syndicate
                      </Button>
                    </Link>

                    <Link href="/create">
                      <Button
                        variant="outline"
                        className="border-white/20 hover:bg-white/10"
                      >
                        Create Syndicate
                      </Button>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                      <div className="text-xl font-bold text-cyan-400">
                        100+
                      </div>
                      <div className="text-xs text-white/70">Group Tickets</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                      <div className="text-xl font-bold text-cyan-400">
                        650K
                      </div>
                      <div className="text-xs text-white/70">Lens Profiles</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                      <div className="text-xl font-bold text-cyan-400">28M</div>
                      <div className="text-xs text-white/70">
                        Social Connections
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right column - Jackpot display */}
                <div className="flex justify-center">
                  <div className="w-full max-w-md">
                    <JackpotHeroDisplay />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </MegapotWrapper>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
