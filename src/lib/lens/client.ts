import { mainnet, PublicClient, staging, testnet } from "@lens-protocol/client";
import { clientCookieStorage, cookieStorage } from "./storage";
import { createPublicClient, createWalletClient, http } from "viem";
import {
  lensMainnet,
  lensTestnet,
  defaultLensChain,
  LENS_CHAIN_DETAILS,
  CHAIN_IDS,
  getLensChainById,
  isLensChain,
} from "../wagmi-chains";

const isServer = typeof window === "undefined";

// Safe access to environment variables
const getEnvVar = (name: string, fallback: string = ""): string => {
  return typeof process !== "undefined" && process.env
    ? process.env[name] || fallback
    : fallback;
};

const APP_URL = getEnvVar("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
const ENV = getEnvVar("NEXT_PUBLIC_ENVIRONMENT", "development");
const defaultIsTestnet = ENV === "development";

// Get the appropriate RPC URLs from environment variables or defaults
const MAINNET_RPC_URL = getEnvVar(
  "NEXT_PUBLIC_LENS_MAINNET_RPC_URL",
  LENS_CHAIN_DETAILS[CHAIN_IDS.LENS_MAINNET].rpcUrl
);

const TESTNET_RPC_URL = getEnvVar(
  "NEXT_PUBLIC_LENS_TESTNET_RPC_URL",
  LENS_CHAIN_DETAILS[CHAIN_IDS.LENS_TESTNET].rpcUrl
);

// Default active chain based on environment
let activeChain = defaultLensChain;
let activeRpcUrl = defaultIsTestnet ? TESTNET_RPC_URL : MAINNET_RPC_URL;

// Function to update the active chain based on wallet connection
export const updateActiveChain = (chainId: number) => {
  if (isLensChain(chainId)) {
    activeChain = getLensChainById(chainId);
    activeRpcUrl =
      chainId === CHAIN_IDS.LENS_MAINNET ? MAINNET_RPC_URL : TESTNET_RPC_URL;
    console.log(
      `Active chain updated to: ${activeChain.name} (ID: ${activeChain.id})`
    );
    console.log(`Using RPC URL: ${activeRpcUrl}`);
    return true;
  }
  return false;
};

console.log(`Lens client initializing with default environment: ${ENV}`);
console.log(`Using origin: ${APP_URL}`);
console.log(`Default chain: ${activeChain.name} (ID: ${activeChain.id})`);
console.log(`Default RPC URL: ${activeRpcUrl}`);
console.log(`Will adapt to wallet connection when available`);

// Legacy Lens Protocol client - environment-aware with runtime updates
const publicClient = PublicClient.create({
  environment: defaultIsTestnet ? testnet : mainnet,
  origin: APP_URL,
  storage: isServer ? cookieStorage : clientCookieStorage,
});

// Function to get the current viem public client based on active chain
export const getCurrentViemPublicClient = () => {
  return createPublicClient({
    chain: activeChain,
    transport: http(activeRpcUrl),
  });
};

// Viem client factories - will adapt to active chain
export const lensViemPublicClient = getCurrentViemPublicClient();

// Create wallet client factory that uses the active chain
export const createLensWalletClient = (account?: `0x${string}`) => {
  return createWalletClient({
    chain: activeChain,
    transport: http(activeRpcUrl),
    account,
  });
};

// Static clients for specific chains when needed
export const lensMainnetPublicClient = createPublicClient({
  chain: lensMainnet,
  transport: http(MAINNET_RPC_URL),
});

export const lensTestnetPublicClient = createPublicClient({
  chain: lensTestnet,
  transport: http(TESTNET_RPC_URL),
});

// Create environment-specific wallet clients
export const createLensMainnetWalletClient = (account?: `0x${string}`) => {
  return createWalletClient({
    chain: lensMainnet,
    transport: http(MAINNET_RPC_URL),
    account,
  });
};

export const createLensTestnetWalletClient = (account?: `0x${string}`) => {
  return createWalletClient({
    chain: lensTestnet,
    transport: http(TESTNET_RPC_URL),
    account,
  });
};

// Legacy Lens Protocol client exports
export const getPublicClient = () => {
  console.log("Getting public Lens client");
  return publicClient;
};

export const getBuilderClient = async (
  address: string,
  signMessage: (message: string) => Promise<string>
) => {
  if (!address) {
    console.error("Cannot get builder client: No address provided");
    return null;
  }

  try {
    console.log(`Attempting to login with Lens using address: ${address}`);

    const authenticated = await publicClient.login({
      builder: {
        address: address,
      },
      signMessage,
    });

    if (authenticated.isErr()) {
      console.error("Lens authentication error:", authenticated.error);
      throw authenticated.error;
    }

    console.log("Lens authentication successful");
    return authenticated.value;
  } catch (error) {
    console.error("Failed to get builder client:", error);
    throw error;
  }
};

export const getLensClient = async () => {
  try {
    console.log("Attempting to resume Lens session");
    const resumed = await publicClient.resumeSession();

    if (resumed.isErr()) {
      console.log("No active Lens session found, returning public client");
      return publicClient;
    }

    console.log("Lens session resumed successfully");
    return resumed.value;
  } catch (error) {
    console.error("Error in getLensClient:", error);
    console.log("Returning public client due to error");
    return publicClient;
  }
};
