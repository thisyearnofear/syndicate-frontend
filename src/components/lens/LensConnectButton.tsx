"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/inputs/button';
import { useLensAuthContext } from './LensAuthProvider';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LensProfileDropdown } from './LensProfileDropdown';
import { toast } from 'sonner';

interface LensConnectButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function LensConnectButton({
  variant = 'default',
  size = 'sm',
  className
}: LensConnectButtonProps) {
  const { isConnected, address } = useAccount();
  const { isAuthenticated, isLoading, login } = useLensAuthContext();

  const handleLensConnect = async () => {
    if (isConnected && !isAuthenticated && !isLoading) {
      try {
        await login();
      } catch (error) {
        console.error('Error connecting to Lens:', error);
        toast.error('Failed to connect to Lens. Please try again.');
      }
    }
  };

  // Error state for lens connection
  const [hasError, setHasError] = useState(false);
  
  // Reset error state when connection state changes
  useEffect(() => {
    if (isAuthenticated) {
      setHasError(false);
    }
  }, [isAuthenticated]);
  
  return (
    <div className="flex items-center gap-2">
      {/* First show the wallet connection button */}
      <ConnectKitButton.Custom>
        {({ isConnected, show, truncatedAddress, ensName }) => (
          <Button
            onClick={show}
            size={size}
            variant="outline"
            className={cn("whitespace-nowrap", className)}
          >
            {isConnected ? `${ensName || truncatedAddress}` : "Connect Wallet"}
          </Button>
        )}
      </ConnectKitButton.Custom>

      {/* Then show the Lens authentication button if wallet is connected */}
      {isConnected && (
        isAuthenticated ? (
          <LensProfileDropdown>
            <Button
              size={size}
              variant={variant}
              className={cn(
                "relative group whitespace-nowrap",
                "bg-green-600 hover:bg-green-700",
                className
              )}
            >
              <div className="flex items-center gap-2">
                <div className="relative w-5 h-5">
                  <Image
                    src="/lens-logo.svg"
                    alt="Lens Protocol"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                </div>
                <span>Lens Connected</span>
              </div>
            </Button>
          </LensProfileDropdown>
        ) : (
          <Button
            onClick={handleLensConnect}
            size={size}
            variant={variant}
            disabled={isLoading}
            className={cn(
              "relative group whitespace-nowrap",
              className
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : hasError ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Retry Connection
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Connect Lens
              </>
            )}
          </Button>
        )
      )}
    </div>
  );
}