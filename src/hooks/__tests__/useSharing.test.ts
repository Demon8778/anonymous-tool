import { renderHook, act } from '@testing-library/react';
import { useSharing } from '../useSharing';
import type { ProcessedGif } from '@/lib/types';

// Mock the sharing service
jest.mock('@/lib/services/sharingService', () => ({
  sharingService: {
    copyToClipboard: jest.fn(),
    generateSocialShareUrls: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

const mockProcessedGif: ProcessedGif = {
  id: 'test-gif',
  title: 'Test GIF',
  url: 'https://example.com/test.gif',
  preview: 'https://example.com/preview.gif',
  width: 400,
  height: 300,
  source: 'mock' as const,
  processedUrl: 'https://example.com/processed.gif',
  processedAt: new Date(),
  textOverlays: [],
  fileSize: 1024,
  processingTime: 5000,
};

describe('useSharing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useSharing());
    
    expect(result.current.isCreatingLink).toBe(false);
    expect(result.current.shareableLink).toBeNull();
    expect(result.current.socialUrls).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('creates shareable link successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: 'share-123',
        url: 'https://example.com/generate?shared=share-123',
        expiresAt: new Date(),
        viewCount: 0,
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const mockSocialUrls = {
      twitter: 'https://twitter.com/share',
      facebook: 'https://facebook.com/share',
      whatsapp: 'https://whatsapp.com/share',
      email: 'mailto:',
      reddit: 'https://reddit.com/share',
    };

    const { sharingService } = require('@/lib/services/sharingService');
    sharingService.generateSocialShareUrls.mockReturnValue(mockSocialUrls);

    const { result } = renderHook(() => useSharing());

    await act(async () => {
      await result.current.createShareableLink(mockProcessedGif);
    });

    expect(result.current.shareableLink).toEqual(mockResponse.data);
    expect(result.current.socialUrls).toEqual(mockSocialUrls);
    expect(result.current.error).toBeNull();
    expect(result.current.isCreatingLink).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles API error when creating shareable link', async () => {
    const mockResponse = {
      success: false,
      error: 'Failed to create link',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useSharing());

    await act(async () => {
      await result.current.createShareableLink(mockProcessedGif);
    });

    expect(result.current.shareableLink).toBeNull();
    expect(result.current.error).toBe('Failed to create link');
    expect(result.current.isCreatingLink).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles network error when creating shareable link', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useSharing());

    await act(async () => {
      await result.current.createShareableLink(mockProcessedGif);
    });

    expect(result.current.shareableLink).toBeNull();
    expect(result.current.error).toBe('Network error');
    expect(result.current.isCreatingLink).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('copies to clipboard successfully', async () => {
    const { sharingService } = require('@/lib/services/sharingService');
    sharingService.copyToClipboard.mockResolvedValue(true);

    const { result } = renderHook(() => useSharing());

    let success: boolean;
    await act(async () => {
      success = await result.current.copyToClipboard('test text');
    });

    expect(success!).toBe(true);
    expect(result.current.error).toBeNull();
    expect(sharingService.copyToClipboard).toHaveBeenCalledWith('test text');
  });

  it('handles clipboard error', async () => {
    const { sharingService } = require('@/lib/services/sharingService');
    sharingService.copyToClipboard.mockResolvedValue(false);

    const { result } = renderHook(() => useSharing());

    let success: boolean;
    await act(async () => {
      success = await result.current.copyToClipboard('test text');
    });

    expect(success!).toBe(false);
    expect(result.current.error).toContain('Failed to copy to clipboard');
  });

  it('generates social URLs', () => {
    const mockSocialUrls = {
      twitter: 'https://twitter.com/share',
      facebook: 'https://facebook.com/share',
      whatsapp: 'https://whatsapp.com/share',
      email: 'mailto:',
      reddit: 'https://reddit.com/share',
    };

    const { sharingService } = require('@/lib/services/sharingService');
    sharingService.generateSocialShareUrls.mockReturnValue(mockSocialUrls);

    const { result } = renderHook(() => useSharing());

    act(() => {
      const urls = result.current.generateSocialUrls(mockProcessedGif, 'https://example.com/share');
      expect(urls).toEqual(mockSocialUrls);
    });

    expect(sharingService.generateSocialShareUrls).toHaveBeenCalledWith(
      mockProcessedGif,
      'https://example.com/share'
    );
  });

  it('handles error in generateSocialUrls', () => {
    const { sharingService } = require('@/lib/services/sharingService');
    sharingService.generateSocialShareUrls.mockImplementation(() => {
      throw new Error('Social URL generation failed');
    });

    const { result } = renderHook(() => useSharing());

    act(() => {
      const urls = result.current.generateSocialUrls(mockProcessedGif);
      expect(urls).toEqual({
        twitter: '',
        facebook: '',
        whatsapp: '',
        email: '',
        reddit: ''
      });
    });

    expect(result.current.error).toBe('Failed to generate social media URLs');
  });

  it('clears error state', () => {
    const { result } = renderHook(() => useSharing());

    // Set an error first
    act(() => {
      result.current.generateSocialUrls(mockProcessedGif);
    });

    // Clear error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('resets all state', () => {
    const { result } = renderHook(() => useSharing());

    // Set some state first
    act(() => {
      result.current.generateSocialUrls(mockProcessedGif);
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.shareableLink).toBeNull();
    expect(result.current.socialUrls).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isCreatingLink).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('cancels ongoing request when creating new link', async () => {
    // Mock a slow request
    let resolveFirst: (value: any) => void;
    const firstRequest = new Promise(resolve => {
      resolveFirst = resolve;
    });

    (fetch as jest.Mock)
      .mockReturnValueOnce(firstRequest)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { id: 'second', url: 'https://example.com/second' }
        }),
      });

    const { result } = renderHook(() => useSharing());

    // Start first request
    act(() => {
      result.current.createShareableLink(mockProcessedGif);
    });

    // Start second request (should cancel first)
    await act(async () => {
      await result.current.createShareableLink(mockProcessedGif);
    });

    // Resolve first request (should be ignored)
    resolveFirst!({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { id: 'first', url: 'https://example.com/first' }
      }),
    });

    // Should have second request result
    expect(result.current.shareableLink?.id).toBe('second');
  });
});