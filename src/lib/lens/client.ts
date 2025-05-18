import { mainnet, PublicClient, staging, testnet } from "@lens-protocol/client";
import { clientCookieStorage, cookieStorage } from "./storage";

const isServer = typeof window === "undefined";

// Safe access to environment variables
const getEnvVar = (name: string, fallback: string = ""): string => {
  return typeof process !== "undefined" && process.env 
    ? (process.env[name] || fallback) 
    : fallback;
};

const APP_URL = getEnvVar("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
const ENV = getEnvVar("NEXT_PUBLIC_ENVIRONMENT", "development");

console.log(`Lens client initializing with environment: ${ENV}`);
console.log(`Using origin: ${APP_URL}`);

const publicClient = PublicClient.create({
  environment: ENV === "development" ? testnet : mainnet,
  origin: APP_URL,
  storage: isServer ? cookieStorage : clientCookieStorage,
});

export const getPublicClient = () => {
  console.log("Getting public Lens client");
  return publicClient;
};

export const getBuilderClient = async (address: string, signMessage: (message: string) => Promise<string>) => {
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
