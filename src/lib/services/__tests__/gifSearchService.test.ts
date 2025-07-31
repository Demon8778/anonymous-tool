/**
 * Tests for GIF search service
 */

import { GifSearchServiceImpl } from '../gifSearchService';
import { tenorClient, giphyClient } from '../../utils/apiClient';
import type { Gif } from '../../types/gif';

// Mock the API clients
jest.mock('../../utils/apiClient', () => ({
  tenorClient: {
    get: jest.fn(),
  },
  giphyClient: {
    get: jest.fn(),
  },
}));

const mockTenorClient = tenorClient as jest.Mocked<typeof tenorClient>;
const mockGiphyClient = giphyClient as jest.Mocked<typeof giphyClient>;

describe('GifSearchService', () => {
  let service: GifSearchServiceImpl;

  beforeEach(() => {
    service = new GifSearchServiceImpl();
    jest.clearAllMocks();
  });

  describe('searchGifs', () => {
    it('should return results from Tenor API', async () => {
      const mockTenorResponse = {
        results: [
          {
            id: '123',
            title: 'Test GIF',
            media_formats: {
              gif: {
                url: 'https://example.com/test.gif',
                dims: [480, 270] as [number, number],
              },
              gifpreview: {
                url: 'https://example.com/preview.gif',
              },
            },
          },
        ],
      };

      mockTenorClient.get.mockResolvedValue(mockTenorResponse);

      const result = await service.searchGifs('test');

      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toEqual({
        id: '123',
        title: 'Test GIF',
        url: 'https://example.com/test.gif',
        preview: 'https://example.com/preview.gif',
        width: 480,
        height: 270,
        source: 'tenor',
      });
    });

    it('should fallback to Giphy when Tenor fails', async () => {
      const mockGiphyResponse = {
        data: [
          {
            id: 'abc123',
            title: 'Giphy GIF',
            images: {
              original: {
                url: 'https://giphy.com/test.gif',
                width: '400',
                height: '300',
              },
              fixed_width_small: {
                url: 'https://giphy.com/small.gif',
              },
            },
          },
        ],
      };

      mockTenorClient.get.mockRejectedValue(new Error('Tenor failed'));
      mockGiphyClient.get.mockResolvedValue(mockGiphyResponse);

      const result = await service.searchGifs('test');

      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toEqual({
        id: 'abc123',
        title: 'Giphy GIF',
        url: 'https://giphy.com/test.gif',
        preview: 'https://giphy.com/small.gif',
        width: 400,
        height: 300,
        source: 'giphy',
      });
    });

    it('should return mock data when all providers fail', async () => {
      mockTenorClient.get.mockRejectedValue(new Error('Tenor failed'));
      mockGiphyClient.get.mockRejectedValue(new Error('Giphy failed'));

      const result = await service.searchGifs('test');

      expect(result.results).toHaveLength(4);
      expect(result.results[0].source).toBe('mock');
      expect(result.results[0].title).toContain('test');
    });

    it('should validate and sanitize query', async () => {
      // Test empty query
      await expect(service.searchGifs('')).rejects.toThrow('Search query cannot be empty');
      await expect(service.searchGifs('   ')).rejects.toThrow('Search query cannot be empty');

      // Test query sanitization
      mockTenorClient.get.mockResolvedValue({ results: [] });
      
      await service.searchGifs('test<script>alert("xss")</script>');
      
      // Verify the sanitized query was used (HTML characters should be removed)
      expect(mockTenorClient.get).toHaveBeenCalledWith(
        expect.stringContaining('q=testscriptalert%28xss%29%2Fscript')
      );
    });

    it('should respect limit parameter', async () => {
      mockTenorClient.get.mockResolvedValue({ results: [] });

      await service.searchGifs('test', { limit: 10 });

      expect(mockTenorClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=10')
      );
    });

    it('should enforce maximum limit', async () => {
      mockTenorClient.get.mockResolvedValue({ results: [] });

      await service.searchGifs('test', { limit: 100 });

      expect(mockTenorClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=50')
      );
    });
  });

  describe('getGifById', () => {
    it('should return null for invalid ID', async () => {
      const result = await service.getGifById('');
      expect(result).toBeNull();
    });

    it('should return mock GIF for mock ID', async () => {
      const result = await service.getGifById('mock1');
      
      expect(result).not.toBeNull();
      expect(result?.id).toBe('mock1');
      expect(result?.source).toBe('mock');
    });

    it('should try Tenor for numeric IDs', async () => {
      const mockTenorResponse = {
        results: [
          {
            id: '123',
            title: 'Tenor GIF',
            media_formats: {
              gif: {
                url: 'https://tenor.com/test.gif',
                dims: [400, 300] as [number, number],
              },
              gifpreview: {
                url: 'https://tenor.com/preview.gif',
              },
            },
          },
        ],
      };

      mockTenorClient.get.mockResolvedValue(mockTenorResponse);

      const result = await service.getGifById('123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('123');
      expect(result?.source).toBe('tenor');
    });

    it('should try Giphy for alphanumeric IDs', async () => {
      const mockGiphyResponse = {
        data: {
          id: 'abc123',
          title: 'Giphy GIF',
          images: {
            original: {
              url: 'https://giphy.com/test.gif',
              width: '400',
              height: '300',
            },
            fixed_width_small: {
              url: 'https://giphy.com/small.gif',
            },
          },
        },
      };

      mockGiphyClient.get.mockResolvedValue(mockGiphyResponse);

      const result = await service.getGifById('abc123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('abc123');
      expect(result?.source).toBe('giphy');
    });
  });
});