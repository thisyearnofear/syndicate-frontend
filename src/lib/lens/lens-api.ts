// Base URL for the Lens API
const LENS_API_URL = 'https://api.lens.dev/';

// Define profile types
export interface LensProfile {
  id: string;
  handle: {
    fullHandle: string;
    localName: string;
    namespace: string;
  };
  ownedBy: {
    address: string;
  };
  metadata: {
    displayName: string;
    bio: string;
    picture: {
      optimized: {
        uri: string;
      };
      raw: {
        uri: string;
      };
    };
    attributes: {
      key: string;
      value: string;
    }[];
  };
  stats: {
    followers: number;
    following: number;
    posts: number;
    comments: number;
    mirrors: number;
  };
}

// Profile with simplified structure for easier consumption
export interface SimpleLensProfile {
  id: string;
  handle: string;
  address: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  followerCount: number;
  followingCount: number;
  isVerified: boolean;
}

// Profile fetch by handle query
const PROFILE_BY_HANDLE_QUERY = `
  query ProfileByHandle($handle: String!) {
    profile(request: { handle: $handle }) {
      id
      handle
      ownedBy
      metadata {
        displayName
        bio
        picture {
          original {
            url
          }
        }
        attributes {
          key
          value
        }
      }
      stats {
        totalFollowers
        totalFollowing
        totalPosts
      }
    }
  }
`;

// Profile fetch by address query
const PROFILES_BY_ADDRESS_QUERY = `
  query ProfilesByAddress($address: String!) {
    profiles(request: { ownedBy: [$address] }) {
      items {
        id
        handle
        ownedBy
        metadata {
          displayName
          bio
          picture {
            original {
              url
            }
          }
          attributes {
            key
            value
          }
        }
        stats {
          totalFollowers
          totalFollowing
          totalPosts
        }
      }
    }
  }
`;

/**
 * Fetches a profile by Lens handle
 * @param handle The Lens handle (with or without .lens suffix)
 * @returns The profile or null if not found
 */
export async function fetchProfileByHandle(handle: string): Promise<SimpleLensProfile | null> {
  try {
    // Ensure the handle has the correct format
    const formattedHandle = formatHandleForQuery(handle);
    
    // Fetch from Lens API
    const response = await fetch(LENS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: PROFILE_BY_HANDLE_QUERY,
        variables: {
          handle: formattedHandle
        }
      })
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error('Error fetching profile by handle:', data.errors);
      return null;
    }
    
    if (!data.data || !data.data.profile) {
      return null;
    }
    
    return convertToSimpleProfile(data.data.profile);
  } catch (error) {
    console.error('Error in fetchProfileByHandle:', error);
    return null;
  }
}

/**
 * Fetches profiles by Ethereum address
 * @param address The Ethereum address
 * @returns Array of profiles or empty array if none found
 */
export async function fetchProfilesByAddress(address: string): Promise<SimpleLensProfile[]> {
  try {
    // Fetch from Lens API
    const response = await fetch(LENS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: PROFILES_BY_ADDRESS_QUERY,
        variables: {
          address: address
        }
      })
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error('Error fetching profiles by address:', data.errors);
      return [];
    }
    
    if (!data.data || !data.data.profiles || !data.data.profiles.items || !data.data.profiles.items.length) {
      return [];
    }
    
    return data.data.profiles.items.map(convertToSimpleProfile);
  } catch (error) {
    console.error('Error in fetchProfilesByAddress:', error);
    return [];
  }
}

/**
 * Formats a handle for querying the Lens API
 * @param handle The handle to format
 * @returns Formatted handle
 */
function formatHandleForQuery(handle: string): string {
  // Remove '@' if present
  let formatted = handle.startsWith('@') ? handle.substring(1) : handle;
  
  // Ensure the handle has the required format
  return formatted;
}

/**
 * Converts a Lens API profile to simplified format
 * @param profile The profile from Lens API
 * @returns Simplified profile
 */
function convertToSimpleProfile(profile: any): SimpleLensProfile {
  const isVerified = profile.metadata?.attributes?.some(
    (attr: any) => attr.key === 'verified' && attr.value === 'true'
  ) || false;

  return {
    id: profile.id || '',
    handle: profile.handle || '',
    address: profile.ownedBy || '',
    displayName: profile.metadata?.displayName || '',
    bio: profile.metadata?.bio || '',
    avatarUrl: profile.metadata?.picture?.original?.url || '',
    followerCount: profile.stats?.totalFollowers || 0,
    followingCount: profile.stats?.totalFollowing || 0,
    isVerified
  };
}

/**
 * Generate a link to a profile page on Hey.xyz
 * @param handle Lens handle or address
 * @returns URL to the profile on Hey.xyz
 */
export function getHeyProfileUrl(handle: string): string {
  // If handle is an address or a full handle, use it directly
  if (handle.startsWith('0x') || handle.includes('.lens')) {
    return `https://hey.xyz/u/${handle}`;
  }
  
  // Otherwise, assume it's a lens handle without the suffix
  return `https://hey.xyz/u/${handle}.lens`;
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