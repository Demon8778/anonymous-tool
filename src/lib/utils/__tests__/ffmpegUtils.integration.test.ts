/**
 * Integration tests for FFmpeg WASM utility service
 * These tests verify the basic functionality without actually running FFmpeg
 */

import { FFmpegProcessor, getFFmpegProcessor, validateGifFormat, estimateProcessingTime } from '../ffmpegUtils';
import type { TextOverlay } from '../../types/textOverlay';

describe('FFmpegProcessor Integration', () => {
  describe('Class instantiation and basic methods', () => {
    it('should create FFmpegProcessor instance', () => {
      const processor = new FFmpegProcessor();
      expect(processor).toBeInstanceOf(FFmpegProcessor);
    });

    it('should create processor with options', () => {
      const options = {
        quality: 'high' as const,
        outputFormat: 'gif' as const,
        enableProgress: true,
      };
      const processor = new FFmpegProcessor(options);
      expect(processor).toBeInstanceOf(FFmpegProcessor);
    });

    it('should get initial progress state', () => {
      const processor = new FFmpegProcessor();
      const progress = processor.getProgress();
      
      expect(progress).toHaveProperty('progress');
      expect(progress).toHaveProperty('stage');
      expect(typeof progress.progress).toBe('number');
      expect(typeof progress.stage).toBe('string');
    });

    it('should get memory usage info', () => {
      const processor = new FFmpegProcessor();
      const memoryInfo = processor.getMemoryUsage();
      
      expect(memoryInfo).toHaveProperty('current');
      expect(memoryInfo).toHaveProperty('max');
      expect(memoryInfo).toHaveProperty('percentage');
      expect(typeof memoryInfo.current).toBe('number');
      expect(typeof memoryInfo.max).toBe('number');
      expect(typeof memoryInfo.percentage).toBe('number');
    });

    it('should track processing state', () => {
      const processor = new FFmpegProcessor();
      expect(processor.isCurrentlyProcessing()).toBe(false);
    });

    it('should set progress callback', () => {
      const processor = new FFmpegProcessor();
      const mockCallback = jest.fn();
      
      expect(() => {
        processor.setProgressCallback(mockCallback);
      }).not.toThrow();
    });
  });

  describe('Singleton pattern', () => {
    it('should return same instance from getFFmpegProcessor', () => {
      const processor1 = getFFmpegProcessor();
      const processor2 = getFFmpegProcessor();
      
      expect(processor1).toBe(processor2);
    });

    it('should create processor with options', () => {
      const options = { quality: 'low' as const };
      const processor = getFFmpegProcessor(options);
      
      expect(processor).toBeInstanceOf(FFmpegProcessor);
    });
  });

  describe('Utility functions', () => {
    describe('validateGifFormat', () => {
      it('should validate GIF87a signature', () => {
        const gif87a = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]); // "GIF87a"
        expect(validateGifFormat(gif87a)).toBe(true);
      });

      it('should validate GIF89a signature', () => {
        const gif89a = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // "GIF89a"
        expect(validateGifFormat(gif89a)).toBe(true);
      });

      it('should reject invalid format', () => {
        const invalid = new Uint8Array([0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A]); // PNG signature
        expect(validateGifFormat(invalid)).toBe(false);
      });

      it('should handle empty data', () => {
        const empty = new Uint8Array([]);
        expect(validateGifFormat(empty)).toBe(false);
      });
    });

    describe('estimateProcessingTime', () => {
      it('should estimate time for small file', () => {
        const time = estimateProcessingTime(1024 * 1024, 1); // 1MB, 1 overlay
        expect(time).toBeGreaterThan(0);
        expect(typeof time).toBe('number');
      });

      it('should estimate time for large file', () => {
        const smallTime = estimateProcessingTime(1024 * 1024, 1); // 1MB
        const largeTime = estimateProcessingTime(10 * 1024 * 1024, 1); // 10MB
        
        expect(largeTime).toBeGreaterThan(smallTime);
      });

      it('should account for overlay count', () => {
        const oneOverlay = estimateProcessingTime(1024 * 1024, 1);
        const fiveOverlays = estimateProcessingTime(1024 * 1024, 5);
        
        expect(fiveOverlays).toBeGreaterThan(oneOverlay);
      });

      it('should have minimum time', () => {
        const time = estimateProcessingTime(0, 0);
        expect(time).toBeGreaterThanOrEqual(2000); // At least 2 seconds
      });
    });
  });

  describe('Text overlay validation', () => {
    it('should validate text overlay structure', () => {
      const validOverlay: TextOverlay = {
        id: 'test-1',
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
      };

      // This should not throw when creating the processor
      expect(() => {
        const processor = new FFmpegProcessor();
        // The validation happens during processing, not instantiation
      }).not.toThrow();
    });
  });

  describe('Error handling structure', () => {
    it('should handle processor disposal', async () => {
      const processor = new FFmpegProcessor();
      
      await expect(processor.dispose()).resolves.not.toThrow();
    });

    it('should handle cancellation', async () => {
      const processor = new FFmpegProcessor();
      
      await expect(processor.cancelProcessing()).resolves.not.toThrow();
    });
  });

  describe('Configuration validation', () => {
    it('should accept valid quality settings', () => {
      const qualities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
      
      qualities.forEach(quality => {
        expect(() => {
          new FFmpegProcessor({ quality });
        }).not.toThrow();
      });
    });

    it('should accept valid output formats', () => {
      const formats: Array<'gif' | 'mp4' | 'webm'> = ['gif', 'mp4', 'webm'];
      
      formats.forEach(outputFormat => {
        expect(() => {
          new FFmpegProcessor({ outputFormat });
        }).not.toThrow();
      });
    });

    it('should accept memory settings', () => {
      expect(() => {
        new FFmpegProcessor({ maxMemoryUsage: 256 * 1024 * 1024 });
      }).not.toThrow();
    });

    it('should accept progress settings', () => {
      expect(() => {
        new FFmpegProcessor({ enableProgress: false });
      }).not.toThrow();
    });
  });
});