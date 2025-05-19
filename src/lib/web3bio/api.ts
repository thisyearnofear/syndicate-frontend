export interface Web3BioProfile {
  address: string;
  identity: string;
  platform: string;
  displayName: string | null;
  avatar: string | null;
  email: string | null;
  description: string | null;
  status: string | null;
  location: string | null;
  header: string | null;
  contenthash: string | null;
  links: Record<string, {
    link: string;
    handle: string;
    sources: string[];
  }>;
  social: {
    uid: string | null;
    follower: number | null;
    following: number | null;
  };
}

export interface Web3BioProfileMinimal {
  address: string;
  identity: string;
  platform: string;
  displayName: string | null;
  avatar: string | null;
  description: string | null;
}

const API_BASE_URL = 'https://api.web3.bio';

/**
 * Fetches a Lens profile from Web3.bio API
 * @param identity Ethereum address or Lens handle
 * @returns The profile data or null if not found
 */
export async function fetchLensProfileFromWeb3Bio(identity: string): Promise<Web3BioProfile | null> {
  try {
    // Clean the identity to ensure it works with the API
    const cleanIdentity = identity.trim();
    
    // Check if we have an API key in environment variables
    const apiKey = process.env.NEXT_PUBLIC_WEB3BIO_API_KEY || '';
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    // Add API key if available
    if (apiKey) {
      headers['X-API-KEY'] = `Bearer ${apiKey}`;
    }
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/profile/lens/${cleanIdentity}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`No Lens profile found for: ${cleanIdentity}`);
        return null;
      }
      throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as Web3BioProfile;
  } catch (error) {
    console.error('Error fetching Lens profile from Web3.bio:', error);
    return null;
  }
}

/**
 * Fetches a minimal Lens profile from Web3.bio API
 * @param identity Ethereum address or Lens handle
 * @returns The minimal profile data or null if not found
 */
export async function fetchMinimalLensProfileFromWeb3Bio(identity: string): Promise<Web3BioProfileMinimal | null> {
  try {
    // Clean the identity to ensure it works with the API
    const cleanIdentity = identity.trim();
    
    // Check if we have an API key in environment variables
    const apiKey = process.env.NEXT_PUBLIC_WEB3BIO_API_KEY || '';
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    // Add API key if available
    if (apiKey) {
      headers['X-API-KEY'] = `Bearer ${apiKey}`;
    }
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/ns/lens/${cleanIdentity}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`No Lens profile found for: ${cleanIdentity}`);
        return null;
      }
      throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as Web3BioProfileMinimal;
  } catch (error) {
    console.error('Error fetching minimal Lens profile from Web3.bio:', error);
    return null;
  }
}

/**
 * Fetches multiple Lens profiles by addresses from Web3.bio API
 * @param addresses Array of Ethereum addresses
 * @returns Array of profile data
 */
export async function fetchProfilesByAddresses(addresses: string[]): Promise<Web3BioProfileMinimal[]> {
  const profiles: Web3BioProfileMinimal[] = [];
  
  // Process in batches of 5 to avoid overwhelming the API
  const batchSize = 5;
  
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    const batchPromises = batch.map(address => fetchMinimalLensProfileFromWeb3Bio(address));
    
    try {
      const results = await Promise.allSettled(batchPromises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          profiles.push(result.value);
        }
      });
      
      // Add a small delay between batches
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error fetching batch of profiles:', error);
    }
  }
  
  return profiles;
}

/**
 * Generate a link to a profile page on Hey.xyz
 * @param handle Lens handle or address
 * @returns URL to the profile on Hey.xyz
 */
export function getHeyProfileUrl(handle: string): string {
  // If the handle includes .lens, use it directly
  if (handle.includes('.lens')) {
    return `https://hey.xyz/u/${handle}`;
  }
  
  // If it's an address, use it directly
  if (handle.startsWith('0x')) {
    return `https://hey.xyz/u/${handle}`;
  }
  
  // Otherwise, append .lens
  return `https://hey.xyz/u/${handle}`;
}