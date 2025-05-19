"use client";

import React from "react";
import { BoxHooksContextProvider } from "@decent.xyz/box-hooks";
import { ClientRendered } from "@decent.xyz/box-ui";
import { DECENT_API_KEY, ChainId, SOURCE_CHAIN_ID, DESTINATION_CHAIN_ID } from "@/lib/cross-chain/config";
import { useAccount } from "wagmi";

interface DecentProviderProps {
  children: React.ReactNode;
}

export function DecentProvider({ children }: DecentProviderProps) {
  const { chainId } = useAccount();
  
  // Log current chain configuration for debugging
  React.useEffect(() => {
    console.log("Current connected chain ID:", chainId);
    console.log("Source Chain ID (Lens):", SOURCE_CHAIN_ID);
    console.log("Destination Chain ID (Base):", DESTINATION_CHAIN_ID);
    console.log("Chain configuration valid:", chainId === SOURCE_CHAIN_ID || chainId === DESTINATION_CHAIN_ID);
  }, [chainId]);

  return (
    <ClientRendered>
      <BoxHooksContextProvider
        apiKey={DECENT_API_KEY || process.env.NEXT_PUBLIC_DECENT_API_KEY || ""}
      >
        {children}
      </BoxHooksContextProvider>
    </ClientRendered>
  );
}