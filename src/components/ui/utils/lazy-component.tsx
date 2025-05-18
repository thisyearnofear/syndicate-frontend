"use client";

import React, { Suspense, lazy, ComponentType } from "react";
import { Skeleton } from "@/components/ui/data-display/skeleton";

interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  props?: Record<string, any>;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

/**
 * LazyComponent - A wrapper for React.lazy with improved error handling and fallback UI
 */
export function LazyComponent({
  component,
  props = {},
  fallback,
  onError,
}: LazyComponentProps) {
  // Use React.lazy to dynamically import the component
  const LazyLoadedComponent = lazy(() => {
    return component().catch((error) => {
      // Handle the error from the dynamic import
      if (onError) {
        onError(error);
      }

      // Return a minimal component to avoid breaking the UI
      return {
        default: () => (
          <div className="p-4 text-destructive text-sm">
            Failed to load component
          </div>
        ),
      };
    });
  });

  // Default fallback is a skeleton loader
  const defaultFallback = (
    <div className="w-full space-y-4 animate-pulse">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-8 w-2/3" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyLoadedComponent {...props} />
    </Suspense>
  );
}
