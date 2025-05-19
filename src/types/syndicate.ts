/**
 * Syndicate related types
 */
import { Profile, ProfileId } from '@/lib/lens/profiles';

/**
 * Represents a Syndicate entity
 */
export interface Syndicate {
  /** Unique identifier for the syndicate */
  id: string;

  /** Name of the syndicate */
  name: string;

  /** The cause category this syndicate supports */
  cause: string;

  /** Number of members in the syndicate */
  members?: number;

  /** Percentage allocation to the cause (string format with % or number) */
  allocation?: string | number;

  /** Percentage split for the cause (number only) */
  causeSplit?: number;

  /** Percentage split for members (number only) */
  memberSplit?: number;

  /** Total pot amount in the syndicate */
  totalPot?: number;

  /** URL or emoji for the syndicate's profile image */
  profileImage?: string;

  /** Optional background color override */
  backgroundColor?: string;

  /** Array of image URLs for the syndicate */
  images?: string[];

  /** Additional images for grid display */
  gridImages?: string[];
  
  /** Lens profile ID of the creator */
  creatorProfileId?: ProfileId;
  
  /** Lens handle of the creator */
  creatorHandle?: string;
  
  /** Members' Lens profile IDs */
  memberProfileIds?: ProfileId[];
  
  /** The full Lens profile object of the creator, if available */
  creatorProfile?: Profile;
}

/**
 * Props for the SyndicateCard component
 */
export interface SyndicateCardProps {
  /** The syndicate data to display */
  syndicate: Syndicate;

  /** Optional click handler */
  onClick?: () => void;

  /** Optional additional className */
  className?: string;

  /** Whether this card should be featured (larger) */
  featured?: boolean;
}

/**
 * Props for the SyndicateGrid component
 */
export interface SyndicateGridProps {
  /** Array of syndicates to display */
  syndicates: Syndicate[];

  /** Handler for when a syndicate is clicked */
  onSyndicateClick?: (syndicate: Syndicate) => void;

  /** Optional additional className */
  className?: string;

  /** Whether the grid is in a loading state */
  isLoading?: boolean;
}

/**
 * Represents a Syndicate member with their Lens profile
 */
export interface SyndicateMember {
  /** Unique identifier for the member */
  id: string | number;
  
  /** Member's wallet address */
  address: string;
  
  /** Member's name or display name */
  name: string;
  
  /** Member's avatar URL */
  avatar?: string;
  
  /** Member's contribution amount */
  contribution?: number;
  
  /** Lens Profile ID */
  profileId?: ProfileId;
  
  /** Lens handle */
  handle?: string;
  
  /** Full Lens profile object, if available */
  lensProfile?: Profile;
  
  /** Timestamp of when they joined */
  joinedAt?: Date;
}

/**
 * Represents an activity in a syndicate
 */
export interface SyndicateActivity {
  /** Unique identifier for the activity */
  id: string | number;
  
  /** Type of activity */
  type: 'join' | 'contribute' | 'create' | 'win' | 'claim';
  
  /** User who performed the activity */
  user: string;
  
  /** Amount involved (for contributions) */
  amount?: number;
  
  /** When the activity occurred */
  time: string;
  
  /** Lens profile ID of the user */
  profileId?: ProfileId;
  
  /** Lens profile of the user */
  profile?: Profile;
}
