"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import {
  isLensChain,
  getLensChainById,
  CHAIN_IDS,
  lensMainnet,
  lensTestnet,
} from "@/lib/wagmi-chains";
import { updateActiveChain } from "@/lib/lens/client";
import {
  chainSwitchOrchestrator,
  ChainSwitchEvent,
} from "@/services/ChainSwitchOrchestrator";

// Define the structure of our context
type WalletContextType = {
  isConnected: boolean;
  address: string | undefined;
  chainId: number;
  isLensNetwork: boolean;
  activeLensChain: typeof lensMainnet | typeof lensTestnet | undefined;
  disconnect: () => void;
  switchToLensMainnet: () => Promise<boolean>;
  switchToLensTestnet: () => Promise<boolean>;
  switchingChain: boolean;
  switchStatus: {
    inProgress: boolean;
    error: Error | null;
    lastEvent: ChainSwitchEvent | null;
  };
};

// Create the context with default values
const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: undefined,
  chainId: 0,
  isLensNetwork: false,
  activeLensChain: undefined,
  disconnect: () => {},
  switchToLensMainnet: async () => false,
  switchToLensTestnet: async () => false,
  switchingChain: false,
  switchStatus: {
    inProgress: false,
    error: null,
    lastEvent: null,
  },
});

// Custom hook to use the wallet context
export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect: disconnectWallet } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [switchingChain, setSwitchingChain] = useState(false);
  const [switchStatus, setSwitchStatus] = useState<
    WalletContextType["switchStatus"]
  >({
    inProgress: false,
    error: null,
    lastEvent: null,
  });

  // Determine if connected to a Lens network
  const isLensNetwork = isLensChain(chainId);

  // Get the active Lens chain based on current chainId
  const activeLensChain = isLensNetwork ? getLensChainById(chainId) : undefined;

  // Set up chain switch orchestrator subscriber
  useEffect(() => {
    const unsubscribe = chainSwitchOrchestrator.subscribe((event, data) => {
      console.log(`Chain switch event: ${event}`, data);

      // Update switch status based on events
      if (event === ChainSwitchEvent.STARTED) {
        setSwitchStatus({
          inProgress: true,
          error: null,
          lastEvent: event,
        });
        setSwitchingChain(true);
      } else if (event === ChainSwitchEvent.FAILED) {
        setSwitchStatus({
          inProgress: false,
          error: data.error,
          lastEvent: event,
        });
        setSwitchingChain(false);
      } else if (event === ChainSwitchEvent.COMPLETED) {
        setSwitchStatus({
          inProgress: false,
          error: null,
          lastEvent: event,
        });
        setSwitchingChain(false);
      } else {
        setSwitchStatus((prev) => ({
          ...prev,
          lastEvent: event,
        }));
      }
    });

    return unsubscribe;
  }, []);

  // Update orchestrator when chain changes
  useEffect(() => {
    chainSwitchOrchestrator.handleChainChange(chainId);
  }, [chainId]);

  // Create a properly typed wrapper for switchChain
  const switchChainWrapper = async (params: {
    chainId: number;
  }): Promise<void> => {
    try {
      await switchChain(params);
    } catch (error) {
      console.error("Error in switchChainWrapper:", error);
      throw error;
    }
  };

  // Switch to Lens Mainnet using the orchestrator
  const switchToLensMainnet = async (): Promise<boolean> => {
    return chainSwitchOrchestrator.switchToLensMainnet(switchChainWrapper);
  };

  // Switch to Lens Testnet using the orchestrator
  const switchToLensTestnet = async (): Promise<boolean> => {
    return chainSwitchOrchestrator.switchToLensTestnet(switchChainWrapper);
  };

  // Update Lens client when chain changes
  useEffect(() => {
    if (isLensNetwork) {
      updateActiveChain(chainId);
    }
  }, [chainId, isLensNetwork]);

  const value = {
    isConnected,
    address: address as string | undefined,
    chainId,
    isLensNetwork,
    activeLensChain,
    disconnect: disconnectWallet,
    switchToLensMainnet,
    switchToLensTestnet,
    switchingChain,
    switchStatus,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
