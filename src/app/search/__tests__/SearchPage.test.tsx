import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchPage from '../page';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock the GIF search service
jest.mock('@/lib/services/gifSearchService', () => ({
  gifSearchService: {
    searchGifs: jest.fn(),
  },
}));

// Mock the custom hook
jest.mock('@/hooks/useGifSearch', () => ({
  useGifSearch: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};

const mockSearchParams = {
  get: jest.fn(),
};

const mockUseGifSearch = {
  searchResults: null,
  isLoading: false,
  error: null,
  currentQuery: '',
  currentPage: 1,
  searchHistory: [],
  selectedGif: null,
  performSearch: jest.fn(),
  setCurrentQuery: jest.fn(),
  setCurrentPage: jest.fn(),
  setSelectedGif: jest.fn(),
  clearSearchHistory: jest.fn(),
  totalPages: 0,
  showPagination: false,
};

describe('SearchPage', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    require('@/hooks/useGifSearch').useGifSearch.mockReturnValue(mockUseGifSearch);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  it('renders the search page with hero section', () => {
    render(<SearchPage />);
    
    expect(screen.getByText('Find the Perfect GIF')).toBeInTheDocument();
    expect(screen.getByText(/Search through millions of GIFs/)).toBeInTheDocument();
  });

  it('renders search form', () => {
    render(<SearchPage />);
    
    expect(screen.getByPlaceholderText(/Search for reactions, emotions/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search GIFs/ })).toBeInTheDocument();
  });

  it('shows empty state when no query and no history', () => {
    render(<SearchPage />);
    
    expect(screen.getByText('Start Your GIF Journey')).toBeInTheDocument();
    expect(screen.getByText(/Search for the perfect GIF/)).toBeInTheDocument();
  });

  it('displays search history when available', () => {
    const mockSearchHistory = [
      { query: 'happy', timestamp: new Date(), resultCount: 10 },
      { query: 'excited', timestamp: new Date(), resultCount: 15 },
    ];

    require('@/hooks/useGifSearch').useGifSearch.mockReturnValue({
      ...mockUseGifSearch,
      searchHistory: mockSearchHistory,
    });

    render(<SearchPage />);
    
    expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    expect(screen.getByText('happy')).toBeInTheDocument();
    expect(screen.getByText('excited')).toBeInTheDocument();
  });

  it('displays search results when available', () => {
    const mockSearchResults = {
      results: [
        {
          id: '1',
          title: 'Happy GIF',
          url: 'https://example.com/gif1.gif',
          preview: 'https://example.com/gif1-preview.gif',
          width: 480,
          height: 270,
          source: 'giphy' as const,
        },
      ],
      totalCount: 1,
      hasMore: false,
    };

    require('@/hooks/useGifSearch').useGifSearch.mockReturnValue({
      ...mockUseGifSearch,
      searchResults: mockSearchResults,
      currentQuery: 'happy',
    });

    render(<SearchPage />);
    
    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getByText('1 GIFs found')).toBeInTheDocument();
    expect(screen.getByText('Search Results for "happy"')).toBeInTheDocument();
  });

  it('shows pagination when there are multiple pages', () => {
    const mockSearchResults = {
      results: Array.from({ length: 24 }, (_, i) => ({
        id: `${i + 1}`,
        title: `GIF ${i + 1}`,
        url: `https://example.com/gif${i + 1}.gif`,
        preview: `https://example.com/gif${i + 1}-preview.gif`,
        width: 480,
        height: 270,
        source: 'giphy' as const,
      })),
      totalCount: 48,
      hasMore: true,
    };

    require('@/hooks/useGifSearch').useGifSearch.mockReturnValue({
      ...mockUseGifSearch,
      searchResults: mockSearchResults,
      currentQuery: 'test',
      totalPages: 2,
      showPagination: true,
    });

    render(<SearchPage />);
    
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    require('@/hooks/useGifSearch').useGifSearch.mockReturnValue({
      ...mockUseGifSearch,
      isLoading: true,
      currentQuery: 'loading',
    });

    render(<SearchPage />);
    
    // The loading state should be handled by the GifGrid component
    // We can verify that the search form shows loading state
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('handles error state', () => {
    require('@/hooks/useGifSearch').useGifSearch.mockReturnValue({
      ...mockUseGifSearch,
      error: 'Failed to search GIFs',
      currentQuery: 'error',
      searchResults: { results: [], totalCount: 0, hasMore: false }, // Add empty results to trigger GifGrid rendering
    });

    render(<SearchPage />);
    
    // Error should be displayed by the GifGrid component
    expect(screen.getByText('Failed to search GIFs')).toBeInTheDocument();
  });

  it('initializes from URL parameters', () => {
    mockSearchParams.get.mockImplementation((param: string) => {
      if (param === 'q') return 'test-query';
      if (param === 'page') return '2';
      return null;
    });

    render(<SearchPage />);
    
    expect(mockUseGifSearch.setCurrentQuery).toHaveBeenCalledWith('test-query');
    expect(mockUseGifSearch.setCurrentPage).toHaveBeenCalledWith(2);
    expect(mockUseGifSearch.performSearch).toHaveBeenCalledWith('test-query', 2);
  });

  it('handles popular search suggestions', () => {
    render(<SearchPage />);
    
    const happyBadge = screen.getByText('happy');
    fireEvent.click(happyBadge);
    
    expect(mockUseGifSearch.setCurrentQuery).toHaveBeenCalledWith('happy');
    expect(mockUseGifSearch.performSearch).toHaveBeenCalledWith('happy', 1);
  });
});