import { useEffect, useState } from "react";

// Default values
const defaults = {
  APP_URL: "http://localhost:3000",
  ENVIRONMENT: "development",
  LENS_MAINNET_RPC_URL: "https://rpc.lens.xyz",
  LENS_TESTNET_RPC_URL: "https://rpc.testnet.lens.xyz",
  BASE_CHAIN_RPC_URL: "https://mainnet.base.org",
};

// Helper to get environment variable from multiple sources
export const getEnvValue = (key: string, defaultVal: string = ""): string => {
  // Priority order:
  // 1. Window Runtime-Injected Values (Netlify/Vercel edge functions)
  // 2. Next.js Injected Values
  // 3. Default Fallback Values

  if (typeof window !== "undefined") {
    // Check window.__ENV (Netlify runtime injection)
    if (
      typeof (window as any).__ENV === "object" &&
      (window as any).__ENV?.[`NEXT_PUBLIC_${key}`]
    ) {
      return (window as any).__ENV[`NEXT_PUBLIC_${key}`];
    }

    // Check Next.js env object (may be injected at build time)
    if (
      typeof (window as any).__NEXT_DATA__?.props?.pageProps?.env === "object"
    ) {
      const envData = (window as any).__NEXT_DATA__.props.pageProps.env;
      if (envData?.[`NEXT_PUBLIC_${key}`]) {
        return envData[`NEXT_PUBLIC_${key}`];
      }
    }
  }

  // Try direct process.env access (works in build and SSR)
  if (typeof process !== "undefined" && process.env) {
    if (process.env[`NEXT_PUBLIC_${key}`]) {
      return process.env[`NEXT_PUBLIC_${key}`] || defaultVal;
    }
  }

  // Use default value as a last resort
  return defaultVal;
};

/**
 * Hook to access environment variables safely and consistently
 * Works across Vercel, Netlify, and local development
 */
export function useEnvironment() {
  const [env, setEnv] = useState({
    appUrl: defaults.APP_URL,
    environment: defaults.ENVIRONMENT,
    lensMainnetRpcUrl: defaults.LENS_MAINNET_RPC_URL,
    lensTestnetRpcUrl: defaults.LENS_TESTNET_RPC_URL,
    baseChainRpcUrl: defaults.BASE_CHAIN_RPC_URL,
    isMainnet: false,
    isTestnet: true,
    isDevelopment: true,
    isProduction: false,
  });

  useEffect(() => {
    // Only run in the browser
    if (typeof window === "undefined") return;

    const appUrl = getEnvValue("APP_URL", defaults.APP_URL);
    const environment = getEnvValue("ENVIRONMENT", defaults.ENVIRONMENT);
    const lensMainnetRpcUrl = getEnvValue(
      "LENS_MAINNET_RPC_URL",
      defaults.LENS_MAINNET_RPC_URL
    );
    const lensTestnetRpcUrl = getEnvValue(
      "LENS_TESTNET_RPC_URL",
      defaults.LENS_TESTNET_RPC_URL
    );
    const baseChainRpcUrl = getEnvValue(
      "BASE_CHAIN_RPC_URL",
      defaults.BASE_CHAIN_RPC_URL
    );

    // Determine environment type flags
    const isMainnet = environment === "mainnet" || environment === "production";
    const isTestnet = environment === "testnet";
    const isDevelopment = environment === "development";
    const isProduction =
      environment === "production" || environment === "mainnet";

    console.log(`[Environment Hook] Using environment: ${environment}`);
    console.log(`[Environment Hook] App URL: ${appUrl}`);

    setEnv({
      appUrl,
      environment,
      lensMainnetRpcUrl,
      lensTestnetRpcUrl,
      baseChainRpcUrl,
      isMainnet,
      isTestnet,
      isDevelopment,
      isProduction,
    });
  }, []);

  return env;
}

export default useEnvironment;
