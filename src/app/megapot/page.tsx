"use client";

import React from "react";
import { MegapotPage } from "@/components/megapot/MegapotPage";
import { ErrorBoundary } from "@/components/ui/utils/error-boundary";

export default function MegapotPageRoute() {
  return (
    <div className="container mx-auto px-4 pb-8">
      {/* Main Content */}
      <ErrorBoundary
        onError={(error: Error) =>
          console.error("Megapot page error boundary caught:", error)
        }
      >
        <MegapotPage />
      </ErrorBoundary>
    </div>
  );
}
