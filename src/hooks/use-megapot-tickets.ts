"use client";

import { useState, useCallback } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { megapotUtils } from "@/lib/cross-chain/megapot-utils";
import { ChainId, DEFAULT_REFERRER_ADDRESS, DESTINATION_CHAIN_ID, SOURCE_CHAIN_ID, TokenType } from "@/lib/cross-chain/config";

interface UseMegapotTicketsOptions {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: string, data?: any) => void;
}

export function useMegapotTickets(options: UseMegapotTicketsOptions = {}) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Transaction state
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Purchase tickets from a Syndicate
  const purchaseTickets = useCallback(async (params: {
    ticketCount: number;
    ticketPrice: number;
    syndicateId?: string;
    referrerAddress?: string;
    sourceChainId?: ChainId;
    destinationChainId?: ChainId;
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
      const { tx } = await megapotUtils.preparePurchaseTickets({
        senderAddress: address,
        ticketCount: params.ticketCount,
        ticketPrice: params.ticketPrice,
        syndicateId: params.syndicateId,
        referrerAddress: params.referrerAddress || DEFAULT_REFERRER_ADDRESS,
        sourceChainId: params.sourceChainId || SOURCE_CHAIN_ID,
        destinationChainId: params.destinationChainId || DESTINATION_CHAIN_ID,
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
      pollTransactionStatus(params.sourceChainId || SOURCE_CHAIN_ID, hash);

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
  }, [address, walletClient, publicClient, options]);

  // Poll for transaction status
  const pollTransactionStatus = useCallback(async (chainId: ChainId, hash: string) => {
    const pollInterval = 10000; // 10 seconds
    const maxAttempts = 12; // 2 minutes total
    const crossChainService = megapotUtils.getCrossChainService();

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
  }, [options]);

  return {
    purchaseTickets,
    pollTransactionStatus,
    isLoading,
    isPending,
    isSuccess,
    error,
    txHash,
    txStatus,
  };
}