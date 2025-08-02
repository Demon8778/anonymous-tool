import { Gif, ProcessedGif, ShareableLink, SocialShareUrls } from './gif';
import { TextOverlay } from './textOverlay';

// Base dialog state interface
export interface DialogState {
  isOpen: boolean;
  data?: any;
  onClose: () => void;
}

// Dialog transition states
export interface DialogTransition {
  isEntering: boolean;
  isExiting: boolean;
  duration: number;
}

// Dialog manager interface
export interface DialogManager {
  gifEditor: DialogState; // Keep for compatibility but unused
  sharing: DialogState;
  sharedViewer: DialogState;
}

export interface GifEditorState {
  selectedGif: Gif | null;
  textOverlays: TextOverlay[];
  activeOverlayId: string | null;
  isProcessing: boolean;
  processedGif: ProcessedGif | null;
  processingProgress: {
    stage: string;
    progress: number;
    message: string;
  };
}

// Sharing Dialog specific interfaces
export interface SharingDialogProps {
  gif: ProcessedGif;
  isOpen: boolean;
  onClose: () => void;
  onShareComplete: (shareData: ShareResult) => void;
}

// Share result interface for dialog completion
export interface ShareResult {
  shareId: string;
  shareUrl: string;
  socialUrls: SocialShareUrls;
}

export interface SharingState {
  isGeneratingLink: boolean;
  shareUrl: string | null;
  socialUrls: {
    twitter: string;
    facebook: string;
    reddit: string;
    linkedin: string;
  } | null;
  error: string | null;
}

// Shared GIF Dialog specific interfaces
export interface SharedGifDialogProps {
  shareId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface SharedGifState {
  sharedGif: {
    id: string;
    originalGif: Gif;
    processedGif: ProcessedGif;
    textOverlays: TextOverlay[];
    createdAt: Date;
    metadata?: {
      title?: string;
      description?: string;
    };
  } | null;
  loading: boolean;
  error: string | null;
}

// Enhanced GIF types for dialog context
export interface GifWithContext extends Gif {
  searchQuery?: string;
  searchIndex?: number;
  selectedAt: Date;
}

// Dialog animation configuration
export interface DialogAnimationConfig {
  enter: {
    duration: number;
    easing: string;
    transform: string;
    opacity: number;
  };
  exit: {
    duration: number;
    easing: string;
    transform: string;
    opacity: number;
  };
}

// Dialog responsive configuration
export interface DialogResponsiveConfig {
  mobile: {
    fullScreen: boolean;
    slideDirection: 'up' | 'down' | 'left' | 'right';
    borderRadius: string;
  };
  desktop: {
    centered: boolean;
    maxWidth: string;
    maxHeight: string;
    borderRadius: string;
  };
}

// Dialog accessibility configuration
export interface DialogAccessibilityConfig {
  focusTrap: boolean;
  escapeToClose: boolean;
  ariaLabel: string;
  ariaDescribedBy?: string;
  role: string;
}