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

export function SyndicateHome() {
  return (
    <ErrorBoundary
      onError={(error: Error) =>
        console.error("Root error boundary caught:", error)
      }
    >
      <div className="min-h-screen text-white bg-gradient-to-b from-gray-900 to-black">
        {/* Header */}
        <header className="sticky top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="font-bold text-lg">Syndicate</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/megapot">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 hover:bg-white/10"
                >
                  Megapot Jackpots
                </Button>
              </Link>
              <Button
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white"
              >
                Connect Wallet
              </Button>
            </div>
          </div>
        </header>

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
        <footer className="py-8 border-t border-white/10 bg-black/60 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xs">
                  S
                </div>
                <span className="font-bold">Syndicate</span>
              </div>

              <div className="text-sm text-white/70">
                &copy; {new Date().getFullYear()} Syndicate | Better Odds,
                Bigger Impact
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
