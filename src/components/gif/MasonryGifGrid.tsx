"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Search, RefreshCw, Loader2, Grid, LayoutGrid } from 'lucide-react';
import { GifErrorBoundary } from '@/components/error/GifErrorBoundary';
import { MasonrySkeleton, MasonryLoadMoreSkeleton } from '@/components/ui/masonry-skeleton';
import { MasonryGifCard } from './MasonryGifCard';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useMasonryLayout } from '@/hooks/useMasonryLayout';
import { getUserMessage, getErrorSuggestions } from '@/lib/utils/errorHandler';
import { cn } from '@/lib/utils';
import type { Gif } from '@/lib/types/gif';
import type { MasonryItem } from '@/hooks/useMasonryLayout';

interface MasonryGifGridProps {
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

export function MasonryGifGrid({
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
  layoutMode = 'masonry',
  onLayoutModeChange
}: MasonryGifGridProps) {
  const [columnWidth, setColumnWidth] = useState(280);
  
  const handleGifError = useCallback((gif: Gif, gifError: Error) => {
    console.error('GIF error:', gifError, gif);
    onGifError?.(gif, gifError);
  }, [onGifError]);

  // Masonry layout hook
  const { columns, containerRef, recalculate } = useMasonryLayout(gifs, {
    columnWidth,
    gap: 16,
    minColumns: 2,
    maxColumns: 8
  });

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

  // Handle GIF selection
  const handleGifSelect = useCallback((item: MasonryItem) => {
    onGifSelect(item);
  }, [onGifSelect]);

  // Recalculate layout when gifs change
  useEffect(() => {
    if (gifs.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(recalculate, 100);
    }
  }, [gifs.length, recalculate]);

  // Update column width based on container size
  useEffect(() => {
    const updateColumnWidth = () => {
      if (containerRef && typeof containerRef === 'function') return;
      
      const container = document.querySelector('[data-masonry-container]') as HTMLElement;
      if (container) {
        const containerWidth = container.offsetWidth;
        const gap = 16;
        const minColumns = 2;
        const maxColumns = 8;
        
        const columnsFromWidth = Math.floor((containerWidth - gap) / (280 + gap));
        const actualColumns = Math.max(minColumns, Math.min(maxColumns, columnsFromWidth));
        const newColumnWidth = (containerWidth - (gap * (actualColumns - 1))) / actualColumns;
        
        setColumnWidth(Math.floor(newColumnWidth));
      }
    };

    updateColumnWidth();
    window.addEventListener('resize', updateColumnWidth);
    return () => window.removeEventListener('resize', updateColumnWidth);
  }, [containerRef]);

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
        <MasonrySkeleton count={12} columnWidth={columnWidth} />
      )}

      {/* Masonry GIF grid */}
      {gifs?.length > 0 && (
        <div 
          ref={containerRef}
          data-masonry-container
          className="flex gap-4"
        >
          {columns.map((column, columnIndex) => (
            <div 
              key={columnIndex} 
              className="flex-1 flex flex-col"
              style={{ minWidth: columnWidth }}
            >
              {column.items.map((item, itemIndex) => {
                const globalIndex = columns.slice(0, columnIndex).reduce((acc, col) => acc + col.items.length, 0) + itemIndex;
                const isLastItem = globalIndex === gifs.length - 1;
                
                return (
                  <div
                    key={item.id}
                    ref={enableInfiniteScroll && isLastItem ? lastElementRef : undefined}
                    className="animate-fade-in"
                    style={{
                      animationDelay: `${Math.min(globalIndex * 0.05, 1)}s`,
                    }}
                  >
                    <MasonryGifCard
                      item={item}
                      isSelected={selectedGifId === item.id}
                      onSelect={handleGifSelect}
                      onError={handleGifError}
                      columnWidth={columnWidth}
                    />
                  </div>
                );
              })}
              
              {/* Loading more skeletons distributed across columns */}
              {(isLoadingMore || isFetching) && columnIndex === 0 && (
                <MasonryLoadMoreSkeleton count={2} columnWidth={columnWidth} />
              )}
              {(isLoadingMore || isFetching) && columnIndex === 1 && (
                <MasonryLoadMoreSkeleton count={2} columnWidth={columnWidth} />
              )}
              {(isLoadingMore || isFetching) && columnIndex === 2 && (
                <MasonryLoadMoreSkeleton count={2} columnWidth={columnWidth} />
              )}
            </div>
          ))}
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

export default MasonryGifGrid;