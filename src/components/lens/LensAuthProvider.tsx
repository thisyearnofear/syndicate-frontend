import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { AuthorizeResponse, useLensAuth } from '@/lib/lens';
import { toast } from 'sonner';

interface LensAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authorizeResponse: AuthorizeResponse | null;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  error: Error | null;
}

const LensAuthContext = createContext<LensAuthContextType | undefined>(undefined);

interface LensAuthProviderProps {
  children: ReactNode;
  /**
   * If true, will attempt to authenticate automatically when wallet is connected
   */
  autoConnect?: boolean;
}

export function LensAuthProvider({ 
  children, 
  autoConnect = false 
}: LensAuthProviderProps) {
  const { isConnected } = useAccount();
  const { 
    isAuthenticated,
    isLoading,
    authenticate,
    logout,
    error,
    authorizeResponse
  } = useLensAuth();

  // Track if we've attempted auto-connection
  const [hasAttemptedAutoConnect, setHasAttemptedAutoConnect] = useState(false);

  // Auto-connect logic
  useEffect(() => {
    if (
      autoConnect && 
      isConnected && 
      !isAuthenticated && 
      !isLoading && 
      !hasAttemptedAutoConnect
    ) {
      setHasAttemptedAutoConnect(true);
      authenticate().catch((err) => {
        console.error('Auto-authentication failed:', err);
        // Only show toast on auto-connect failures if there's a specific error
        if (err instanceof Error && err.message !== 'Authentication failed') {
          toast.error(`Auto-connection failed: ${err.message}`);
        }
      });
    }
  }, [autoConnect, isConnected, isAuthenticated, isLoading, authenticate, hasAttemptedAutoConnect]);

  // Reset attempted flag when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setHasAttemptedAutoConnect(false);
    }
  }, [isConnected]);

  const contextValue: LensAuthContextType = {
    isAuthenticated,
    isLoading,
    authorizeResponse,
    login: authenticate,
    logout,
    error,
  };

  return (
    <LensAuthContext.Provider value={contextValue}>
      {children}
    </LensAuthContext.Provider>
  );
}

export function useLensAuthContext() {
  const context = useContext(LensAuthContext);
  if (context === undefined) {
    throw new Error('useLensAuthContext must be used within a LensAuthProvider');
  }
  return context;
}