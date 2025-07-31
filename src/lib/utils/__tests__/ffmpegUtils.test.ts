/**
 * Tests for FFmpeg WASM utility service
 */

import { FFmpegProcessor, getFFmpegProcessor, validateGifFormat, estimateProcessingTime } from '../ffmpegUtils';
import type { TextOverlay } from '../../types/textOverlay';

// Mock FFmpeg since we can't run WASM in test environment
jest.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    load: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    exec: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
    deleteFile: jest.fn().mockResolvedValue(undefined),
    terminate: jest.fn(),
  })),
}));

jest.mock('@ffmpeg/util', () => ({
  toBlobURL: jest.fn().mockResolvedValue('mock-blob-url'),
  fetchFile: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
}));

describe('FFmpegProcessor', () => {
  let processor: FFmpegProcessor;

  beforeEach(() => {
    processor = new FFmpegProcessor();
  });

  afterEach(async () => {
    await processor.dispose();
  });

  describe('initialization', () => {
    it('should initialize FFmpeg successfully', async () => {
      await expect(processor.initialize()).resolves.not.toThrow();
    });

    it('should handle initialization errors', async () => {
      const errorProcessor = new FFmpegProcessor();
      // Mock load to throw error
      const mockFFmpeg = require('@ffmpeg/ffmpeg').FFmpeg;
      mockFFmpeg.mockImplementation(() => ({
        on: jest.fn(),
        load: jest.fn().mockRejectedValue(new Error('Load failed')),
        terminate: jest.fn(),
      }));

      await expect(errorProcessor.initialize()).rejects.toThrow();
    });
  });

  describe('text overlay processing', () => {
    const mockGifUrl = 'https://example.com/test.gif';
    const mockTextOverlays: TextOverlay[] = [
      {
        id: '1',
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
          textAlign: 'center',
        },
        isDragging: false,
      },
    ];

    it('should process GIF with text overlays', async () => {
      await processor.initialize();
      
      const result = await processor.processGifWithText(mockGifUrl, mockTextOverlays);
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('fileSize');
      expect(result).toHaveProperty('processingTime');
      expect(result).toHaveProperty('metadata');
      expect(result.data).toBeInstanceOf(Uint8Array);
    });

    it('should handle empty text overlays', async () => {
      await processor.initialize();
      
      const result = await processor.processGifWithText(mockGifUrl, []);
      
      expect(result).toHaveProperty('data');
    });

    it('should validate input parameters', async () => {
      await processor.initialize();
      
      // Invalid URL
      await expect(
        processor.processGifWithText('', mockTextOverlays)
      ).rejects.toThrow('Invalid GIF URL provided');

      // Invalid overlays
      await expect(
        processor.processGifWithText(mockGifUrl, null as any)
      ).rejects.toThrow('Invalid text overlays provided');
    });

    it('should validate text overlay positions', async () => {
      await processor.initialize();
      
      const invalidOverlays: TextOverlay[] = [
        {
          ...mockTextOverlays[0],
          position: { x: 150, y: 50 }, // Invalid x position > 100
        },
      ];

      await expect(
        processor.processGifWithText(mockGifUrl, invalidOverlays)
      ).rejects.toThrow('Text overlay position must be between 0 and 100 percent');
    });
  });

  describe('progress tracking', () => {
    it('should track processing progress', async () => {
      await processor.initialize();
      
      const progressUpdates: any[] = [];
      processor.setProgressCallback((progress) => {
        progressUpdates.push(progress);
      });

      const mockTextOverlays: TextOverlay[] = [
        {
          id: '1',
          text: 'Test',
          position: { x: 50, y: 50 },
          style: {
            fontSize: 24,
            fontFamily: 'Arial',
            color: '#ffffff',
            strokeColor: '#000000',
            strokeWidth: 2,
            opacity: 1,
            fontWeight: 'bold',
            textAlign: 'center',
          },
          isDragging: false,
        },
      ];

      await processor.processGifWithText('https://example.com/test.gif', mockTextOverlays);
      
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1].stage).toBe('complete');
    });

    it('should return current progress', () => {
      const progress = processor.getProgress();
      expect(progress).toHaveProperty('progress');
      expect(progress).toHaveProperty('stage');
    });
  });

  describe('memory management', () => {
    it('should track memory usage', () => {
      const memoryInfo = processor.getMemoryUsage();
      expect(memoryInfo).toHaveProperty('current');
      expect(memoryInfo).toHaveProperty('max');
      expect(memoryInfo).toHaveProperty('percentage');
    });

    it('should dispose resources properly', async () => {
      await processor.initialize();
      await expect(processor.dispose()).resolves.not.toThrow();
    });
  });

  describe('processing state', () => {
    it('should track processing state', () => {
      expect(processor.isCurrentlyProcessing()).toBe(false);
    });

    it('should prevent concurrent processing', async () => {
      await processor.initialize();
      
      // Mock a long-running process
      const mockFFmpeg = processor['ffmpeg'];
      if (mockFFmpeg) {
        mockFFmpeg.exec = jest.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(resolve, 100))
        );
      }

      const mockTextOverlays: TextOverlay[] = [
        {
          id: '1',
          text: 'Test',
          position: { x: 50, y: 50 },
          style: {
            fontSize: 24,
            fontFamily: 'Arial',
            color: '#ffffff',
            strokeColor: '#000000',
            strokeWidth: 2,
            opacity: 1,
            fontWeight: 'bold',
            textAlign: 'center',
          },
          isDragging: false,
        },
      ];

      // Start first process
      const firstProcess = processor.processGifWithText('https://example.com/test.gif', mockTextOverlays);
      
      // Try to start second process
      await expect(
        processor.processGifWithText('https://example.com/test2.gif', mockTextOverlays)
      ).rejects.toThrow('Another processing operation is already in progress');

      await firstProcess;
    });
  });
});

describe('Utility functions', () => {
  describe('getFFmpegProcessor', () => {
    it('should return singleton instance', () => {
      const processor1 = getFFmpegProcessor();
      const processor2 = getFFmpegProcessor();
      expect(processor1).toBe(processor2);
    });
  });

  describe('validateGifFormat', () => {
    it('should validate GIF87a format', () => {
      const gif87a = new TextEncoder().encode('GIF87a');
      expect(validateGifFormat(gif87a)).toBe(true);
    });

    it('should validate GIF89a format', () => {
      const gif89a = new TextEncoder().encode('GIF89a');
      expect(validateGifFormat(gif89a)).toBe(true);
    });

    it('should reject invalid formats', () => {
      const invalid = new TextEncoder().encode('NOTGIF');
      expect(validateGifFormat(invalid)).toBe(false);
    });
  });

  describe('estimateProcessingTime', () => {
    it('should estimate processing time based on file size and overlays', () => {
      const fileSize = 1024 * 1024; // 1MB
      const overlayCount = 2;
      
      const estimatedTime = estimateProcessingTime(fileSize, overlayCount);
      
      expect(estimatedTime).toBeGreaterThan(0);
      expect(typeof estimatedTime).toBe('number');
    });

    it('should have minimum processing time', () => {
      const estimatedTime = estimateProcessingTime(0, 0);
      expect(estimatedTime).toBeGreaterThanOrEqual(2000); // Minimum 2 seconds
    });
  });
});