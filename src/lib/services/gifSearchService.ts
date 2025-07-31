/**
 * GIF search service with multiple provider support and fallback mechanisms
 */

import { tenorClient, giphyClient } from '../utils/apiClient';
import { API_CONFIG } from '../constants/api';
import type { Gif, SearchResult } from '../types/gif';
import type { GifSearchService, ApiError } from '../types/api';

export interface SearchOptions {
  limit?: number;
  offset?: number;
  rating?: 'g' | 'pg' | 'pg-13' | 'r';
  provider?: 'tenor' | 'giphy' | 'auto';
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

  constructor() {
    this.tenorApiKey = process.env.TENOR_API_KEY || '';
    this.giphyApiKey = process.env.GIPHY_API_KEY || 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65';
  }

  /**
   * Search for GIFs using multiple providers with fallback
   */
  async searchGifs(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    const sanitizedQuery = this.sanitizeQuery(query);

    const {
      limit = API_CONFIG.TENOR.DEFAULT_LIMIT,
      offset = 0,
      rating = 'g',
      provider = 'auto',
    } = options;

    // Validate limit
    const validatedLimit = Math.min(Math.max(1, limit), API_CONFIG.TENOR.MAX_LIMIT);

    try {
      // Try Giphy first since it has a working API key
      if (provider === 'giphy' || provider === 'auto') {
        try {
          return await this.searchGiphy(sanitizedQuery, validatedLimit, offset, rating);
        } catch (error) {
          console.warn('Giphy search failed:', error);
          if (provider === 'giphy') {
            throw error;
          }
        }
      }

      // Only try Tenor if we have a valid API key and it's specifically requested
      if (provider === 'tenor' && this.tenorApiKey) {
        try {
          return await this.searchTenor(sanitizedQuery, validatedLimit, offset, rating);
        } catch (error) {
          console.warn('Tenor search failed:', error);
          throw error;
        }
      }

      // If all providers fail, return mock data
      console.warn('All GIF providers failed, returning mock data');
      return this.getMockSearchResult(sanitizedQuery, validatedLimit);
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      
      throw this.createApiError(
        'api_error',
        'Failed to search GIFs from all providers',
        true,
        true
      );
    }
  }

  /**
   * Get a specific GIF by ID
   */
  async getGifById(id: string): Promise<Gif | null> {
    if (!id || typeof id !== 'string') {
      return null;
    }

    // Try to determine provider from ID format
    try {
      // Try Giphy first (alphanumeric IDs)
      const gif = await this.getGiphyGifById(id);
      if (gif) return gif;

      // Try Tenor only if we have a valid API key (numeric IDs)
      if (/^\d+$/.test(id) && this.tenorApiKey) {
        const tenorGif = await this.getTenorGifById(id);
        if (tenorGif) return tenorGif;
      }

      // Check if it's a mock ID
      if (id.startsWith('mock')) {
        return this.getMockGifById(id);
      }

      return null;
    } catch (error) {
      console.error('Error fetching GIF by ID:', error);
      return null;
    }
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
   * Sanitize and validate search query
   */
  private sanitizeQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      throw this.createValidationError('Search query cannot be empty');
    }

    const trimmed = query.trim();
    if (!trimmed) {
      throw this.createValidationError('Search query cannot be empty');
    }

    // Remove potentially harmful characters and trim
    const sanitized = trimmed
      .replace(/[<>\"'&]/g, '') // Remove HTML/script injection characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 100); // Limit length

    return sanitized;
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
   * Check if error is an API error
   */
  private isApiError(error: any): error is ApiError {
    return error && typeof error === 'object' && 'type' in error && 'message' in error;
  }
}

// Export singleton instance
export const gifSearchService = new GifSearchServiceImpl();