"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Play, Pause, Search, RefreshCw } from 'lucide-react';
import { GifErrorBoundary } from '@/components/error/GifErrorBoundary';
import { validateGif } from '@/lib/utils/validation';
import { getUserMessage, getErrorSuggestions } from '@/lib/utils/errorHandler';
import type { Gif } from '@/lib/types/gif';

interface GifGridProps {
  gifs: Gif[];
  onGifSelect: (gif: Gif) => void;
  selectedGifId?: string;
  isLoading?: boolean;
  error?: string | Error;
  onRetry?: () => void;
  className?: string;
  onGifError?: (gif: Gif, error: Error) => void;
}

interface GifCardProps {
  gif: Gif;
  isSelected: boolean;
  onSelect: (gif: Gif) => void;
  onError?: (gif: Gif, error: Error) => void;
}

function GifCard({ gif, isSelected, onSelect, onError }: GifCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleSelect = useCallback(() => {
    // Validate GIF before selection
    const validation = validateGif(gif);
    if (!validation.isValid) {
      const error = new Error(validation.errors[0]);
      onError?.(gif, error);
      return;
    }
    
    onSelect(gif);
  }, [gif, onSelect, onError]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    const error = new Error(`Failed to load GIF image: ${gif.url}`);
    onError?.(gif, error);
  }, [gif, onError]);

  const togglePlayback = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  return (
    <GifErrorBoundary type="display" onError={(error) => onError?.(gif, error)}>
      <Card 
        className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
          isSelected 
            ? 'ring-2 ring-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50' 
            : 'hover:shadow-lg bg-white/90 backdrop-blur-sm'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleSelect}
      >
      <CardContent className="p-0 relative overflow-hidden rounded-lg">
        {imageError ? (
          <div className="aspect-square bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Failed to load</p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative aspect-square overflow-hidden">
              <img
                src={isPlaying ? gif.url : gif.preview}
                alt={gif.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={handleImageError}
                loading="lazy"
              />
              
              {/* Overlay controls */}
              <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white text-gray-800"
                  onClick={togglePlayback}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-blue-500 text-white">
                    Selected
                  </Badge>
                </div>
              )}

              {/* Source badge */}
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="text-xs bg-white/80 text-gray-700">
                  {gif.source.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* GIF info */}
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-900 truncate" title={gif.title}>
                {gif.title}
              </h3>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                <span>{gif.width} × {gif.height}</span>
                {gif.duration && (
                  <span>{(gif.duration / 1000).toFixed(1)}s</span>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </GifErrorBoundary>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardContent className="p-0">
        <Skeleton className="aspect-square w-full rounded-t-lg" />
        <div className="p-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GifGrid({
  gifs,
  onGifSelect,
  selectedGifId,
  isLoading = false,
  error,
  onRetry,
  className = "",
  onGifError
}: GifGridProps) {
  const handleGifError = useCallback((gif: Gif, gifError: Error) => {
    console.error('GIF error:', gifError, gif);
    onGifError?.(gif, gifError);
  }, [onGifError]);

  if (error) {
    const errorMessage = typeof error === 'string' ? error : getUserMessage(error);
    const suggestions = typeof error === 'string' ? [] : getErrorSuggestions(error);

    return (
      <div className={`w-full ${className}`}>
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <p>{errorMessage}</p>
              {suggestions.length > 0 && (
                <div className="text-sm">
                  <p className="font-medium">Suggestions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="mt-2 h-8 text-xs"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Try Again
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {/* Loading skeletons */}
        {isLoading && gifs.length === 0 && (
          <>
            {Array.from({ length: 12 }).map((_, index) => (
              <LoadingSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        )}

        {/* GIF cards */}
        {gifs.map((gif) => (
          <GifCard
            key={gif.id}
            gif={gif}
            isSelected={selectedGifId === gif.id}
            onSelect={onGifSelect}
            onError={handleGifError}
          />
        ))}

        {/* Additional loading skeletons when loading more */}
        {isLoading && gifs.length > 0 && (
          <>
            {Array.from({ length: 6 }).map((_, index) => (
              <LoadingSkeleton key={`loading-more-${index}`} />
            ))}
          </>
        )}
      </div>

      {/* Empty state */}
      {!isLoading && gifs.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No GIFs found</h3>
          <p className="text-gray-600">Try searching with different keywords</p>
        </div>
      )}
    </div>
  );
}

export default GifGrid;