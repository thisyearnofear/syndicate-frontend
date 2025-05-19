"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { gsap } from "gsap";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/data-display/card";
import { Badge } from "@/components/ui/data-display/badge";
import { MagneticButton } from "@/components/ui/inputs/magnetic-button";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/utils/optimized-image";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { SyndicateCardProps } from "@/types/syndicate";
import { LensProfileGroup } from "@/components/lens/LensProfileGroup";
import { LensProfileAvatar } from "@/components/lens/LensProfileAvatar";
import { Profile } from "@/lib/lens/profiles";

// Animal-themed cause icons
const causeIcons: Record<string, string> = {
  Environmental: "🌳",
  Humanitarian: "❤️",
  Education: "📚",
  Health: "🏥",
  "Animal Welfare": "🐾",
  "Arts & Culture": "🎨",
  "Community Development": "🏘️",
  "Ocean Cleanup": "🌊",
  "Food Aid": "🍲",
  Reforestation: "🌱",
  "Clean Water": "💧",
  "Renewable Energy": "⚡",
  "Digital Rights": "🔒",
  "Mental Health": "🧠",
};

// Get a default icon if the cause doesn't have a specific one
const getIconForCause = (cause: string): string => {
  // Try to match the cause with our predefined icons
  for (const [key, value] of Object.entries(causeIcons)) {
    if (cause.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  // Default icon if no match
  return "🎯";
};

// Background colors for cards
const cardColors = [
  "from-blue-500/20 to-purple-500/20",
  "from-green-500/20 to-teal-500/20",
  "from-pink-500/20 to-red-500/20",
  "from-yellow-500/20 to-orange-500/20",
  "from-indigo-500/20 to-blue-500/20",
  "from-purple-500/20 to-pink-500/20",
];

// Using SyndicateCardProps from @/types/syndicate

export function SyndicateCard({
  syndicate,
  onClick,
  className,
  featured = false,
}: SyndicateCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const { handleError } = useErrorHandler();

  // Get a random background color from our array - use useMemo for performance
  const bgGradient = useMemo(() => {
    try {
      const randomColorIndex = parseInt(syndicate.id, 16) % cardColors.length;
      return cardColors[randomColorIndex];
    } catch (error) {
      handleError(error, "Failed to generate background color");
      return cardColors[0]; // Fallback to first color
    }
  }, [syndicate.id, handleError]);

  // Get the icon for this cause
  const icon = syndicate.profileImage || getIconForCause(syndicate.cause);

  // Format the allocation percentage - use useMemo for performance
  const allocation = useMemo(() => {
    return typeof syndicate.allocation === "number"
      ? `${syndicate.allocation}%`
      : syndicate.allocation ||
          (syndicate.causeSplit ? `${syndicate.causeSplit}%` : "20%");
  }, [syndicate.allocation, syndicate.causeSplit]);

  useEffect(() => {
    if (!cardRef.current) return;

    try {
      // Initial animation when card mounts
      gsap.fromTo(
        cardRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          delay: Math.random() * 0.3,
        }
      );

      return () => {
        gsap.killTweensOf(cardRef.current);
      };
    } catch (error) {
      handleError(error, "Animation failed to initialize");
    }
  }, [handleError]);

  const handleMouseEnter = () => {
    setIsHovered(true);

    if (iconRef.current) {
      gsap.to(iconRef.current, {
        scale: 1.2,
        rotate: 10,
        duration: 0.4,
        ease: "back.out(1.7)",
      });
    }

    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: -5,
        boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);

    if (iconRef.current) {
      gsap.to(iconRef.current, {
        scale: 1,
        rotate: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    }

    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  return (
    <Card
      ref={cardRef}
      className={cn(
        "overflow-hidden transition-all duration-300 border border-white/10",
        "bg-gradient-to-br backdrop-blur-md",
        bgGradient,
        featured ? "transform scale-105" : "",
        "relative transform-gpu",
        className
      )}
      style={{ perspective: "1000px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `float ${Math.random() * 5 + 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Glow effect for featured cards */}
      {featured && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-30 pointer-events-none" />
      )}

      <CardHeader className="pb-2 relative z-10">
        <div className="flex justify-between items-center">
          <div
            ref={iconRef}
            className="text-3xl transition-transform p-2 bg-white/10 rounded-full"
            style={{
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            {typeof icon === "string" && icon.startsWith("http") ? (
              <OptimizedImage
                src={icon}
                alt={`${syndicate.name} icon`}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
                onImageError={(error) =>
                  handleError(error, "Failed to load syndicate icon")
                }
              />
            ) : (
              icon
            )}
          </div>
          <div className="flex items-center gap-2">
            {syndicate.creatorProfile ? (
              <LensProfileAvatar 
                profile={syndicate.creatorProfile}
                size="xs"
                showTooltip
                linkToProfile
              />
            ) : syndicate.creatorProfileId ? (
              <LensProfileAvatar 
                profileId={syndicate.creatorProfileId}
                size="xs"
                showTooltip
                linkToProfile
              />
            ) : syndicate.creatorHandle ? (
              <LensProfileAvatar 
                handle={syndicate.creatorHandle}
                size="xs"
                showTooltip
                linkToProfile
              />
            ) : null}
            <Badge
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white"
            >
              {syndicate.members || "0"} members
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg font-bold mt-3 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
          {syndicate.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-2 text-sm text-white/80 relative z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-cyan-400 mr-2"></div>
            <div>
              Cause:{" "}
              <span className="text-cyan-400 font-medium">
                {syndicate.cause}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-cyan-400 mr-2"></div>
            <div>
              Allocation:{" "}
              <span className="text-cyan-400 font-medium">{allocation}</span> to
              cause
            </div>
          </div>
          
          {/* Lens profile group showing syndicate members */}
          {syndicate.memberProfileIds && syndicate.memberProfileIds.length > 0 && (
            <div className="mt-1">
              <LensProfileGroup 
                profileIds={syndicate.memberProfileIds} 
                maxVisible={3}
                avatarSize="xs"
                overlap="-10px"
                className="mt-2"
              />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="relative z-10">
        <MagneticButton
          onClick={onClick}
          variant="outline"
          className="w-full border-white/20 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-white"
          strength={40}
          scale={1.05}
          textEffect="slide"
          borderEffect={true}
        >
          <span className="magnetic-child flex items-center justify-center">
            <span className="mr-2">Join Syndicate</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="magnetic-child"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </span>
        </MagneticButton>
      </CardFooter>

      {/* Add keyframes for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </Card>
  );
}
