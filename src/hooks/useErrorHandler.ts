"use client";

import { useState, useCallback, useRef } from 'react';
import { errorHandler, type ErrorContext, type ErrorReport } from '@/lib/utils/errorHandler';
import { useToast } from '@/hooks/use-toast';

export interface UseErrorHandlerOptions {
  showToast?: boolean;
  logErrors?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: ErrorReport) => void;
}

export interface ErrorState {
  error: ErrorReport | null;
  isRetrying: boolean;
  retryCount: number;
  canRetry: boolean;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    showToast = true,
    logErrors = true,
    maxRetries = 3,
    retryDelay = 1000,
    onError,
  } = options;

  const { toast } = useToast();
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    canRetry: false,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleError = useCallback((
    error: unknown,
    context?: ErrorContext,
    retryFn?: () => Promise<void> | void
  ) => {
    const errorReport = errorHandler.handleError(error, context);
    
    const newErrorState: ErrorState = {
      error: errorReport,
      isRetrying: false,
      retryCount: 0,
      canRetry: errorReport.retryable && !!retryFn,
    };

    setErrorState(newErrorState);

    // Show toast notification
    if (showToast) {
      toast({
        title: "Error",
        description: errorReport.userMessage,
        variant: "destructive",
      });
    }

    // Call custom error handler
    if (onError) {
      onError(errorReport);
    }

    return errorReport;
  }, [showToast, toast, onError]);

  const retry = useCallback(async (retryFn: () => Promise<void> | void) => {
    if (!errorState.canRetry || errorState.retryCount >= maxRetries) {
      return;
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
    }));

    try {
      // Add delay before retry
      if (retryDelay > 0) {
        await new Promise(resolve => {
          retryTimeoutRef.current = setTimeout(resolve, retryDelay * Math.pow(2, errorState.retryCount));
        });
      }

      await retryFn();

      // Success - clear error state
      setErrorState({
        error: null,
        isRetrying: false,
        retryCount: 0,
        canRetry: false,
      });

      if (showToast) {
        toast({
          title: "Success",
          description: "Operation completed successfully",
          variant: "default",
        });
      }
    } catch (error) {
      const newRetryCount = errorState.retryCount + 1;
      const errorReport = errorHandler.handleError(error);

      setErrorState(prev => ({
        ...prev,
        error: errorReport,
        isRetrying: false,
        retryCount: newRetryCount,
        canRetry: errorReport.retryable && newRetryCount < maxRetries,
      }));

      if (showToast) {
        toast({
          title: "Retry Failed",
          description: `${errorReport.userMessage} (${maxRetries - newRetryCount} attempts remaining)`,
          variant: "destructive",
        });
      }
    }
  }, [errorState, maxRetries, retryDelay, showToast, toast]);

  const clearError = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      canRetry: false,
    });
  }, []);

  const getErrorMessage = useCallback(() => {
    return errorState.error?.userMessage || null;
  }, [errorState.error]);

  const getErrorSuggestions = useCallback(() => {
    return errorState.error?.suggestions || [];
  }, [errorState.error]);

  return {
    // State
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    canRetry: errorState.canRetry,
    hasError: !!errorState.error,

    // Actions
    handleError,
    retry,
    clearError,

    // Helpers
    getErrorMessage,
    getErrorSuggestions,
  };
}

// Hook for handling async operations with error handling
export function useAsyncOperation<T = any>(options: UseErrorHandlerOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const errorHandler = useErrorHandler(options);

  const execute = useCallback(async (
    operation: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T | null> => {
    setIsLoading(true);
    errorHandler.clearError();

    try {
      const result = await operation();
      setData(result);
      return result;
    } catch (error) {
      errorHandler.handleError(error, context, async () => {
        await execute(operation, context);
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [errorHandler]);

  const retry = useCallback(() => {
    if (errorHandler.canRetry) {
      // The retry function is already set up in the error handler
      // This is just a convenience method
      return errorHandler.retry(() => {});
    }
  }, [errorHandler]);

  return {
    // State
    isLoading,
    data,
    ...errorHandler,

    // Actions
    execute,
    retry,
  };
}

export default useErrorHandler;