"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateSearchQuery, sanitizeSearchQuery } from '@/lib/utils/validation';
import { GifErrorBoundary } from '@/components/error/GifErrorBoundary';
import { Badge } from '../ui/badge';

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

  useEffect(() => {
    const trimmed = initialQuery.trim();
    if (trimmed) {
      const validation = validateSearchQuery(trimmed);
      if (validation.isValid) {
        const sanitizedQuery = sanitizeSearchQuery(trimmed);
        onSearch(sanitizedQuery);
      } else {
        const errorMessage = validation.errors[0];
        setValidationError(errorMessage);
        onError?.(errorMessage);
      }
    }
  }, []);

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
      <Card className={`w-full max-w-2xl mx-auto bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border-border/20 shadow-xl ${className}`}>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Validation Error */}
            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationError}
                </AlertDescription>
              </Alert>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                className={`pl-10 pr-4 py-3 text-lg bg-background/80 border-border focus:border-primary focus:ring-primary rounded-lg transition-all duration-200 ${
                  validationError ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''
                }`}
                autoComplete="off"
                autoFocus
                maxLength={100}
              />
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || !query.trim() || !!validationError}
              className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
          
          {/* Enhanced Search tips */}
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Try searching for <strong className="text-foreground">emotions</strong>, <strong className="text-foreground">reactions</strong>, or <strong className="text-foreground">topics</strong>
              </p>
            </div>
            
            {/* Quick suggestions */}
            <div className="flex flex-wrap justify-center gap-2">
              {['happy', 'excited', 'funny', 'thumbs up', 'dancing'].map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 text-xs"
                  onClick={() => {
                    setValidationError(null);
                    const validation = validateSearchQuery(suggestion);
                    if (validation.isValid) {
                      const sanitizedQuery = sanitizeSearchQuery(suggestion);
                      setQuery(sanitizedQuery);
                      onSearch(sanitizedQuery);
                    } else {
                      const errorMessage = validation.errors[0];
                      setValidationError(errorMessage);
                      onError?.(errorMessage);
                    }
                  }}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </GifErrorBoundary>
  );
}

export default GifSearchForm;