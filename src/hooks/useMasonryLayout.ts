"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Gif } from '@/lib/types/gif';

export interface MasonryItem extends Gif {
  height: number;
  aspectRatio: number;
}

export interface MasonryColumn {
  items: MasonryItem[];
  height: number;
}

export interface UseMasonryLayoutOptions {
  columnWidth?: number;
  gap?: number;
  minColumns?: number;
  maxColumns?: number;
}

export interface UseMasonryLayoutReturn {
  columns: MasonryColumn[];
  containerRef: (node: HTMLDivElement | null) => void;
  recalculate: () => void;
}

export function useMasonryLayout(
  items: Gif[],
  options: UseMasonryLayoutOptions = {}
): UseMasonryLayoutReturn {
  const {
    columnWidth = 280,
    gap = 16,
    minColumns = 2,
    maxColumns = 8
  } = options;

  const [columns, setColumns] = useState<MasonryColumn[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Calculate optimal number of columns based on container width
  const calculateColumnCount = useCallback((width: number): number => {
    if (width === 0) return minColumns;
    
    const availableWidth = width - gap;
    const columnsFromWidth = Math.floor(availableWidth / (columnWidth + gap));
    
    return Math.max(minColumns, Math.min(maxColumns, columnsFromWidth));
  }, [columnWidth, gap, minColumns, maxColumns]);

  // Calculate item height based on aspect ratio and column width
  const calculateItemHeight = useCallback((gif: Gif, actualColumnWidth: number): number => {
    const aspectRatio = gif.width / gif.height;
    const imageHeight = actualColumnWidth / aspectRatio;
    
    // Add padding for title and info - responsive padding
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const cardPadding = isMobile ? 45 : 55; // Reduced padding for mobile
    
    return Math.round(imageHeight + cardPadding);
  }, []);

  // Distribute items across columns using a greedy algorithm
  const distributeItems = useCallback((
    gifs: Gif[],
    columnCount: number,
    actualColumnWidth: number
  ): MasonryColumn[] => {
    // Initialize columns
    const newColumns: MasonryColumn[] = Array.from({ length: columnCount }, () => ({
      items: [],
      height: 0
    }));

    // Add each item to the shortest column
    gifs.forEach((gif) => {
      const aspectRatio = gif.width / gif.height;
      const itemHeight = calculateItemHeight(gif, actualColumnWidth);
      
      const masonryItem: MasonryItem = {
        ...gif,
        height: itemHeight,
        aspectRatio
      };

      // Find the column with the smallest height
      const shortestColumnIndex = newColumns.reduce((minIndex, column, index) => {
        return column.height < newColumns[minIndex].height ? index : minIndex;
      }, 0);

      // Add item to the shortest column
      newColumns[shortestColumnIndex].items.push(masonryItem);
      newColumns[shortestColumnIndex].height += itemHeight + gap;
    });

    return newColumns;
  }, [calculateItemHeight, gap]);

  // Recalculate layout
  const recalculate = useCallback(() => {
    if (!containerRef.current || items.length === 0) {
      setColumns([]);
      return;
    }

    const width = containerRef.current.offsetWidth;
    const columnCount = calculateColumnCount(width);
    const actualColumnWidth = (width - (gap * (columnCount - 1))) / columnCount;
    
    const newColumns = distributeItems(items, columnCount, actualColumnWidth);
    setColumns(newColumns);
  }, [items, calculateColumnCount, distributeItems, gap]);

  // Container ref callback
  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    
    if (node) {
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const newWidth = entry.contentRect.width;
          if (newWidth !== containerWidth) {
            setContainerWidth(newWidth);
          }
        }
      });
      
      resizeObserver.observe(node);
      
      // Initial calculation
      const width = node.offsetWidth;
      setContainerWidth(width);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [containerWidth]);

  // Recalculate when items or container width changes
  useEffect(() => {
    recalculate();
  }, [recalculate, containerWidth]);

  // Recalculate on window resize (fallback)
  useEffect(() => {
    const handleResize = () => {
      setTimeout(recalculate, 100); // Debounce
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [recalculate]);

  return {
    columns,
    containerRef: setContainerRef,
    recalculate
  };
}