"use client";

import React from "react";
import { AcrossSdkTest } from "@/components/test/AcrossSdkTest";

export default function AcrossSdkTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Across API Integration Test</h1>
      <p className="mb-6 opacity-70">
        This page allows testing the cross-chain functionality between Lens
        Chain (GHO token) and Base Chain (USDC) using Across Protocol's
        /swap/approval API. Make sure you have your wallet connected to Lens
        Chain.
      </p>

      <div className="max-w-xl mx-auto">
        <AcrossSdkTest />
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg max-w-xl mx-auto">
        <h2 className="text-lg font-medium mb-2">About Across Protocol API</h2>
        <p className="text-sm opacity-80 mb-4">
          The Across /swap/approval API provides a streamlined interface for
          cross-chain swaps, handling token approvals and transaction execution
          in a single flow. This implementation uses the official API maintained
          by the Risk Labs team.
        </p>

        <h3 className="text-md font-medium mb-2">
          Benefits of API Integration:
        </h3>
        <ul className="list-disc list-inside text-sm opacity-80 space-y-1 ml-2">
          <li>Simplified approval and swap flow in one API call</li>
          <li>Automatic handling of token allowances</li>
          <li>Better error handling and user experience</li>
          <li>Optimized gas usage with proper approval amounts</li>
          <li>Native support for Lens Chain</li>
        </ul>
      </div>
    </div>
  );
}
