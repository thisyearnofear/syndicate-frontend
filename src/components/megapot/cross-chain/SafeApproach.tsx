"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import {
  Loader2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import {
  ChainId,
  CHAINS,
  getChainName,
  USDC_ADDRESS_BASE,
} from "@/lib/cross-chain/config";
import { USDC_ADDRESS_LENS } from "@/lib/cross-chain/constants";
import { useAcrossAppSdk } from "@/hooks/use-across-app-sdk";
import { useSyndicateContracts } from "@/hooks/use-syndicate-contracts";
import { parseUnits } from "viem";
import { Label } from "@/components/ui/inputs/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { DialogTest } from "./DialogTest";
import Link from "next/link";

interface SafeApproachProps {
  sourceChainId: ChainId;
  destinationChainId: ChainId;
}

/**
 * SafeApproach component that demonstrates the Safe Accounts + Bridging approach
 * for cross-chain ticket purchases, using Across Protocol
 */
export function SafeApproach({
  sourceChainId,
  destinationChainId,
}: SafeApproachProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [amount, setAmount] = useState<string>("1");
  const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<
    "idle" | "bridging" | "success" | "error"
  >("idle");
  const [bridgeError, setBridgeError] = useState<string | null>(null);

  // Use the syndicate contracts hook
  const {
    userSyndicates,
    isLoadingSyndicates,
    createSyndicate,
    isCreatingSyndicate,
    createSyndicateError,
    bridgeToBaseTreasury,
    isBridging,
    bridgeError: syndicateBridgeError,
    selectedSyndicate,
    setSelectedSyndicate,
  } = useSyndicateContracts();

  // Select the first syndicate by default if none is selected
  useEffect(() => {
    if (userSyndicates.length > 0 && !selectedSyndicate) {
      setSelectedSyndicate(userSyndicates[0]);
    }
  }, [userSyndicates, selectedSyndicate, setSelectedSyndicate]);

  // Handle bridging tokens from Lens to Base
  const handleBridge = async () => {
    if (!address || !selectedSyndicate) return;

    try {
      setBridgeStatus("bridging");
      setBridgeError(null);

      await bridgeToBaseTreasury(selectedSyndicate.treasuryAddress, amount);

      setBridgeStatus("success");
    } catch (err) {
      console.error("Bridge error:", err);
      setBridgeStatus("error");
      setBridgeError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Add the dialog test component */}
      <div className="mb-8">
        <DialogTest />
      </div>

      <div className="flex flex-col md:flex-row bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-xl p-4 md:p-6 backdrop-blur-sm border border-white/10">
        {/* Source Chain (Lens) */}
        <div className="flex-1 p-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold">
              L
            </div>
            <h3 className="text-lg font-semibold text-white">
              {getChainName(sourceChainId)}
            </h3>
          </div>

          <div className="mt-4">
            <Label htmlFor="amount" className="text-white">
              Amount
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 pl-3 pr-16 py-2 bg-black/20 border border-white/10 rounded-md w-full text-white"
                placeholder="Enter amount"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-white/70">USDC</span>
              </div>
            </div>
          </div>

          {/* Syndicate Selection */}
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <Label className="text-white">Syndicate</Label>
            </div>

            {isLoadingSyndicates ? (
              <div className="flex items-center justify-center h-20 bg-black/20 border border-white/10 rounded-md mt-1">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              </div>
            ) : userSyndicates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-20 bg-black/20 border border-white/10 rounded-md mt-1 p-4">
                <p className="text-white/70 text-sm text-center">
                  No syndicates found
                </p>
                <Link href="/create">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-cyan-300 hover:text-cyan-200 mt-1"
                  >
                    Create your first syndicate on home page
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="mt-1 bg-black/20 border border-white/10 rounded-md p-2">
                <select
                  value={selectedSyndicate?.treasuryAddress || ""}
                  onChange={(e) => {
                    const syndicate = userSyndicates.find(
                      (s) => s.treasuryAddress === e.target.value
                    );
                    setSelectedSyndicate(syndicate || null);
                  }}
                  className="w-full bg-transparent text-white p-2 border-0 focus:outline-none focus:ring-0"
                >
                  {userSyndicates.map((syndicate) => (
                    <option
                      key={syndicate.treasuryAddress}
                      value={syndicate.treasuryAddress}
                    >
                      {syndicate.name} ({syndicate.cause})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Selected Syndicate Info */}
          {selectedSyndicate && (
            <div className="mt-4 p-3 bg-black/20 border border-white/10 rounded-md">
              <h4 className="font-medium text-white">
                {selectedSyndicate.name}
              </h4>
              <div className="mt-1 text-sm text-white/70">
                <div>Cause: {selectedSyndicate.cause}</div>
                <div>Cause %: {selectedSyndicate.causePercentage}%</div>
                <div className="mt-1">
                  Treasury:{" "}
                  <span className="font-mono text-xs">{`${selectedSyndicate.treasuryAddress.substring(
                    0,
                    6
                  )}...${selectedSyndicate.treasuryAddress.substring(
                    selectedSyndicate.treasuryAddress.length - 4
                  )}`}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center Arrow */}
        <div className="flex items-center justify-center py-4 md:py-0">
          <div className="bg-white/5 h-10 w-10 rounded-full flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Destination Chain (Base) */}
        <div className="flex-1 p-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              B
            </div>
            <h3 className="text-lg font-semibold text-white">
              {getChainName(destinationChainId)}
            </h3>
          </div>

          <div className="mt-6 p-4 bg-black/20 border border-white/10 rounded-md">
            <div className="text-sm text-white">
              <div className="flex items-center space-x-1">
                <span className="text-white/70">Estimated to receive:</span>
              </div>
              <div className="mt-1 text-lg font-medium text-white">
                {amount} USDC
              </div>
              <div className="mt-2 text-xs text-white/70">
                Recipient:{" "}
                <span className="text-cyan-300 font-mono text-xs">
                  {selectedSyndicate
                    ? `${selectedSyndicate.treasuryAddress.substring(
                        0,
                        6
                      )}...${selectedSyndicate.treasuryAddress.substring(
                        selectedSyndicate.treasuryAddress.length - 4
                      )}`
                    : "No syndicate selected"}
                </span>
              </div>
            </div>
          </div>

          {/* Bridging Information */}
          <div className="mt-4">
            <div className="p-4 bg-black/20 border border-white/10 rounded-md">
              <h4 className="font-medium text-white">Bridging Information</h4>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Bridge Provider:</span>
                  <span className="font-medium text-white">
                    Across Protocol
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Average Time:</span>
                  <span className="font-medium text-white">10-30 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Safe Contract:</span>
                  <span className="font-medium text-white font-mono text-xs">
                    {selectedSyndicate
                      ? `${selectedSyndicate.treasuryAddress.substring(
                          0,
                          6
                        )}...${selectedSyndicate.treasuryAddress.substring(
                          selectedSyndicate.treasuryAddress.length - 4
                        )}`
                      : "No syndicate selected"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bridge Button */}
      <div className="mt-6 flex justify-center">
        <Button
          variant="default"
          size="lg"
          disabled={
            !isConnected || bridgeStatus === "bridging" || !selectedSyndicate
          }
          onClick={handleBridge}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white w-3/4 md:w-1/2"
        >
          {bridgeStatus === "bridging" ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Bridging...
            </>
          ) : bridgeStatus === "success" ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" /> Bridged Successfully
            </>
          ) : bridgeStatus === "error" ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2" /> Bridge Failed
            </>
          ) : (
            "Bridge USDC to Base"
          )}
        </Button>
      </div>

      {/* Error message */}
      {(bridgeStatus === "error" || syndicateBridgeError) && (
        <div className="mt-2 text-center text-red-400 text-sm">
          {bridgeError ||
            (syndicateBridgeError ? syndicateBridgeError.message : "")}
        </div>
      )}
    </div>
  );
}
