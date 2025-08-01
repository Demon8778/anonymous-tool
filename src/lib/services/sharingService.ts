/**
 * Sharing service for creating shareable links and social media sharing
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  generateShareId, 
  generateShareUrl, 
  createSocialShareUrls, 
  copyToClipboard as utilCopyToClipboard 
} from '../utils/sharingUtils';
import type { 
  ProcessedGif, 
  ShareableLink, 
  SharedGif, 
  SocialShareUrls,
  SharingService as ISharingService 
} from '../types';

// In-memory storage for shared GIFs (in production, this would use a database)
const sharedGifs = new Map<string, SharedGif>();

export class SharingService implements ISharingService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  }

  /**
   * Create a shareable link for a processed GIF
   */
  async createShareableLink(gif: ProcessedGif): Promise<ShareableLink> {
    const shareId = generateShareId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expire in 30 days

    const shareableLink: ShareableLink = {
      id: shareId,
      url: generateShareUrl(shareId, this.baseUrl),
      expiresAt,
      viewCount: 0
    };

    const sharedGif: SharedGif = {
      id: shareId,
      gif,
      createdAt: new Date(),
      metadata: {
        title: gif.title || 'Custom GIF',
        description: `A custom GIF with ${gif.textOverlays.length} text overlay${gif.textOverlays.length !== 1 ? 's' : ''}`
      }
    };

    // Store the shared GIF
    sharedGifs.set(shareId, sharedGif);

    return shareableLink;
  }

  /**
   * Retrieve a shared GIF by its share ID
   */
  async getSharedGif(shareId: string): Promise<SharedGif | null> {
    const sharedGif = sharedGifs.get(shareId);
    
    if (!sharedGif) {
      return null;
    }

    // Check if the link has expired
    if (new Date() > new Date(sharedGif.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000)) {
      sharedGifs.delete(shareId);
      return null;
    }

    return sharedGif;
  }

  /**
   * Generate social media sharing URLs
   */
  generateSocialShareUrls(gif: ProcessedGif, shareUrl?: string): SocialShareUrls {
    const url = shareUrl || generateShareUrl(gif.id, this.baseUrl);
    const title = gif.title || 'Check out this custom GIF!';
    const description = `A custom GIF with ${gif.textOverlays.length} text overlay${gif.textOverlays.length !== 1 ? 's' : ''}`;
    
    return createSocialShareUrls(url, title, description);
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    return utilCopyToClipboard(text);
  }

  /**
   * Increment view count for a shared GIF
   */
  async incrementViewCount(shareId: string): Promise<void> {
    const sharedGif = sharedGifs.get(shareId);
    if (sharedGif) {
      // In a real implementation, this would update the database
      // For now, we'll just log it
      console.log(`View count incremented for share ID: ${shareId}`);
    }
  }

  /**
   * Get sharing statistics for a GIF
   */
  async getSharingStats(shareId: string): Promise<{ viewCount: number; createdAt: Date } | null> {
    const sharedGif = sharedGifs.get(shareId);
    if (!sharedGif) {
      return null;
    }

    return {
      viewCount: 0, // Would come from database in real implementation
      createdAt: sharedGif.createdAt
    };
  }

  /**
   * Delete a shared GIF
   */
  async deleteSharedGif(shareId: string): Promise<boolean> {
    return sharedGifs.delete(shareId);
  }

  /**
   * Clean up expired shared GIFs
   */
  async cleanupExpiredShares(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;

    for (const [shareId, sharedGif] of sharedGifs.entries()) {
      const expirationDate = new Date(sharedGif.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (now > expirationDate) {
        sharedGifs.delete(shareId);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}

// Export a singleton instance
export const sharingService = new SharingService();