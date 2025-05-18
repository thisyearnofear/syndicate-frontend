"use client";

import { ActionType, ChainId } from "@decent.xyz/box-common";
import { formatUnits, parseUnits } from "viem";

// Custom BigInt serializer that converts BigInt to string without the 'n' suffix
const customBigIntSerializer = (_key: string, value: any) => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

// Custom BigInt deserializer that converts numeric strings back to BigInt
const customBigIntDeserializer = (_key: string, value: any) => {
  if (typeof value === "string" && /^\d+$/.test(value)) {
    try {
      return BigInt(value);
    } catch {
      return value;
    }
  }
  return value;
};

/**
 * Configuration options for the Decent.xyz service
 */
interface DecentServiceConfig {
  apiKey: string;
  decentApiUrl?: string;
}

/**
 * The BoxActionRequest interface for Decent.xyz
 */
interface BoxActionRequest {
  actionType: ActionType;
  sender: string;
  srcToken: string;
  dstToken: string;
  srcChainId: ChainId | string;
  dstChainId: ChainId;
  slippage: number;
  actionConfig: any;
}

/**
 * Interface for preparing a transaction to purchase tickets on Megapot
 */
interface PurchaseTicketsParams {
  senderAddress: string;
  sourceChainId: ChainId; // Lens Chain
  destinationChainId: ChainId; // Base Chain
  usdcAddressSource: string;
  usdcAddressDestination: string;
  ticketAmount: number;
  ticketPriceInUSDC: number;
  megapotContractAddress: string;
  syndicateRegistryAddress: string;
  referrerAddress?: string;
}

/**
 * Interface for preparing a transaction to bridge winnings back to Lens Chain
 */
interface BridgeWinningsParams {
  senderAddress: string;
  sourceChainId: ChainId; // Base Chain
  destinationChainId: ChainId; // Lens Chain
  usdcAddressSource: string;
  usdcAddressDestination: string;
  totalAmount: number;
  syndicateTreasuryAddress: string;
  syndicateAddress: string;
  causeAddress: string;
  causePercentage: number;
}

/**
 * Service for handling cross-chain operations via Decent.xyz
 */
export class DecentService {
  private apiKey: string;
  private apiUrl: string;

  constructor(config: DecentServiceConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.decentApiUrl || "https://box-v4.api.decent.xyz/api";
  }

  /**
   * Prepares a transaction for purchasing tickets on Megapot through Decent.xyz
   */
  async preparePurchaseTickets(params: PurchaseTicketsParams) {
    const {
      senderAddress,
      sourceChainId,
      destinationChainId,
      usdcAddressSource,
      usdcAddressDestination,
      ticketAmount,
      ticketPriceInUSDC,
      megapotContractAddress,
      syndicateRegistryAddress,
      referrerAddress = "0x0000000000000000000000000000000000000000",
    } = params;

    // Calculate total cost in USDC
    const totalCostInUSDC = ticketAmount * ticketPriceInUSDC;

    // Convert to wei (assuming 6 decimals for USDC)
    const totalCostInWei = parseUnits(totalCostInUSDC.toString(), 6);

    // Create the transaction config
    const txConfig: BoxActionRequest = {
      actionType: ActionType.EvmFunction,
      sender: senderAddress,
      srcToken: usdcAddressSource,
      dstToken: usdcAddressDestination,
      srcChainId: sourceChainId,
      dstChainId: destinationChainId,
      slippage: 1, // 1% slippage
      actionConfig: {
        chainId: destinationChainId,
        contractAddress: megapotContractAddress,
        cost: {
          amount: totalCostInWei,
          isNative: false,
          tokenAddress: usdcAddressDestination,
        },
        signature: "function purchaseTickets(address referrer, uint256 value, address recipient)",
        args: [
          referrerAddress,
          totalCostInWei,
          syndicateRegistryAddress, // The recipient is our registry that tracks tickets
        ],
      },
    };

    return this.prepareTransaction(txConfig);
  }

  /**
   * Prepares a transaction for bridging winnings back to Lens Chain
   */
  async prepareBridgeWinnings(params: BridgeWinningsParams) {
    const {
      senderAddress,
      sourceChainId,
      destinationChainId,
      usdcAddressSource,
      usdcAddressDestination,
      totalAmount,
      syndicateTreasuryAddress,
      syndicateAddress,
      causeAddress,
      causePercentage,
    } = params;

    // Convert to wei (assuming 6 decimals for USDC)
    const totalAmountInWei = parseUnits(totalAmount.toString(), 6);

    // Calculate cause amount
    const causeAmountInWei = (totalAmountInWei * BigInt(causePercentage)) / 100n;

    // Create the transaction config
    const txConfig: BoxActionRequest = {
      actionType: ActionType.EvmFunction,
      sender: senderAddress,
      srcToken: usdcAddressSource,
      dstToken: usdcAddressDestination,
      srcChainId: sourceChainId,
      dstChainId: destinationChainId,
      slippage: 1, // 1% slippage
      actionConfig: {
        chainId: destinationChainId,
        contractAddress: syndicateTreasuryAddress,
        cost: {
          amount: totalAmountInWei,
          isNative: false,
          tokenAddress: usdcAddressDestination,
        },
        signature: "function receiveWinnings(address syndicate, uint256 totalAmount, address causeAddress, uint256 causeAmount)",
        args: [
          syndicateAddress,
          totalAmountInWei,
          causeAddress,
          causeAmountInWei,
        ],
      },
    };

    return this.prepareTransaction(txConfig);
  }

  /**
   * Generic method to prepare any transaction via Decent.xyz
   */
  async prepareTransaction(txConfig: BoxActionRequest) {
    const url = new URL(`${this.apiUrl}/getBoxAction`);
    url.searchParams.set("arguments", JSON.stringify(txConfig, customBigIntSerializer));

    const requestOptions = {
      method: "GET",
      headers: { "x-api-key": this.apiKey },
    };

    try {
      const response = await fetch(url.toString(), requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Decent API error response:", errorText);
        throw new Error(`Decent API error: ${response.status} ${response.statusText}`);
      }

      const textResponse = await response.text();
      console.log("Decent API response:", textResponse);
      const { tx, tokenPayment } = JSON.parse(textResponse, customBigIntDeserializer);

      return {
        tx,
        tokenPayment,
      };
    } catch (error) {
      console.error("Error preparing transaction with Decent:", error);
      throw error;
    }
  }

  /**
   * Polls for the status of a cross-chain transaction
   */
  async pollTransactionStatus(sourceChainId: ChainId, txHash: string, maxAttempts = 20) {
    const queryParams = new URLSearchParams({
      chainId: sourceChainId.toString(),
      txHash,
    });

    const options = {
      method: "GET",
      headers: { "x-api-key": this.apiKey },
    };

    let waitTime = 20000; // Start with 20 seconds
    let attempts = 0;

    while (attempts < maxAttempts) {
      console.log(
        `Waiting for ${waitTime / 1000} seconds before next poll (Attempt ${
          attempts + 1
        }/${maxAttempts})...`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));

      try {
        const response = await fetch(
          `https://api.decentscan.xyz/getStatus?${queryParams}`,
          options
        );

        if (!response.ok) {
          throw new Error(`Status API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        console.log("Transaction status:", data.status);

        if (data.status === "Executed") {
          return {
            status: "executed",
            data,
          };
        } else if (data.status === "Failed") {
          return {
            status: "failed",
            data,
          };
        }
      } catch (error) {
        console.error("Error fetching transaction status:", error);
      }

      // Gradually reduce wait time for quicker updates
      waitTime = Math.max(1000, waitTime / 2);
      attempts++;
    }

    return {
      status: "timeout",
      message: "Maximum number of polling attempts reached",
    };
  }
}