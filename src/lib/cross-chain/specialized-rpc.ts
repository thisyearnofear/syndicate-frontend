"use client";

import { createPublicClient, http } from "viem";
import { lens } from "viem/chains";
import { ChainId, getRpcUrl } from "./config";

// Constants
const LENS_PUBLIC_RPC = "https://rpc.lens.xyz";
const LENS_CHAIN_ID = 232;

/**
 * Creates a specialized public client for specific functionality 
 * that doesn't work well with certain RPC providers
 * 
 * @param functionType The type of functionality needing a specialized RPC
 * @param chainId The chain ID
 * @returns A viem public client configured for the specialized use case
 */
export function createSpecializedClient(
  functionType: "syndicate" | "default" = "default",
  chainId: number = LENS_CHAIN_ID
) {
  // For syndicate creation on Lens, use the public RPC
  if (functionType === "syndicate" && chainId === LENS_CHAIN_ID) {
    return createPublicClient({
      chain: lens,
      transport: http(LENS_PUBLIC_RPC),
    });
  }
  
  // For everything else, use the configured RPC from config
  return createPublicClient({
    chain: lens,
    transport: http(getRpcUrl(chainId as ChainId)),
  });
}
