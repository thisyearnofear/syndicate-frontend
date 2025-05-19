"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Loader2, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import {
  ChainId,
  CHAINS,
  getChainName,
  GHO_ADDRESS_LENS,
  USDC_ADDRESS_BASE,
  SYNDICATE_TREASURY_ADDRESS,
  SYNDICATE_REGISTRY_ADDRESS,
  ACROSS_BRIDGE_LENS,
  ACROSS_BRIDGE_BASE,
} from "@/lib/cross-chain/config";
import { useAcrossApi } from "@/hooks/use-across-api";

interface SafeApproachProps {
  sourceChainId: ChainId;
  destinationChainId: ChainId;
}

/**
 * SafeApproach component that demonstrates the Safe Accounts + Bridging approach
 * for cross-chain ticket purchases
 */
export function SafeApproach({
  sourceChainId,
  destinationChainId,
}: SafeApproachProps) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState<string>("1");
  const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // Initialize Across API hook with callbacks
  const {
    isLoading,
    isPending,
    error,
    txHash,
    txStatus,
    getQuote,
    executeQuote,
    bridgeTokens,
    swapApproval,
  } = useAcrossApi({
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

  // Set available routes on component mount
  useEffect(() => {
    if (isConnected) {
      // For the Across API approach, we don't need to fetch supported chains
      // We can just set the route directly since we know Lens and Base are supported
      setAvailableRoutes([
        {
          id: `${sourceChainId}-${destinationChainId}`,
          name: `${getChainName(sourceChainId)} to ${getChainName(
            destinationChainId
          )}`,
          originChainId: sourceChainId,
          destinationChainId: destinationChainId,
          inputToken: GHO_ADDRESS_LENS,
          outputToken: USDC_ADDRESS_BASE,
        },
      ]);
      setIsLoadingRoutes(false);
    }
  }, [isConnected, sourceChainId, destinationChainId]);

  // Handle the bridge transaction
  const handleBridge = async () => {
    if (!isConnected) {
      console.error("Please connect your wallet first");
      return;
    }

    try {
      console.log(
        `Bridging ${amount} GHO from ${getChainName(
          sourceChainId
        )} to ${getChainName(destinationChainId)}...`
      );

      // Execute bridge transaction using the Safe treasury as recipient
      // This uses the new Across API with the /swap/approval endpoint
      await bridgeTokens({
        sourceChainId: sourceChainId,
        destinationChainId: destinationChainId,
        sourceToken: GHO_ADDRESS_LENS,
        destinationToken: USDC_ADDRESS_BASE,
        amount: amount,
        recipient: SYNDICATE_TREASURY_ADDRESS, // Use the Safe treasury address as recipient
        slippageTolerance: 1, // 1% slippage tolerance
      });
    } catch (err) {
      console.error("Bridge error:", err);
    }
  };

  // Render transaction status
  const renderStatus = () => {
    if (txHash || txStatus) {
      return (
        <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/20">
          <div className="flex items-center gap-2">
            {txStatus === "executed" || txStatus === "completed" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : txStatus === "failed" || txStatus === "error" ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            )}
            <span className="text-sm font-medium">
              {txStatus === "executed" || txStatus === "completed"
                ? "Transaction completed successfully"
                : txStatus === "failed" || txStatus === "error"
                ? "Transaction failed"
                : txStatus === "preparing"
                ? "Preparing transaction..."
                : txStatus === "approving"
                ? "Approving token..."
                : txStatus === "approval_pending"
                ? "Approval transaction submitted, waiting for confirmation..."
                : txStatus === "approved"
                ? "Token approved, preparing swap..."
                : txStatus === "swapping"
                ? "Executing swap transaction..."
                : txStatus === "swap_pending"
                ? "Swap transaction submitted, waiting for confirmation..."
                : txStatus === "signing"
                ? "Please sign the transaction..."
                : txStatus === "processing" || txStatus === "submitted"
                ? "Transaction submitted, waiting for confirmation..."
                : "Transaction in progress..."}
            </span>
          </div>
          {txHash && (
            <div className="mt-2 text-xs font-mono bg-black/40 p-2 rounded border border-white/10 break-all">
              <a
                href={`${
                  CHAINS[sourceChainId]?.blockExplorerUrl ||
                  "https://explorer.lens.xyz"
                }/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                {txHash}
              </a>
            </div>
          )}

          {swapApproval && (
            <div className="mt-3 text-xs text-white/70">
              <div className="flex justify-between">
                <span>Expected fill time:</span>
                <span className="font-medium">
                  {swapApproval.expectedFillTime || "~"} seconds
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expected output:</span>
                <span className="font-medium">
                  {swapApproval.expectedOutputAmount
                    ? (
                        Number(swapApproval.expectedOutputAmount) /
                        10 ** 6
                      ).toFixed(6)
                    : "~"}{" "}
                  USDC
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Safe Accounts + Bridging</h3>

        <p className="text-sm text-white/70 mb-4">
          This approach uses multi-signature Safe wallets as treasuries with
          Across Protocol for bridging. Users contribute GHO to a Safe wallet on
          Lens Chain, which then bridges funds to a corresponding Safe wallet on
          Base Chain for ticket purchases.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-black/30 p-3 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">From</span>
              <span className="text-sm font-medium text-cyan-400">
                {getChainName(sourceChainId)}
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
              className="bg-black/50 border-white/20"
            />
            <div className="mt-2 text-xs text-white/60">Token: GHO</div>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:block">
              <ArrowRight className="h-5 w-5 text-white/50" />
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/80">To</span>
                <span className="text-sm font-medium text-cyan-400">
                  {getChainName(destinationChainId)}
                </span>
              </div>
              <div className="p-3 bg-black/50 rounded-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80">
                    Estimated to receive:
                  </span>
                  <span className="text-sm font-bold text-white">
                    {amount} USDC
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-white/60">Token: USDC</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          {isLoadingRoutes ? (
            <div className="text-center p-2">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              <span className="text-sm text-white/70">
                Checking available routes...
              </span>
            </div>
          ) : availableRoutes.length === 0 ? (
            <div className="text-center p-2 bg-yellow-900/30 text-yellow-300 rounded-lg text-sm border border-yellow-500/30">
              <AlertCircle className="h-5 w-5 mx-auto mb-2" />
              <span>
                No available routes found between these chains. This may be a
                temporary issue or the bridge may not support these tokens yet.
              </span>
            </div>
          ) : (
            <Button
              onClick={handleBridge}
              disabled={
                !isConnected ||
                isLoading ||
                isPending ||
                availableRoutes.length === 0
              }
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              {isLoading || isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? "Confirming..." : "Preparing..."}
                </>
              ) : (
                "Bridge GHO to USDC"
              )}
            </Button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/30 text-red-300 rounded-lg text-sm border border-red-500/30">
            {error.message}
          </div>
        )}

        {renderStatus()}
      </div>

      <div className="text-xs text-white/50 p-3 bg-black/20 rounded-lg border border-white/10">
        <p className="font-medium mb-1">Implementation Details:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Uses Across Protocol for bridging between chains</li>
          <li>Lens Chain Treasury: {SYNDICATE_TREASURY_ADDRESS}</li>
          <li>Base Chain Treasury: {SYNDICATE_REGISTRY_ADDRESS}</li>
          <li>Across Bridge (Lens): {ACROSS_BRIDGE_LENS}</li>
          <li>Across Bridge (Base): {ACROSS_BRIDGE_BASE}</li>
          <li>GHO Token (Lens): {GHO_ADDRESS_LENS}</li>
          <li>USDC Token (Base): {USDC_ADDRESS_BASE}</li>
        </ul>
      </div>
    </div>
  );
}
