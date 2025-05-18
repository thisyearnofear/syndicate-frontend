"use client";

import { MegapotProvider } from '@coordinationlabs/megapot-ui-kit';
import { useConnect } from 'wagmi';
import React from 'react';

interface MegapotWrapperProps {
  children: React.ReactNode;
}

/**
 * MegapotWrapper component that provides the MegapotProvider context
 * to all child components
 */
export function MegapotWrapper({ children }: MegapotWrapperProps) {
  const { connectors } = useConnect();

  return (
    <MegapotProvider
      onConnectWallet={() => {
        // Connect using the first available connector
        if (connectors.length > 0) {
          connectors[0].connect();
        }
      }}
    >
      {children}
    </MegapotProvider>
  );
}
