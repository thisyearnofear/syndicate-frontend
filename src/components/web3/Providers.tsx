"use client";

import { getPublicClient, updateActiveChain } from "@/lib/lens/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import React, { useEffect } from "react";
import { createConfig, http, WagmiProvider, useChainId } from "wagmi";
import { ThemeProvider } from "next-themes";
import { DecentProvider } from "./DecentProvider";
import {
  lensMainnet,
  lensTestnet,
  LENS_CHAIN_DETAILS,
  CHAIN_IDS,
  isLensChain,
  base,
} from "@/lib/wagmi-chains";
import { WalletProvider } from "@/contexts/WalletContext";
import { chainSwitchOrchestrator } from "@/services/ChainSwitchOrchestrator";

// Get RPC URLs from environment or defaults
const LENS_MAINNET_RPC_URL =
  "https://lens-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH";
const LENS_TESTNET_RPC_URL =
  "https://lens-testnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH";
const BASE_RPC_URL =
  "https://base-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH";

// Define supported chains for the app
const appChains = [lensMainnet, lensTestnet, base] as const;

// Include all chains in the configuration to support flexible wallet connections
const wagmiConfig = createConfig(
  getDefaultConfig({
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    chains: appChains, // Support all chains
    transports: {
      [CHAIN_IDS.LENS_MAINNET]: http(LENS_MAINNET_RPC_URL),
      [CHAIN_IDS.LENS_TESTNET]: http(LENS_TESTNET_RPC_URL),
      [base.id]: http(BASE_RPC_URL),
    },
    appName: "Syndicate",
    appDescription:
      "SocialFi-powered, programmable philanthropy. Pool your luck, pledge your impact, and win together on Lens.",
    appUrl: "https://syndicate-lens.vercel.app",
    appIcon: "https://syndicate-lens.vercel.app/icon.png",
  })
);

// Log the available configurations
console.log(
  `Providers: Supported chains: ${appChains
    .map((c) => `${c.name} (${c.id})`)
    .join(", ")}`
);
console.log(`Providers: Lens Mainnet RPC URL: ${LENS_MAINNET_RPC_URL}`);
console.log(`Providers: Lens Testnet RPC URL: ${LENS_TESTNET_RPC_URL}`);
console.log(`Providers: Base RPC URL: ${BASE_RPC_URL}`);

// Component to sync with the wallet's connected chain
function ChainSynchronizer() {
  const chainId = useChainId();

  useEffect(() => {
    console.log(`ChainSynchronizer: Wallet connected to chain ID: ${chainId}`);

    if (isLensChain(chainId)) {
      console.log(
        `ChainSynchronizer: Updating active chain to match wallet (ID: ${chainId})`
      );

      // Use the orchestrator to handle chain changes
      chainSwitchOrchestrator.handleChainChange(chainId);
    } else {
      console.log(
        `ChainSynchronizer: Connected to non-Lens chain ID: ${chainId}`
      );
    }
  }, [chainId]);

  return null; // This component doesn't render anything
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Configure QueryClient with better defaults for RPC interactions
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        retryDelay: 1000,
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  });

  const publicClient = getPublicClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider>
            <WalletProvider>
              <ChainSynchronizer />
              <DecentProvider>{children}</DecentProvider>
            </WalletProvider>
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
