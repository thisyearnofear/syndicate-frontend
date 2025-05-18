"use client";

import React from "react";
import { Button } from "@/components/ui/inputs/button";
import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import { motion } from "framer-motion";

export function AdaptedHero() {
  return (
    <section className="pt-12 pb-16 relative overflow-hidden">
      {/* Glowing orbs - positioned to match your existing design */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500 rounded-full filter blur-[100px] opacity-20 z-0" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500 rounded-full filter blur-[100px] opacity-20 z-0" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
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
            className="text-lg text-white/80 mb-8 max-w-2xl mx-auto"
          >
            Syndicate leverages the Lens protocol on Megapot's onchain lottery
            system, creating a powerful SocialFi coordination layer for
            purpose-driven lottery participation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
          >
            <ConnectKitButton.Custom>
              {({ isConnected, show, truncatedAddress, ensName }) => (
                <Button
                  onClick={show}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white"
                >
                  {isConnected ? `${ensName || truncatedAddress}` : "Connect Wallet"}
                </Button>
              )}
            </ConnectKitButton.Custom>

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
            className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="text-xl font-bold text-cyan-400">
                15x
              </div>
              <div className="text-xs text-white/70">Better Odds</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="text-xl font-bold text-cyan-400">
                20%
              </div>
              <div className="text-xs text-white/70">To Causes</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="text-xl font-bold text-cyan-400">
                1500+
              </div>
              <div className="text-xs text-white/70">Users</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
