/**
 * Utility functions for sharing functionality
 */

import type { ProcessedGif, SocialShareUrls } from '../types';

/**
 * Generate a unique share ID
 */
export function generateShareId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Validate a share ID format
 */
export function isValidShareId(shareId: string): boolean {
  return /^[a-z0-9]{20,}$/.test(shareId);
}

/**
 * Create social media share URLs with custom content
 */
export function createSocialShareUrls(
  shareUrl: string,
  title: string,
  description?: string
): SocialShareUrls {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || title);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`
  };
}

/**
 * Generate a shareable URL for a GIF
 */
export function generateShareUrl(shareId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  return `${base}/shared/${shareId}`;
}

/**
 * Extract share ID from a share URL
 */
export function extractShareIdFromUrl(url: string): string | null {
  const match = url.match(/\/shared\/([a-z0-9]+)$/);
  return match ? match[1] : null;
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format processing time in human readable format
 */
export function formatProcessingTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Create a download filename for a processed GIF
 */
export function createDownloadFilename(gif: ProcessedGif): string {
  const title = gif.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const timestamp = new Date().toISOString().split('T')[0];
  return `${title}-${timestamp}.gif`;
}

/**
 * Validate social media platform
 */
export function isValidSocialPlatform(platform: string): platform is keyof SocialShareUrls {
  return ['twitter', 'facebook', 'whatsapp', 'email', 'reddit'].includes(platform);
}

/**
 * Get social media platform display name
 */
export function getSocialPlatformName(platform: keyof SocialShareUrls): string {
  const names = {
    twitter: 'Twitter',
    facebook: 'Facebook',
    whatsapp: 'WhatsApp',
    email: 'Email',
    reddit: 'Reddit'
  };
  return names[platform];
}

/**
 * Check if clipboard API is available
 */
export function isClipboardAvailable(): boolean {
  return typeof window !== 'undefined' && 
         typeof navigator !== 'undefined' && 
         typeof navigator.clipboard !== 'undefined';
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (isClipboardAvailable()) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers
    if (typeof window !== 'undefined') {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}