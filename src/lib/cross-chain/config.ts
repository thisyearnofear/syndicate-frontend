"use client";

import { baseGoerli, goerli, baseSepolia, sepolia } from "viem/chains";

// Define chain IDs that work with Decent
export enum ChainId {
  ETHEREUM = 1,
  OPTIMISM = 10,
  BSC = 56,
  POLYGON = 137,
  POLYGON_MUMBAI = 80001,
  ARBITRUM = 42161,
  AVALANCHE = 43114,
  GOERLI = 5,
  BASE = 8453,
  BASE_GOERLI = 84531,
  BASE_SEPOLIA = 84532,
  LENS = 13337,  // For future use when Lens has its own chain
  ZORA = 7777777,
  SCROLL = 534352,
  REDSTONE = 2246,
}

// Token types
export enum TokenType {
  USDC = "USDC",
  GHO = "GHO"
}

// Environment
const isProduction = process.env.NODE_ENV === "production";

// API keys - Using public key for now
export const DECENT_API_KEY = process.env.NEXT_PUBLIC_DECENT_API_KEY || "";

// Token addresses
export const GHO_ADDRESS_LENS = process.env.NEXT_PUBLIC_GHO_ADDRESS_LENS || "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f"; // GHO on Lens Chain
export const USDC_ADDRESS_BASE = process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base

// Determine which networks to use based on environment
export const SOURCE_CHAIN_ID = isProduction ? ChainId.LENS : ChainId.POLYGON_MUMBAI;
export const DESTINATION_CHAIN_ID = isProduction ? ChainId.BASE : ChainId.BASE_SEPOLIA;

// Chain configurations
export const CHAINS = {
  [ChainId.POLYGON_MUMBAI]: {
    ...goerli, // Using goerli as a temporary substitute for Mumbai
    name: "Polygon Mumbai",
    rpcUrl: process.env.NEXT_PUBLIC_LENS_CHAIN_RPC_URL || "https://rpc-mumbai.maticvigil.com",
    usdcAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS_LENS || "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Test USDC
    ghoAddress: process.env.NEXT_PUBLIC_GHO_ADDRESS_LENS || "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f", // GHO token
  },
  [ChainId.LENS]: {
    ...goerli, // Using goerli as a base for Lens Chain
    id: 13337,
    name: "Lens Mainnet",
    rpcUrl: process.env.NEXT_PUBLIC_LENS_CHAIN_RPC_URL || "https://rpc.lens.xyz",
    usdcAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS_LENS || "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC on Lens
    ghoAddress: process.env.NEXT_PUBLIC_GHO_ADDRESS_LENS || "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f", // GHO token
  },
  [ChainId.BASE]: {
    ...baseGoerli,
    name: "Base",
    rpcUrl: process.env.NEXT_PUBLIC_BASE_CHAIN_RPC_URL || "https://mainnet.base.org",
    usdcAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  [ChainId.BASE_SEPOLIA]: {
    ...baseSepolia,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Test USDC on Base Sepolia
  },
};

// Contract addresses
export const MEGAPOT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_MEGAPOT_CONTRACT_ADDRESS ||
  "0xa9A2d6b0743f2e284e4c7C32D4f71b54bdA02913";

export const SYNDICATE_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_SYNDICATE_REGISTRY_ADDRESS ||
  "0x1342Ded441A8AD566a9A9a1204aDE83fdaaA4b0B"; // Base chain registry/treasury

export const SYNDICATE_TREASURY_ADDRESS =
  process.env.NEXT_PUBLIC_SYNDICATE_TREASURY_ADDRESS ||
  "0xA27B07399DA4eEC1eE0FbdB4Dd4ADc64Ba1E617F"; // Lens chain treasury

// Default values
export const DEFAULT_REFERRER_ADDRESS = "0x0000000000000000000000000000000000000000";
export const DEFAULT_CAUSE_PERCENTAGE = 20; // 20% of winnings to cause by default
export const DEFAULT_SLIPPAGE = 1; // 1% slippage
export const USDC_DECIMALS = 6;
export const GHO_DECIMALS = 18;

// Get token address by chain ID and token type
export function getTokenAddress(chainId: ChainId, tokenType: TokenType = TokenType.USDC): string {
  if (chainId === SOURCE_CHAIN_ID && tokenType === TokenType.GHO) {
    return GHO_ADDRESS_LENS;
  } else if (chainId === DESTINATION_CHAIN_ID) {
    return USDC_ADDRESS_BASE;
  }
  return CHAINS[chainId]?.usdcAddress || "0x0000000000000000000000000000000000000000";
}

// Get token decimals by token type
export function getTokenDecimals(tokenType: TokenType = TokenType.USDC): number {
  return tokenType === TokenType.GHO ? GHO_DECIMALS : USDC_DECIMALS;
}

// Get RPC URL by chain ID
export function getRpcUrl(chainId: ChainId): string {
  return CHAINS[chainId]?.rpcUrl || "";
}

// Get chain name by ID
export function getChainName(chainId: ChainId): string {
  return CHAINS[chainId]?.name || "Unknown Chain";
}