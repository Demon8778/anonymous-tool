"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Play, Pause, Search, RefreshCw, Loader2, Grid, LayoutGrid } from 'lucide-react';
import { GifErrorBoundary } from '@/components/error/GifErrorBoundary';
import { GifSkeleton, GifLoadMoreSkeleton } from '@/components/ui/gif-skeleton';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { validateGif } from '@/lib/utils/validation';
import { getUserMessage, getErrorSuggestions } from '@/lib/utils/errorHandler';
import { cn } from '@/lib/utils';
import type { Gif } from '@/lib/types/gif';

interface GifGridProps {
  gifs: Gif[];
  onGifSelect: (gif: Gif) => void;
  selectedGifId?: string;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => Promise<void> | void;
  error?: string | Error;
  onRetry?: () => void;
  className?: string;
  onGifError?: (gif: Gif, error: Error) => void;
  enableInfiniteScroll?: boolean;
  layoutMode?: 'masonry' | 'grid';
  onLayoutModeChange?: (mode: 'masonry' | 'grid') => void;
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
  const [isLoading, setIsLoading] = useState(true);
  const [hasIntersected, setHasIntersected] = useState(false);

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
    setIsLoading(false);
    const error = new Error(`Failed to load GIF image: ${gif.url}`);
    onError?.(gif, error);
  }, [gif, onError]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const togglePlayback = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Intersection observer for lazy loading
  const observerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasIntersected]);

  return (
    <GifErrorBoundary type="display" onError={(error) => onError?.(gif, error)}>
      <Card 
        ref={observerRef}
        data-gif-id={gif.id}
        className={cn(
          "group cursor-pointer transition-all duration-300 hover-lift focus-ring touch-manipulation",
          isSelected 
            ? 'ring-2 ring-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 scale-105' 
            : 'hover:shadow-xl glass hover-glow'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleSelect}
      >
      <CardContent className="p-0 h-full relative overflow-hidden rounded-lg">
        {imageError ? (
          <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center animate-fade-in">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-medium">Failed to load</p>
              <p className="text-xs text-muted-foreground">Try again later</p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30">
              {/* Loading skeleton */}
              {(isLoading || !hasIntersected) && (
                <div className="absolute inset-0 loading-skeleton">
                  <div className="absolute inset-0 loading-shimmer" />
                </div>
              )}
              
              {hasIntersected && (
                <img
                  src={isPlaying ? gif.url : gif.preview}
                  alt={gif.title}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
                    isLoading && "opacity-0",
                    !isLoading && "opacity-100"
                  )}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  loading="lazy"
                />
              )}
              
              {/* Enhanced overlay controls */}
              {/* <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-center justify-center transition-all duration-300",
                isHovered ? 'opacity-100' : 'opacity-0'
              )}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="glass hover:bg-background/90 text-foreground shadow-lg hover-lift touch-target"
                  onClick={togglePlayback}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div> */}

              {/* Enhanced selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 animate-scale-in">
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg animate-pulse-gentle">
                    Selected
                  </Badge>
                </div>
              )}

              {/* Enhanced source badge */}
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="text-xs glass text-muted-foreground shadow-sm">
                  {gif.source.toUpperCase()}
                </Badge>
              </div>
              
              {/* Hover gradient overlay */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent transition-opacity duration-300",
                isHovered ? 'opacity-100' : 'opacity-0'
              )} />
            </div>

            {/* Enhanced GIF info */}
            <div className="p-3 space-y-2">
              <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors duration-200" title={gif.title}>
                {gif.title}
              </h3>
              {/* <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">{gif.width} × {gif.height}</span>
                {gif.duration && (
                  <span className="font-mono">{(gif.duration / 1000).toFixed(1)}s</span>
                )}
              </div> */}
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </GifErrorBoundary>
  );
}

// Intersection observer trigger component for infinite scroll
function InfiniteScrollTrigger({ onIntersect }: { onIntersect: () => void }) {
  const observerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    observer.observe(node);
    return () => observer.disconnect();
  }, [onIntersect]);

  return <div ref={observerRef} className="h-1" />;
}

export function GifGrid({
  gifs,
  onGifSelect,
  selectedGifId,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  error,
  onRetry,
  className = "",
  onGifError,
  enableInfiniteScroll = true,
  layoutMode = 'grid',
  onLayoutModeChange
}: GifGridProps) {
  const handleGifError = useCallback((gif: Gif, gifError: Error) => {
    console.error('GIF error:', gifError, gif);
    onGifError?.(gif, gifError);
  }, [onGifError]);

  // Infinite scroll hook
  const { isFetching, lastElementRef } = useInfiniteScroll(
    async () => {
      if (onLoadMore && hasMore && !isLoadingMore) {
        await onLoadMore();
      }
    },
    hasMore && enableInfiniteScroll,
    { enabled: enableInfiniteScroll && !!onLoadMore }
  );

  if (error) {
    const errorMessage = typeof error === 'string' ? error : getUserMessage(error);
    const suggestions = typeof error === 'string' ? [] : getErrorSuggestions(error);

    return (
      <div className={`w-full ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
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
    <div className={cn("w-full", className)}>
      {/* Layout Mode Toggle */}
      {onLayoutModeChange && (
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={layoutMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLayoutModeChange('grid')}
              className="h-8 px-3"
            >
              <Grid className="h-4 w-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={layoutMode === 'masonry' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLayoutModeChange('masonry')}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Masonry
            </Button>
          </div>
        </div>
      )}

      {/* Initial loading state */}
      {isLoading && gifs?.length === 0 && (
        <GifSkeleton count={12} />
      )}

      {/* GIF grid */}
      {gifs?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-responsive">
          {/* GIF cards with staggered animation */}
          {gifs.map((gif, index) => {
            const isLastItem = index === gifs.length - 1;
            
            return (
              <div
                key={gif.id}
                ref={enableInfiniteScroll && isLastItem ? lastElementRef : undefined}
              >
                <GifCard
                  gif={gif}
                  isSelected={selectedGifId === gif.id}
                  onSelect={onGifSelect}
                  onError={handleGifError}
                />
              </div>
            );
          })}

          {/* Loading more skeletons */}
          {(isLoadingMore || isFetching) && (
            <GifLoadMoreSkeleton count={6} />
          )}
        </div>
      )}

      {/* Load more button (fallback for when infinite scroll is disabled) */}
      {!enableInfiniteScroll && hasMore && !isLoadingMore && gifs?.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            size="lg"
            className="hover-lift"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more...
              </>
            ) : (
              'Load More GIFs'
            )}
          </Button>
        </div>
      )}

      {/* Enhanced empty state */}
      {!isLoading && gifs?.length === 0 && !error && (
        <div className="text-center py-16 animate-fade-in">
          <div className="mb-6">
            <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full mb-4 animate-float">
              <Search className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-responsive-lg font-bold text-foreground mb-2">No GIFs found</h3>
            <p className="text-responsive-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Try searching with different keywords or check your spelling
            </p>
          </div>
          
          {/* Suggested search terms */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['happy', 'excited', 'thumbs up', 'dancing', 'celebration', 'funny'].map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover-lift"
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GifGrid;