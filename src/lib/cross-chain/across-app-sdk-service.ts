"use client";

import { createAcrossClient } from "@across-protocol/app-sdk";
import { base, mainnet } from "viem/chains";
import {
  ChainId,
  ACROSS_INTEGRATOR_ID,
  GHO_ADDRESS_LENS,
  USDC_ADDRESS_BASE
} from "./config";

// Custom chain definition for Lens Chain
const lensChain = {
  id: 232,
  name: "Lens Chain",
  network: "lens",
  nativeCurrency: {
    name: "GHO",
    symbol: "GHO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.lens.xyz"],
    },
    public: {
      http: ["https://rpc.lens.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Lens Explorer",
      url: "https://explorer.lens.xyz",
    },
  },
};

/**
 * Create and configure the Across client
 */
export const createAcrossAppClient = (integratorId = ACROSS_INTEGRATOR_ID) => {
  // Create the Across client with supported chains
  const client = createAcrossClient({
    integratorId: (integratorId || "syndicate-lens") as `0x${string}`, // Use your integrator ID or a default
    chains: [lensChain, base, mainnet], // Add all chains you want to support
  });

  return client;
};

/**
 * Get a singleton instance of the Across client
 */
let acrossClientInstance: ReturnType<typeof createAcrossClient> | null = null;

export const getAcrossClient = (integratorId = ACROSS_INTEGRATOR_ID) => {
  if (!acrossClientInstance) {
    acrossClientInstance = createAcrossAppClient(integratorId);
  }
  return acrossClientInstance;
};

/**
 * Get supported chains from the Across client
 */
export const getSupportedChains = async (chainId?: number) => {
  const client = getAcrossClient();
  try {
    const chains = await client.getSupportedChains({
      chainId: chainId,
    });
    return chains;
  } catch (error) {
    console.error("Error getting supported chains:", error);
    return [];
  }
};

/**
 * Get a quote for bridging tokens
 */
export const getAcrossQuote = async (params: {
  originChainId: ChainId;
  destinationChainId: ChainId;
  inputToken: string;
  outputToken: string;
  inputAmount: bigint;
  recipient?: string;
}) => {
  const client = getAcrossClient();
  try {
    const quote = await client.getQuote({
      route: {
        originChainId: params.originChainId,
        destinationChainId: params.destinationChainId,
        inputToken: params.inputToken as `0x${string}`,
        outputToken: params.outputToken as `0x${string}`,
      },
      inputAmount: params.inputAmount,
      recipient: params.recipient as `0x${string}` | undefined,
    });
    return quote;
  } catch (error) {
    console.error("Error getting quote:", error);
    throw error;
  }
};

/**
 * Execute a quote to bridge tokens
 */
export const executeAcrossQuote = async (params: {
  walletClient: any;
  deposit: any;
  onProgress?: (progress: any) => void;
}) => {
  const client = getAcrossClient();
  try {
    const result = await client.executeQuote({
      walletClient: params.walletClient,
      deposit: params.deposit,
      onProgress: params.onProgress,
    });
    return result;
  } catch (error) {
    console.error("Error executing quote:", error);
    throw error;
  }
};

/**
 * Bridge tokens from one chain to another
 */
export const bridgeTokens = async (params: {
  walletClient: any;
  originChainId: ChainId;
  destinationChainId: ChainId;
  inputToken: string;
  outputToken: string;
  inputAmount: bigint;
  recipient?: string;
  onProgress?: (progress: any) => void;
}) => {
  try {
    // Get a quote first
    const quote = await getAcrossQuote({
      originChainId: params.originChainId,
      destinationChainId: params.destinationChainId,
      inputToken: params.inputToken,
      outputToken: params.outputToken,
      inputAmount: params.inputAmount,
      recipient: params.recipient as `0x${string}` | undefined,
    });

    // Execute the quote
    return await executeAcrossQuote({
      walletClient: params.walletClient,
      deposit: quote.deposit,
      onProgress: params.onProgress,
    });
  } catch (error) {
    console.error("Error bridging tokens:", error);
    throw error;
  }
};

/**
 * Check if a token is supported on a chain
 */
export const isTokenSupported = async (chainId: number, tokenAddress: string) => {
  try {
    const chains = await getSupportedChains(chainId);
    if (!chains || chains.length === 0) return false;

    const chain = Array.isArray(chains) ? chains[0] : chains;

    // Check if the token is in inputTokens
    const inputTokens = chain.inputTokens || [];
    const isInputToken = inputTokens.some((token: any) =>
      token.address.toLowerCase() === tokenAddress.toLowerCase()
    );

    // Check if the token is in outputTokens
    const outputTokens = chain.outputTokens || [];
    const isOutputToken = outputTokens.some((token: any) =>
      token.address.toLowerCase() === tokenAddress.toLowerCase()
    );

    return isInputToken || isOutputToken;
  } catch (error) {
    console.error("Error checking if token is supported:", error);
    return false;
  }
};

/**
 * Get token details from a chain
 */
export const getTokenDetails = async (chainId: number, tokenAddress: string) => {
  try {
    const chains = await getSupportedChains(chainId);
    if (!chains || chains.length === 0) return null;

    const chain = Array.isArray(chains) ? chains[0] : chains;

    // Check inputTokens
    const inputTokens = chain.inputTokens || [];
    const inputToken = inputTokens.find((token: any) =>
      token.address.toLowerCase() === tokenAddress.toLowerCase()
    );

    if (inputToken) return inputToken;

    // Check outputTokens
    const outputTokens = chain.outputTokens || [];
    const outputToken = outputTokens.find((token: any) =>
      token.address.toLowerCase() === tokenAddress.toLowerCase()
    );

    return outputToken || null;
  } catch (error) {
    console.error("Error getting token details:", error);
    return null;
  }
};
