"use client";

import React, { useState } from 'react';
import { GifGrid } from './GifGrid';
import { MasonryGifGrid } from './MasonryGifGrid';
import type { Gif } from '@/lib/types/gif';

interface UnifiedGifGridProps {
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
  defaultLayoutMode?: 'masonry' | 'grid';
  showLayoutToggle?: boolean;
}

export function UnifiedGifGrid({
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
  defaultLayoutMode = 'masonry',
  showLayoutToggle = true
}: UnifiedGifGridProps) {
  const [layoutMode, setLayoutMode] = useState<'masonry' | 'grid'>(defaultLayoutMode);

  const commonProps = {
    gifs,
    onGifSelect,
    selectedGifId,
    isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore,
    error,
    onRetry,
    className,
    onGifError,
    enableInfiniteScroll,
    layoutMode,
    onLayoutModeChange: showLayoutToggle ? setLayoutMode : undefined
  };

  if (layoutMode === 'masonry') {
    return <MasonryGifGrid {...commonProps} />;
  }

  return <GifGrid {...commonProps} />;
}

export default UnifiedGifGrid;