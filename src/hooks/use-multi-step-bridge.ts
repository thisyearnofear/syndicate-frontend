"use client";

import { useCallback, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import {
  executeMultiStepBridge,
  bridgeFromLensToEthereum,
  swapGhoToUsdcOnEthereum,
  bridgeFromEthereumToBase,
} from "@/lib/cross-chain/multi-step-bridge-service";

// Define the steps in the bridging process
export enum BridgeStep {
  INITIAL = "initial",
  LENS_TO_ETH = "lens_to_eth",
  ETH_SWAP = "eth_swap",
  ETH_TO_BASE = "eth_to_base",
  COMPLETED = "completed",
}

// Define the status of each step
export type StepStatus = "pending" | "in_progress" | "completed" | "failed";

interface UseMultiStepBridgeOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  onStepChange?: (step: BridgeStep, status: StepStatus, data?: any) => void;
}

interface MultiStepBridgeState {
  isLoading: boolean;
  error: Error | null;
  currentStep: BridgeStep;
  stepStatus: Record<BridgeStep, StepStatus>;
  txHashes: Record<BridgeStep, string | null>;
  result: any | null;
}

export function useMultiStepBridge(options: UseMultiStepBridgeOptions = {}) {
  const { onSuccess, onError, onStepChange } = options;

  // Wagmi hooks
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  // State
  const [state, setState] = useState<MultiStepBridgeState>({
    isLoading: false,
    error: null,
    currentStep: BridgeStep.INITIAL,
    stepStatus: {
      [BridgeStep.INITIAL]: "pending",
      [BridgeStep.LENS_TO_ETH]: "pending",
      [BridgeStep.ETH_SWAP]: "pending",
      [BridgeStep.ETH_TO_BASE]: "pending",
      [BridgeStep.COMPLETED]: "pending",
    },
    txHashes: {
      [BridgeStep.INITIAL]: null,
      [BridgeStep.LENS_TO_ETH]: null,
      [BridgeStep.ETH_SWAP]: null,
      [BridgeStep.ETH_TO_BASE]: null,
      [BridgeStep.COMPLETED]: null,
    },
    result: null,
  });

  // Update step status
  const updateStepStatus = useCallback(
    (step: BridgeStep, status: StepStatus, data?: any) => {
      setState((prev) => ({
        ...prev,
        stepStatus: {
          ...prev.stepStatus,
          [step]: status,
        },
        ...(data?.hash
          ? {
              txHashes: {
                ...prev.txHashes,
                [step]: data.hash,
              },
            }
          : {}),
      }));

      if (onStepChange) {
        onStepChange(step, status, data);
      }
    },
    [onStepChange]
  );

  // Execute the complete multi-step bridging process
  const executeBridge = useCallback(
    async (amount: string) => {
      if (!address || !walletClient) {
        const error = new Error("Wallet not connected");
        if (onError) onError(error);
        setState((prev) => ({ ...prev, error }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        currentStep: BridgeStep.LENS_TO_ETH,
      }));

      updateStepStatus(BridgeStep.LENS_TO_ETH, "in_progress");

      try {
        // Execute the multi-step bridge
        const result = await executeMultiStepBridge({
          amount,
          depositor: address,
          walletClient,
          onProgress: (progress) => {
            console.log("Bridge progress:", progress);

            // Update step status based on progress
            if (progress.step === 1) {
              if (progress.status === "completed") {
                updateStepStatus(BridgeStep.LENS_TO_ETH, "completed", progress);
                setState((prev) => ({
                  ...prev,
                  currentStep: BridgeStep.ETH_SWAP,
                }));
              } else if (progress.status === "failed") {
                updateStepStatus(BridgeStep.LENS_TO_ETH, "failed", progress);
              }
            } else if (progress.step === 2) {
              if (progress.status === "starting") {
                updateStepStatus(BridgeStep.ETH_SWAP, "in_progress", progress);
              } else if (progress.status === "completed") {
                updateStepStatus(BridgeStep.ETH_SWAP, "completed", progress);
                setState((prev) => ({
                  ...prev,
                  currentStep: BridgeStep.ETH_TO_BASE,
                }));
              } else if (progress.status === "failed") {
                updateStepStatus(BridgeStep.ETH_SWAP, "failed", progress);
              }
            } else if (progress.step === 3) {
              if (progress.status === "starting") {
                updateStepStatus(BridgeStep.ETH_TO_BASE, "in_progress", progress);
              } else if (progress.status === "completed") {
                updateStepStatus(BridgeStep.ETH_TO_BASE, "completed", progress);
                setState((prev) => ({
                  ...prev,
                  currentStep: BridgeStep.COMPLETED,
                }));
                updateStepStatus(BridgeStep.COMPLETED, "completed", progress);
              } else if (progress.status === "failed") {
                updateStepStatus(BridgeStep.ETH_TO_BASE, "failed", progress);
              }
            }
          },
        });

        // Update state with success
        setState((prev) => ({
          ...prev,
          isLoading: false,
          result,
        }));

        if (onSuccess) onSuccess(result);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error,
        }));
        if (onError) onError(error);
        return null;
      }
    },
    [address, walletClient, updateStepStatus, onSuccess, onError]
  );

  // Execute just the first step (Lens to Ethereum)
  const bridgeLensToEthereum = useCallback(
    async (amount: string) => {
      if (!address || !walletClient) {
        const error = new Error("Wallet not connected");
        if (onError) onError(error);
        setState((prev) => ({ ...prev, error }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        currentStep: BridgeStep.LENS_TO_ETH,
      }));

      updateStepStatus(BridgeStep.LENS_TO_ETH, "in_progress");

      try {
        const result = await bridgeFromLensToEthereum({
          amount,
          depositor: address,
          walletClient,
          onProgress: (progress) => {
            console.log("Bridge progress:", progress);
          },
        });

        updateStepStatus(BridgeStep.LENS_TO_ETH, "completed", { hash: result.hash });

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        updateStepStatus(BridgeStep.LENS_TO_ETH, "failed");
        if (onError) onError(error);
        return null;
      } finally {
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    },
    [address, walletClient, updateStepStatus, onError]
  );

  return {
    ...state,
    executeBridge,
    bridgeLensToEthereum,
  };
}
