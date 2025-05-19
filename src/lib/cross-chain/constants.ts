import { ChainId } from "@decent.xyz/box-common";

// Chain IDs
export const LENS_CHAIN_ID = ChainId.LENS;
export const BASE_CHAIN_ID = ChainId.BASE;

// API Keys
export const DECENT_API_KEY = process.env.NEXT_PUBLIC_DECENT_API_KEY || "";

// USDC Token Addresses
export const USDC_ADDRESS_LENS = "0x88F08E304EC4f90D644Cec3Fb69b8aD414acf884"; // Lens USDC
export const USDC_ADDRESS_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC

// Contract Addresses
export const MEGAPOT_CONTRACT_ADDRESS = "0xbEDd4F2beBE9E3E636161E644759f3cbe3d51B95"; // Base
export const SYNDICATE_REGISTRY_ADDRESS = "0x399f080bB2868371D7a0024a28c92fc63C05536E"; // Lens
export const SYNDICATE_TREASURY_ADDRESS = "0x399f080bB2868371D7a0024a28c92fc63C05536E"; // Lens

// Default values
export const DEFAULT_REFERRER_ADDRESS = "0x55A5705453Ee82c742274154136Fce8149597058";
export const DEFAULT_CAUSE_PERCENTAGE = 20; // 20% of winnings to cause by default

// Cross-chain Transaction Settings
export const DEFAULT_SLIPPAGE = 1; // 1% slippage
export const MAX_POLLING_ATTEMPTS = 20;
export const USDC_DECIMALS = 6;