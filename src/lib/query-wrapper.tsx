"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Component, ReactNode, useState } from "react";

interface QueryWrapperProps {
  children: ReactNode;
}

// Custom ErrorBoundary component
interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent: React.ComponentType<{
    error: Error;
    resetErrorBoundary: () => void;
  }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <this.props.FallbackComponent
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="p-4 border border-red-500 rounded-md bg-red-50 dark:bg-red-950/20">
      <h2 className="text-red-600 text-md font-medium mb-2">
        Error loading data
      </h2>
      <p className="text-sm text-red-700 dark:text-red-400 mb-4">
        {error.message}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="text-xs bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
      >
        Try again
      </button>
    </div>
  );
}

export function QueryWrapper({ children }: QueryWrapperProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 2,
            staleTime: 1000 * 60, // 1 minute
            gcTime: 1000 * 60 * 5, // 5 minutes
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {children}
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
