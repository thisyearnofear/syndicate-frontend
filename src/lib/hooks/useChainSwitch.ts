"use client";

import { useCallback, useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';

interface ChainSwitchHookResult {
  /**
   * Switch to the specified chain ID
   */
  switchToChain: (chainId: number) => Promise<boolean>;
  
  /**
   * Check if the current chain matches the specified chain ID
   */
  isConnectedToChain: (chainId: number) => boolean;
  
  /**
   * The current chain ID the wallet is connected to
   */
  currentChainId: number | undefined;
  
  /**
   * Whether a chain switch operation is in progress
   */
  isSwitching: boolean;
  
  /**
   * Any error that occurred during the last chain switch attempt
   */
  error: Error | null;
}

/**
 * Hook for switching between blockchain networks
 * Provides utilities for checking and changing the current chain
 */
export function useChainSwitch(): ChainSwitchHookResult {
  const { chainId } = useAccount();
  const { switchChain, isPending: isSwitching, error } = useSwitchChain();
  const [currentChainId, setCurrentChainId] = useState<number | undefined>(chainId);

  // Update the current chain ID when it changes in wagmi
  useEffect(() => {
    if (chainId) {
      setCurrentChainId(chainId);
    }
  }, [chainId]);

  // Helper to check if connected to a specific chain
  const isConnectedToChain = useCallback(
    (checkChainId: number): boolean => {
      return currentChainId === checkChainId;
    },
    [currentChainId]
  );

  // Function to switch to a specific chain
  const switchToChain = useCallback(
    async (targetChainId: number): Promise<boolean> => {
      try {
        // If already on the right chain, return true
        if (isConnectedToChain(targetChainId)) {
          return true;
        }

        // Attempt to switch chains
        if (switchChain) {
          await switchChain({ chainId: targetChainId });
          return true;
        }
        return false;
      } catch (err) {
        console.error(`Failed to switch to chain ID ${targetChainId}:`, err);
        return false;
      }
    },
    [isConnectedToChain, switchChain]
  );

  return {
    switchToChain,
    isConnectedToChain,
    currentChainId,
    isSwitching,
    error,
  };
}