/**
 * Simple tests for FFmpeg utility functions that don't require FFmpeg imports
 */

import { validateGifFormat, estimateProcessingTime } from '../ffmpegUtils';

describe('FFmpeg Utility Functions', () => {
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

    it('should handle empty data', () => {
      const empty = new Uint8Array([]);
      expect(validateGifFormat(empty)).toBe(false);
    });

    it('should handle short data', () => {
      const short = new Uint8Array([0x47, 0x49]); // "GI"
      expect(validateGifFormat(short)).toBe(false);
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

    it('should increase time with file size', () => {
      const smallFile = estimateProcessingTime(1024 * 1024, 1); // 1MB
      const largeFile = estimateProcessingTime(10 * 1024 * 1024, 1); // 10MB
      
      expect(largeFile).toBeGreaterThan(smallFile);
    });

    it('should increase time with overlay count', () => {
      const oneOverlay = estimateProcessingTime(1024 * 1024, 1);
      const fiveOverlays = estimateProcessingTime(1024 * 1024, 5);
      
      expect(fiveOverlays).toBeGreaterThan(oneOverlay);
    });

    it('should handle zero values', () => {
      const time = estimateProcessingTime(0, 0);
      expect(time).toBeGreaterThanOrEqual(2000);
    });

    it('should handle large values', () => {
      const time = estimateProcessingTime(100 * 1024 * 1024, 10); // 100MB, 10 overlays
      expect(time).toBeGreaterThan(0);
      expect(typeof time).toBe('number');
    });
  });
});