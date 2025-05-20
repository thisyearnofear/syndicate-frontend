import { base } from "viem/chains";
import { chains } from "@lens-chain/sdk/viem";

// Lens Chain configurations from SDK
export const lensMainnet = chains.mainnet;
export const lensTestnet = chains.testnet;

// Default chain based on environment, but this will be overridden by wallet connection
const ENV = process.env.NEXT_PUBLIC_ENVIRONMENT || "mainnet";
const defaultIsTestnet = ENV === "development" || ENV === "testnet";
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

// Lens Chain details with RPC URLs and block explorers
export const LENS_CHAIN_DETAILS: Record<
  number,
  {
    name: string;
    shortName: string;
    symbol: string;
    rpcUrl: string;
    explorerUrl: string;
  }
> = {
  [CHAIN_IDS.LENS_MAINNET]: {
    name: "Lens",
    shortName: "lens",
    symbol: "GHO",
    rpcUrl:
      "https://lens-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH",
    explorerUrl: "https://lensscan.io",
  },
  [CHAIN_IDS.LENS_TESTNET]: {
    name: "Lens Testnet",
    shortName: "lens-testnet",
    symbol: "GHO",
    rpcUrl:
      "https://lens-testnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH",
    explorerUrl: "https://testnet.lensscan.io",
  },
};
