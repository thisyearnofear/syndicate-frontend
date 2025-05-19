"use client";

import React from "react";
import { Button } from "@/components/ui/inputs/button";
import Link from "next/link";
import { ErrorBoundary } from "@/components/ui/utils/error-boundary";
import { StatsSection } from "./StatsSection";
import { AdaptedFeatureSection } from "@/components/ui/adapted-feature-section";
import { AdaptedCausesSection } from "@/components/ui/adapted-causes-section";
import { EnhancedHeroSection } from "@/components/ui/typography/enhanced-hero-section";
import { AdaptedHowItWorks } from "@/components/ui/adapted-how-it-works";
import { Footer } from "@/components/layout";

export function SyndicateHome() {
  return (
    <ErrorBoundary
      onError={(error: Error) =>
        console.error("Root error boundary caught:", error)
      }
    >
      <div className="min-h-screen text-white bg-gradient-to-b from-gray-900 to-black">
        {/* Hero Section - Using EnhancedHeroSection component */}
        <EnhancedHeroSection />

        {/* How It Works Section - Using AdaptedHowItWorks component */}
        <AdaptedHowItWorks />

        {/* Features Section - Using AdaptedFeatureSection component */}
        <AdaptedFeatureSection />

        {/* Stats Section - Lazy Loaded */}
        <ErrorBoundary>
          <StatsSection />
        </ErrorBoundary>

        {/* Featured Syndicates - Using AdaptedCausesSection component */}
        <AdaptedCausesSection />

        {/* Footer */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
