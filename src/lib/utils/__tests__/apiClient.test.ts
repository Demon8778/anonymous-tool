/**
 * Tests for API client utility
 */

import { ApiClient } from '../apiClient';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient('https://api.example.com');
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('request', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.get('/test');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should make successful POST request with body', async () => {
      const mockResponse = { success: true };
      const requestBody = { name: 'test' };
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.post('/test', requestBody);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid request' }),
      } as Response);

      await expect(client.get('/test')).rejects.toMatchObject({
        type: 'validation_error',
        message: 'Invalid request',
        recoverable: true,
        retryable: false,
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(client.get('/test')).rejects.toThrow('Network error');
    });

    it('should handle timeout', async () => {
      mockFetch.mockImplementation(() => 
        new Promise((resolve) => {
          // Never resolve to simulate timeout
        })
      );

      await expect(client.get('/test', { timeout: 100 })).rejects.toMatchObject({
        type: 'timeout_error',
        message: expect.stringContaining('timeout'),
      });
    }, 10000);

    it('should retry on retryable errors', async () => {
      // Clear any previous mock calls
      mockFetch.mockClear();
      
      // First call fails with 500, second succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({ error: 'Server error' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: 'success' }),
        } as Response);

      const result = await client.get('/test', { retries: 2 });

      expect(result).toEqual({ data: 'success' });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      // Clear any previous mock calls
      mockFetch.mockClear();
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid request' }),
      } as Response);

      await expect(client.get('/test', { retries: 3 })).rejects.toMatchObject({
        type: 'validation_error',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should build URLs correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      // Test with leading slash
      await client.get('/test');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'https://api.example.com/test',
        expect.any(Object)
      );

      // Test without leading slash
      await client.get('test');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'https://api.example.com/test',
        expect.any(Object)
      );

      // Test with full URL
      await client.get('https://other.api.com/test');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'https://other.api.com/test',
        expect.any(Object)
      );
    });
  });

  describe('helper methods', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);
    });

    it('should make PUT request', async () => {
      await client.put('/test', { data: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ data: 'test' }),
        })
      );
    });

    it('should make DELETE request', async () => {
      await client.delete('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});