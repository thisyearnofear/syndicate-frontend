import { fetchProfileByHandle, fetchProfilesByAddress, SimpleLensProfile, getHeyProfileUrl as getLensApiHeyUrl } from './lens-api';

// Define types for compatibility with existing code
export type ProfileId = string;

export interface Profile {
  id: string;
  handle?: {
    fullHandle?: string;
  };
  ownedBy?: string[];
  metadata?: {
    displayName?: string;
    bio?: string;
    picture?: {
      __typename?: string;
      optimized?: {
        uri?: string;
      };
    };
    attributes?: {
      key: string;
      value: string;
    }[];
  };
}

/**
 * Fetches a Lens profile by its handle or address
 * @param handleOrAddress Lens handle (without @) or Ethereum address
 * @returns The profile data or null if not found
 */
export async function fetchLensProfile(handleOrAddress: string): Promise<Profile | null> {
  try {
    // First try direct Lens API
    let lensProfile: SimpleLensProfile | null = null;
    
    try {
      // Check if input is an address (0x...) or a handle
      if (handleOrAddress.startsWith('0x')) {
        // Fetch profile by Ethereum address
        const profiles = await fetchProfilesByAddress(handleOrAddress);
        lensProfile = profiles.length > 0 ? profiles[0] : null;
      } else {
        // Fetch profile by handle
        lensProfile = await fetchProfileByHandle(handleOrAddress);
      }
      
      if (lensProfile) {
        return convertFromSimpleLensProfile(lensProfile);
      }
    } catch (lensError) {
      console.log(`Error with Lens API, will try fallback: ${lensError}`);
    }
    
    // Fallback: Use mock data for known handles
    const knownHandles: Record<string, Profile> = {
      'stani.lens': createMockProfile('stani.lens', '0x3182d5B9Fe22Dea8A9cf2f06312e93Dbbb67c578', 'Stani', 'https://ik.imagekit.io/lens/media-snapshot/e3adfb7046a549480a92c63de2d431f1ced8e516ea285970267c4dc24f941856.png'),
      'vitalik.lens': createMockProfile('vitalik.lens', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'Vitalik', 'https://ik.imagekit.io/lens/media-snapshot/ff9c206b6b76a5c8530cb7b877f06943bcdb4a6b28d2378cac94be93ed223549.jpg'),
      'yoginth.lens': createMockProfile('yoginth.lens', '0xB59Aa5BB9270d44be3fA9b6D67520a2d28CF80AB', 'Yoginth', 'https://ik.imagekit.io/lens/media-snapshot/0e8c5f2e4c962a0b17a0184686bd4cbaddd1879165a9b45cff9f1766cc9e8e4a.jpg'),
      'papajams.lens': createMockProfile('papajams.lens', '0x66eC1b5ECD5a8d36652f786C4eCB5bB2d427A44b', 'Papa Jams', 'https://ik.imagekit.io/lens/media-snapshot/70fbc7fa44e5b71761b88814274a3dce27b5d9db3b703e3b89f37e5010fd1107.webp')
    };
    
    // Try to match by handle (case insensitive)
    if (!handleOrAddress.startsWith('0x')) {
      const normalizedHandle = handleOrAddress.toLowerCase().endsWith('.lens') 
        ? handleOrAddress.toLowerCase() 
        : `${handleOrAddress.toLowerCase()}.lens`;
        
      if (knownHandles[normalizedHandle]) {
        return knownHandles[normalizedHandle];
      }
    }
    
    // Try to match by address
    if (handleOrAddress.startsWith('0x')) {
      for (const profile of Object.values(knownHandles)) {
        if (profile.ownedBy?.[0]?.toLowerCase() === handleOrAddress.toLowerCase()) {
          return profile;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Lens profile:', error);
    return null;
  }
}

/**
 * Fetches multiple Lens profiles by their addresses
 * @param addresses Array of Ethereum addresses
 * @returns Array of profiles found
 */
export async function fetchLensProfilesByAddresses(addresses: string[]): Promise<Profile[]> {
  try {
    // Mock data for known addresses
    const knownProfiles: Record<string, Profile> = {
      '0x3182d5B9Fe22Dea8A9cf2f06312e93Dbbb67c578': createMockProfile('stani.lens', '0x3182d5B9Fe22Dea8A9cf2f06312e93Dbbb67c578', 'Stani', 'https://ik.imagekit.io/lens/media-snapshot/e3adfb7046a549480a92c63de2d431f1ced8e516ea285970267c4dc24f941856.png'),
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045': createMockProfile('vitalik.lens', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'Vitalik', 'https://ik.imagekit.io/lens/media-snapshot/ff9c206b6b76a5c8530cb7b877f06943bcdb4a6b28d2378cac94be93ed223549.jpg'),
      '0xB59Aa5BB9270d44be3fA9b6D67520a2d28CF80AB': createMockProfile('yoginth.lens', '0xB59Aa5BB9270d44be3fA9b6D67520a2d28CF80AB', 'Yoginth', 'https://ik.imagekit.io/lens/media-snapshot/0e8c5f2e4c962a0b17a0184686bd4cbaddd1879165a9b45cff9f1766cc9e8e4a.jpg'),
      '0x66eC1b5ECD5a8d36652f786C4eCB5bB2d427A44b': createMockProfile('papajams.lens', '0x66eC1b5ECD5a8d36652f786C4eCB5bB2d427A44b', 'Papa Jams', 'https://ik.imagekit.io/lens/media-snapshot/70fbc7fa44e5b71761b88814274a3dce27b5d9db3b703e3b89f37e5010fd1107.webp')
    };
    
    // First try direct lookups from known profiles
    const profiles: Profile[] = [];
    const remainingAddresses: string[] = [];
    
    // Try known profiles first
    for (const address of addresses) {
      const normalizedAddress = address.toLowerCase();
      
      // Check if we have this address in our known profiles
      const found = Object.entries(knownProfiles).find(
        ([addr]) => addr.toLowerCase() === normalizedAddress
      );
      
      if (found) {
        profiles.push(found[1]);
      } else {
        remainingAddresses.push(address);
      }
    }
    
    // If we found all the profiles in our known data, just return them
    if (remainingAddresses.length === 0) {
      return profiles;
    }
    
    // Try Lens API for remaining addresses
    try {
      for (const address of remainingAddresses) {
        try {
          const lensProfiles = await fetchProfilesByAddress(address);
          if (lensProfiles.length > 0) {
            profiles.push(convertFromSimpleLensProfile(lensProfiles[0]));
          }
        } catch (e) {
          console.warn(`Error fetching profile for address ${address} from Lens API, using fallback`);
          
          // Create a fallback profile
          profiles.push(createFallbackProfile(address));
        }
      }
    } catch (error) {
      console.error('Error in Lens API batch processing:', error);
      
      // Create fallback profiles for any remaining addresses
      for (const address of remainingAddresses) {
        if (!profiles.some(p => p.ownedBy?.[0]?.toLowerCase() === address.toLowerCase())) {
          profiles.push(createFallbackProfile(address));
        }
      }
    }
    
    return profiles;
  } catch (error) {
    console.error('Error fetching Lens profiles by addresses:', error);
    
    // Return fallback profiles for all addresses
    return addresses.map(createFallbackProfile);
  }
}

/**
 * Fetches a list of Lens profiles by their profile IDs
 * Note: This is a compatibility function that actually uses addresses
 * since Web3.bio API doesn't support profile IDs directly
 * @param profileIds Array of Lens profile IDs
 * @returns Array of profiles found
 */
export async function fetchLensProfilesByIds(profileIds: ProfileId[]): Promise<Profile[]> {
  try {
    // Since we're working with different APIs, we'll treat each ID individually
    const profilePromises = profileIds.map(id => fetchLensProfile(id.toString()));
    const profiles = await Promise.all(profilePromises);
    
    // Filter out null values
    return profiles.filter((profile): profile is Profile => profile !== null);
  } catch (error) {
    console.error('Error fetching Lens profiles by IDs:', error);
    return [];
  }
}

/**
 * Generate a link to a profile page on Hey.xyz
 * @param handle Lens handle or address
 * @returns URL to the profile on Hey.xyz
 */
export function getHeyProfileUrl(handle: string): string {
  return getLensApiHeyUrl(handle);
}

/**
 * Format a Lens profile handle for display
 * @param handle Full Lens handle
 * @returns Formatted handle with @ prefix
 */
export function formatLensHandle(handle: string | null | undefined): string {
  if (!handle) return '';
  
  // Extract handle from lens/handle format if needed
  const parts = handle.split('/');
  const baseHandle = parts.length > 1 ? parts[1] : handle;
  
  // Remove .lens if it exists
  const cleanHandle = baseHandle.replace('.lens', '');
  
  return `@${cleanHandle}`;
}

/**
 * Creates a mock Profile for known Lens users
 */
function createMockProfile(handle: string, address: string, displayName: string, imageUrl: string): Profile {
  return {
    id: handle,
    handle: {
      fullHandle: handle
    },
    ownedBy: [address],
    metadata: {
      displayName: displayName,
      bio: `${displayName}'s profile on Lens Protocol`,
      picture: {
        __typename: 'ImageSet',
        optimized: {
          uri: imageUrl
        }
      },
      attributes: [
        {
          key: 'verified',
          value: 'true'
        }
      ]
    }
  };
}

/**
 * Creates a fallback profile when no data is available
 */
function createFallbackProfile(address: string): Profile {
  const shortAddress = `${address.substring(0, 6)}...${address.substring(38)}`;
  
  return {
    id: address,
    handle: {
      fullHandle: shortAddress
    },
    ownedBy: [address],
    metadata: {
      displayName: shortAddress,
      bio: 'Lens user',
      picture: {
        __typename: 'ImageSet',
        optimized: {
          uri: `https://cdn.stamp.fyi/avatar/${address}?s=250`
        }
      }
    }
  };
}

/**
 * Checks if the provided Ethereum address has a Lens profile
 * @param address Ethereum address
 * @returns Boolean indicating if the address has a Lens profile
 */
export async function hasLensProfile(address: string): Promise<boolean> {
  try {
    const profile = await fetchLensProfile(address);
    return profile !== null;
  } catch (error) {
    console.error('Error checking for Lens profile:', error);
    return false;
  }
}

/**
 * Convert a SimpleLensProfile to our Profile format
 * @param lensProfile SimpleLensProfile from Lens API
 * @returns Profile in our format
 */
function convertFromSimpleLensProfile(lensProfile: SimpleLensProfile): Profile {
  return {
    id: lensProfile.id,
    handle: {
      fullHandle: lensProfile.handle
    },
    ownedBy: [lensProfile.address],
    metadata: {
      displayName: lensProfile.displayName,
      bio: lensProfile.bio,
      picture: lensProfile.avatarUrl ? {
        __typename: 'ImageSet',
        optimized: {
          uri: lensProfile.avatarUrl
        }
      } : undefined,
      attributes: lensProfile.isVerified ? [
        {
          key: 'verified',
          value: 'true'
        }
      ] : []
    }
  };
}