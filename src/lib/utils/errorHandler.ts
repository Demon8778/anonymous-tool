/**
 * Centralized error handling utilities
 */

import type { ApiError, ProcessingError } from '../types/api';

export type ErrorType = 
  | 'api_error'
  | 'network_error'
  | 'validation_error'
  | 'processing_error'
  | 'memory_error'
  | 'format_error'
  | 'timeout_error'
  | 'unknown_error';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  type: ErrorType;
  message: string;
  originalError?: Error;
  context?: ErrorContext;
  recoverable: boolean;
  retryable: boolean;
  userMessage: string;
  technicalMessage: string;
  suggestions: string[];
}

/**
 * Main error handler class
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorReports: Map<string, ErrorReport> = new Map();

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle any error and convert it to a standardized format
   */
  handleError(error: unknown, context?: ErrorContext): ErrorReport {
    const errorId = this.generateErrorId();
    const errorReport = this.createErrorReport(error, errorId, context);
    
    // Store error report
    this.errorReports.set(errorId, errorReport);
    
    // Log error
    this.logError(errorReport);
    
    // Report to monitoring service (in production)
    this.reportToMonitoring(errorReport);
    
    return errorReport;
  }

  /**
   * Handle API errors specifically
   */
  handleApiError(error: unknown, context?: ErrorContext): ApiError {
    const errorReport = this.handleError(error, { ...context, component: 'API' });
    
    return {
      type: errorReport.type as ApiError['type'],
      message: errorReport.userMessage,
      recoverable: errorReport.recoverable,
      retryable: errorReport.retryable,
    };
  }

  /**
   * Handle processing errors specifically
   */
  handleProcessingError(error: unknown, context?: ErrorContext): ProcessingError {
    const errorReport = this.handleError(error, { ...context, component: 'Processing' });
    
    return {
      type: errorReport.type as ProcessingError['type'],
      message: errorReport.userMessage,
      recoverable: errorReport.recoverable,
      retryable: errorReport.retryable,
    };
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: unknown): string {
    const errorReport = this.createErrorReport(error, 'temp', {});
    return errorReport.userMessage;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: unknown): boolean {
    const errorReport = this.createErrorReport(error, 'temp', {});
    return errorReport.retryable;
  }

  /**
   * Check if error is recoverable
   */
  isRecoverable(error: unknown): boolean {
    const errorReport = this.createErrorReport(error, 'temp', {});
    return errorReport.recoverable;
  }

  /**
   * Get error suggestions
   */
  getErrorSuggestions(error: unknown): string[] {
    const errorReport = this.createErrorReport(error, 'temp', {});
    return errorReport.suggestions;
  }

  /**
   * Get error report by ID
   */
  getErrorReport(errorId: string): ErrorReport | undefined {
    return this.errorReports.get(errorId);
  }

  /**
   * Clear old error reports (cleanup)
   */
  clearOldReports(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [id, report] of this.errorReports.entries()) {
      if (report.context?.timestamp && now - report.context.timestamp.getTime() > maxAge) {
        this.errorReports.delete(id);
      }
    }
  }

  // Private methods

  private createErrorReport(error: unknown, errorId: string, context?: ErrorContext): ErrorReport {
    const timestamp = new Date();
    const errorType = this.determineErrorType(error);
    const originalError = error instanceof Error ? error : undefined;
    
    const baseReport: ErrorReport = {
      id: errorId,
      type: errorType,
      message: this.extractErrorMessage(error),
      originalError,
      context: { ...context, timestamp },
      recoverable: false,
      retryable: false,
      userMessage: '',
      technicalMessage: '',
      suggestions: [],
    };

    // Customize based on error type
    return this.customizeErrorReport(baseReport, error);
  }

  private determineErrorType(error: unknown): ErrorType {
    if (error && typeof error === 'object') {
      // Check if it's already a typed error
      if ('type' in error) {
        return (error as any).type;
      }

      // Check for specific error patterns
      if (error instanceof TypeError) {
        return 'validation_error';
      }

      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('network') || message.includes('fetch')) {
          return 'network_error';
        }
        if (message.includes('timeout')) {
          return 'timeout_error';
        }
        if (message.includes('memory') || message.includes('out of memory')) {
          return 'memory_error';
        }
        if (message.includes('format') || message.includes('invalid')) {
          return 'format_error';
        }
        if (message.includes('processing') || message.includes('ffmpeg')) {
          return 'processing_error';
        }
      }
    }

    return 'unknown_error';
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as any).message);
    }
    return 'An unknown error occurred';
  }

  private customizeErrorReport(report: ErrorReport, error: unknown): ErrorReport {
    switch (report.type) {
      case 'network_error':
        return {
          ...report,
          recoverable: true,
          retryable: true,
          userMessage: 'Network connection issue. Please check your internet connection and try again.',
          technicalMessage: `Network error: ${report.message}`,
          suggestions: [
            'Check your internet connection',
            'Try again in a few moments',
            'Refresh the page if the problem persists'
          ]
        };

      case 'timeout_error':
        return {
          ...report,
          recoverable: true,
          retryable: true,
          userMessage: 'The request timed out. This might be due to a slow connection or server issues.',
          technicalMessage: `Timeout error: ${report.message}`,
          suggestions: [
            'Try again with a smaller file',
            'Check your internet connection',
            'Wait a moment and retry'
          ]
        };

      case 'validation_error':
        return {
          ...report,
          recoverable: true,
          retryable: false,
          userMessage: 'Invalid input provided. Please check your data and try again.',
          technicalMessage: `Validation error: ${report.message}`,
          suggestions: [
            'Check that all required fields are filled',
            'Ensure data is in the correct format',
            'Remove any special characters if not allowed'
          ]
        };

      case 'processing_error':
        return {
          ...report,
          recoverable: true,
          retryable: true,
          userMessage: 'Failed to process the GIF. This might be due to file size or format issues.',
          technicalMessage: `Processing error: ${report.message}`,
          suggestions: [
            'Try with a smaller GIF file',
            'Ensure the GIF is not corrupted',
            'Reduce the number of text overlays'
          ]
        };

      case 'memory_error':
        return {
          ...report,
          recoverable: true,
          retryable: true,
          userMessage: 'Not enough memory to complete this operation. Try with a smaller file.',
          technicalMessage: `Memory error: ${report.message}`,
          suggestions: [
            'Use a smaller GIF file',
            'Close other browser tabs',
            'Try again after refreshing the page'
          ]
        };

      case 'format_error':
        return {
          ...report,
          recoverable: false,
          retryable: false,
          userMessage: 'Unsupported file format or corrupted file.',
          technicalMessage: `Format error: ${report.message}`,
          suggestions: [
            'Ensure the file is a valid GIF',
            'Try with a different GIF file',
            'Check if the file is corrupted'
          ]
        };

      case 'api_error':
        return {
          ...report,
          recoverable: true,
          retryable: true,
          userMessage: 'Service temporarily unavailable. Please try again later.',
          technicalMessage: `API error: ${report.message}`,
          suggestions: [
            'Try again in a few moments',
            'Check if the service is down',
            'Contact support if the issue persists'
          ]
        };

      default:
        return {
          ...report,
          recoverable: false,
          retryable: true,
          userMessage: 'An unexpected error occurred. Please try again or contact support.',
          technicalMessage: `Unknown error: ${report.message}`,
          suggestions: [
            'Try refreshing the page',
            'Clear your browser cache',
            'Contact support if the issue persists'
          ]
        };
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(report: ErrorReport): void {
    const logLevel = report.recoverable ? 'warn' : 'error';
    
    console[logLevel]('Error Report:', {
      id: report.id,
      type: report.type,
      message: report.userMessage,
      technical: report.technicalMessage,
      context: report.context,
      recoverable: report.recoverable,
      retryable: report.retryable,
      originalError: report.originalError,
    });
  }

  private reportToMonitoring(report: ErrorReport): void {
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement actual error reporting
      // Example: Sentry, LogRocket, Bugsnag, etc.
      /*
      errorMonitoringService.captureException(report.originalError || new Error(report.message), {
        tags: {
          errorType: report.type,
          component: report.context?.component,
          recoverable: report.recoverable,
          retryable: report.retryable,
        },
        extra: {
          errorId: report.id,
          context: report.context,
          suggestions: report.suggestions,
        },
      });
      */
    }
  }
}

// Singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleError = (error: unknown, context?: ErrorContext) => 
  errorHandler.handleError(error, context);

export const handleApiError = (error: unknown, context?: ErrorContext) => 
  errorHandler.handleApiError(error, context);

export const handleProcessingError = (error: unknown, context?: ErrorContext) => 
  errorHandler.handleProcessingError(error, context);

export const getUserMessage = (error: unknown) => 
  errorHandler.getUserMessage(error);

export const isRetryable = (error: unknown) => 
  errorHandler.isRetryable(error);

export const isRecoverable = (error: unknown) => 
  errorHandler.isRecoverable(error);

export const getErrorSuggestions = (error: unknown) => 
  errorHandler.getErrorSuggestions(error);