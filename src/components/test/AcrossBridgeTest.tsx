"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useAcrossAppSdk } from "@/hooks/use-across-app-sdk";
import { Button } from "@/components/ui/inputs/button";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/inputs/select";
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import {
  DESTINATION_CHAIN_ID,
  USDC_ADDRESS_LENS,
  SOURCE_CHAIN_ID,
  USDC_ADDRESS_BASE,
  getChainName,
  CHAINS,
} from "@/lib/cross-chain/config";
import { parseUnits } from "viem";

/**
 * A test component for validating cross-chain transactions using Across Protocol
 */
export function AcrossBridgeTest({
  sourceChainId = SOURCE_CHAIN_ID,
  destinationChainId = DESTINATION_CHAIN_ID,
}: {
  sourceChainId?: number;
  destinationChainId?: number;
}) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState<string>("1");
  const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // Initialize Across App SDK hook
  const {
    isLoading,
    isPending,
    error,
    txHash,
    txStatus,
    fetchSupportedChains,
    bridgeTokens,
  } = useAcrossAppSdk({
    onSuccess: (hash) => {
      console.log("Transaction submitted successfully:", hash);
    },
    onError: (err) => {
      console.error("Transaction error:", err);
    },
    onStatusChange: (status, data) => {
      console.log("Transaction status changed:", status, data);
    },
  });

  // Fetch supported chains on component mount or when chains change
  useEffect(() => {
    if (isConnected) {
      fetchSupportedChainsData();
    }
  }, [isConnected, sourceChainId, destinationChainId]);

  // Fetch supported chains
  const fetchSupportedChainsData = async () => {
    try {
      setIsLoadingRoutes(true);
      console.log("Fetching supported chains from Across...");

      const chains = await fetchSupportedChains();

      console.log("Supported chains:", chains);

      // Check if our chains are supported
      const isSourceSupported = chains?.some(
        (chain: any) => chain.chainId === sourceChainId
      );

      const isDestSupported = chains?.some(
        (chain: any) => chain.chainId === destinationChainId
      );

      // If both chains are supported, we can bridge between them
      if (isSourceSupported && isDestSupported) {
        const route = {
          id: `${sourceChainId}-${destinationChainId}`,
          name: `${
            CHAINS[sourceChainId as keyof typeof CHAINS]?.name ||
            `Chain ${sourceChainId}`
          } to ${
            CHAINS[destinationChainId as keyof typeof CHAINS]?.name ||
            `Chain ${destinationChainId}`
          }`,
          originChainId: sourceChainId,
          destinationChainId: destinationChainId,
        };

        setAvailableRoutes([route]);

        // Set default route
        setSelectedRoute(route.id);
      } else {
        setAvailableRoutes([]);
      }
    } catch (err) {
      console.error("Error fetching supported chains:", err);
      setAvailableRoutes([]);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  // Handle bridge transaction
  const handleBridge = async () => {
    if (!isConnected) {
      console.error("Wallet not connected");
      return;
    }

    try {
      // Get token addresses based on chain IDs
      const sourceToken =
        sourceChainId === SOURCE_CHAIN_ID
          ? USDC_ADDRESS_LENS
          : CHAINS[sourceChainId as keyof typeof CHAINS]?.usdcAddress || "0x0";

      const destToken =
        destinationChainId === DESTINATION_CHAIN_ID
          ? USDC_ADDRESS_BASE
          : CHAINS[destinationChainId as keyof typeof CHAINS]?.usdcAddress ||
            "0x0";

      // Parse amount to bigint with 6 decimals (for USDC)
      const amountInWei = parseUnits(amount, 6);

      // Execute bridge transaction
      await bridgeTokens({
        sourceChainId: sourceChainId,
        destinationChainId: destinationChainId,
        sourceToken: sourceToken,
        destinationToken: destToken,
        amount: amount,
      });
    } catch (err) {
      console.error("Bridge error:", err);
    }
  };

  // Render transaction status
  const renderStatus = () => {
    if (txHash) {
      return (
        <div className="mt-6 p-5 bg-indigo-50 rounded-lg border-2 border-indigo-200">
          <h3 className="text-base font-bold mb-3 text-indigo-800">
            Transaction Status
          </h3>
          <div className="flex items-center gap-3">
            {txStatus === "executed" ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : txStatus === "failed" ? (
              <AlertCircle className="h-6 w-6 text-red-600" />
            ) : (
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            )}
            <span className="text-base font-medium text-indigo-900">
              {txStatus === "executed"
                ? "Transaction completed successfully"
                : txStatus === "failed"
                ? "Transaction failed"
                : "Transaction in progress..."}
            </span>
          </div>
          <div className="mt-3 p-2 bg-white rounded border border-indigo-200">
            <div className="text-sm font-medium text-indigo-800">
              Transaction Hash:
            </div>
            <div className="font-mono text-sm bg-gray-50 p-2 rounded border border-gray-200 mt-1 break-all">
              {txHash}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-white border-2 border-gray-300">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">
        Across Bridge Test
      </h2>

      <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base font-semibold text-blue-800">From</span>
          <span className="text-base font-medium text-blue-700">
            {CHAINS[sourceChainId as keyof typeof CHAINS]?.name ||
              `Chain ${sourceChainId}`}
          </span>
        </div>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to bridge"
          min="0.01"
          step="0.01"
          disabled={isLoading || isPending}
          className="border-2 border-blue-300 text-lg font-medium"
        />
        <div className="mt-2 text-sm font-medium text-blue-700">
          Token: USDC
        </div>
      </div>

      <div className="flex justify-center my-3">
        <ArrowRight className="h-6 w-6 text-blue-500" />
      </div>

      <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base font-semibold text-green-800">To</span>
          <span className="text-base font-medium text-green-700">
            {CHAINS[destinationChainId as keyof typeof CHAINS]?.name ||
              `Chain ${destinationChainId}`}
          </span>
        </div>
        <div className="p-4 bg-white rounded-lg border-2 border-green-300">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-green-800">
              Estimated to receive:
            </span>
            <span className="text-lg font-bold text-green-700">
              {amount} USDC
            </span>
          </div>
        </div>
      </div>

      {isLoadingRoutes ? (
        <div className="flex justify-center my-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-base font-medium">
            Loading available routes...
          </span>
        </div>
      ) : availableRoutes.length > 0 ? (
        <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
          <label className="block text-base font-semibold text-purple-800 mb-2">
            Select Route
          </label>
          <Select
            value={selectedRoute}
            onValueChange={setSelectedRoute}
            disabled={isLoading || isPending}
          >
            <SelectTrigger className="border-2 border-purple-300 bg-white text-purple-900">
              <SelectValue placeholder="Select a route" />
            </SelectTrigger>
            <SelectContent>
              {availableRoutes.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  {route.name || `Route ${route.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <Button
        onClick={handleBridge}
        disabled={
          !isConnected ||
          isLoading ||
          isPending ||
          !amount ||
          parseFloat(amount) <= 0
        }
        className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
      >
        {isLoading || isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {isPending ? "Confirming..." : "Preparing..."}
          </>
        ) : (
          "Bridge USDC to USDC"
        )}
      </Button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg text-base font-medium border-2 border-red-300">
          <div className="font-bold">Error</div>
          <div>{error.message}</div>
        </div>
      )}

      {renderStatus()}

      <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
        <p className="text-sm font-medium text-gray-800">
          This is a test component for the Across Protocol bridge integration.
          It allows bridging USDC tokens from{" "}
          {CHAINS[sourceChainId as keyof typeof CHAINS]?.name ||
            `Chain ${sourceChainId}`}{" "}
          to USDC on{" "}
          {CHAINS[destinationChainId as keyof typeof CHAINS]?.name ||
            `Chain ${destinationChainId}`}
          .
        </p>
      </div>
    </Card>
  );
}
