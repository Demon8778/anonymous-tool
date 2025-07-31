/**
 * Central export for all type definitions
 */

// GIF-related types
export type {
  Gif,
  ProcessedGif,
  SearchResult,
  ProcessingProgress,
  ShareableLink,
  SharedGif,
  SocialShareUrls,
} from './gif';

// Text overlay types
export type {
  TextOverlay,
  Position,
  TextStyle,
  TextAnimation,
} from './textOverlay';

export {
  DEFAULT_TEXT_STYLE,
  DEFAULT_TEXT_ANIMATION,
} from './textOverlay';

// API types
export type {
  ApiResponse,
  ProcessingRequest,
  ApiError,
  ProcessingError,
  GifSearchService,
  GifProcessingService,
  SharingService,
  SearchGifsResponse,
  ProcessGifResponse,
  ShareGifResponse,
  GetSharedGifResponse,
  SearchGifsRequest,
  ShareGifRequest,
} from './api';