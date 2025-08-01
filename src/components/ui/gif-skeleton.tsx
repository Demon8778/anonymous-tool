"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GifSkeletonProps {
  className?: string;
  count?: number;
  animated?: boolean;
}

function SingleGifSkeleton({ animated = true }: { animated?: boolean }) {
  return (
    <Card className={cn("glass animate-scale-in", animated && "animate-pulse")}>
      <CardContent className="p-0">
        <div className="aspect-square w-full rounded-t-lg bg-gradient-to-br from-muted/50 to-muted/30 relative overflow-hidden">
          {animated && (
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          )}
        </div>
        <div className="p-3 space-y-2">
          <div className={cn(
            "h-4 w-3/4 bg-gradient-to-r from-muted/50 to-muted/30 rounded relative overflow-hidden",
            animated && "animate-pulse"
          )}>
            {animated && (
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            )}
          </div>
          <div className="flex justify-between">
            <div className={cn(
              "h-3 w-16 bg-gradient-to-r from-muted/50 to-muted/30 rounded relative overflow-hidden",
              animated && "animate-pulse"
            )}>
              {animated && (
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              )}
            </div>
            <div className={cn(
              "h-3 w-12 bg-gradient-to-r from-muted/50 to-muted/30 rounded relative overflow-hidden",
              animated && "animate-pulse"
            )}>
              {animated && (
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GifSkeleton({ className = "", count = 12, animated = true }: GifSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-responsive", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="animate-fade-in"
          style={{
            animationDelay: `${Math.min(index * 0.05, 1)}s`,
          }}
        >
          <SingleGifSkeleton animated={animated} />
        </div>
      ))}
    </div>
  );
}

export function GifLoadMoreSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`loading-more-${index}`}
          className="animate-fade-in"
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <SingleGifSkeleton />
        </div>
      ))}
    </>
  );
}

export default GifSkeleton;