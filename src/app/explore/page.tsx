"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/inputs/button";
import { ErrorBoundary } from "@/components/ui/utils/error-boundary";
import { AdaptedCausesSection } from "@/components/ui/adapted-causes-section";
import { motion } from "framer-motion";
import { LensConnectButton } from "@/components/lens/LensConnectButton";

export default function ExplorePage() {
  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-gray-900 to-black">
      {/* Header - Reusing the same header from SyndicateHome */}
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

            <LensConnectButton
              size="sm"
              variant="default"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <ErrorBoundary
        onError={(error: Error) =>
          console.error("Explore page error boundary caught:", error)
        }
      >
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Explore Syndicates
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Join a syndicate to pool resources with others, dramatically
              increase your chances of winning, and support causes you care
              about.
            </p>
          </motion.div>

          {/* Featured Syndicates - Using AdaptedCausesSection component */}
          <AdaptedCausesSection />
        </div>
      </ErrorBoundary>

      {/* Footer - Reusing the same footer from SyndicateHome */}
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
              &copy; {new Date().getFullYear()} Syndicate | Better Odds, Bigger
              Impact
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
