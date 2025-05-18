"use client";

import React from "react";
import { BoxHooksContextProvider } from "@decent.xyz/box-hooks";
import { ClientRendered } from "@decent.xyz/box-ui";
import { DECENT_API_KEY } from "@/lib/cross-chain/config";

interface DecentProviderProps {
  children: React.ReactNode;
}

export function DecentProvider({ children }: DecentProviderProps) {
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