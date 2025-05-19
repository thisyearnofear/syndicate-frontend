"use client";

import { useCallback, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import {
  getSwapApproval,
  executeSwapApproval
} from "@/lib/cross-chain/across-api-service";
import {
  ACROSS_INTEGRATOR_ID,
  ChainId,
} from "@/lib/cross-chain/config";

interface UseAcrossApiOptions {
  integratorId?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: string, data?: any) => void;
}

interface AcrossApiState {
  isLoading: boolean;
  isPending: boolean;
  error: Error | null;
  txHash: string | null;
  txStatus: string | null;
  swapApproval: any | null;
}

export function useAcrossApi(options: UseAcrossApiOptions = {}) {
  const {
    integratorId = ACROSS_INTEGRATOR_ID,
    onSuccess,
    onError,
    onStatusChange,
  } = options;

  // Wagmi hooks
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  // State
  const [state, setState] = useState<AcrossApiState>({
    isLoading: false,
    isPending: false,
    error: null,
    txHash: null,
    txStatus: null,
    swapApproval: null,
  });

  // Get a swap approval quote
  const getQuote = useCallback(
    async (params: {
      sourceChainId: ChainId;
      destinationChainId: ChainId;
      sourceToken: string;
      destinationToken: string;
      amount: string;
      recipient?: string;
      slippageTolerance?: number;
    }) => {
      if (!address) {
        const error = new Error("Wallet not connected");
        if (onError) onError(error);
        setState((prev) => ({ ...prev, error }));
        return null;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const swapApproval = await getSwapApproval({
          originChainId: params.sourceChainId,
          destinationChainId: params.destinationChainId,
          inputToken: params.sourceToken,
          outputToken: params.destinationToken,
          amount: params.amount,
          depositor: address,
          recipient: params.recipient || address,
          slippageTolerance: params.slippageTolerance,
          integratorId,
        });

        setState((prev) => ({ ...prev, isLoading: false, swapApproval }));
        return swapApproval;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({ ...prev, isLoading: false, error }));
        if (onError) onError(error);
        throw error;
      }
    },
    [address, integratorId, onError]
  );

  // Execute a swap approval
  const executeQuote = useCallback(
    async (swapApproval: any) => {
      if (!address || !walletClient) {
        const error = new Error("Wallet not connected");
        if (onError) onError(error);
        setState((prev) => ({ ...prev, error }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, isPending: true, error: null }));

      try {
        // Update status
        setState((prev) => ({ ...prev, txStatus: "preparing" }));
        if (onStatusChange) onStatusChange("preparing");

        // Execute the swap approval
        const result = await executeSwapApproval({
          walletClient,
          swapApproval,
          onProgress: (progress) => {
            // Handle progress updates
            let status = progress.status;
            
            if (status === "approval") {
              setState((prev) => ({ ...prev, txStatus: "approving" }));
              if (onStatusChange) onStatusChange("approving", progress);
            } else if (status === "approval_submitted") {
              setState((prev) => ({ ...prev, txStatus: "approval_pending" }));
              if (onStatusChange) onStatusChange("approval_pending", progress);
            } else if (status === "approval_confirmed") {
              setState((prev) => ({ ...prev, txStatus: "approved" }));
              if (onStatusChange) onStatusChange("approved", progress);
            } else if (status === "swap") {
              setState((prev) => ({ ...prev, txStatus: "swapping" }));
              if (onStatusChange) onStatusChange("swapping", progress);
            } else if (status === "swap_submitted") {
              setState((prev) => ({ 
                ...prev, 
                txStatus: "swap_pending", 
                txHash: progress.hash 
              }));
              if (onStatusChange) onStatusChange("swap_pending", progress);
            }
          },
        });

        // Update state with success
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isPending: false,
          txStatus: "executed",
          txHash: result.hash,
        }));

        if (onSuccess) onSuccess(result.hash);
        if (onStatusChange) onStatusChange("executed", result);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isPending: false,
          error,
          txStatus: "failed",
        }));
        if (onError) onError(error);
        if (onStatusChange) onStatusChange("failed", { error });
        return null;
      }
    },
    [walletClient, address, onSuccess, onError, onStatusChange]
  );

  // Bridge tokens from one chain to another (combined function)
  const bridgeTokens = useCallback(
    async (params: {
      sourceChainId: ChainId;
      destinationChainId: ChainId;
      sourceToken: string;
      destinationToken: string;
      amount: string;
      recipient?: string;
      slippageTolerance?: number;
    }) => {
      if (!address || !walletClient) {
        const error = new Error("Wallet not connected");
        if (onError) onError(error);
        setState((prev) => ({ ...prev, error }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // First get the quote
        const swapApproval = await getQuote(params);
        
        if (!swapApproval) {
          throw new Error("Failed to get swap approval");
        }
        
        // Then execute it
        return await executeQuote(swapApproval);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isPending: false,
          error,
          txStatus: "failed",
        }));
        if (onError) onError(error);
        if (onStatusChange) onStatusChange("failed", { error });
        return null;
      }
    },
    [address, walletClient, getQuote, executeQuote, onError, onStatusChange]
  );

  return {
    ...state,
    getQuote,
    executeQuote,
    bridgeTokens,
  };
}
