/**
 * Core GIF-related types and interfaces
 */

import type { TextOverlay } from './textOverlay';

export interface Gif {
  id: string;
  title: string;
  url: string;
  preview: string;
  width: number;
  height: number;
  duration?: number;
  frameCount?: number;
  source: 'tenor' | 'giphy' | 'mock';
}

export interface ProcessedGif extends Gif {
  processedUrl: string;
  processedAt: Date;
  textOverlays: TextOverlay[];
  fileSize: number;
  processingTime: number;
}

export interface SearchResult {
  results: Gif[];
  totalCount: number;
  hasMore: boolean;
}

export interface ProcessingProgress {
  progress: number; // 0-1
  stage: 'loading' | 'processing' | 'encoding' | 'complete';
  timeRemaining?: number;
}

export interface ShareableLink {
  id: string;
  url: string;
  expiresAt: Date;
  viewCount: number;
}

export interface SharedGif {
  id: string;
  gif: ProcessedGif;
  createdAt: Date;
  metadata: {
    title?: string;
    description?: string;
  };
}

export interface SocialShareUrls {
  twitter: string;
  facebook: string;
  whatsapp: string;
  email: string;
  reddit: string;
}