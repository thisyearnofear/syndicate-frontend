"use client";

import { useState, useCallback } from "react";
import { useCrossChain } from "./use-cross-chain";
import { useAcrossAppSdk } from "./use-across-app-sdk";
import { BridgeType, DECENT_API_KEY, ACROSS_INTEGRATOR_ID } from "@/lib/cross-chain/config";

interface UseBridgeServiceOptions {
  defaultBridge?: BridgeType;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: string, data?: any) => void;
}

export function useBridgeService(options: UseBridgeServiceOptions = {}) {
  const {
    defaultBridge = BridgeType.ACROSS, // Default to Across since it's the only one that supports Lens Chain
    onSuccess,
    onError,
    onStatusChange,
  } = options;

  // State for selected bridge
  const [selectedBridge, setSelectedBridge] = useState<BridgeType>(defaultBridge);

  // Initialize both bridge services
  const decentService = useCrossChain({
    apiKey: DECENT_API_KEY,
    onSuccess,
    onError,
    onStatusChange,
  });

  const acrossService = useAcrossAppSdk({
    integratorId: ACROSS_INTEGRATOR_ID,
    onSuccess,
    onError,
    onStatusChange,
  });

  // Get the active service based on selected bridge
  const activeService = selectedBridge === BridgeType.DECENT ? decentService : acrossService;

  // Function to change the selected bridge
  const changeBridge = useCallback((bridge: BridgeType) => {
    if (bridge === BridgeType.DECENT) {
      console.warn("Decent.xyz does not currently support Lens Chain. Using Across Protocol instead.");
      // You could also show a toast notification here
      // If you still want to allow selection for testing, remove the return
      return;
    }
    setSelectedBridge(bridge);
  }, []);

  // Purchase tickets cross-chain
  const purchaseTickets = useCallback(
    async (params: any) => {
      if (selectedBridge === BridgeType.DECENT) {
        console.warn("Decent.xyz does not currently support Lens Chain. Using Across Protocol instead.");
      }

      // Convert parameters for Across service
      const acrossParams = {
        sourceChainId: params.sourceChainId,
        destinationChainId: params.destinationChainId,
        sourceToken: params.ghoAddressSource || params.usdcAddressSource,
        destinationToken: params.usdcAddressDestination,
        amount: params.amount.toString(),
        recipient: params.recipient || params.senderAddress,
      };

      // Use bridgeTokens method from acrossService
      return acrossService.bridgeTokens(acrossParams);
    },
    [selectedBridge, acrossService]
  );

  // Bridge winnings cross-chain
  const bridgeWinnings = useCallback(
    async (params: any) => {
      if (selectedBridge === BridgeType.DECENT) {
        console.warn("Decent.xyz does not currently support Lens Chain. Using Across Protocol instead.");
      }

      // Convert parameters for Across service
      const acrossParams = {
        sourceChainId: params.sourceChainId,
        destinationChainId: params.destinationChainId,
        sourceToken: params.usdcAddressSource,
        destinationToken: params.usdcAddressDestination || params.ghoAddressDestination,
        amount: params.amount.toString(),
        recipient: params.recipient || params.senderAddress,
      };

      // Use bridgeTokens method from acrossService
      return acrossService.bridgeTokens(acrossParams);
    },
    [selectedBridge, acrossService]
  );

  return {
    ...activeService,
    selectedBridge,
    changeBridge,
    purchaseTickets,
    bridgeWinnings,
    isDecentActive: selectedBridge === BridgeType.DECENT,
    isAcrossActive: selectedBridge === BridgeType.ACROSS,
  };
}
