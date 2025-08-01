"use client";

import React, { useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Clock, Trash2, Sparkles, Zap, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis 
} from '@/components/ui/pagination';
import { PageHeader } from '@/components/layout/PageHeader';
import { GifSearchForm } from '@/components/gif/GifSearchForm';
import { GifGrid } from '@/components/gif/GifGrid';
import { useGifSearch } from '@/hooks/useGifSearch';
import type { Gif } from '@/lib/types/gif';

const ITEMS_PER_PAGE = 24;

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use custom hook for search state management
  const {
    searchResults,
    isLoading,
    error,
    currentQuery,
    currentPage,
    searchHistory,
    selectedGif,
    performSearch,
    setCurrentQuery,
    setCurrentPage,
    setSelectedGif,
    clearSearchHistory,
    totalPages,
    showPagination
  } = useGifSearch({ itemsPerPage: ITEMS_PER_PAGE });

  // Initialize from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    
    if (query && query !== currentQuery) {
      setCurrentQuery(query);
      setCurrentPage(page);
      performSearch(query, page);
    }
  }, [searchParams, currentQuery, performSearch, setCurrentQuery, setCurrentPage]);

  // Update URL when search changes
  const updateUrl = useCallback((query: string, page: number) => {
    const params = new URLSearchParams();
    params.set('q', query);
    if (page > 1) params.set('page', page.toString());
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [router]);

  // Handle search form submission
  const handleSearch = useCallback((query: string) => {
    setCurrentQuery(query);
    setCurrentPage(1);
    performSearch(query, 1);
    updateUrl(query, 1);
  }, [performSearch, setCurrentQuery, setCurrentPage, updateUrl]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    performSearch(currentQuery, page);
    updateUrl(currentQuery, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuery, performSearch, setCurrentPage, updateUrl]);

  // Handle GIF selection
  const handleGifSelect = useCallback((gif: Gif) => {
    setSelectedGif(gif);
    // Navigate to generation page with selected GIF
    router.push(`/generate?gif=${encodeURIComponent(gif.id)}`);
  }, [router, setSelectedGif]);

  // Handle history item click
  const handleHistoryClick = useCallback((query: string) => {
    setCurrentQuery(query);
    setCurrentPage(1);
    performSearch(query, 1);
    updateUrl(query, 1);
  }, [performSearch, setCurrentQuery, setCurrentPage, updateUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Page Header */}
      <PageHeader
        title="Find the Perfect GIF"
        description="Search through millions of GIFs and add your own text to create something amazing"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="mb-8 -mt-8 relative z-10">
          <GifSearchForm
            onSearch={handleSearch}
            isLoading={isLoading}
            initialQuery={currentQuery}
            placeholder="Search for reactions, emotions, or anything..."
          />
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && !currentQuery && (
          <div className="mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-gray-600" />
                    Recent Searches
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearchHistory}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-blue-100 transition-colors px-3 py-1"
                      onClick={() => handleHistoryClick(item.query)}
                    >
                      {item.query}
                      <span className="ml-2 text-xs text-gray-500">
                        ({item.resultCount})
                      </span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Visual Section Divider */}
        {currentQuery && (
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-2 rounded-full text-gray-600 font-medium">
                  Search Results for "{currentQuery}"
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Results
                </h2>
                <Badge variant="outline" className="text-sm">
                  {searchResults.totalCount} GIFs found
                </Badge>
              </div>
              
              {showPagination && (
                <div className="hidden sm:block text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>

            <GifGrid
              gifs={searchResults.results}
              onGifSelect={handleGifSelect}
              selectedGifId={selectedGif?.id}
              isLoading={isLoading}
              error={error || undefined}
              onRetry={() => performSearch(currentQuery, currentPage)}
            />
          </div>
        )}

        {/* Pagination */}
        {showPagination && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        handlePageChange(currentPage - 1);
                      }
                    }}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {/* Page numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) {
                        handlePageChange(currentPage + 1);
                      }
                    }}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Empty State for No Query */}
        {!currentQuery && searchHistory.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="inline-flex p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
                <Search className="h-16 w-16 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Start Your GIF Journey
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Search for the perfect GIF to express your thoughts, emotions, or just have fun!
              </p>
              
              {/* Popular search suggestions */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">Popular searches:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['happy', 'excited', 'thumbs up', 'dancing', 'celebration', 'funny'].map((suggestion) => (
                    <Badge
                      key={suggestion}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50 transition-colors px-3 py-1"
                      onClick={() => handleSearch(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visual Footer Divider */}
        <div className="mt-16 pt-8 border-t border-gradient-to-r from-transparent via-gray-200 to-transparent">
          <div className="text-center text-gray-500 text-sm">
            <p>Powered by Giphy • Find the perfect GIF for every moment</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-900">Loading...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}