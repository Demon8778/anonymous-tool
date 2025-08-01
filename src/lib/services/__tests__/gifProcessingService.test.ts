/**
 * Tests for GIF Processing Service
 */

import { GifProcessingServiceImpl } from '../gifProcessingService';
import type { Gif } from '../../types/gif';
import type { TextOverlay } from '../../types/textOverlay';

// Mock FFmpeg utilities
jest.mock('../../utils/ffmpegUtils', () => ({
  getFFmpegProcessor: jest.fn(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    processGifWithText: jest.fn().mockResolvedValue({
      data: new Uint8Array([1, 2, 3, 4]),
      fileSize: 1024,
      processingTime: 2000,
      metadata: { width: 400, height: 300 }
    }),
    setProgressCallback: jest.fn(),
    isCurrentlyProcessing: jest.fn().mockReturnValue(false),
    cancelProcessing: jest.fn().mockResolvedValue(undefined),
    getMemoryUsage: jest.fn().mockReturnValue({ current: 1024, max: 10240, percentage: 0.1 }),
    dispose: jest.fn().mockResolvedValue(undefined)
  }))
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

describe('GifProcessingService', () => {
  let service: GifProcessingServiceImpl;
  let mockGif: Gif;
  let mockTextOverlays: TextOverlay[];

  beforeEach(() => {
    service = new GifProcessingServiceImpl();
    
    mockGif = {
      id: 'test-gif-1',
      title: 'Test GIF',
      url: 'https://example.com/test.gif',
      preview: 'https://example.com/test-preview.gif',
      width: 400,
      height: 300,
      source: 'mock'
    };

    mockTextOverlays = [
      {
        id: 'overlay-1',
        text: 'Hello World',
        position: { x: 50, y: 50 },
        style: {
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 2,
          opacity: 1,
          fontWeight: 'bold',
          textAlign: 'center'
        },
        isDragging: false
      }
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processGif', () => {
    it('should successfully process a GIF with text overlays', async () => {
      const result = await service.processGif(mockGif, mockTextOverlays);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.processedUrl).toBe('blob:mock-url');
      expect(result.textOverlays).toEqual(mockTextOverlays);
      expect(result.fileSize).toBe(1024);
      expect(result.processingTime).toBe(2000);
      expect(result.processedAt).toBeInstanceOf(Date);
    });

    it('should throw error for invalid GIF', async () => {
      const invalidGif = { ...mockGif, url: '' };

      await expect(service.processGif(invalidGif, mockTextOverlays))
        .rejects.toMatchObject({
          type: 'processing_error',
          message: 'Invalid GIF provided'
        });
    });

    it('should throw error for invalid text overlays', async () => {
      await expect(service.processGif(mockGif, null as any))
        .rejects.toMatchObject({
          type: 'processing_error',
          message: 'Invalid text overlays provided'
        });
    });

    it('should throw error when no text overlays have content', async () => {
      const emptyOverlays = [{ ...mockTextOverlays[0], text: '' }];

      await expect(service.processGif(mockGif, emptyOverlays))
        .rejects.toMatchObject({
          type: 'processing_error',
          message: 'At least one text overlay with content is required'
        });
    });

    it('should throw error for invalid overlay positions', async () => {
      const invalidOverlays = [
        { ...mockTextOverlays[0], position: { x: -10, y: 50 } }
      ];

      await expect(service.processGif(mockGif, invalidOverlays))
        .rejects.toMatchObject({
          type: 'processing_error',
          message: 'Invalid text overlay position. Positions must be between 0 and 100 percent'
        });
    });
  });

  describe('getProcessingProgress', () => {
    it('should return initial progress when no processing is active', async () => {
      const progress = await service.getProcessingProgress();
      
      expect(progress).toEqual({
        progress: 0,
        stage: 'loading'
      });
    });
  });

  describe('cancelProcessing', () => {
    it('should cancel processing successfully', async () => {
      await expect(service.cancelProcessing()).resolves.not.toThrow();
    });
  });

  describe('isProcessing', () => {
    it('should return false when not processing', () => {
      expect(service.isProcessing()).toBe(false);
    });
  });

  describe('getMemoryUsage', () => {
    it('should return memory usage information', () => {
      const memoryUsage = service.getMemoryUsage();
      
      expect(memoryUsage).toEqual({
        current: 1024,
        max: 10240,
        percentage: 0.1
      });
    });
  });

  describe('getProcessingStats', () => {
    it('should return processing statistics', () => {
      const stats = service.getProcessingStats();
      
      expect(stats).toEqual({
        totalProcessed: 0,
        averageProcessingTime: 0,
        totalProcessingTime: 0,
        successRate: 1
      });
    });
  });

  describe('dispose', () => {
    it('should dispose of resources successfully', async () => {
      await expect(service.dispose()).resolves.not.toThrow();
    });
  });
});