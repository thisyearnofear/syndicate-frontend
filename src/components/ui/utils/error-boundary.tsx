"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/inputs/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/data-display/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors in child components
 * and display a fallback UI instead of crashing the whole app
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="w-full max-w-md mx-auto my-8 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              An error occurred in this component. Please try again or contact
              support if the issue persists.
            </p>
            {this.state.error && (
              <div className="bg-muted p-3 rounded text-xs overflow-auto max-h-32">
                <p className="font-mono">{this.state.error.toString()}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={this.resetError} variant="outline">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}
