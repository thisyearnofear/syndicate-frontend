import { useCallback, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { lensAuthService, AuthorizeResponse } from './auth-service';
import { getBuilderClient, getLensClient } from './client';
import { toast } from 'sonner';

interface UseLensAuthResult {
  isLoading: boolean;
  isAuthenticated: boolean;
  authenticate: () => Promise<boolean>;
  logout: () => Promise<void>;
  error: Error | null;
  authorizeResponse: AuthorizeResponse | null;
}

/**
 * Hook for handling Lens Protocol authentication
 * Connects the authentication service with wagmi hooks
 */
export function useLensAuth(): UseLensAuthResult {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authorizeResponse, setAuthorizeResponse] = useState<AuthorizeResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Check if user is already authenticated
  const checkAuthentication = useCallback(async () => {
    try {
      const client = await getLensClient();
      // Safely check authentication status - using alternative approach
      // that doesn't rely on client.authentication which may not exist
      const authenticated = client !== null && 
        // Check if this is a session client (authenticated)
        client.hasOwnProperty('session') &&
        // @ts-ignore - We need to bypass TypeScript here
        client.session !== undefined;
      setIsAuthenticated(authenticated);
      return authenticated;
    } catch (err) {
      console.error('Failed to check Lens authentication:', err);
      return false;
    }
  }, []);

  // Authenticate with Lens Protocol
  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First, check if already authenticated
      const alreadyAuthenticated = await checkAuthentication();
      if (alreadyAuthenticated) {
        return true;
      }
      
      // Authorize through our backend
      const authResponse = await lensAuthService.authorize(address, address);
      setAuthorizeResponse(authResponse);
      
      if (!authResponse.allowed) {
        throw new Error(authResponse.reason || 'Authorization denied');
      }
      
      // If authorized, proceed with Lens authentication
      const signMessage = async (message: string) => {
        return signMessageAsync({ message });
      };
      
      // Use the builder client for authentication
      const client = await getBuilderClient(address, signMessage);
      
      if (!client) {
        throw new Error('Failed to create Lens client');
      }
      
      setIsAuthenticated(true);
      toast.success('Successfully authenticated with Lens Protocol');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(new Error(errorMessage));
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [address, signMessageAsync, checkAuthentication]);

  // Logout from Lens Protocol
  const logout = useCallback(async () => {
    try {
      const client = await getLensClient();
      // Use a more type-safe approach to logout
      if (client && typeof client === 'object' && 'logout' in client) {
        // @ts-ignore - We need to bypass TypeScript here
        await client.logout();
        setIsAuthenticated(false);
        setAuthorizeResponse(null);
        toast.success('Logged out from Lens Protocol');
      } else {
        console.error('Client does not support logout method');
        toast.error('Failed to logout: Client does not support logout');
      }
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error('Failed to logout');
    }
  }, []);

  return {
    isLoading,
    isAuthenticated,
    authenticate,
    logout,
    error,
    authorizeResponse
  };
}