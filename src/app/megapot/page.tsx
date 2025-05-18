"use client";

import React from 'react';
import { MegapotPage } from '@/components/megapot/MegapotPage';
import { ErrorBoundary } from '@/components/ui/utils/error-boundary';

export default function MegapotPageRoute() {
  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-gray-900 to-black">
      {/* Header - Reusing the same header from SyndicateHome */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold text-lg">Syndicate</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <ErrorBoundary
        onError={(error: Error) =>
          console.error("Megapot page error boundary caught:", error)
        }
      >
        <MegapotPage />
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
              &copy; {new Date().getFullYear()} Syndicate | Better Odds,
              Bigger Impact
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
