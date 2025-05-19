"use client";

import { useCallback, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { parseUnits } from "viem";
import {
  getAcrossQuote,
  executeAcrossQuote,
  bridgeTokens as bridgeTokensService,
  getSupportedChains,
} from "@/lib/cross-chain/across-app-sdk-service";
import {
  ACROSS_INTEGRATOR_ID,
  ChainId,
  GHO_DECIMALS,
  USDC_DECIMALS,
  GHO_ADDRESS_LENS,
} from "@/lib/cross-chain/config";

interface UseAcrossAppSdkOptions {
  integratorId?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: string, data?: any) => void;
}

interface AcrossAppSdkState {
  isLoading: boolean;
  isPending: boolean;
  error: Error | null;
  txHash: string | null;
  txStatus: string | null;
  quote: any | null;
  supportedChains: any[] | null;
}

export function useAcrossAppSdk(options: UseAcrossAppSdkOptions = {}) {
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
  const [state, setState] = useState<AcrossAppSdkState>({
    isLoading: false,
    isPending: false,
    error: null,
    txHash: null,
    txStatus: null,
    quote: null,
    supportedChains: null,
  });

  // Get supported chains
  const fetchSupportedChains = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const chains = await getSupportedChains();
      setState((prev) => ({ ...prev, isLoading: false, supportedChains: chains }));
      return chains;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState((prev) => ({ ...prev, isLoading: false, error }));
      if (onError) onError(error);
      throw error;
    }
  }, [onError]);

  // Get a quote for bridging tokens
  const getQuote = useCallback(
    async (params: {
      sourceChainId: ChainId;
      destinationChainId: ChainId;
      sourceToken: string;
      destinationToken: string;
      amount: string;
      recipient?: string;
    }) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Parse amount to bigint with appropriate decimals
        const decimals = params.sourceToken.toLowerCase() === GHO_ADDRESS_LENS.toLowerCase()
          ? GHO_DECIMALS
          : USDC_DECIMALS;
        const inputAmount = parseUnits(params.amount, decimals);

        const quote = await getAcrossQuote({
          originChainId: params.sourceChainId,
          destinationChainId: params.destinationChainId,
          inputToken: params.sourceToken,
          outputToken: params.destinationToken,
          inputAmount,
          recipient: params.recipient || address,
        });

        setState((prev) => ({ ...prev, isLoading: false, quote }));
        return quote;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({ ...prev, isLoading: false, error }));
        if (onError) onError(error);
        throw error;
      }
    },
    [address, onError]
  );

  // Execute a quote to bridge tokens
  const executeQuote = useCallback(
    async (quote: any) => {
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

        // Execute the quote
        const result = await executeAcrossQuote({
          walletClient,
          deposit: quote.deposit,
          onProgress: (progress) => {
            // Handle progress updates
            let status = progress.status;

            // Map step and status to a more user-friendly status
            if (progress.step === "approve") {
              if (progress.status === "txSent") status = "approving";
              if (progress.status === "txSuccess") status = "approved";
            } else if (progress.step === "deposit") {
              if (progress.status === "txSent") status = "depositing";
              if (progress.status === "txSuccess") {
                status = "deposited";
                // Save the transaction hash
                setState((prev) => ({ ...prev, txHash: progress.txReceipt?.transactionHash }));
              }
            } else if (progress.step === "fill") {
              if (progress.status === "pending") status = "processing";
              if (progress.status === "txSuccess") status = "executed";
            }

            setState((prev) => ({ ...prev, txStatus: status }));
            if (onStatusChange) onStatusChange(status, progress);
          },
        });

        // Update state with success
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isPending: false,
          txStatus: "executed",
        }));

        if (onSuccess && state.txHash) onSuccess(state.txHash);
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
    [walletClient, address, onSuccess, onError, onStatusChange, state.txHash]
  );

  // Bridge tokens from one chain to another
  const bridgeTokens = useCallback(
    async (params: {
      sourceChainId: ChainId;
      destinationChainId: ChainId;
      sourceToken: string;
      destinationToken: string;
      amount: string;
      recipient?: string;
    }) => {
      if (!address || !walletClient) {
        const error = new Error("Wallet not connected");
        if (onError) onError(error);
        setState((prev) => ({ ...prev, error }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Parse amount to bigint with appropriate decimals
        const decimals = params.sourceToken.toLowerCase() === GHO_ADDRESS_LENS.toLowerCase()
          ? GHO_DECIMALS
          : USDC_DECIMALS;
        const inputAmount = parseUnits(params.amount, decimals);

        // Bridge tokens
        const result = await bridgeTokensService({
          walletClient,
          originChainId: params.sourceChainId,
          destinationChainId: params.destinationChainId,
          inputToken: params.sourceToken,
          outputToken: params.destinationToken,
          inputAmount,
          recipient: params.recipient || address,
          onProgress: (progress) => {
            // Handle progress updates
            let status = progress.status;

            // Map step and status to a more user-friendly status
            if (progress.step === "approve") {
              if (progress.status === "txSent") status = "approving";
              if (progress.status === "txSuccess") status = "approved";
            } else if (progress.step === "deposit") {
              if (progress.status === "txSent") status = "depositing";
              if (progress.status === "txSuccess") {
                status = "deposited";
                // Save the transaction hash
                setState((prev) => ({ ...prev, txHash: progress.txReceipt?.transactionHash }));
              }
            } else if (progress.step === "fill") {
              if (progress.status === "pending") status = "processing";
              if (progress.status === "txSuccess") status = "executed";
            }

            setState((prev) => ({ ...prev, txStatus: status }));
            if (onStatusChange) onStatusChange(status, progress);
          },
        });

        // Update state with success
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isPending: false,
          txStatus: "executed",
        }));

        if (onSuccess && state.txHash) onSuccess(state.txHash);
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
    [walletClient, address, onSuccess, onError, onStatusChange, state.txHash]
  );

  return {
    ...state,
    fetchSupportedChains,
    getQuote,
    executeQuote,
    bridgeTokens,
  };
}
