import { toast } from 'sonner';
import { getAddress } from 'viem';

/**
 * Service for handling Lens Protocol authentication through our backend
 */
export interface AuthorizeResponse {
  allowed: boolean;
  sponsored: boolean;
  signingKey?: string;
  reason?: string;
}

export class LensAuthService {
  /**
   * Authorizes a wallet to interact with Lens Protocol
   * @param account The account address to authorize
   * @param signedBy The wallet address that signed the request
   * @returns Authorization response with allowed status, sponsorship status, and signing key
   */
  async authorize(account: string, signedBy: string): Promise<AuthorizeResponse> {
    try {
      // Ensure addresses are checksummed
      const checksummedAccount = getAddress(account);
      const checksummedSignedBy = getAddress(signedBy);

      console.log('Attempting to authorize via secure API route');
      
      // Create an abort controller with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        // Using server-side API route for security
        const response = await fetch('/api/lens/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            account: checksummedAccount,
            signedBy: checksummedSignedBy
          }),
          signal: controller.signal,
        });
        
        // Clear the timeout since request completed
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error ${response.status}`);
        }

        const data = await response.json();
        console.log('Authorization successful:', data);
        return data as AuthorizeResponse;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      // More detailed error logging
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('Request timed out after 10 seconds');
        toast.error('Request timed out. Please try again.');
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error during authentication:', error);
        toast.error('Network error during authentication. Please try again.');
      } else {
        console.error('Lens authorization failed:', error);
        toast.error(`Failed to authorize with Lens Protocol: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      return {
        allowed: false,
        sponsored: false,
        reason: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Singleton instance
export const lensAuthService = new LensAuthService();