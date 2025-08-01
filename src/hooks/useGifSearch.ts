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
  isLoading: boolean;
  error: string | null;
  currentQuery: string;
  currentPage: number;
  searchHistory: SearchHistory[];
  selectedGif: Gif | null;
  
  // Actions
  performSearch: (query: string, page?: number) => Promise<void>;
  setCurrentQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  setSelectedGif: (gif: Gif | null) => void;
  clearSearchHistory: () => void;
  loadSearchHistory: () => void;
  clearCache: () => void;
  preloadPopularGifs: () => Promise<void>;
  
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [selectedGif, setSelectedGif] = useState<Gif | null>(null);

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

    setIsLoading(true);
    setError(null);
    
    try {
      const offset = (page - 1) * itemsPerPage;
      const result = await gifSearchService.searchGifs(query, {
        limit: itemsPerPage,
        offset
      });
      
      setSearchResults(result);
      saveSearchHistory(query, result.totalCount);
      
    } catch (err) {
      let errorMessage = 'Failed to search GIFs';
      
      // Handle different error types
      if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as any).message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage, saveSearchHistory]);

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
    isLoading,
    error,
    currentQuery,
    currentPage,
    searchHistory,
    selectedGif,
    
    // Actions
    performSearch,
    setCurrentQuery,
    setCurrentPage,
    setSelectedGif,
    clearSearchHistory,
    loadSearchHistory,
    clearCache,
    preloadPopularGifs,
    
    // Computed
    totalPages,
    showPagination,
    cacheStats
  };
}