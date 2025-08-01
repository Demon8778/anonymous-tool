"use client";

import React, { useState, useCallback } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateSearchQuery, sanitizeSearchQuery } from '@/lib/utils/validation';
import { GifErrorBoundary } from '@/components/error/GifErrorBoundary';

interface GifSearchFormProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  initialQuery?: string;
  className?: string;
  onError?: (error: string) => void;
}

export function GifSearchForm({
  onSearch,
  isLoading = false,
  placeholder = "Search for GIFs...",
  initialQuery = "",
  className = "",
  onError
}: GifSearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading) return;

    // Validate query
    const validation = validateSearchQuery(trimmedQuery);
    if (!validation.isValid) {
      const errorMessage = validation.errors[0];
      setValidationError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    // Sanitize and submit
    const sanitizedQuery = sanitizeSearchQuery(trimmedQuery);
    onSearch(sanitizedQuery);
  }, [query, onSearch, isLoading, onError]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  }, [validationError]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as any);
    }
  }, [handleSubmit, isLoading]);

  return (
    <GifErrorBoundary type="search">
      <Card className={`w-full max-w-2xl mx-auto bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border-white/20 shadow-xl ${className}`}>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Validation Error */}
            {validationError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {validationError}
                </AlertDescription>
              </Alert>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                className={`pl-10 pr-4 py-3 text-lg bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200 ${
                  validationError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                autoComplete="off"
                autoFocus
                maxLength={100}
              />
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || !query.trim() || !!validationError}
              className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Search GIFs
                </>
              )}
            </Button>
          </form>
          
          {/* Search tips */}
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>Try searching for emotions, reactions, or specific topics</p>
          </div>
        </CardContent>
      </Card>
    </GifErrorBoundary>
  );
}

export default GifSearchForm;