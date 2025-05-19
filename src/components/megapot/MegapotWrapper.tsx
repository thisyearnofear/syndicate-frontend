"use client";

import { MegapotProvider } from "@coordinationlabs/megapot-ui-kit";
import { useConnect, useAccount } from "wagmi";
import React, { useEffect } from "react";

interface MegapotWrapperProps {
  children: React.ReactNode;
}

/**
 * MegapotWrapper component that provides the MegapotProvider context
 * to all child components while using the existing wallet connection
 */
export function MegapotWrapper({ children }: MegapotWrapperProps) {
  const { connectors } = useConnect();
  const { isConnected } = useAccount();

  // Use the current wallet connection instead of creating a new one
  return (
    <MegapotProvider
      onConnectWallet={() => {
        // Only connect if not already connected
        if (!isConnected && connectors.length > 0) {
          connectors[0].connect();
        }
      }}
    >
      {children}
    </MegapotProvider>
  );
}
