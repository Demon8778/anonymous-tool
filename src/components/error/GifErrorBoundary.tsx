"use client";

import React from 'react';
import { Image, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ErrorBoundary } from './ErrorBoundary';

interface GifErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  type?: 'search' | 'processing' | 'display' | 'general';
}

function GifErrorFallback({ error, resetError, type = 'general' }: GifErrorFallbackProps) {
  const getErrorContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: <Search className="h-8 w-8 text-blue-500" />,
          title: 'Search Error',
          message: 'Unable to search for GIFs right now. This might be a temporary issue with our search service.',
          suggestions: [
            'Check your internet connection',
            'Try a different search term',
            'Wait a moment and try again'
          ]
        };
      
      case 'processing':
        return {
          icon: <Image className="h-8 w-8 text-purple-500" />,
          title: 'Processing Error',
          message: 'We couldn\'t process your GIF. This might be due to the file size or format.',
          suggestions: [
            'Try with a smaller GIF',
            'Check if the GIF is corrupted',
            'Reduce the number of text overlays'
          ]
        };
      
      case 'display':
        return {
          icon: <Image className="h-8 w-8 text-green-500" />,
          title: 'Display Error',
          message: 'This GIF couldn\'t be displayed properly.',
          suggestions: [
            'The GIF might be corrupted',
            'Try refreshing the page',
            'Select a different GIF'
          ]
        };
      
      default:
        return {
          icon: <Image className="h-8 w-8 text-gray-500" />,
          title: 'GIF Error',
          message: 'Something went wrong with the GIF functionality.',
          suggestions: [
            'Try refreshing the page',
            'Check your internet connection',
            'Contact support if the issue persists'
          ]
        };
    }
  };

  const { icon, title, message, suggestions } = getErrorContent();

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm border-orange-200">
      <CardContent className="p-6 text-center">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{message}</p>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Try these solutions:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center justify-center">
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 justify-center">
          {resetError && (
            <Button
              onClick={resetError}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-gray-300"
          >
            Refresh Page
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

interface GifErrorBoundaryProps {
  children: React.ReactNode;
  type?: 'search' | 'processing' | 'display' | 'general';
  onError?: (error: Error) => void;
}

export function GifErrorBoundary({ children, type = 'general', onError }: GifErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="component"
      onError={(error, errorInfo) => {
        console.error(`GIF ${type} error:`, error, errorInfo);
        onError?.(error);
      }}
      fallback={
        <GifErrorFallback type={type} />
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default GifErrorBoundary;