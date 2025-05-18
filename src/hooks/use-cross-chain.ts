"use client";

import { useCallback, useMemo, useState } from "react";
import { ChainId } from "@decent.xyz/box-common";
import { DecentService } from "@/lib/cross-chain/decent-service";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

interface UseCrossChainOptions {
  apiKey: string;
  apiUrl?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: string, data?: any) => void;
}

interface CrossChainState {
  isLoading: boolean;
  isPending: boolean;
  error: Error | null;
  txHash: string | null;
  txStatus: string | null;
}

export function useCrossChain(options: UseCrossChainOptions) {
  const { apiKey, apiUrl, onSuccess, onError, onStatusChange } = options;

  // Wagmi hooks
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // State
  const [state, setState] = useState<CrossChainState>({
    isLoading: false,
    isPending: false,
    error: null,
    txHash: null,
    txStatus: null,
  });

  // Create the Decent service
  const decentService = useMemo(() => {
    return new DecentService({
      apiKey,
      decentApiUrl: apiUrl,
    });
  }, [apiKey, apiUrl]);

  // Purchase tickets cross-chain
  const purchaseTickets = useCallback(async (params: {
    sourceChainId: ChainId; // Lens Chain
    destinationChainId: ChainId; // Base Chain
    usdcAddressSource: string;
    usdcAddressDestination: string;
    ticketAmount: number;
    ticketPriceInUSDC: number;
    megapotContractAddress: string;
    syndicateRegistryAddress: string;
    referrerAddress?: string;
    pollStatus?: boolean;
  }) => {
    if (!address || !walletClient || !publicClient) {
      const error = new Error("Wallet not connected");
      if (onError) onError(error);
      setState(prev => ({ ...prev, error }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Log parameters for debugging
      console.log("Cross-chain purchase parameters:", {
        sourceChainId: params.sourceChainId,
        destinationChainId: params.destinationChainId,
        usdcAddressSource: params.usdcAddressSource,
        usdcAddressDestination: params.usdcAddressDestination,
        ticketAmount: params.ticketAmount,
        ticketPriceInUSDC: params.ticketPriceInUSDC,
        megapotContractAddress: params.megapotContractAddress,
        syndicateRegistryAddress: params.syndicateRegistryAddress,
      });

      // Prepare the transaction
      setState(prev => ({ ...prev, txStatus: 'preparing' }));
      const prepareResult = await decentService.preparePurchaseTickets({
        senderAddress: address,
        ...params,
      });

      if (!prepareResult || !prepareResult.tx) {
        throw new Error("Failed to prepare transaction: No transaction data returned");
      }

      const { tx } = prepareResult;
      console.log("Transaction prepared:", tx);

      // Estimate gas
      setState(prev => ({ ...prev, txStatus: 'estimating gas' }));
      const gas = await publicClient.estimateGas({
        account: address,
        ...tx,
      });
      console.log("Gas estimated:", gas);

      setState(prev => ({ ...prev, isPending: true, txStatus: 'awaiting confirmation' }));

      // Send the transaction
      const hash = await walletClient.sendTransaction({
        ...tx,
        gas,
      });
      console.log("Transaction submitted with hash:", hash);

      setState(prev => ({
        ...prev,
        isLoading: false,
        isPending: false,
        txHash: hash,
        txStatus: 'processing'
      }));

      if (onSuccess) onSuccess(hash);

      // Poll for transaction status if requested
      if (params.pollStatus) {
        pollTransactionStatus(params.sourceChainId, hash);
      }

      return hash;
    } catch (err) {
      console.error("Cross-chain transaction error:", err);
      const error = err instanceof Error ? err : new Error(String(err));
      setState(prev => ({
        ...prev,
        isLoading: false,
        isPending: false,
        error,
        txStatus: 'failed'
      }));

      if (onError) onError(error);
    }
  }, [address, walletClient, publicClient, decentService, onSuccess, onError]);

  // Bridge winnings cross-chain
  const bridgeWinnings = useCallback(async (params: {
    sourceChainId: ChainId; // Base Chain
    destinationChainId: ChainId; // Lens Chain
    usdcAddressSource: string;
    usdcAddressDestination: string;
    totalAmount: number;
    syndicateTreasuryAddress: string;
    syndicateAddress: string;
    causeAddress: string;
    causePercentage: number;
    pollStatus?: boolean;
  }) => {
    if (!address || !walletClient || !publicClient) {
      const error = new Error("Wallet not connected");
      if (onError) onError(error);
      setState(prev => ({ ...prev, error }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Prepare the transaction
      const { tx } = await decentService.prepareBridgeWinnings({
        senderAddress: address,
        ...params,
      });

      // Estimate gas
      const gas = await publicClient.estimateGas({
        account: address,
        ...tx,
      });

      setState(prev => ({ ...prev, isPending: true }));

      // Send the transaction
      const hash = await walletClient.sendTransaction({
        ...tx,
        gas,
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        isPending: false,
        txHash: hash,
        txStatus: 'processing'
      }));

      if (onSuccess) onSuccess(hash);

      // Poll for transaction status if requested
      if (params.pollStatus) {
        pollTransactionStatus(params.sourceChainId, hash);
      }

      return hash;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState(prev => ({
        ...prev,
        isLoading: false,
        isPending: false,
        error
      }));

      if (onError) onError(error);
    }
  }, [address, walletClient, publicClient, decentService, onSuccess, onError]);

  // Poll transaction status
  const pollTransactionStatus = useCallback(async (
    sourceChainId: ChainId,
    txHash: string
  ) => {
    setState(prev => ({ ...prev, txStatus: 'polling' }));

    try {
      const result = await decentService.pollTransactionStatus(sourceChainId, txHash);

      setState(prev => ({ ...prev, txStatus: result.status }));

      if (onStatusChange) {
        onStatusChange(result.status, result);
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Error polling tx status:", error);

      setState(prev => ({ ...prev, txStatus: 'error' }));

      if (onStatusChange) {
        onStatusChange('error', { error });
      }
    }
  }, [decentService, onStatusChange]);

  return {
    ...state,
    purchaseTickets,
    bridgeWinnings,
    pollTransactionStatus,
  };
}