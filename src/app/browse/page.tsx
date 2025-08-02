"use client";

import React, { useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { GifSearchForm } from '@/components/gif/GifSearchForm';
import { UnifiedGifGrid } from '@/components/gif/UnifiedGifGrid';
import { useGifSearch } from '@/hooks/useGifSearch';
import type { Gif } from '@/lib/types/gif';

function BrowsePageContent() {
    const searchParams = useSearchParams();

    // Search functionality
    const {
        searchResults,
        allGifs,
        isLoading: isSearchLoading,
        isLoadingMore,
        hasMore,
        loadMoreGifs,
        error: searchError,
        currentQuery,
        performSearch,
        setCurrentQuery,
    } = useGifSearch();

    // Handle search
    const handleSearch = useCallback(async (query: string) => {
        setCurrentQuery(query);
        await performSearch(query);
    }, [setCurrentQuery, performSearch]);

    // Handle GIF selection - this just navigates to gif-editor
    const handleGifSelect = useCallback((_gif: Gif) => {
        // This is handled by the Edit GIF buttons in the cards
        // No selection logic needed here anymore
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8">
                {/* Search Interface */}
                <div className="space-y-8">
                    {/* Global Search Form */}
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                                Browse & Search GIFs
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Discover millions of animated GIFs from Klipy. Search by keyword, emotion, or category to find the perfect GIF for your message, then add custom text overlays to make it uniquely yours.
                            </p>
                        </div>
                        
                        <GifSearchForm
                            onSearch={handleSearch}
                            isLoading={isSearchLoading}
                            initialQuery={currentQuery || searchParams.get('search') || ""}
                            placeholder="Search for GIFs to customize..."
                        />
                    </div>

                    {/* Search Results */}
                    {searchResults && (
                        <UnifiedGifGrid
                            gifs={allGifs}
                            onGifSelect={handleGifSelect}
                            selectedGifId={undefined}
                            isLoading={isSearchLoading}
                            isLoadingMore={isLoadingMore}
                            hasMore={hasMore}
                            onLoadMore={loadMoreGifs}
                            error={searchError}
                            onRetry={() => performSearch(currentQuery)}
                            enableInfiniteScroll={true}
                            defaultLayoutMode="masonry"
                            showLayoutToggle={true}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default function BrowsePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-lg font-medium text-foreground">Loading...</p>
                </div>
            </div>
        }>
            <BrowsePageContent />
        </Suspense>
    );
}