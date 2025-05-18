"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface ErrorState {
  hasError: boolean;
  message: string | null;
  details: any;
}

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  logToService?: boolean;
}

/**
 * Custom hook for handling errors in a consistent way across the application
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    showToast = true,
    logToConsole = true,
    logToService = false,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    message: null,
    details: null,
  });

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    // Extract error message
    const errorMessage = customMessage || 
      (error instanceof Error ? error.message : 
      (typeof error === 'string' ? error : 'An unknown error occurred'));
    
    // Set error state
    setErrorState({
      hasError: true,
      message: errorMessage,
      details: error,
    });

    // Log to console if enabled
    if (logToConsole) {
      console.error('Error caught by useErrorHandler:', error);
    }

    // Show toast notification if enabled
    if (showToast) {
      toast.error(errorMessage);
    }

    // Log to error tracking service if enabled
    if (logToService) {
      // This would be where you'd integrate with an error tracking service like Sentry
      // Example: Sentry.captureException(error);
      console.log('Would log to error service:', error);
    }

    return error;
  }, [showToast, logToConsole, logToService]);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      message: null,
      details: null,
    });
  }, []);

  return {
    error: errorState,
    handleError,
    clearError,
  };
}
