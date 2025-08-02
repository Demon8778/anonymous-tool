"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Play, Pause } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GifErrorBoundary } from '@/components/error/GifErrorBoundary';
import { validateGif } from '@/lib/utils/validation';
import { cn } from '@/lib/utils';
import type { MasonryItem } from '@/hooks/useMasonryLayout';

interface MasonryGifCardProps {
  item: MasonryItem;
  isSelected: boolean;
  onSelect: (gif: MasonryItem) => void;
  onError?: (gif: MasonryItem, error: Error) => void;
  columnWidth: number;
}

export function MasonryGifCard({ 
  item, 
  isSelected, 
  onSelect, 
  onError,
  columnWidth 
}: MasonryGifCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasIntersected, setHasIntersected] = useState(false);

  const handleSelect = useCallback(() => {
    // Validate GIF before selection
    const validation = validateGif(item);
    if (!validation.isValid) {
      const error = new Error(validation.errors[0]);
      onError?.(item, error);
      return;
    }
    
    onSelect(item);
  }, [item, onSelect, onError]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
    const error = new Error(`Failed to load GIF image: ${item.url}`);
    onError?.(item, error);
  }, [item, onError]);

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

  // Calculate image dimensions
  const imageHeight = columnWidth / item.aspectRatio;

  return (
    <GifErrorBoundary type="display" onError={(error) => onError?.(item, error)}>
      <Card 
        ref={observerRef}
        data-gif-id={item.id}
        className={cn(
          "group cursor-pointer transition-all duration-300 hover-lift focus-ring touch-manipulation mb-2 sm:mb-3 md:mb-4 break-inside-avoid overflow-hidden p-0",
          isSelected 
            ? 'ring-2 ring-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 scale-105' 
            : 'hover:shadow-xl glass hover-glow'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleSelect}
        style={{ width: columnWidth }}
      >
        <div className="relative overflow-hidden">
          {imageError ? (
            <div 
              className="bg-muted/20 flex items-center justify-center animate-fade-in"
              style={{ height: imageHeight }}
            >
              <div className="text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                <p className="text-sm font-medium">Failed to load</p>
                <p className="text-xs text-muted-foreground">Try again later</p>
              </div>
            </div>
          ) : (
            <>
              <div 
                className="relative overflow-hidden"
                style={{ height: imageHeight }}
              >
                {/* Loading skeleton */}
                {(isLoading || !hasIntersected) && (
                  <div className="absolute inset-0 loading-skeleton bg-muted/20">
                    <div className="absolute inset-0 loading-shimmer" />
                  </div>
                )}
                
                {hasIntersected && (
                  <img
                    src={isPlaying ? item.url : item.preview}
                    alt={item.title}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
                      isLoading && "opacity-0",
                      !isLoading && "opacity-100"
                    )}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    loading="lazy"
                  />
                )}
                
                {/* Enhanced overlay controls */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-center justify-center transition-all duration-300",
                  isHovered ? 'opacity-100' : 'opacity-0'
                )}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="glass hover:bg-background/90 text-foreground shadow-lg hover-lift touch-target"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to gif-editor with the GIF URL
                      router.push(`/gif-editor?gif=${encodeURIComponent(item.url)}`);
                    }}
                  >
                    Edit GIF
                  </Button>
                </div>

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
                  <Badge variant="secondary" className="text-xs glass shadow-sm">
                    {item.source.toUpperCase()}
                  </Badge>
                </div>
                
                {/* Hover gradient overlay */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent transition-opacity duration-300",
                  isHovered ? 'opacity-100' : 'opacity-0'
                )} />
              </div>

              {/* Enhanced GIF info */}
              <div className="p-2 sm:p-3">
                <h3 className="text-sm font-semibold text-foreground dark:text-foreground truncate group-hover:text-primary transition-colors duration-200" title={item.title}>
                  {item.title}
                </h3>
              </div>
            </>
          )}
        </div>
      </Card>
    </GifErrorBoundary>
  );
}

export default MasonryGifCard;