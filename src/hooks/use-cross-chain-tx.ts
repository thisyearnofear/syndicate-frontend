"use client";

import { useState, useCallback } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { CrossChainService } from "@/lib/cross-chain/cross-chain-service";
import { ChainId, DECENT_API_KEY } from "@/lib/cross-chain/config";

interface UseCrossChainTxOptions {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: string, data?: any) => void;
}

export function useCrossChainTx(options: UseCrossChainTxOptions = {}) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Initialize service
  const crossChainService = new CrossChainService(DECENT_API_KEY);

  // Transaction state
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Execute cross-chain transaction
  const executeTx = useCallback(async (params: {
    sourceChainId: ChainId;
    destinationChainId: ChainId;
    contractAddress: string;
    functionSignature: string;
    args: any[];
    value?: bigint;
  }) => {
    if (!address || !walletClient || !publicClient) {
      const error = new Error("Wallet not connected");
      setError(error);
      options.onError?.(error);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare the transaction
      const { tx } = await crossChainService.prepareTransaction({
        ...params,
        senderAddress: address,
      });

      // Convert tx properties to the correct types
      const txForEstimate = {
        account: address,
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: tx.value
      };

      // Estimate gas
      const gas = await publicClient.estimateGas(txForEstimate);

      setIsPending(true);

      // Send the transaction
      const hash = await walletClient.sendTransaction({
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: tx.value,
        gas,
      });

      setTxHash(hash);
      setIsSuccess(true);
      setTxStatus("processing");
      options.onSuccess?.(hash);

      // Start polling for transaction status
      pollTransactionStatus(params.sourceChainId, hash);

      return hash;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
      setIsPending(false);
    }
  }, [address, walletClient, publicClient, crossChainService, options]);

  // Poll for transaction status
  const pollTransactionStatus = useCallback(async (chainId: ChainId, hash: string) => {
    const pollInterval = 10000; // 10 seconds
    const maxAttempts = 12; // 2 minutes total

    let attempts = 0;
    const poll = async () => {
      try {
        if (attempts >= maxAttempts) {
          setTxStatus("timeout");
          options.onStatusChange?.("timeout");
          return;
        }

        const { status, data } = await crossChainService.getTransactionStatus(chainId, hash);
        setTxStatus(status);
        options.onStatusChange?.(status, data);

        // If not complete, continue polling
        if (status !== "Executed" && status !== "Failed") {
          attempts++;
          setTimeout(poll, pollInterval);
        }
      } catch (err) {
        attempts++;
        setTimeout(poll, pollInterval);
      }
    };

    await poll();
  }, [crossChainService, options]);

  return {
    executeTx,
    pollTransactionStatus,
    isLoading,
    isPending,
    isSuccess,
    error,
    txHash,
    txStatus,
  };
}