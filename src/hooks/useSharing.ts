/**
 * React hook for sharing functionality
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { sharingService } from '@/lib/services/sharingService';
import type { ProcessedGif, ShareableLink, SocialShareUrls } from '@/lib/types';

interface UseSharingReturn {
  isCreatingLink: boolean;
  shareableLink: ShareableLink | null;
  socialUrls: SocialShareUrls | null;
  error: string | null;
  isLoading: boolean;
  createShareableLink: (gif: ProcessedGif) => Promise<void>;
  copyToClipboard: (text: string) => Promise<boolean>;
  generateSocialUrls: (gif: ProcessedGif, shareUrl?: string) => SocialShareUrls;
  reset: () => void;
  clearError: () => void;
  retryLastOperation: () => Promise<void>;
}

export function useSharing(): UseSharingReturn {
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [shareableLink, setShareableLink] = useState<ShareableLink | null>(null);
  const [socialUrls, setSocialUrls] = useState<SocialShareUrls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for cleanup and retry functionality
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastOperationRef = useRef<(() => Promise<void>) | null>(null);

  const createShareableLink = useCallback(async (gif: ProcessedGif) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setIsCreatingLink(true);
    setIsLoading(true);
    setError(null);

    // Store operation for retry
    lastOperationRef.current = () => createShareableLink(gif);

    try {
      // Create shareable link via API
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gifId: gif.id,
          metadata: {
            title: gif.title,
            description: `Custom GIF with ${gif.textOverlays.length} text overlay${gif.textOverlays.length !== 1 ? 's' : ''}`
          }
        }),
        signal: abortControllerRef.current.signal,
      });

      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create shareable link');
      }

      const link = result.data as ShareableLink;
      setShareableLink(link);

      // Generate social media URLs
      const social = sharingService.generateSocialShareUrls(gif, link.url);
      setSocialUrls(social);

    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      let errorMessage = 'Failed to create shareable link';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      console.error('Error creating shareable link:', err);
    } finally {
      setIsCreatingLink(false);
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    setError(null);
    
    try {
      const success = await sharingService.copyToClipboard(text);
      if (!success) {
        setError('Failed to copy to clipboard. Please try selecting and copying manually.');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy to clipboard';
      setError(errorMessage);
      console.error('Clipboard error:', err);
      return false;
    }
  }, []);

  const generateSocialUrls = useCallback((gif: ProcessedGif, shareUrl?: string): SocialShareUrls => {
    try {
      return sharingService.generateSocialShareUrls(gif, shareUrl);
    } catch (err) {
      console.error('Error generating social URLs:', err);
      setError('Failed to generate social media URLs');
      // Return empty URLs as fallback
      return {
        twitter: '',
        facebook: '',
        whatsapp: '',
        email: '',
        reddit: ''
      };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryLastOperation = useCallback(async () => {
    if (lastOperationRef.current) {
      await lastOperationRef.current();
    }
  }, []);

  const reset = useCallback(() => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setShareableLink(null);
    setSocialUrls(null);
    setError(null);
    setIsCreatingLink(false);
    setIsLoading(false);
    lastOperationRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isCreatingLink,
    shareableLink,
    socialUrls,
    error,
    isLoading,
    createShareableLink,
    copyToClipboard,
    generateSocialUrls,
    reset,
    clearError,
    retryLastOperation,
  };
}