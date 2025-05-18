"use client";

import React, { useState } from "react";
import { LazyComponent } from "@/components/ui/utils/lazy-component";
import { Button } from "@/components/ui/inputs/button";
import { useErrorHandler } from "@/hooks/use-error-handler";

/**
 * StatsSection component that demonstrates lazy loading
 * and error handling with the LazyComponent wrapper
 */
export function StatsSection() {
  const [showStats, setShowStats] = useState(false);
  const { handleError } = useErrorHandler();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Syndicate Statistics</h2>
        <Button onClick={() => setShowStats(!showStats)} variant="outline">
          {showStats ? "Hide Stats" : "Show Stats"}
        </Button>
      </div>

      {showStats && (
        <LazyComponent
          component={() => import("@/components/syndicate/LazyLoadedStats")}
          props={{
            totalPools: 42,
            totalParticipants: 1024,
            totalRaised: 500000,
          }}
          onError={(error) => handleError(error, "Failed to load statistics")}
        />
      )}
    </div>
  );
}
