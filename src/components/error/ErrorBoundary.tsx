"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to monitoring service (in production)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to an error monitoring service
    // like Sentry, LogRocket, or Bugsnag
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component',
    };

    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Report:', errorReport);
    }

    // TODO: Send to error monitoring service
    // errorMonitoringService.captureException(error, errorReport);
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
      });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private renderErrorDetails = () => {
    const { error, errorInfo } = this.state;
    const { showDetails = process.env.NODE_ENV === 'development' } = this.props;

    if (!showDetails || !error) return null;

    return (
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
          Technical Details
        </summary>
        <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm font-mono">
          <div className="mb-2">
            <strong>Error:</strong> {error.message}
          </div>
          {error.stack && (
            <div className="mb-2">
              <strong>Stack Trace:</strong>
              <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                {error.stack}
              </pre>
            </div>
          )}
          {errorInfo?.componentStack && (
            <div>
              <strong>Component Stack:</strong>
              <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                {errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      </details>
    );
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component' } = this.props;
      const canRetry = this.retryCount < this.maxRetries;

      // Critical errors get full page treatment
      if (level === 'critical' || level === 'page') {
        return (
          <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm border-red-200 shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Something went wrong
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">
                    We encountered an unexpected error. Our team has been notified.
                  </p>
                  <p className="text-sm text-gray-500">
                    Error ID: <code className="bg-gray-100 px-2 py-1 rounded">{this.state.errorId}</code>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {canRetry && (
                    <Button
                      onClick={this.handleRetry}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again ({this.maxRetries - this.retryCount} left)
                    </Button>
                  )}
                  <Button
                    onClick={this.handleReload}
                    variant="outline"
                    className="border-gray-300"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload Page
                  </Button>
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="border-gray-300"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Button>
                </div>

                {this.renderErrorDetails()}
              </CardContent>
            </Card>
          </div>
        );
      }

      // Component-level errors get inline treatment
      return (
        <Alert className="bg-red-50 border-red-200 my-4">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Component Error</p>
                <p className="text-sm mt-1">
                  This component encountered an error and couldn't render properly.
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                {canRetry && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={this.handleRetry}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Retry
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <Bug className="mr-1 h-3 w-3" />
                  Report
                </Button>
              </div>
            </div>
            {this.renderErrorDetails()}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default ErrorBoundary;