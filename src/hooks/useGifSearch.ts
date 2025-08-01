"use client";

import { useState, useCallback, useEffect } from 'react';
import { gifSearchService } from '@/lib/services/gifSearchService';
import type { Gif, SearchResult } from '@/lib/types/gif';

export interface SearchHistory {
  query: string;
  timestamp: Date;
  resultCount: number;
}

export interface UseGifSearchOptions {
  itemsPerPage?: number;
  maxHistoryItems?: number;
}

export interface UseGifSearchReturn {
  // State
  searchResults: SearchResult | null;
  allGifs: Gif[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  currentQuery: string;
  currentPage: number;
  searchHistory: SearchHistory[];
  selectedGif: Gif | null;
  hasMore: boolean;
  
  // Actions
  performSearch: (query: string, page?: number) => Promise<void>;
  loadMoreGifs: () => Promise<void>;
  setCurrentQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  setSelectedGif: (gif: Gif | null) => void;
  clearSearchHistory: () => void;
  loadSearchHistory: () => void;
  clearCache: () => void;
  preloadPopularGifs: () => Promise<void>;
  resetSearch: () => void;
  
  // Computed
  totalPages: number;
  showPagination: boolean;
  cacheStats: any;
}

const STORAGE_KEY = 'gif-search-history';

export function useGifSearch(options: UseGifSearchOptions = {}): UseGifSearchReturn {
  const {
    itemsPerPage = 24,
    maxHistoryItems = 10
  } = options;

  // State
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [allGifs, setAllGifs] = useState<Gif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [selectedGif, setSelectedGif] = useState<Gif | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Load search history from localStorage
  const loadSearchHistory = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const history = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setSearchHistory(history);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = useCallback((query: string, resultCount: number) => {
    try {
      if (typeof window === 'undefined') return;
      
      const newItem: SearchHistory = {
        query,
        timestamp: new Date(),
        resultCount
      };
      
      const updatedHistory = [
        newItem,
        ...searchHistory.filter(item => item.query !== query)
      ].slice(0, maxHistoryItems);
      
      setSearchHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [searchHistory, maxHistoryItems]);

  // Perform search with enhanced error handling
  const performSearch = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) return;

    const isNewSearch = page === 1;
    
    if (isNewSearch) {
      setIsLoading(true);
      setAllGifs([]);
      setCurrentPage(1);
    } else {
      setIsLoadingMore(true);
    }
    
    setError(null);
    
    try {
      const offset = (page - 1) * itemsPerPage;
      const result = await gifSearchService.searchGifs(query, {
        limit: itemsPerPage,
        offset
      });
      
      setSearchResults(result);
      setHasMore(result.hasMore);
      
      if (isNewSearch) {
        setAllGifs(result.results);
        saveSearchHistory(query, result.totalCount);
      } else {
        setAllGifs(prev => [...prev, ...result.results]);
      }
      
      setCurrentPage(page);
      
    } catch (err) {
      let errorMessage = 'Failed to search GIFs';
      
      // Handle different error types
      if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as any).message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      if (isNewSearch) {
        setSearchResults(null);
        setAllGifs([]);
      }
    } finally {
      if (isNewSearch) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [itemsPerPage, saveSearchHistory]);

  // Load more GIFs for infinite scrolling
  const loadMoreGifs = useCallback(async () => {
    if (!currentQuery || !hasMore || isLoadingMore) return;
    
    await performSearch(currentQuery, currentPage + 1);
  }, [currentQuery, hasMore, isLoadingMore, currentPage, performSearch]);

  // Reset search state
  const resetSearch = useCallback(() => {
    setSearchResults(null);
    setAllGifs([]);
    setCurrentPage(1);
    setHasMore(false);
    setError(null);
    setSelectedGif(null);
  }, []);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    gifSearchService.clearCache();
  }, []);

  // Preload popular GIFs
  const preloadPopularGifs = useCallback(async () => {
    try {
      await gifSearchService.preloadPopularGifs();
    } catch (error) {
      console.warn('Failed to preload popular GIFs:', error);
    }
  }, []);

  // Get cache statistics
  const cacheStats = gifSearchService.getCacheStats();

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, [loadSearchHistory]);

  // Computed values
  const totalPages = searchResults ? Math.ceil(searchResults.totalCount / itemsPerPage) : 0;
  const showPagination = totalPages > 1;

  return {
    // State
    searchResults,
    allGifs,
    isLoading,
    isLoadingMore,
    error,
    currentQuery,
    currentPage,
    searchHistory,
    selectedGif,
    hasMore,
    
    // Actions
    performSearch,
    loadMoreGifs,
    setCurrentQuery,
    setCurrentPage,
    setSelectedGif,
    clearSearchHistory,
    loadSearchHistory,
    clearCache,
    preloadPopularGifs,
    resetSearch,
    
    // Computed
    totalPages,
    showPagination,
    cacheStats
  };
}