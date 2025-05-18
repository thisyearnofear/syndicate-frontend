"use client";

import { getPublicClient } from "@/lib/lens/client";
import { chains } from "@lens-chain/sdk/viem";
import { LensProvider } from "@lens-protocol/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import React, { JSX } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { ThemeProvider } from "next-themes";
import { DecentProvider } from "./DecentProvider";
import { LensAuthProvider } from "@/components/lens";

// Private Alchemy RPC URL for Lens Chain
const ALCHEMY_LENS_RPC_URL =
  "https://lens-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH";

const wagmiConfig = createConfig(
  getDefaultConfig({
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    chains: [chains.mainnet],
    transports: {
      [chains.mainnet.id]: http(ALCHEMY_LENS_RPC_URL),
    },
    appName: "Syndicate",
    appDescription:
      "SocialFi-powered, programmable philanthropy. Pool your luck, pledge your impact, and win together on Lens.",
    appUrl: "https://syndicate-lens.vercel.app",
    appIcon: "https://syndicate-lens.vercel.app/icon.png",
  })
);

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
            <LensProvider client={publicClient}>
              <LensAuthProvider autoConnect={true}>
                <DecentProvider>
                  {children}
                </DecentProvider>
              </LensAuthProvider>
            </LensProvider>
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
