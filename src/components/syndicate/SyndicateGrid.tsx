"use client";

import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/dist/Flip";
import { SyndicateCard } from "./SyndicateCard";
import { Button } from "@/components/ui/inputs/button";
import { MagneticButton } from "@/components/ui/inputs/magnetic-button";
import { cn } from "@/lib/utils";
import { Syndicate, SyndicateGridProps } from "@/types/syndicate";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip);
}

// Using Syndicate and SyndicateGridProps from @/types/syndicate

export function SyndicateGrid({
  syndicates,
  className,
  onSyndicateClick,
  isLoading = false,
}: SyndicateGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredSyndicates, setFilteredSyndicates] =
    useState<Syndicate[]>(syndicates);

  // Get unique categories from syndicates
  const categories = [...new Set(syndicates.map((s) => s.cause))];

  // Update filtered syndicates when selection changes
  useEffect(() => {
    if (!selectedCategory) {
      setFilteredSyndicates(syndicates);
    } else {
      setFilteredSyndicates(
        syndicates.filter((s) => s.cause === selectedCategory)
      );
    }
  }, [selectedCategory, syndicates]);

  // Handle layout toggle with GSAP Flip animation
  const toggleLayout = () => {
    if (!gridRef.current) return;

    // Get the current state
    const state = Flip.getState(gridRef.current.children);

    // Change the layout
    setLayout((prev) => (prev === "grid" ? "list" : "grid"));

    // After the DOM updates, animate to the new state
    setTimeout(() => {
      Flip.from(state, {
        duration: 0.6,
        ease: "power1.inOut",
        stagger: 0.05,
        absolute: true,
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.6 }
          );
        },
        onLeave: (elements) => {
          gsap.to(elements, { opacity: 0, scale: 0.8, duration: 0.6 });
        },
      });
    }, 0);
  };

  // Filter by category
  const filterByCategory = (category: string) => {
    if (!gridRef.current) return;

    // Get the current state
    const state = Flip.getState(gridRef.current.children);

    // Update the selected category
    setSelectedCategory((prev) => (prev === category ? null : category));

    // After the DOM updates, animate to the new state
    setTimeout(() => {
      Flip.from(state, {
        duration: 0.6,
        ease: "power1.inOut",
        stagger: 0.05,
        absolute: true,
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.6 }
          );
        },
        onLeave: (elements) => {
          gsap.to(elements, { opacity: 0, scale: 0.8, duration: 0.6 });
        },
      });
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-4xl animate-bounce mb-4">🔍</div>
        <p className="text-white/70">Loading syndicates...</p>
      </div>
    );
  }

  if (syndicates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="text-6xl mb-4 animate-bounce">🦄</div>
        <h3 className="text-2xl font-bold mb-2">No syndicates found</h3>
        <p className="text-white/70 max-w-md mb-6">
          Be the first to create a syndicate and start pooling resources for a
          cause you care about!
        </p>
        <MagneticButton variant="default">Create a Syndicate</MagneticButton>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => filterByCategory(category)}
              className={cn(
                "border-white/20",
                selectedCategory === category
                  ? "bg-white/20 text-white"
                  : "text-white/70"
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLayout}
          className="text-white/70"
        >
          {layout === "grid" ? "List View" : "Grid View"}
        </Button>
      </div>

      {/* Grid/List of Syndicates */}
      <div
        ref={gridRef}
        className={cn(
          "transition-all duration-300",
          layout === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
        )}
      >
        {filteredSyndicates.map((syndicate) => (
          <SyndicateCard
            key={syndicate.id}
            syndicate={syndicate}
            onClick={() => onSyndicateClick?.(syndicate)}
            className={layout === "list" ? "w-full" : ""}
          />
        ))}
      </div>
    </div>
  );
}
