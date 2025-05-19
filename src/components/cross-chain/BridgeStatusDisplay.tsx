"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/inputs/button";
import { Card } from "@/components/ui/data-display/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface BridgeStatusDisplayProps {
  status: string;
  txHash?: string;
  sourceChainId?: number;
  destinationChainId?: number;
  error?: Error | null;
  details?: any;
}

/**
 * Component to display the status of a cross-chain bridge transaction
 * with better error handling and user-friendly messages
 */
export function BridgeStatusDisplay({
  status,
  txHash,
  sourceChainId,
  destinationChainId,
  error,
  details,
}: BridgeStatusDisplayProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showManualLink, setShowManualLink] = useState(false);

  // Update time elapsed every second
  useEffect(() => {
    if (
      status === "deposited" ||
      status === "processing" ||
      status === "manualMonitoring"
    ) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);

        // After 60 seconds, show manual check link
        if (timeElapsed > 60 && !showManualLink) {
          setShowManualLink(true);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, timeElapsed, showManualLink]);

  // Format time elapsed in minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Get status message based on current status
  const getStatusMessage = () => {
    switch (status) {
      case "preparing":
        return "Preparing your transaction...";
      case "approving":
        return "Approving token transfer...";
      case "approved":
        return "Token transfer approved!";
      case "depositing":
        return "Depositing tokens...";
      case "deposited":
        return "Tokens deposited! Waiting for relay...";
      case "processing":
        return `Bridging in progress... (${formatTime(timeElapsed)})`;
      case "manualMonitoring":
        return `Transaction submitted. RPC monitoring limited. (${formatTime(
          timeElapsed
        )})`;
      case "executed":
        return "Bridge complete! Tokens received.";
      case "error":
        return error?.message || "An error occurred.";
      default:
        return "Processing transaction...";
    }
  };

  // Get explorer URL for transaction
  const getExplorerUrl = () => {
    if (!txHash) return null;

    // Base explorer for source chain
    if (sourceChainId === 232) {
      return `https://lensscan.io/tx/${txHash}`;
    } else if (sourceChainId === 37111) {
      return `https://testnet.lensscan.io/tx/${txHash}`;
    } else if (sourceChainId === 8453) {
      return `https://basescan.org/tx/${txHash}`;
    }

    return null;
  };

  // Get Across Explorer URL
  const getAcrossExplorerUrl = () => {
    if (!txHash) return null;
    return `https://across.to/transactions?search=${txHash}`;
  };

  return (
    <Card className="p-4 mt-4 bg-slate-800 border-slate-700">
      <div className="text-center">
        <div className="mb-4">
          {status === "executed" ? (
            <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : status === "error" ? (
            <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
          )}
        </div>

        <h3 className="text-xl font-semibold mb-2">
          {status === "executed"
            ? "Bridge Complete!"
            : status === "error"
            ? "Bridge Error"
            : "Bridge in Progress"}
        </h3>

        <p className="text-white/70 mb-4">{getStatusMessage()}</p>

        {/* Additional details for special states */}
        {(status === "deposited" ||
          status === "processing" ||
          status === "manualMonitoring") && (
          <div className="mb-4 bg-slate-700 p-3 rounded-md text-sm">
            <p className="mb-2">
              Bridge transactions typically take 10-30 minutes to complete.
            </p>
            <p>You can leave this page and check back later.</p>
          </div>
        )}

        {/* Transaction links */}
        <div className="flex flex-col gap-2">
          {txHash && getExplorerUrl() && (
            <Link
              href={getExplorerUrl()!}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline text-sm"
            >
              View transaction on explorer
            </Link>
          )}

          {(status === "deposited" ||
            status === "processing" ||
            showManualLink) &&
            getAcrossExplorerUrl() && (
              <Link
                href={getAcrossExplorerUrl()!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline text-sm mt-2"
              >
                Check status on Across Explorer
              </Link>
            )}

          {status === "manualMonitoring" && (
            <div className="mt-4 text-yellow-400 text-sm">
              <p>
                The RPC provider has limited support for monitoring this
                transaction.
                <br />
                Use the link above to check your transaction status.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
