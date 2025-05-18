"use client";

import React from 'react';
import { CrossChainTest } from '@/components/test/CrossChainTest';

export default function CrossChainTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Cross-Chain Integration Test</h1>
      <p className="mb-6 opacity-70">
        This page allows testing the cross-chain functionality between Lens Chain (GHO token) and Base Chain (USDC)
        using Decent.xyz. Make sure you have your wallet connected to Lens Chain.
      </p>
      
      <div className="max-w-xl mx-auto">
        <CrossChainTest />
      </div>
      
      <div className="mt-8 p-4 bg-gray-800/30 border border-gray-700 rounded-md max-w-xl mx-auto">
        <h2 className="text-lg font-medium mb-2">How to test:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Connect your wallet to Lens Chain</li>
          <li>Enter a test amount in GHO</li>
          <li>Click "Test Cross-Chain Transaction"</li>
          <li>Approve the transaction in your wallet</li>
          <li>The UI will update as the transaction is processed across chains (GHO on Lens → USDC on Base)</li>
        </ol>
      </div>
    </div>
  );
}