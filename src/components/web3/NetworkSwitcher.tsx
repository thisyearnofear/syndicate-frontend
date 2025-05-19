"use client";

import React from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "../ui/inputs/button";
import { CHAIN_IDS } from "@/lib/wagmi-chains";

export function NetworkSwitcher() {
  const {
    isConnected,
    chainId,
    isLensNetwork,
    activeLensChain,
    switchToLensMainnet,
    switchToLensTestnet,
    switchStatus,
  } = useWallet();

  if (!isConnected) {
    return null;
  }

  // Determine which chain we're connected to
  const isMainnet = chainId === CHAIN_IDS.LENS_MAINNET;
  const isTestnet = chainId === CHAIN_IDS.LENS_TESTNET;
  const isBase = chainId === CHAIN_IDS.BASE;

  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-black/20 text-sm">
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isLensNetwork ? "bg-green-500" : "bg-gray-500"
          }`}
        ></div>
        <span className="font-medium">
          {isLensNetwork
            ? `Connected to ${activeLensChain?.name}`
            : isBase
            ? "Connected to Base Chain"
            : `Connected to chain ${chainId}`}
        </span>
      </div>

      {/* Network switching buttons */}
      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isMainnet || switchStatus.inProgress}
          onClick={switchToLensMainnet}
          className={isMainnet ? "bg-blue-500/20 border-blue-500" : ""}
        >
          Lens Mainnet
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isTestnet || switchStatus.inProgress}
          onClick={switchToLensTestnet}
          className={isTestnet ? "bg-purple-500/20 border-purple-500" : ""}
        >
          Lens Testnet
        </Button>
      </div>

      {/* Status messages */}
      {switchStatus.inProgress && (
        <div className="text-xs text-blue-400 animate-pulse mt-1">
          Switching networks...
        </div>
      )}

      {switchStatus.error && (
        <div className="text-xs text-red-400 mt-1">
          Error: {switchStatus.error.message}
        </div>
      )}
    </div>
  );
}
