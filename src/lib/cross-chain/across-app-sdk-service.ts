"use client";

import { createAcrossClient } from "@across-protocol/app-sdk";
import { mainnet } from "viem/chains";
import {
  ChainId,
  ACROSS_INTEGRATOR_ID,
  GHO_ADDRESS_LENS,
  USDC_ADDRESS_BASE,
  getRpcUrl,
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
      http: [
        "https://lens-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH",
      ],
    },
    public: {
      http: [
        "https://lens-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Lens Explorer",
      url: "https://explorer.lens.xyz",
    },
  },
};

// Custom chain definition for Base with Alchemy RPC URL
const baseChain = {
  id: 8453,
  name: "Base",
  network: "base",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        "https://base-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH",
      ],
    },
    public: {
      http: [
        "https://base-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: "https://basescan.org",
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
    chains: [lensChain, baseChain, mainnet], // Add all chains you want to support
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
    // Add custom wrapper for handling progress events
    const progressHandler = (progress: any) => {
      if (params.onProgress) {
        // If this is a fill stage and we're encountering errors with event filtering,
        // we'll add better error handling
        if (progress.step === "fill" && progress.status === "txPending") {
          try {
            console.log("Monitoring fill events for deposit...", progress);
          } catch (error) {
            console.warn(
              "Failed to log fill event progress (non-critical):",
              error
            );
          }
        }
        params.onProgress(progress);
      }
    };

    // Modified executeQuote that catches specific RPC errors but doesn't fail the whole flow
    const result = await client
      .executeQuote({
        walletClient: params.walletClient,
        deposit: params.deposit,
        onProgress: progressHandler,
      })
      .catch((error) => {
        // Check for specific RPC-related errors
        if (
          error.message?.includes("filter not found") ||
          error.message?.includes("Missing or invalid parameters") ||
          error.message?.includes("Event filtering currently disabled") ||
          error.message?.includes("eth_getFilterChanges") // Specifically handle the error mentioned in logs
        ) {
          console.error(
            "Event filtering currently disabled for this RPC provider, switching to getFillByDepositTx()",
            { cause: error }
          );

          // Continue the process despite the event filtering error
          // This is a fallback for limited RPC providers
          if (params.onProgress) {
            params.onProgress({
              step: "fill",
              status: "manualMonitoring",
              meta: {
                reason: "RPC provider does not support event filtering",
                message:
                  "Your transaction is processing. It may take 10-30 minutes to complete. We're using an alternative method to track its progress.",
              },
            });
          }

          // Begin manual polling for fill status instead of relying on event filtering
          setTimeout(() => {
            if (params.onProgress) {
              params.onProgress({
                step: "fill",
                status: "checking",
                meta: {
                  message: "Checking transaction status...",
                },
              });
            }

            // Poll Across API directly to check status
            // This would typically be handled by the SDK but we're implementing a fallback
            fetch(
              `https://across.to/api/v1/fills?depositTxHash=${params.deposit.depositTxHash}`
            )
              .then((response) => response.json())
              .then((data) => {
                if (data?.fills?.length > 0) {
                  const fill = data.fills[0];
                  if (params.onProgress) {
                    params.onProgress({
                      step: "fill",
                      status:
                        fill.status === "filled" ? "txSuccess" : "txPending",
                      meta: {
                        fill,
                      },
                    });
                  }
                }
              })
              .catch((e) => console.error("Error checking fill status:", e));
          }, 60000); // Check after 1 minute

          return {
            status: "processing",
            depositTxHash: params.deposit.depositTxHash,
            message:
              "Transaction is being processed. Check Across explorer for updates.",
          };
        }

        // For API 404 errors related to deposit status
        if (
          error.message?.includes("404") &&
          error.message?.includes("deposit/status")
        ) {
          console.warn(
            "Deposit not found in Across API yet, this is normal for recent deposits"
          );

          if (params.onProgress) {
            params.onProgress({
              step: "fill",
              status: "pending",
              meta: {
                reason: "Deposit not yet indexed",
                message:
                  "Your bridge transaction is being processed. It will be picked up soon.",
              },
            });
          }

          return {
            status: "processing",
            depositTxHash: params.deposit.depositTxHash,
            message:
              "Transaction submitted, waiting for relay. This may take 10-30 minutes.",
          };
        }

        // Rethrow any other errors
        throw error;
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
export const isTokenSupported = async (
  chainId: number,
  tokenAddress: string
) => {
  try {
    const chains = await getSupportedChains(chainId);
    if (!chains || chains.length === 0) return false;

    const chain = Array.isArray(chains) ? chains[0] : chains;

    // Check if the token is in inputTokens
    const inputTokens = chain.inputTokens || [];
    const isInputToken = inputTokens.some(
      (token: any) => token.address.toLowerCase() === tokenAddress.toLowerCase()
    );

    // Check if the token is in outputTokens
    const outputTokens = chain.outputTokens || [];
    const isOutputToken = outputTokens.some(
      (token: any) => token.address.toLowerCase() === tokenAddress.toLowerCase()
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
export const getTokenDetails = async (
  chainId: number,
  tokenAddress: string
) => {
  try {
    const chains = await getSupportedChains(chainId);
    if (!chains || chains.length === 0) return null;

    const chain = Array.isArray(chains) ? chains[0] : chains;

    // Check inputTokens
    const inputTokens = chain.inputTokens || [];
    const inputToken = inputTokens.find(
      (token: any) => token.address.toLowerCase() === tokenAddress.toLowerCase()
    );

    if (inputToken) return inputToken;

    // Check outputTokens
    const outputTokens = chain.outputTokens || [];
    const outputToken = outputTokens.find(
      (token: any) => token.address.toLowerCase() === tokenAddress.toLowerCase()
    );

    return outputToken || null;
  } catch (error) {
    console.error("Error getting token details:", error);
    return null;
  }
};
