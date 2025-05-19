"use client";

import React, { useState, useEffect } from 'react';
import { Profile, ProfileId } from '@/lib/lens/profiles';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data-display/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/overlay/tooltip';
import { cn } from '@/lib/utils';
import { fetchLensProfile } from '@/lib/lens/profiles';
import Link from 'next/link';
import { getHeyProfileUrl, formatLensHandle } from '@/lib/lens/profiles';

export interface LensProfileAvatarProps {
  /** Profile ID if you have it */
  profileId?: ProfileId;
  
  /** Profile handle (without @) if you have it */
  handle?: string;
  
  /** Wallet address if you don't have profile ID or handle */
  address?: string;
  
  /** Full Profile object if you already have it */
  profile?: Profile;
  
  /** Size of the avatar (default: 'md') */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Optional additional class name */
  className?: string;
  
  /** If true, shows the handle as a tooltip on hover */
  showTooltip?: boolean;
  
  /** If true, makes the avatar clickable, linking to the profile on Hey.xyz */
  linkToProfile?: boolean;
  
  /** Whether to show a border around verified profiles */
  showVerifiedBorder?: boolean;
  
  /** Callback when profile is loaded */
  onProfileLoaded?: (profile: Profile) => void;
  
  /** Fallback display name (used when no profile is found) */
  fallbackName?: string;
}

export function LensProfileAvatar({
  profileId,
  handle,
  address,
  profile: initialProfile,
  size = 'md',
  className = '',
  showTooltip = true,
  linkToProfile = true,
  showVerifiedBorder = true,
  onProfileLoaded,
  fallbackName = '',
}: LensProfileAvatarProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile || null);
  const [isLoading, setIsLoading] = useState(!initialProfile);
  const [error, setError] = useState<Error | null>(null);

  // Sizing classes
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  // Load profile if not provided
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      return;
    }

    if (!profileId && !handle && !address) {
      setIsLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        setIsLoading(true);
        setError(null);

        // Prioritize loading by profileId, then handle, then address
        const identifier = profileId?.toString() || handle || address;
        if (!identifier) return;

        const loadedProfile = await fetchLensProfile(identifier);
        setProfile(loadedProfile);
        
        if (loadedProfile && onProfileLoaded) {
          onProfileLoaded(loadedProfile);
        }
      } catch (err) {
        console.error('Failed to load Lens profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to load profile'));
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [profileId, handle, address, initialProfile, onProfileLoaded]);

  // Extract display information
  const profileHandle = profile?.handle?.fullHandle || handle || '';
  const displayName = profile?.metadata?.displayName || formatLensHandle(profileHandle) || fallbackName;
  const avatarUrl = profile?.metadata?.picture?.optimized?.uri;
  const isVerified = !!profile?.metadata?.attributes?.find(attr => 
    attr.key === 'verified' && attr.value === 'true'
  );

  // Generate fallback for avatar
  const generateFallback = () => {
    if (displayName) return displayName.substring(0, 2).toUpperCase();
    if (address) return address.substring(2, 4).toUpperCase();
    return 'LP';
  };

  // Prepare the avatar component
  const avatarComponent = (
    <Avatar 
      className={cn(
        sizeClasses[size],
        isVerified && showVerifiedBorder ? 'border-2 border-green-500' : 'border border-white/10',
        isLoading ? 'opacity-70' : '',
        'transition-all duration-200 shadow-md',
        className
      )}
    >
      <AvatarImage 
        src={avatarUrl} 
        alt={displayName}
        className="object-cover"
      />
      <AvatarFallback className="bg-gradient-to-br from-cyan-800 to-blue-900">
        {generateFallback()}
      </AvatarFallback>
    </Avatar>
  );

  // If loading or error, just return the avatar without interactivity
  if (isLoading || error || (!profileHandle && !address)) {
    return avatarComponent;
  }

  // With tooltip and/or link
  if (showTooltip) {
    const tooltipContent = (
      <div className="flex flex-col items-center text-center">
        <span className="font-medium">{displayName}</span>
        {profileHandle && (
          <span className="text-xs text-gray-300">{formatLensHandle(profileHandle)}</span>
        )}
      </div>
    );

    if (linkToProfile && profileHandle) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href={getHeyProfileUrl(profileHandle.split('/').pop() || profileHandle)} 
                target="_blank"
                className="hover:opacity-90 transition-opacity"
              >
                {avatarComponent}
              </Link>
            </TooltipTrigger>
            <TooltipContent>{tooltipContent}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {avatarComponent}
          </TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Just link without tooltip
  if (linkToProfile && profileHandle) {
    return (
      <Link 
        href={getHeyProfileUrl(profileHandle.split('/').pop() || profileHandle)} 
        target="_blank"
        className="hover:opacity-90 transition-opacity"
      >
        {avatarComponent}
      </Link>
    );
  }

  // Base avatar without tooltip or link
  return avatarComponent;
}