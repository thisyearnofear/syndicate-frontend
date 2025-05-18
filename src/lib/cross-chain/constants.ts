import { ChainId } from "@decent.xyz/box-common";

// Chain IDs
export const LENS_CHAIN_ID = ChainId.POLYGON_MUMBAI; // Using Mumbai for testing
export const BASE_CHAIN_ID = ChainId.BASE;

// API Keys
export const DECENT_API_KEY = process.env.NEXT_PUBLIC_DECENT_API_KEY || "";

// USDC Token Addresses
export const USDC_ADDRESS_LENS = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"; // Polygon Mumbai USDC
export const USDC_ADDRESS_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC

// Contract Addresses
export const MEGAPOT_CONTRACT_ADDRESS = "0xa9A2d6b0743f2e284e2cFaEf54b8E61114BdcC8B"; // Base
export const SYNDICATE_REGISTRY_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder for our Registry contract
export const SYNDICATE_TREASURY_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder for our Treasury contract

// Default values
export const DEFAULT_REFERRER_ADDRESS = "0x0000000000000000000000000000000000000000";
export const DEFAULT_CAUSE_PERCENTAGE = 20; // 20% of winnings to cause by default

// Cross-chain Transaction Settings
export const DEFAULT_SLIPPAGE = 1; // 1% slippage
export const MAX_POLLING_ATTEMPTS = 20;
export const USDC_DECIMALS = 6;