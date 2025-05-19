"use client";

import React from 'react';
import { AcrossBridgeTest } from '@/components/test/AcrossBridgeTest';

export default function AcrossBridgeTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Across Bridge Integration Test</h1>
      <p className="mb-6 opacity-70">
        This page allows testing the cross-chain functionality between Lens Chain (GHO token) and Base Chain (USDC)
        using Across Protocol. Make sure you have your wallet connected to Lens Chain.
      </p>
      
      <div className="max-w-xl mx-auto">
        <AcrossBridgeTest />
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg max-w-xl mx-auto">
        <h2 className="text-lg font-medium mb-2">About Across Protocol</h2>
        <p className="text-sm opacity-80 mb-4">
          Across is an interoperability protocol powered by intents, enabling a fast and low-cost way to transfer value between chains.
          It supports Lens Chain and Base Chain, making it an ideal solution for cross-chain transactions in the Syndicate platform.
        </p>
        
        <h3 className="text-md font-medium mb-2">How it works:</h3>
        <ol className="list-decimal list-inside text-sm opacity-80 space-y-1 ml-2">
          <li>Users deposit tokens on the origin chain</li>
          <li>Relayers view this deposit and fulfill the order on the destination chain</li>
          <li>Relayers submit proof of the relay and deposit to an optimistic oracle and claim reimbursement</li>
        </ol>
      </div>
    </div>
  );
}
