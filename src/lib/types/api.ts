/**
 * API response types and service interfaces
 */

import type { Gif, ProcessedGif, SearchResult, ProcessingProgress, ShareableLink, SharedGif, SocialShareUrls } from './gif';
import type { TextOverlay } from './textOverlay';

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Processing request payload
export interface ProcessingRequest {
  gifUrl: string;
  textOverlays: TextOverlay[];
  outputFormat: 'gif' | 'mp4' | 'webm';
  quality: 'low' | 'medium' | 'high';
}

// Error types
export interface ApiError {
  type: 'api_error' | 'network_error' | 'validation_error' | 'unknown_error' | 'timeout_error';
  message: string;
  recoverable: boolean;
  retryable: boolean;
}

export interface ProcessingError {
  type: 'processing_error' | 'memory_error' | 'format_error' | 'timeout_error';
  message: string;
  recoverable: boolean;
  retryable: boolean;
}

// Service interfaces
export interface GifSearchService {
  searchGifs(query: string, options?: { limit?: number; offset?: number }): Promise<SearchResult>;
  getGifById(id: string): Promise<Gif | null>;
}

export interface GifProcessingService {
  processGif(gif: Gif, overlays: TextOverlay[]): Promise<ProcessedGif>;
  getProcessingProgress(): Promise<ProcessingProgress>;
  cancelProcessing(): Promise<void>;
}

export interface SharingService {
  createShareableLink(gif: ProcessedGif): Promise<ShareableLink>;
  getSharedGif(shareId: string): Promise<SharedGif | null>;
  generateSocialShareUrls(gif: ProcessedGif): SocialShareUrls;
}

// API endpoint response types
export interface SearchGifsResponse extends ApiResponse<SearchResult> {}

export interface ProcessGifResponse extends ApiResponse<ProcessedGif> {}

export interface ShareGifResponse extends ApiResponse<ShareableLink> {}

export interface GetSharedGifResponse extends ApiResponse<SharedGif> {}

// Request validation types
export interface SearchGifsRequest {
  query: string;
  limit?: number;
  offset?: number;
}

export interface ShareGifRequest {
  gifId: string;
  metadata?: {
    title?: string;
    description?: string;
  };
}