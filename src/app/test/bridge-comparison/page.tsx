"use client";

import React, { useState } from "react";
import { AcrossBridgeTest } from "@/components/test/AcrossBridgeTest";
import { AcrossSdkTest } from "@/components/test/AcrossSdkTest";
import { BridgeSelector } from "@/components/syndicate/BridgeSelector";
import { BridgeType, ChainId, CHAINS } from "@/lib/cross-chain/config";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/inputs/select";

export default function BridgeComparisonPage() {
  // Force Across as the default since Decent doesn't support Lens Chain yet
  const [selectedBridge, setSelectedBridge] = useState<BridgeType>(
    BridgeType.ACROSS
  );
  const [implementationType, setImplementationType] = useState<"api" | "sdk">(
    "sdk"
  );
  const [sourceChainId, setSourceChainId] = useState<ChainId>(ChainId.ETHEREUM);
  const [destinationChainId, setDestinationChainId] = useState<ChainId>(
    ChainId.OPTIMISM
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Cross-Chain Bridge Comparison</h1>
      <p className="mb-6 opacity-70">
        This page shows the available cross-chain bridge solutions for
        transferring USDC tokens between Lens Chain and Base Chain. Currently,
        only Across Protocol supports Lens Chain.
      </p>

      <div className="max-w-xl mx-auto mb-8">
        <BridgeSelector
          defaultBridge={selectedBridge}
          onChange={setSelectedBridge}
        />
      </div>

      {selectedBridge === BridgeType.ACROSS && (
        <div className="max-w-xl mx-auto mb-8">
          <div className="text-sm font-medium mb-2">Implementation Type</div>
          <div className="flex gap-2">
            <button
              onClick={() => setImplementationType("api")}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                implementationType === "api"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              API Implementation
            </button>
            <button
              onClick={() => setImplementationType("sdk")}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                implementationType === "sdk"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              SDK Implementation
            </button>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto mb-8">
        <div className="text-sm font-medium mb-2">Chain Selection</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Source Chain
            </label>
            <Select
              value={sourceChainId.toString()}
              onValueChange={(value) =>
                setSourceChainId(parseInt(value) as ChainId)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select source chain" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CHAINS).map(([id, chain]) => (
                  <SelectItem key={id} value={id}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Destination Chain
            </label>
            <Select
              value={destinationChainId.toString()}
              onValueChange={(value) =>
                setDestinationChainId(parseInt(value) as ChainId)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select destination chain" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CHAINS).map(([id, chain]) => (
                  <SelectItem key={id} value={id}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        {selectedBridge === BridgeType.DECENT ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Decent.xyz Bridge</h2>
            <div className="p-8 border rounded-lg bg-gray-50 text-center">
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                Not Available for Lens Chain
              </h3>
              <p className="text-sm text-gray-500">
                Decent.xyz does not currently support Lens Chain (ID 232). This
                option will be enabled once Decent.xyz adds support for Lens
                Chain.
              </p>
            </div>

            <div className="mt-6 p-5 bg-amber-100 rounded-lg border-2 border-amber-300">
              <h3 className="text-lg font-bold mb-3 text-amber-900">
                About Decent.xyz
              </h3>
              <p className="text-base font-medium text-amber-800">
                Decent.xyz provides a cross-chain bridge solution that allows
                for fast and efficient token transfers between different
                blockchains. However, it currently does not support Lens Chain
                (ID 232) directly.
              </p>
            </div>
          </div>
        ) : implementationType === "api" ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Across Protocol Bridge (API Implementation)
            </h2>
            <AcrossBridgeTest
              sourceChainId={sourceChainId}
              destinationChainId={destinationChainId}
            />

            <div className="mt-6 p-5 bg-purple-100 rounded-lg border-2 border-purple-300">
              <h3 className="text-lg font-bold mb-3 text-purple-900">
                About Across Protocol API
              </h3>
              <p className="text-base font-medium text-purple-800">
                This implementation uses the Across Protocol public API
                endpoints directly. While functional, it adds an extra network
                hop and may not have all the features of the SDK.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Across Protocol Bridge (SDK Implementation)
            </h2>
            <AcrossSdkTest
              sourceChainId={sourceChainId}
              destinationChainId={destinationChainId}
            />

            <div className="mt-6 p-5 bg-blue-100 rounded-lg border-2 border-blue-300">
              <h3 className="text-lg font-bold mb-3 text-blue-900">
                About Across Protocol SDK
              </h3>
              <p className="text-base font-medium text-blue-800">
                This implementation uses the official Across Protocol SDK
                directly, providing the most secure and efficient way to bridge
                tokens between chains. The SDK is maintained by the Risk Labs
                team and offers better performance with no additional network
                hops.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto mt-12">
        <h2 className="text-xl font-bold mb-4">Bridge Comparison</h2>

        <Tabs defaultValue="features">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="p-4 border rounded-lg mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Decent.xyz</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Fast cross-chain swaps</li>
                  <li>Competitive rates</li>
                  <li>Simple API</li>
                  <li>No Lens Chain support</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Across Protocol</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Intent-based bridging</li>
                  <li>Native Lens Chain support</li>
                  <li>High security guarantees</li>
                  <li>Optimistic verification</li>
                  <li>Official SDK available</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="performance"
            className="p-4 border rounded-lg mt-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">API Implementation</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Extra network hop</li>
                  <li>Potential rate limiting</li>
                  <li>Simpler implementation</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">SDK Implementation</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Direct integration</li>
                  <li>Better performance</li>
                  <li>More features available</li>
                  <li>Regular updates from Risk Labs</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="p-4 border rounded-lg mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">API Implementation</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Additional attack surface</li>
                  <li>Potential for MITM attacks</li>
                  <li>Dependency on API availability</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">SDK Implementation</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Fewer points of failure</li>
                  <li>Direct verification</li>
                  <li>Better parameter validation</li>
                  <li>Maintained by Risk Labs team</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
