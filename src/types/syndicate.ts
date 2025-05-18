/**
 * Syndicate related types
 */

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
