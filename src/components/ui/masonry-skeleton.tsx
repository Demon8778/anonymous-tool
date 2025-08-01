"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MasonrySkeletonProps {
  className?: string;
  count?: number;
  animated?: boolean;
  columnWidth?: number;
}

function SingleMasonrySkeleton({ 
  animated = true, 
  height,
  columnWidth = 280 
}: { 
  animated?: boolean; 
  height: number;
  columnWidth?: number;
}) {
  return (
    <Card 
      className={cn("glass animate-scale-in mb-4 break-inside-avoid", animated && "animate-pulse")}
      style={{ width: columnWidth }}
    >
      <CardContent className="p-0">
        <div 
          className="w-full rounded-t-lg bg-gradient-to-br from-muted/50 to-muted/30 relative overflow-hidden"
          style={{ height: height - 60 }} // Subtract padding for title area
        >
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

// Generate random heights for skeleton items to simulate masonry layout
const generateSkeletonHeights = (count: number, columnWidth: number): number[] => {
  const aspectRatios = [
    1.0,    // Square
    1.33,   // 4:3
    1.77,   // 16:9
    0.75,   // 3:4 (portrait)
    1.5,    // 3:2
    0.67,   // 2:3 (portrait)
    2.0,    // Wide
    0.5,    // Very tall
  ];

  return Array.from({ length: count }, () => {
    const aspectRatio = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
    const imageHeight = columnWidth / aspectRatio;
    return Math.round(imageHeight + 60); // Add padding for title and info
  });
};

export function MasonrySkeleton({ 
  className = "", 
  count = 12, 
  animated = true,
  columnWidth = 280 
}: MasonrySkeletonProps) {
  const heights = generateSkeletonHeights(count, columnWidth);

  return (
    <div className={cn("columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-7 gap-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`masonry-skeleton-${index}`}
          className="animate-fade-in"
          style={{
            animationDelay: `${Math.min(index * 0.05, 1)}s`,
          }}
        >
          <SingleMasonrySkeleton 
            animated={animated} 
            height={heights[index]}
            columnWidth={columnWidth}
          />
        </div>
      ))}
    </div>
  );
}

export function MasonryLoadMoreSkeleton({ 
  count = 6, 
  columnWidth = 280 
}: { 
  count?: number;
  columnWidth?: number;
}) {
  const heights = generateSkeletonHeights(count, columnWidth);

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`masonry-loading-more-${index}`}
          className="animate-fade-in"
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <SingleMasonrySkeleton 
            height={heights[index]}
            columnWidth={columnWidth}
          />
        </div>
      ))}
    </>
  );
}

export default MasonrySkeleton;