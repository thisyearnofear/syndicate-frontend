"use client";

import React from "react";
import { MegapotWrapper } from "./MegapotWrapper";
import { FullJackpotDisplay } from "../jackpot/FullJackpotDisplay";
import { CrossChainApproaches } from "./CrossChainApproaches";
import { motion } from "framer-motion";
import { ConnectKitButton } from "connectkit";
import { Button } from "../ui/inputs/button";

/**
 * MegapotPage component that displays the Megapot Jackpot components
 * Uses the global providers from layout.tsx instead of creating new ones
 */
export function MegapotPage() {
  return (
    <MegapotWrapper>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          {/* Removed duplicate heading since it's already in the header navigation */}
          <p className="text-white/70 max-w-2xl mx-auto mb-6">
            Join our Syndicate pools to increase your chances of winning these
            jackpots while supporting causes you care about.
          </p>

          {/* Connect Wallet Button */}
          <div className="flex justify-center mb-4">
            <ConnectKitButton.Custom>
              {({ isConnected, show, truncatedAddress, ensName }) => {
                const displayName = ensName ?? truncatedAddress;

                if (!isConnected) {
                  return (
                    <Button
                      onClick={show}
                      className="px-6 py-3 rounded-full bg-[#00bcd4] text-white font-bold shadow hover:bg-[#0097a7] transition"
                    >
                      🧑‍🤝‍🧑 Continue with Family Wallet
                    </Button>
                  );
                }

                return (
                  <div className="text-center">
                    <Button
                      onClick={show}
                      variant="secondary"
                      className="px-4 py-2"
                    >
                      <span className="mr-2">🧑‍🤝‍🧑</span>
                      {displayName}
                    </Button>
                  </div>
                );
              }}
            </ConnectKitButton.Custom>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FullJackpotDisplay />
        </motion.div>

        {/* Cross-Chain Approaches Section */}
        <CrossChainApproaches />
      </div>
    </MegapotWrapper>
  );
}
