/**
 * GIF search service with multiple provider support and fallback mechanisms
 */

import { tenorClient, giphyClient, klipyClient } from '../utils/apiClient';
import { API_CONFIG } from '../constants/api';
import { handleApiError } from '../utils/errorHandler';
import { validateSearchQuery, sanitizeSearchQuery } from '../utils/validation';
import { searchResultsCache, gifMetadataCache, createCacheKey } from '../utils/cache';
import { retryWithBackoff, retryConditions, circuitBreakers } from '../utils/retryUtils';
import type { Gif, SearchResult } from '../types/gif';
import type { GifSearchService, ApiError } from '../types/api';

export interface SearchOptions {
  limit?: number;
  offset?: number;
  rating?: 'g' | 'pg' | 'pg-13' | 'r';
  provider?: 'tenor' | 'giphy' | 'auto' | 'klipy';
}

export interface TenorGifResponse {
  id: string;
  title: string;
  media_formats: {
    gif: {
      url: string;
      dims: [number, number];
    };
    gifpreview: {
      url: string;
    };
  };
}

export interface KlipyGifResponse {
  id: string;
  title: string;
  file: {
    md: {
      gif: {
        height: number,
        size: number,
        url: string,
        width: number
      }
    }
  };
}

export interface GiphyGifResponse {
  id: string;
  title: string;
  images: {
    original: {
      url: string;
      width: string;
      height: string;
    };
    fixed_width_small: {
      url: string;
    };
  };
}

export class GifSearchServiceImpl implements GifSearchService {
  private readonly tenorApiKey: string;
  private readonly giphyApiKey: string;
  private readonly klipyApiKey: string;

  constructor() {
    this.tenorApiKey = process.env.TENOR_API_KEY || '';
    this.giphyApiKey = process.env.GIPHY_API_KEY || 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65';
    this.klipyApiKey = process.env.KLIPY_API_KEY || 'AHKOUO1AtTmVyhltqTyUpR7n1DxGr6wgEqH63Mon6R17X2CUhWkY6NkzjSXBai2I';
  }

  /**
   * Search for GIFs using multiple providers with fallback and caching
   */
  async searchGifs(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    // Validate and sanitize query
    const validation = validateSearchQuery(query);
    if (!validation.isValid) {
      throw handleApiError(new Error(validation.errors[0]), {
        component: 'GifSearchService',
        action: 'searchGifs',
      });
    }

    const sanitizedQuery = sanitizeSearchQuery(query);

    const {
      limit = API_CONFIG.KLIPY.DEFAULT_LIMIT,
      offset = 0,
      rating = 'g',
      provider = 'klipy',
    } = options;

    // Validate limit
    const validatedLimit = Math.min(Math.max(1, limit), API_CONFIG.TENOR.MAX_LIMIT);

    // Create cache key
    const cacheKey = createCacheKey('search', sanitizedQuery, validatedLimit, offset, rating, provider);
    
    // Try to get from cache first
    const cachedResult = searchResultsCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      let result: SearchResult;

      if(provider === 'klipy') {
        try {
          result = await circuitBreakers.gifSearch.execute(() =>
            retryWithBackoff(
              () => this.searchKlipy(sanitizedQuery, validatedLimit, offset, rating),
              {
                maxAttempts: 2,
                baseDelay: 1000,
                retryCondition: retryConditions.apiErrors,
                onRetry: (attempt, error) => {
                  console.warn(`Klipy search retry attempt ${attempt}:`, error);
                }
              }
            )
          );
          // Cache successful result
          searchResultsCache.set(cacheKey, result);
          return result;
        } catch (error) {
          console.warn('Klipy search failed after retries:', error);
          if (provider === 'klipy') {
            throw error;
          }
        }
      }

      // Try Giphy first since it has a working API key
      if (provider === 'giphy' || provider === 'auto') {
        try {
          result = await circuitBreakers.gifSearch.execute(() =>
            retryWithBackoff(
              () => this.searchGiphy(sanitizedQuery, validatedLimit, offset, rating),
              {
                maxAttempts: 2,
                baseDelay: 1000,
                retryCondition: retryConditions.apiErrors,
                onRetry: (attempt, error) => {
                  console.warn(`Giphy search retry attempt ${attempt}:`, error);
                }
              }
            )
          );
          // Cache successful result
          searchResultsCache.set(cacheKey, result);
          return result;
        } catch (error) {
          console.warn('Giphy search failed after retries:', error);
          if (provider === 'giphy') {
            throw error;
          }
        }
      }

      // Only try Tenor if we have a valid API key and it's specifically requested
      if (provider === 'tenor' && this.tenorApiKey) {
        try {
          result = await circuitBreakers.gifSearch.execute(() =>
            retryWithBackoff(
              () => this.searchTenor(sanitizedQuery, validatedLimit, offset, rating),
              {
                maxAttempts: 2,
                baseDelay: 1000,
                retryCondition: retryConditions.apiErrors,
                onRetry: (attempt, error) => {
                  console.warn(`Tenor search retry attempt ${attempt}:`, error);
                }
              }
            )
          );
          // Cache successful result
          searchResultsCache.set(cacheKey, result);
          return result;
        } catch (error) {
          console.warn('Tenor search failed after retries:', error);
          throw error;
        }
      }

      // If all providers fail, return mock data
      console.warn('All GIF providers failed, returning mock data');
      result = this.getMockSearchResult(sanitizedQuery, validatedLimit);
      
      // Cache mock result with shorter TTL
      searchResultsCache.set(cacheKey, result, 60 * 1000); // 1 minute for mock data
      return result;
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      
      throw handleApiError(error, {
        component: 'GifSearchService',
        action: 'searchGifs',
        metadata: { query: sanitizedQuery, options },
      });
    }
  }

  /**
   * Get a specific GIF by ID with caching
   */
  async getGifById(id: string): Promise<Gif | null> {
    if (!id || typeof id !== 'string') {
      return null;
    }

    // Check cache first
    const cacheKey = createCacheKey('gif', id);
    const cachedGif = gifMetadataCache.get(cacheKey);
    if (cachedGif) {
      return cachedGif;
    }

    // Try to determine provider from ID format
    try {
      let gif: Gif | null = null;

      // Try Giphy first (alphanumeric IDs)
      gif = await this.getGiphyGifById(id);
      if (gif) {
        gifMetadataCache.set(cacheKey, gif);
        return gif;
      }

      // Try Tenor only if we have a valid API key (numeric IDs)
      if (/^\d+$/.test(id) && this.tenorApiKey) {
        gif = await this.getTenorGifById(id);
        if (gif) {
          gifMetadataCache.set(cacheKey, gif);
          return gif;
        }
      }

      // Check if it's a mock ID
      if (id.startsWith('mock')) {
        gif = this.getMockGifById(id);
        if (gif) {
          gifMetadataCache.set(cacheKey, gif, 60 * 1000); // Shorter TTL for mock data
          return gif;
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching GIF by ID:', error);
      return null;
    }
  }

  /**
   * Search GIFs using Klipy API
   */
  private async searchKlipy(
    query: string,
    limit: number,
    offset: number,
    rating: string
  ): Promise<SearchResult> {
    const params = new URLSearchParams({
      q: query,
      per_page: limit.toString(),
      pos: offset.toString(),
      media_filter: 'gif',
      contentfilter: rating,
      page: offset === 0 ? '1' : Math.floor(offset / limit + 1).toString()
    });

    const response = await klipyClient.get<{ result: boolean, data: { data: KlipyGifResponse[]} }>(
      `${API_CONFIG.KLIPY.SEARCH_ENDPOINT}/${this.klipyApiKey}/gifs/search?${params.toString()}`
    );

    const results = response.data.data.map(this.transformKlipyGif);
    
    return {
      results,
      totalCount: results.length,
      hasMore: results.length === limit,
    };
  }

  /**
   * Search GIFs using Tenor API
   */
  private async searchTenor(
    query: string,
    limit: number,
    offset: number,
    rating: string
  ): Promise<SearchResult> {
    const params = new URLSearchParams({
      q: query,
      key: this.tenorApiKey,
      limit: limit.toString(),
      pos: offset.toString(),
      media_filter: 'gif',
      contentfilter: rating,
    });

    const response = await tenorClient.get<{ results: TenorGifResponse[] }>(
      `${API_CONFIG.TENOR.SEARCH_ENDPOINT}?${params.toString()}`
    );

    const results = response.results.map(this.transformTenorGif);
    
    return {
      results,
      totalCount: results.length,
      hasMore: results.length === limit,
    };
  }

  /**
   * Search GIFs using Giphy API
   */
  private async searchGiphy(
    query: string,
    limit: number,
    offset: number,
    rating: string
  ): Promise<SearchResult> {
    const params = new URLSearchParams({
      api_key: this.giphyApiKey,
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
      rating,
    });

    const response = await giphyClient.get<{ data: GiphyGifResponse[] }>(
      `${API_CONFIG.GIPHY.SEARCH_ENDPOINT}?${params.toString()}`
    );

    const results = response.data.map(this.transformGiphyGif);
    
    return {
      results,
      totalCount: results.length,
      hasMore: results.length === limit,
    };
  }

  /**
   * Get Tenor GIF by ID
   */
  private async getTenorGifById(id: string): Promise<Gif | null> {
    try {
      const params = new URLSearchParams({
        ids: id,
        key: this.tenorApiKey,
        media_filter: 'gif',
      });

      const response = await tenorClient.get<{ results: TenorGifResponse[] }>(
        `/posts?${params.toString()}`
      );

      if (response.results && response.results.length > 0) {
        return this.transformTenorGif(response.results[0]);
      }

      return null;
    } catch (error) {
      console.error('Error fetching Tenor GIF by ID:', error);
      return null;
    }
  }

  /**
   * Get Giphy GIF by ID
   */
  private async getGiphyGifById(id: string): Promise<Gif | null> {
    try {
      const params = new URLSearchParams({
        api_key: this.giphyApiKey,
      });

      const response = await giphyClient.get<{ data: GiphyGifResponse }>(
        `/${id}?${params.toString()}`
      );

      if (response.data) {
        return this.transformGiphyGif(response.data);
      }

      return null;
    } catch (error) {
      console.error('Error fetching Giphy GIF by ID:', error);
      return null;
    }
  }

  /**
   * Transform Tenor API response to our GIF format
   */
  private transformTenorGif = (gif: TenorGifResponse): Gif => ({
    id: gif.id,
    title: gif.title || 'Untitled GIF',
    url: gif.media_formats.gif.url,
    preview: gif.media_formats.gifpreview.url,
    width: gif.media_formats.gif.dims[0],
    height: gif.media_formats.gif.dims[1],
    source: 'tenor',
  });

  private transformKlipyGif = (gif: KlipyGifResponse): Gif => ({
    id: gif.id,
    title: gif.title || 'Untitled GIF',
    url: gif.file.md.gif.url,
    preview: gif.file.md.gif.url,
    width: gif.file.md.gif.width,
    height: gif.file.md.gif.height,
    source: 'klipy',
  });

  /**
   * Transform Giphy API response to our GIF format
   */
  private transformGiphyGif = (gif: GiphyGifResponse): Gif => ({
    id: gif.id,
    title: gif.title || 'Untitled GIF',
    url: gif.images.original.url,
    preview: gif.images.fixed_width_small.url,
    width: parseInt(gif.images.original.width, 10),
    height: parseInt(gif.images.original.height, 10),
    source: 'giphy',
  });

  /**
   * Get mock search results as fallback
   */
  private getMockSearchResult(query: string, limit: number): SearchResult {
    const mockGifs: Gif[] = [
      {
        id: 'mock1',
        title: `${query} GIF 1`,
        url: 'https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif',
        preview: 'https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/200w_d.gif',
        width: 480,
        height: 480,
        source: 'mock',
      },
      {
        id: 'mock2',
        title: `${query} GIF 2`,
        url: 'https://media.giphy.com/media/26u4cqiYI31lA4P4k/giphy.gif',
        preview: 'https://media.giphy.com/media/26u4cqiYI31lA4P4k/200w_d.gif',
        width: 480,
        height: 270,
        source: 'mock',
      },
      {
        id: 'mock3',
        title: `${query} GIF 3`,
        url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
        preview: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/200w_d.gif',
        width: 480,
        height: 270,
        source: 'mock',
      },
      {
        id: 'mock4',
        title: `${query} GIF 4`,
        url: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif',
        preview: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/200w_d.gif',
        width: 480,
        height: 270,
        source: 'mock',
      },
    ];

    return {
      results: mockGifs.slice(0, limit),
      totalCount: mockGifs.length,
      hasMore: false,
    };
  }

  /**
   * Get mock GIF by ID
   */
  private getMockGifById(id: string): Gif | null {
    const mockGifs = this.getMockSearchResult('mock', 10).results;
    return mockGifs.find(gif => gif.id === id) || null;
  }



  /**
   * Create validation error
   */
  private createValidationError(message: string): ApiError {
    return {
      type: 'validation_error',
      message,
      recoverable: true,
      retryable: false,
    };
  }

  /**
   * Create API error
   */
  private createApiError(
    type: ApiError['type'],
    message: string,
    recoverable: boolean,
    retryable: boolean
  ): ApiError {
    return {
      type,
      message,
      recoverable,
      retryable,
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    searchResults: any;
    gifMetadata: any;
  } {
    return {
      searchResults: searchResultsCache.getStats(),
      gifMetadata: gifMetadataCache.getStats()
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    searchResultsCache.clear();
    gifMetadataCache.clear();
  }

  /**
   * Preload popular GIFs for better performance
   */
  async preloadPopularGifs(queries: string[] = ['happy', 'excited', 'thumbs up', 'celebration']): Promise<void> {
    const preloadPromises = queries.map(async (query) => {
      try {
        await this.searchGifs(query, { limit: 12 });
      } catch (error) {
        console.warn(`Failed to preload GIFs for query: ${query}`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Check if error is an API error
   */
  private isApiError(error: any): error is ApiError {
    return error && typeof error === 'object' && 'type' in error && 'message' in error;
  }
}

// Export singleton instance
export const gifSearchService = new GifSearchServiceImpl();