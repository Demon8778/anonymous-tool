/**
 * Tests for FFmpeg helper functions
 */

import {
  validateGifFormat,
  estimateProcessingTime,
  escapeTextForFFmpeg,
  convertColorForFFmpeg,
  validateOverlayPosition,
  estimateMemoryUsage,
  formatProcessingTime,
  validateFileSize,
  formatFileSize,
  generateProcessingId,
  calculateProgress,
} from '../ffmpegHelpers';

describe('FFmpeg Helper Functions', () => {
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
    it('should estimate processing time', () => {
      const time = estimateProcessingTime(1024 * 1024, 2); // 1MB, 2 overlays
      expect(time).toBeGreaterThan(0);
      expect(typeof time).toBe('number');
    });

    it('should have minimum time', () => {
      const time = estimateProcessingTime(0, 0);
      expect(time).toBeGreaterThanOrEqual(2000);
    });

    it('should increase with file size', () => {
      const small = estimateProcessingTime(1024 * 1024, 1);
      const large = estimateProcessingTime(10 * 1024 * 1024, 1);
      expect(large).toBeGreaterThan(small);
    });

    it('should increase with overlay count', () => {
      const one = estimateProcessingTime(1024 * 1024, 1);
      const five = estimateProcessingTime(1024 * 1024, 5);
      expect(five).toBeGreaterThan(one);
    });
  });

  describe('escapeTextForFFmpeg', () => {
    it('should escape special characters', () => {
      expect(escapeTextForFFmpeg("Hello: World")).toBe("Hello\\: World");
      expect(escapeTextForFFmpeg("It's working")).toBe("It\\'s working");
      expect(escapeTextForFFmpeg("Path\\to\\file")).toBe("Path\\\\to\\\\file");
    });

    it('should handle normal text', () => {
      expect(escapeTextForFFmpeg("Hello World")).toBe("Hello World");
    });

    it('should handle empty text', () => {
      expect(escapeTextForFFmpeg("")).toBe("");
    });
  });

  describe('convertColorForFFmpeg', () => {
    it('should convert hex colors', () => {
      expect(convertColorForFFmpeg("#ffffff")).toBe("0xffffff");
      expect(convertColorForFFmpeg("#000000")).toBe("0x000000");
      expect(convertColorForFFmpeg("ff0000")).toBe("0xff0000");
    });

    it('should handle invalid colors', () => {
      expect(convertColorForFFmpeg("invalid")).toBe("white");
      expect(convertColorForFFmpeg("#gg0000")).toBe("white");
      expect(convertColorForFFmpeg("#fff")).toBe("white");
    });
  });

  describe('validateOverlayPosition', () => {
    it('should validate valid positions', () => {
      expect(validateOverlayPosition(0, 0)).toBe(true);
      expect(validateOverlayPosition(50, 50)).toBe(true);
      expect(validateOverlayPosition(100, 100)).toBe(true);
    });

    it('should reject invalid positions', () => {
      expect(validateOverlayPosition(-1, 50)).toBe(false);
      expect(validateOverlayPosition(50, -1)).toBe(false);
      expect(validateOverlayPosition(101, 50)).toBe(false);
      expect(validateOverlayPosition(50, 101)).toBe(false);
    });

    it('should handle non-numeric values', () => {
      expect(validateOverlayPosition(NaN, 50)).toBe(false);
      expect(validateOverlayPosition(50, NaN)).toBe(false);
      expect(validateOverlayPosition("50" as any, 50)).toBe(false);
    });
  });

  describe('estimateMemoryUsage', () => {
    it('should estimate memory usage', () => {
      const usage = estimateMemoryUsage(1024 * 1024, 2); // 1MB, 2 overlays
      expect(usage).toBeGreaterThan(0);
      expect(typeof usage).toBe('number');
    });

    it('should increase with file size', () => {
      const small = estimateMemoryUsage(1024 * 1024, 1);
      const large = estimateMemoryUsage(10 * 1024 * 1024, 1);
      expect(large).toBeGreaterThan(small);
    });

    it('should increase with overlay count', () => {
      const one = estimateMemoryUsage(1024 * 1024, 1);
      const five = estimateMemoryUsage(1024 * 1024, 5);
      expect(five).toBeGreaterThan(one);
    });
  });

  describe('formatProcessingTime', () => {
    it('should format milliseconds', () => {
      expect(formatProcessingTime(500)).toBe("500ms");
      expect(formatProcessingTime(999)).toBe("999ms");
    });

    it('should format seconds', () => {
      expect(formatProcessingTime(1000)).toBe("1s");
      expect(formatProcessingTime(1500)).toBe("1.5s");
      expect(formatProcessingTime(30000)).toBe("30s");
    });

    it('should format minutes', () => {
      expect(formatProcessingTime(60000)).toBe("1m 0s");
      expect(formatProcessingTime(90000)).toBe("1m 30s");
      expect(formatProcessingTime(125000)).toBe("2m 5s");
    });
  });

  describe('validateFileSize', () => {
    it('should validate valid file sizes', () => {
      const result = validateFileSize(1024 * 1024, 10 * 1024 * 1024); // 1MB file, 10MB limit
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files that are too large', () => {
      const result = validateFileSize(10 * 1024 * 1024, 5 * 1024 * 1024); // 10MB file, 5MB limit
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum limit');
    });

    it('should reject zero or negative file sizes', () => {
      const result = validateFileSize(0, 10 * 1024 * 1024);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be greater than 0');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
      expect(formatFileSize(512)).toBe("512 Bytes");
    });

    it('should format KB', () => {
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
    });

    it('should format MB', () => {
      expect(formatFileSize(1024 * 1024)).toBe("1 MB");
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
    });

    it('should format GB', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
    });
  });

  describe('generateProcessingId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateProcessingId();
      const id2 = generateProcessingId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^ffmpeg_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^ffmpeg_\d+_[a-z0-9]+$/);
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress percentage', () => {
      expect(calculateProgress(0, 100)).toBe(0);
      expect(calculateProgress(50, 100)).toBe(50);
      expect(calculateProgress(100, 100)).toBe(100);
    });

    it('should handle edge cases', () => {
      expect(calculateProgress(0, 0)).toBe(0);
      expect(calculateProgress(50, 0)).toBe(0);
      expect(calculateProgress(150, 100)).toBe(100); // Should cap at 100
      expect(calculateProgress(-10, 100)).toBe(0); // Should not go below 0
    });
  });
});