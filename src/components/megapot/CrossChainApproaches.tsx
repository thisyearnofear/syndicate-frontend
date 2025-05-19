"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation/tabs";
import { SafeApproach } from "./cross-chain/SafeApproach";
import { DirectContractsApproach } from "./cross-chain/DirectContractsApproach";
import { NearIntentsApproach } from "./cross-chain/NearIntentsApproach";
import { ChainId } from "@/lib/cross-chain/config";

/**
 * CrossChainApproaches component that showcases the three methods
 * for purchasing tickets cross-chain on mainnet
 */
export function CrossChainApproaches() {
  const [activeTab, setActiveTab] = useState("safe");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-3xl mx-auto mt-12 mb-16"
    >
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Cross-Chain Ticket Purchase Methods
        </h2>

        <p className="text-white/70 mb-8 text-center max-w-2xl mx-auto">
          Syndicate offers three distinct approaches for buying lottery tickets
          on Base Chain from Lens Chain, each with different tradeoffs in terms
          of security, user experience, and implementation complexity.
        </p>

        <Tabs
          defaultValue="safe"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col items-center"
        >
          <TabsList className="grid grid-cols-3 mb-8 w-full max-w-md mx-auto">
            <TabsTrigger value="safe" className="text-center">
              Safe Accounts
            </TabsTrigger>
            <TabsTrigger value="direct" className="text-center">
              Direct Contracts
            </TabsTrigger>
            <TabsTrigger value="intents" className="text-center">
              NEAR Intents
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="safe"
            className="focus-visible:outline-none focus-visible:ring-0"
          >
            <SafeApproach
              sourceChainId={ChainId.LENS}
              destinationChainId={ChainId.BASE}
            />
          </TabsContent>

          <TabsContent
            value="direct"
            className="focus-visible:outline-none focus-visible:ring-0"
          >
            <DirectContractsApproach
              sourceChainId={ChainId.LENS}
              destinationChainId={ChainId.BASE}
            />
          </TabsContent>

          <TabsContent
            value="intents"
            className="focus-visible:outline-none focus-visible:ring-0"
          >
            <NearIntentsApproach
              sourceChainId={ChainId.LENS}
              destinationChainId={ChainId.BASE}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-8 pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold mb-4">Approach Comparison</h3>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-cyan-400">Safe Accounts</h4>
              <ul className="list-disc list-inside text-white/70 space-y-1">
                <li>Enhanced security</li>
                <li>Multi-signature protection</li>
                <li>Established infrastructure</li>
                <li>Best for large treasuries</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-cyan-400">Direct Contracts</h4>
              <ul className="list-disc list-inside text-white/70 space-y-1">
                <li>Customizable logic</li>
                <li>Transparent operations</li>
                <li>Automatic distribution</li>
                <li>Balance of security & flexibility</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-cyan-400">NEAR Intents</h4>
              <ul className="list-disc list-inside text-white/70 space-y-1">
                <li>Single transaction UX</li>
                <li>Gas optimization</li>
                <li>Flexible execution</li>
                <li>Best user experience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
