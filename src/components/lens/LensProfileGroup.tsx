"use client";

import React, { useState, useEffect } from 'react';
import { Profile, ProfileId } from '@/lib/lens/profiles';
import { LensProfileAvatar } from './LensProfileAvatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/overlay/tooltip';
import { cn } from '@/lib/utils';
import { fetchLensProfilesByIds, fetchLensProfilesByAddresses } from '@/lib/lens/profiles';
import { SyndicateMember } from '@/types/syndicate';

export interface LensProfileGroupProps {
  /** Array of profile IDs */
  profileIds?: ProfileId[];
  
  /** Array of addresses */
  addresses?: string[];
  
  /** Array of members with profileId or address */
  members?: SyndicateMember[];
  
  /** Array of pre-loaded profiles */
  profiles?: Profile[];
  
  /** Maximum number of profiles to display */
  maxVisible?: number;
  
  /** Size of each avatar */
  avatarSize?: 'xs' | 'sm' | 'md' | 'lg';
  
  /** How much to overlap the avatars (-50% means half width overlap) */
  overlap?: string;
  
  /** Whether to show tooltips on hover */
  showTooltips?: boolean;
  
  /** Additional class name */
  className?: string;
  
  /** Whether avatars should link to profile pages */
  linkToProfiles?: boolean;
  
  /** Optional callback when all profiles are loaded */
  onProfilesLoaded?: (profiles: Profile[]) => void;
  
  /** Whether to show a clickable "View all" button when there are more profiles than maxVisible */
  showViewAllButton?: boolean;
  
  /** Callback when "View all" is clicked */
  onViewAllClick?: () => void;
}

export function LensProfileGroup({
  profileIds = [],
  addresses = [],
  members = [],
  profiles: initialProfiles = [],
  maxVisible = 5,
  avatarSize = 'sm',
  overlap = '-20%',
  showTooltips = true,
  className = '',
  linkToProfiles = true,
  onProfilesLoaded,
  showViewAllButton = true,
  onViewAllClick,
}: LensProfileGroupProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [isLoading, setIsLoading] = useState(initialProfiles.length === 0 && (profileIds.length > 0 || addresses.length > 0 || members.length > 0));
  
  // Extract IDs and addresses from members if provided
  const memberProfileIds = members
    .filter(m => m.profileId)
    .map(m => m.profileId as ProfileId);
    
  const memberAddresses = members
    .filter(m => !m.profileId && m.address)
    .map(m => m.address);
  
  // Combine profile IDs from both sources
  const allProfileIds = [...profileIds, ...memberProfileIds];
  const allAddresses = [...addresses, ...memberAddresses];

  // Load profiles if not provided
  useEffect(() => {
    if (initialProfiles.length > 0 || (allProfileIds.length === 0 && allAddresses.length === 0)) {
      setIsLoading(false);
      return;
    }
    
    async function loadProfiles() {
      try {
        setIsLoading(true);
        let loadedProfiles: Profile[] = [];
        
        // Load by profile IDs if available
        if (allProfileIds.length > 0) {
          const profilesById = await fetchLensProfilesByIds(allProfileIds);
          loadedProfiles = [...loadedProfiles, ...profilesById];
        }
        
        // Load by addresses if available
        if (allAddresses.length > 0) {
          const profilesByAddress = await fetchLensProfilesByAddresses(allAddresses);
          
          // Filter out duplicates that might have been loaded by ID already
          const newProfiles = profilesByAddress.filter(profile => 
            !loadedProfiles.some(p => p.id === profile.id)
          );
          
          loadedProfiles = [...loadedProfiles, ...newProfiles];
        }
        
        setProfiles(loadedProfiles);
        
        if (onProfilesLoaded) {
          onProfilesLoaded(loadedProfiles);
        }
      } catch (err) {
        console.error('Failed to load Lens profiles:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfiles();
  }, [allProfileIds, allAddresses, initialProfiles, onProfilesLoaded]);

  // Handle the case where we're still loading
  if (isLoading) {
    return (
      <div className={cn("flex items-center", className)}>
        {Array.from({ length: Math.min(3, maxVisible) }).map((_, i) => (
          <div 
            key={i}
            className={cn(
              "rounded-full bg-gray-800 animate-pulse",
              {
                'h-6 w-6': avatarSize === 'xs',
                'h-8 w-8': avatarSize === 'sm',
                'h-10 w-10': avatarSize === 'md',
                'h-12 w-12': avatarSize === 'lg',
              }
            )}
            style={{ marginLeft: i > 0 ? overlap : '0' }}
          />
        ))}
      </div>
    );
  }

  // Calculate if we need to show the +X more indicator
  const hasMore = profiles.length > maxVisible;
  const visibleProfiles = profiles.slice(0, maxVisible);
  const extraCount = profiles.length - maxVisible;

  return (
    <div className={cn("flex items-center", className)}>
      {visibleProfiles.map((profile, index) => (
        <div 
          key={profile.id}
          style={{ marginLeft: index > 0 ? overlap : '0', zIndex: 10 - index }}
          className="relative"
        >
          <LensProfileAvatar
            profile={profile}
            size={avatarSize}
            showTooltip={showTooltips}
            linkToProfile={linkToProfiles}
          />
        </div>
      ))}
      
      {hasMore && (
        <div 
          style={{ marginLeft: overlap, zIndex: 10 - maxVisible }}
          className="relative"
        >
          {showViewAllButton ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onViewAllClick}
                    className={cn(
                      "flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-medium text-xs",
                      {
                        'h-6 w-6': avatarSize === 'xs',
                        'h-8 w-8': avatarSize === 'sm',
                        'h-10 w-10': avatarSize === 'md',
                        'h-12 w-12': avatarSize === 'lg',
                      }
                    )}
                  >
                    +{extraCount}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View all {profiles.length} members</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div
              className={cn(
                "flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-medium text-xs",
                {
                  'h-6 w-6': avatarSize === 'xs',
                  'h-8 w-8': avatarSize === 'sm',
                  'h-10 w-10': avatarSize === 'md',
                  'h-12 w-12': avatarSize === 'lg',
                }
              )}
            >
              +{extraCount}
            </div>
          )}
        </div>
      )}
      
      {profiles.length === 0 && !isLoading && (
        <div className="text-sm text-gray-400">No members yet</div>
      )}
    </div>
  );
}