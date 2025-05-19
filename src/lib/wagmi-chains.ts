import { base } from "viem/chains";
import { chains } from "@lens-chain/sdk/viem";

// Lens Chain configurations from SDK
export const lensMainnet = chains.mainnet;
export const lensTestnet = chains.testnet;

// Default chain based on environment, but this will be overridden by wallet connection
const defaultIsTestnet =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "development" ||
  process.env.NEXT_PUBLIC_ENVIRONMENT === "testnet";
export const defaultLensChain = defaultIsTestnet ? lensTestnet : lensMainnet;

// Re-export Base chain for convenience
export { base };

// Make all chains available for flexible wallet connections
export const supportedChains = [lensMainnet, lensTestnet, base];

// Chain IDs as constants
export const CHAIN_IDS = {
  LENS_MAINNET: 232,
  LENS_TESTNET: 37111,
  BASE: 8453,
};

// Function to get Lens chain by ID
export const getLensChainById = (chainId: number) => {
  if (chainId === CHAIN_IDS.LENS_MAINNET) return lensMainnet;
  if (chainId === CHAIN_IDS.LENS_TESTNET) return lensTestnet;
  return defaultLensChain; // Fall back to default if not recognized
};

// Function to check if a chain ID is a Lens chain
export const isLensChain = (chainId: number) => {
  return (
    chainId === CHAIN_IDS.LENS_MAINNET || chainId === CHAIN_IDS.LENS_TESTNET
  );
};

// Extra chain details not provided by SDK
export const LENS_CHAIN_DETAILS = {
  [CHAIN_IDS.LENS_MAINNET]: {
    name: "Lens Chain Mainnet",
    rpcUrl: "https://rpc.lens.xyz",
    currencySymbol: "GHO",
    explorerUrl: "https://explorer.lens.xyz",
  },
  [CHAIN_IDS.LENS_TESTNET]: {
    name: "Lens Chain Testnet",
    rpcUrl: "https://rpc.testnet.lens.xyz",
    currencySymbol: "GRASS",
    explorerUrl: "https://explorer.testnet.lens.xyz",
  },
};
