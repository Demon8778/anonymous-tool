/**
 * Tests for sharing utilities
 */

import {
  generateShareId,
  isValidShareId,
  createSocialShareUrls,
  generateShareUrl,
  extractShareIdFromUrl,
  formatFileSize,
  formatProcessingTime,
  createDownloadFilename,
  isValidSocialPlatform,
  getSocialPlatformName,
  isClipboardAvailable
} from '../sharingUtils';
import type { ProcessedGif } from '../../types';

describe('sharingUtils', () => {
  describe('generateShareId', () => {
    it('should generate a valid share ID', () => {
      const shareId = generateShareId();
      expect(typeof shareId).toBe('string');
      expect(shareId.length).toBeGreaterThan(20);
      expect(isValidShareId(shareId)).toBe(true);
    });

    it('should generate unique share IDs', () => {
      const id1 = generateShareId();
      const id2 = generateShareId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('isValidShareId', () => {
    it('should return true for valid share IDs', () => {
      expect(isValidShareId('abcdefghijklmnopqrstuvwxyz123456')).toBe(true);
      expect(isValidShareId('1234567890abcdefghijklmnopqrstuvwxyz')).toBe(true);
    });

    it('should return false for invalid share IDs', () => {
      expect(isValidShareId('')).toBe(false);
      expect(isValidShareId('short')).toBe(false);
      expect(isValidShareId('contains-UPPERCASE')).toBe(false);
      expect(isValidShareId('contains-special-chars!')).toBe(false);
    });
  });

  describe('createSocialShareUrls', () => {
    it('should create social media share URLs', () => {
      const shareUrl = 'https://example.com/generate?shared=abc123';
      const title = 'My Custom GIF';
      const description = 'A cool GIF with text overlay';

      const result = createSocialShareUrls(shareUrl, title, description);

      expect(result.twitter).toContain('twitter.com/intent/tweet');
      expect(result.twitter).toContain(encodeURIComponent(title));
      expect(result.twitter).toContain(encodeURIComponent(shareUrl));

      expect(result.facebook).toContain('facebook.com/sharer/sharer.php');
      expect(result.facebook).toContain(encodeURIComponent(shareUrl));

      expect(result.whatsapp).toContain('wa.me/');
      expect(result.whatsapp).toContain(encodeURIComponent(title));

      expect(result.email).toContain('mailto:');
      expect(result.email).toContain(encodeURIComponent(title));
      expect(result.email).toContain(encodeURIComponent(description));

      expect(result.reddit).toContain('reddit.com/submit');
      expect(result.reddit).toContain(encodeURIComponent(shareUrl));
    });
  });

  describe('generateShareUrl', () => {
    it('should generate share URL with default base URL', () => {
      const shareId = 'abc123';
      const result = generateShareUrl(shareId);
      expect(result).toMatch(/\/generate\?shared=abc123$/);
    });

    it('should generate share URL with custom base URL', () => {
      const shareId = 'abc123';
      const baseUrl = 'https://myapp.com';
      const result = generateShareUrl(shareId, baseUrl);
      expect(result).toBe('https://myapp.com/generate?shared=abc123');
    });
  });

  describe('extractShareIdFromUrl', () => {
    it('should extract share ID from valid URLs', () => {
      expect(extractShareIdFromUrl('https://example.com/shared/abc123')).toBe('abc123');
      expect(extractShareIdFromUrl('http://localhost:3000/shared/xyz789')).toBe('xyz789');
      expect(extractShareIdFromUrl('https://example.com/generate?shared=abc123')).toBe('abc123');
      expect(extractShareIdFromUrl('http://localhost:3000/generate?shared=xyz789')).toBe('xyz789');
    });

    it('should return null for invalid URLs', () => {
      expect(extractShareIdFromUrl('https://example.com/other/abc123')).toBeNull();
      expect(extractShareIdFromUrl('https://example.com/shared/')).toBeNull();
      expect(extractShareIdFromUrl('https://example.com/generate')).toBeNull();
      expect(extractShareIdFromUrl('invalid-url')).toBeNull();
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('formatProcessingTime', () => {
    it('should format processing times correctly', () => {
      expect(formatProcessingTime(500)).toBe('500ms');
      expect(formatProcessingTime(1000)).toBe('1s');
      expect(formatProcessingTime(5000)).toBe('5s');
      expect(formatProcessingTime(65000)).toBe('1m 5s');
      expect(formatProcessingTime(120000)).toBe('2m 0s');
    });
  });

  describe('createDownloadFilename', () => {
    it('should create valid download filename', () => {
      const mockGif: ProcessedGif = {
        id: 'gif-123',
        title: 'My Cool GIF!',
        url: 'https://example.com/gif.gif',
        preview: 'https://example.com/preview.gif',
        width: 480,
        height: 270,
        source: 'mock',
        processedUrl: 'https://example.com/processed.gif',
        processedAt: new Date('2024-01-01T00:00:00Z'),
        textOverlays: [],
        fileSize: 1024000,
        processingTime: 5000
      };

      const filename = createDownloadFilename(mockGif);
      expect(filename).toMatch(/^my-cool-gif--\d{4}-\d{2}-\d{2}\.gif$/);
    });
  });

  describe('isValidSocialPlatform', () => {
    it('should return true for valid platforms', () => {
      expect(isValidSocialPlatform('twitter')).toBe(true);
      expect(isValidSocialPlatform('facebook')).toBe(true);
      expect(isValidSocialPlatform('whatsapp')).toBe(true);
      expect(isValidSocialPlatform('email')).toBe(true);
      expect(isValidSocialPlatform('reddit')).toBe(true);
    });

    it('should return false for invalid platforms', () => {
      expect(isValidSocialPlatform('instagram')).toBe(false);
      expect(isValidSocialPlatform('linkedin')).toBe(false);
      expect(isValidSocialPlatform('')).toBe(false);
    });
  });

  describe('getSocialPlatformName', () => {
    it('should return correct platform names', () => {
      expect(getSocialPlatformName('twitter')).toBe('Twitter');
      expect(getSocialPlatformName('facebook')).toBe('Facebook');
      expect(getSocialPlatformName('whatsapp')).toBe('WhatsApp');
      expect(getSocialPlatformName('email')).toBe('Email');
      expect(getSocialPlatformName('reddit')).toBe('Reddit');
    });
  });

  describe('isClipboardAvailable', () => {
    it('should return false in Node.js environment', () => {
      expect(isClipboardAvailable()).toBe(false);
    });
  });
});