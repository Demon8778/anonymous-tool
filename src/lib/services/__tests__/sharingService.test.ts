/**
 * Tests for sharing service
 */

import { SharingService } from '../sharingService';
import type { ProcessedGif } from '../../types';

// Mock the utilities
jest.mock('../../utils/sharingUtils', () => ({
  generateShareId: jest.fn(() => 'mock-share-id-12345'),
  generateShareUrl: jest.fn((id: string, baseUrl?: string) => `${baseUrl || 'http://localhost:3000'}/generate?shared=${id}`),
  createSocialShareUrls: jest.fn(() => ({
    twitter: 'https://twitter.com/intent/tweet?text=Mock%20Title&url=http%3A//localhost%3A3000/generate%3Fshared%3Dmock-share-id-12345',
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=http%3A//localhost%3A3000/generate%3Fshared%3Dmock-share-id-12345',
    whatsapp: 'https://wa.me/?text=Mock%20Title%20http%3A//localhost%3A3000/generate%3Fshared%3Dmock-share-id-12345',
    email: 'mailto:?subject=Mock%20Title&body=Mock%20Description%0A%0Ahttp%3A//localhost%3A3000/generate%3Fshared%3Dmock-share-id-12345',
    reddit: 'https://reddit.com/submit?url=http%3A//localhost%3A3000/generate%3Fshared%3Dmock-share-id-12345&title=Mock%20Title'
  })),
  copyToClipboard: jest.fn(() => Promise.resolve(true))
}));

describe('SharingService', () => {
  let sharingService: SharingService;
  let mockGif: ProcessedGif;

  beforeEach(() => {
    sharingService = new SharingService('http://localhost:3000');
    mockGif = {
      id: 'gif-123',
      title: 'Test GIF',
      url: 'https://example.com/test.gif',
      preview: 'https://example.com/preview.gif',
      width: 480,
      height: 270,
      source: 'mock',
      processedUrl: 'https://example.com/processed.gif',
      processedAt: new Date('2024-01-01T00:00:00Z'),
      textOverlays: [
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
      ],
      fileSize: 1024000,
      processingTime: 5000
    };
  });

  describe('createShareableLink', () => {
    it('should create a shareable link for a processed GIF', async () => {
      const result = await sharingService.createShareableLink(mockGif);

      expect(result).toEqual({
        id: 'mock-share-id-12345',
        url: 'http://localhost:3000/generate?shared=mock-share-id-12345',
        expiresAt: expect.any(Date),
        viewCount: 0
      });

      // Check that expiration date is 30 days from now
      const expectedExpiration = new Date();
      expectedExpiration.setDate(expectedExpiration.getDate() + 30);
      const actualExpiration = new Date(result.expiresAt);
      
      // Allow for small time differences (within 1 minute)
      expect(Math.abs(actualExpiration.getTime() - expectedExpiration.getTime())).toBeLessThan(60000);
    });
  });

  describe('getSharedGif', () => {
    it('should return null for non-existent share ID', async () => {
      const result = await sharingService.getSharedGif('non-existent-id');
      expect(result).toBeNull();
    });

    it('should return shared GIF for valid share ID', async () => {
      // First create a shareable link
      const shareableLink = await sharingService.createShareableLink(mockGif);
      
      // Then retrieve it
      const result = await sharingService.getSharedGif(shareableLink.id);
      
      expect(result).toEqual({
        id: shareableLink.id,
        gif: mockGif,
        createdAt: expect.any(Date),
        metadata: {
          title: 'Test GIF',
          description: 'A custom GIF with 1 text overlay'
        }
      });
    });
  });

  describe('generateSocialShareUrls', () => {
    it('should generate social media sharing URLs', () => {
      const result = sharingService.generateSocialShareUrls(mockGif);

      expect(result).toEqual({
        twitter: 'https://twitter.com/intent/tweet?text=Mock%20Title&url=http%3A//localhost%3A3000/generate%3Fshared%3Dmock-share-id-12345',
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=http%3A//localhost%3A3000/generate%3Fshared%3Dmock-share-id-12345',
        whatsapp: 'https://wa.me/?text=Mock%20Title%20http%3A//localhost%3A3000/generate%3Fshared%3Dmock-share-id-12345',
        email: 'mailto:?subject=Mock%20Title&body=Mock%20Description%0A%0Ahttp%3A//localhost%3A3000/generate%3Fshared%3Dmock-share-id-12345',
        reddit: 'https://reddit.com/submit?url=http%3A//localhost%3A3000/generate%3Fshared%3Dmock-share-id-12345&title=Mock%20Title'
      });
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', async () => {
      const result = await sharingService.copyToClipboard('test text');
      expect(result).toBe(true);
    });
  });

  describe('incrementViewCount', () => {
    it('should increment view count for existing shared GIF', async () => {
      const shareableLink = await sharingService.createShareableLink(mockGif);
      
      // This should not throw an error
      await expect(sharingService.incrementViewCount(shareableLink.id)).resolves.toBeUndefined();
    });
  });

  describe('getSharingStats', () => {
    it('should return null for non-existent share ID', async () => {
      const result = await sharingService.getSharingStats('non-existent-id');
      expect(result).toBeNull();
    });

    it('should return stats for existing shared GIF', async () => {
      const shareableLink = await sharingService.createShareableLink(mockGif);
      const result = await sharingService.getSharingStats(shareableLink.id);
      
      expect(result).toEqual({
        viewCount: 0,
        createdAt: expect.any(Date)
      });
    });
  });

  describe('deleteSharedGif', () => {
    it('should delete shared GIF and return true', async () => {
      const shareableLink = await sharingService.createShareableLink(mockGif);
      const result = await sharingService.deleteSharedGif(shareableLink.id);
      
      expect(result).toBe(true);
      
      // Verify it's deleted
      const deletedGif = await sharingService.getSharedGif(shareableLink.id);
      expect(deletedGif).toBeNull();
    });

    it('should return false for non-existent share ID', async () => {
      const result = await sharingService.deleteSharedGif('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('cleanupExpiredShares', () => {
    it('should return 0 when no expired shares exist', async () => {
      await sharingService.createShareableLink(mockGif);
      const result = await sharingService.cleanupExpiredShares();
      expect(result).toBe(0);
    });
  });
});