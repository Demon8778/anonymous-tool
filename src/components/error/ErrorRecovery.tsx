"use client";

import React, { useState, useCallback } from 'react';
import { RefreshCw, Home, Bug, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { ErrorReport } from '@/lib/utils/errorHandler';

interface ErrorRecoveryProps {
  error: ErrorReport;
  onRetry?: () => Promise<void> | void;
  onDismiss?: () => void;
  showDetails?: boolean;
  maxRetries?: number;
  className?: string;
}

interface RecoveryState {
  isRetrying: boolean;
  retryCount: number;
  retryProgress: number;
  lastRetryTime: Date | null;
}

export function ErrorRecovery({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  maxRetries = 3,
  className = ""
}: ErrorRecoveryProps) {
  const { toast } = useToast();
  const [recoveryState, setRecoveryState] = useState<RecoveryState>({
    isRetrying: false,
    retryCount: 0,
    retryProgress: 0,
    lastRetryTime: null,
  });

  const canRetry = error.retryable && onRetry && recoveryState.retryCount < maxRetries;
  const remainingRetries = maxRetries - recoveryState.retryCount;

  const handleRetry = useCallback(async () => {
    if (!canRetry || !onRetry) return;

    setRecoveryState(prev => ({
      ...prev,
      isRetrying: true,
      retryProgress: 0,
    }));

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Simulate progress for better UX
      progressInterval = setInterval(() => {
        setRecoveryState(prev => ({
          ...prev,
          retryProgress: Math.min(prev.retryProgress + 10, 90),
        }));
      }, 100);

      await onRetry();

      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      setRecoveryState(prev => ({
        ...prev,
        isRetrying: false,
        retryProgress: 100,
        retryCount: prev.retryCount + 1,
        lastRetryTime: new Date(),
      }));

      toast({
        title: "Success",
        description: "Operation completed successfully",
        variant: "default",
      });

      // Auto-dismiss after successful retry
      setTimeout(() => {
        onDismiss?.();
      }, 2000);

    } catch (retryError) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      setRecoveryState(prev => ({
        ...prev,
        isRetrying: false,
        retryProgress: 0,
        retryCount: prev.retryCount + 1,
        lastRetryTime: new Date(),
      }));

      toast({
        title: "Retry Failed",
        description: `Retry failed. ${remainingRetries - 1} attempts remaining.`,
        variant: "destructive",
      });
    }
  }, [canRetry, onRetry, toast, onDismiss, remainingRetries]);

  const handleReportBug = useCallback(() => {
    // In a real application, this would open a bug report form or send to support
    const bugReport = {
      errorId: error.id,
      type: error.type,
      message: error.message,
      context: error.context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // For now, copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2));
    
    toast({
      title: "Bug Report Copied",
      description: "Error details have been copied to your clipboard. Please share with support.",
      variant: "default",
    });
  }, [error, toast]);

  const getErrorIcon = () => {
    if (recoveryState.retryProgress === 100) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    }
    if (recoveryState.isRetrying) {
      return <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />;
    }
    return <AlertTriangle className="h-6 w-6 text-red-600" />;
  };

  const getErrorSeverityColor = () => {
    if (!error.recoverable) return 'bg-red-100 border-red-300';
    if (error.retryable) return 'bg-yellow-100 border-yellow-300';
    return 'bg-orange-100 border-orange-300';
  };

  return (
    <Card className={`${getErrorSeverityColor()} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getErrorIcon()}
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {recoveryState.retryProgress === 100 ? 'Recovered' : 'Error Occurred'}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={error.recoverable ? 'secondary' : 'destructive'}>
                  {error.type.replace('_', ' ').toUpperCase()}
                </Badge>
                {error.retryable && (
                  <Badge variant="outline">
                    Retryable
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Message */}
        <Alert className="bg-white/50">
          <AlertDescription>
            {error.userMessage}
          </AlertDescription>
        </Alert>

        {/* Retry Progress */}
        {recoveryState.isRetrying && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Retrying...</span>
              <span>{recoveryState.retryProgress}%</span>
            </div>
            <Progress value={recoveryState.retryProgress} className="h-2" />
          </div>
        )}

        {/* Suggestions */}
        {error.suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Suggestions:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {error.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Last Retry Info */}
        {recoveryState.lastRetryTime && (
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            Last retry: {recoveryState.lastRetryTime.toLocaleTimeString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {canRetry && (
            <Button
              onClick={handleRetry}
              disabled={recoveryState.isRetrying}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${recoveryState.isRetrying ? 'animate-spin' : ''}`} />
              Retry ({remainingRetries} left)
            </Button>
          )}

          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="border-gray-300"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Page
          </Button>

          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="sm"
            className="border-gray-300"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>

          <Button
            onClick={handleReportBug}
            variant="outline"
            size="sm"
            className="border-gray-300"
          >
            <Bug className="mr-2 h-4 w-4" />
            Report Bug
          </Button>
        </div>

        {/* Technical Details */}
        {showDetails && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              Technical Details
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
              <div className="space-y-1">
                <div><strong>Error ID:</strong> {error.id}</div>
                <div><strong>Type:</strong> {error.type}</div>
                <div><strong>Technical Message:</strong> {error.technicalMessage}</div>
                {error.context && (
                  <div><strong>Context:</strong> {JSON.stringify(error.context, null, 2)}</div>
                )}
                {error.originalError && (
                  <div><strong>Stack Trace:</strong>
                    <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                      {error.originalError.stack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

export default ErrorRecovery;