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
import { Card } from "@/components/ui/data-display/card";
import { formatAddress, getExplorerLink } from "@/lib/utils";

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
      // Determine status color and icon
      let statusColor = "blue";
      let StatusIcon = Loader2;
      let statusIconClass = "animate-spin text-blue-400";

      if (txStatus === "executed" || txStatus === "completed") {
        statusColor = "green";
        StatusIcon = CheckCircle;
        statusIconClass = "text-green-400";
      } else if (txStatus === "failed" || txStatus === "error") {
        statusColor = "red";
        StatusIcon = AlertCircle;
        statusIconClass = "text-red-400";
      }

      // Get status message
      const statusMessage =
        txStatus === "executed" || txStatus === "completed"
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
          : "Transaction in progress...";

      return (
        <div
          className={`mt-6 p-4 bg-${statusColor}-900/30 rounded-lg border border-${statusColor}-500/30 shadow-md`}
        >
          <div className="flex items-center gap-3 mb-2">
            <StatusIcon className={`h-6 w-6 ${statusIconClass}`} />
            <span className="text-base font-medium text-white">
              {statusMessage}
            </span>
          </div>

          {txHash && (
            <div className="mt-3 bg-black/50 p-3 rounded-lg border border-white/20 break-all">
              <div className="text-xs text-white/80 mb-1">
                Transaction Hash:
              </div>
              <a
                href={`${
                  CHAINS[sourceChainId]?.blockExplorerUrl ||
                  "https://explorer.lens.xyz"
                }/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-cyan-400 hover:underline hover:text-cyan-300 transition-colors"
              >
                {txHash}
              </a>
            </div>
          )}

          {swapApproval && (
            <div className="mt-4 p-3 bg-black/40 rounded-lg border border-white/20">
              <h4 className="text-sm font-medium text-white mb-2">
                Transaction Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Expected fill time:</span>
                  <span className="font-medium text-white">
                    {swapApproval.expectedFillTime || "~"} seconds
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Expected output:</span>
                  <span className="font-medium text-white">
                    {swapApproval.expectedOutputAmount
                      ? (
                          Number(swapApproval.expectedOutputAmount) /
                          10 ** 6
                        ).toFixed(6)
                      : "~"}{" "}
                    <span className="text-cyan-300">USDC</span>
                  </span>
                </div>
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
      <div className="bg-gradient-to-b from-black/40 to-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-center text-white">
          Safe Accounts + Bridging
        </h3>

        <p className="text-sm text-white/90 mb-6 text-center max-w-xl mx-auto">
          This approach uses multi-signature Safe wallets as treasuries with
          Across Protocol for bridging. Users contribute GHO to a Safe wallet on
          Lens Chain, which then bridges funds to a corresponding Safe wallet on
          Base Chain for ticket purchases.
        </p>

        <div className="max-w-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gradient-to-b from-black/50 to-black/40 p-4 rounded-lg border border-white/20 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">From</span>
                <span className="text-sm font-medium text-cyan-300 bg-cyan-900/30 px-2 py-1 rounded-md">
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
                className="bg-black/60 border-white/30 text-white placeholder:text-white/50 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/20"
              />
              <div className="mt-2 text-xs text-white/80 font-medium">
                Token: GHO
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex flex-col items-center">
                <ArrowRight className="h-6 w-6 text-cyan-400" />
                <span className="text-xs text-cyan-400/80 mt-1">Bridge</span>
              </div>

              <div className="bg-gradient-to-b from-black/50 to-black/40 p-4 rounded-lg border border-white/20 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">To</span>
                  <span className="text-sm font-medium text-cyan-300 bg-cyan-900/30 px-2 py-1 rounded-md">
                    {getChainName(destinationChainId)}
                  </span>
                </div>
                <div className="p-4 bg-black/60 rounded-lg border border-white/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">
                      Estimated to receive:
                    </span>
                    <span className="text-base font-bold text-white">
                      {amount} USDC
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-white/80 font-medium">
                  Token: USDC
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-8 max-w-md mx-auto">
          {isLoadingRoutes ? (
            <div className="text-center p-4 bg-black/40 rounded-lg border border-white/20">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-cyan-400" />
              <span className="text-sm text-white">
                Checking available routes...
              </span>
            </div>
          ) : availableRoutes.length === 0 ? (
            <div className="text-center p-4 bg-yellow-900/40 text-yellow-200 rounded-lg text-sm border border-yellow-500/40 shadow-md">
              <AlertCircle className="h-6 w-6 mx-auto mb-3 text-yellow-300" />
              <span className="font-medium">
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
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-6 text-lg font-medium rounded-lg shadow-lg hover:shadow-cyan-900/20 transition-all"
            >
              {isLoading || isPending ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  {isPending
                    ? "Confirming Transaction..."
                    : "Preparing Transaction..."}
                </>
              ) : (
                "Bridge GHO to USDC"
              )}
            </Button>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-900/40 text-red-200 rounded-lg text-sm border border-red-500/40 max-w-md mx-auto shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-5 w-5 text-red-300" />
              <span className="font-medium">Error</span>
            </div>
            {error.message}
          </div>
        )}

        <div className="max-w-md mx-auto">{renderStatus()}</div>
      </div>

      <div className="bg-gradient-to-b from-black/30 to-black/20 backdrop-blur-sm rounded-xl p-5 border border-white/15 shadow-md max-w-xl mx-auto">
        <h4 className="text-sm font-semibold text-white mb-3 text-center">
          Implementation Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/40 p-3 rounded-lg border border-white/20">
            <h5 className="text-xs font-medium text-cyan-400 mb-2">Protocol</h5>
            <ul className="text-xs text-white/90 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                <span>Uses Across Protocol for bridging between chains</span>
              </li>
            </ul>
          </div>

          <div className="bg-black/40 p-3 rounded-lg border border-white/20">
            <h5 className="text-xs font-medium text-cyan-400 mb-2">
              Treasuries
            </h5>
            <ul className="text-xs text-white/90 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                <span>
                  Lens Chain:{" "}
                  <a
                    href={getExplorerLink(
                      SYNDICATE_TREASURY_ADDRESS,
                      ChainId.LENS
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-white/80 hover:text-cyan-400 transition-colors"
                  >
                    {formatAddress(SYNDICATE_TREASURY_ADDRESS)}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                <span>
                  Base Chain:{" "}
                  <a
                    href={getExplorerLink(
                      SYNDICATE_REGISTRY_ADDRESS,
                      ChainId.BASE
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-white/80 hover:text-cyan-400 transition-colors"
                  >
                    {formatAddress(SYNDICATE_REGISTRY_ADDRESS)}
                  </a>
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-black/40 p-3 rounded-lg border border-white/20">
            <h5 className="text-xs font-medium text-cyan-400 mb-2">
              Bridge Contracts
            </h5>
            <ul className="text-xs text-white/90 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                <span>
                  Lens:{" "}
                  <span className="font-mono text-white/80">
                    {ACROSS_BRIDGE_LENS.slice(0, 6)}...
                    {ACROSS_BRIDGE_LENS.slice(-4)}
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                <span>
                  Base:{" "}
                  <span className="font-mono text-white/80">
                    {ACROSS_BRIDGE_BASE.slice(0, 6)}...
                    {ACROSS_BRIDGE_BASE.slice(-4)}
                  </span>
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-black/40 p-3 rounded-lg border border-white/20">
            <h5 className="text-xs font-medium text-cyan-400 mb-2">
              Token Addresses
            </h5>
            <ul className="text-xs text-white/90 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                <span>
                  GHO (Lens):{" "}
                  <a
                    href={getExplorerLink(GHO_ADDRESS_LENS, ChainId.LENS)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-white/80 hover:text-cyan-400 transition-colors"
                  >
                    {formatAddress(GHO_ADDRESS_LENS)}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                <span>
                  USDC (Base):{" "}
                  <a
                    href={getExplorerLink(USDC_ADDRESS_BASE, ChainId.BASE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-white/80 hover:text-cyan-400 transition-colors"
                  >
                    {formatAddress(USDC_ADDRESS_BASE)}
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
