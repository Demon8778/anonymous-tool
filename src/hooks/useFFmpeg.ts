"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { FFmpegProcessor, getFFmpegProcessor, disposeGlobalFFmpegProcessor } from '@/lib/utils/ffmpegUtils';
import type { ProcessingProgress } from '@/lib/types/gif';
import type { TextOverlay } from '@/lib/types/textOverlay';
import type { ProcessingError } from '@/lib/types/api';

export interface UseFFmpegOptions {
  quality?: 'low' | 'medium' | 'high';
  outputFormat?: 'gif' | 'mp4' | 'webm';
  maxMemoryUsage?: number;
  autoInitialize?: boolean;
}

export interface UseFFmpegReturn {
  // State
  isInitialized: boolean;
  isInitializing: boolean;
  isProcessing: boolean;
  progress: ProcessingProgress;
  error: ProcessingError | null;
  memoryUsage: { current: number; max: number; percentage: number };
  
  // Actions
  initialize: () => Promise<void>;
  processGif: (gifUrl: string, textOverlays: TextOverlay[]) => Promise<Uint8Array>;
  cancelProcessing: () => Promise<void>;
  dispose: () => Promise<void>;
  clearError: () => void;
  
  // Utils
  isSupported: boolean;
}

/**
 * Hook for managing FFmpeg WASM with lazy loading and performance optimizations
 */
export function useFFmpeg(options: UseFFmpegOptions = {}): UseFFmpegReturn {
  const {
    quality = 'medium',
    outputFormat = 'gif',
    maxMemoryUsage,
    autoInitialize = false
  } = options;

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress>({ progress: 0, stage: 'loading' });
  const [error, setError] = useState<ProcessingError | null>(null);
  const [memoryUsage, setMemoryUsage] = useState({ current: 0, max: 0, percentage: 0 });

  // Refs
  const processorRef = useRef<FFmpegProcessor | null>(null);
  const initializationPromiseRef = useRef<Promise<void> | null>(null);

  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    'WebAssembly' in window && 
    'SharedArrayBuffer' in window;

  // Initialize FFmpeg processor
  const initialize = useCallback(async () => {
    if (isInitialized || isInitializing) {
      return initializationPromiseRef.current || Promise.resolve();
    }

    if (!isSupported) {
      const unsupportedError: ProcessingError = {
        type: 'processing_error',
        message: 'Your browser does not support WebAssembly or SharedArrayBuffer, which are required for GIF processing.',
        recoverable: false,
        retryable: false
      };
      setError(unsupportedError);
      throw unsupportedError;
    }

    setIsInitializing(true);
    setError(null);

    const initPromise = (async () => {
      try {
        // Get or create processor instance
        processorRef.current = getFFmpegProcessor({
          quality,
          outputFormat,
          maxMemoryUsage,
          enableProgress: true
        });

        // Set up progress callback
        processorRef.current.setProgressCallback((newProgress) => {
          setProgress(newProgress);
          setMemoryUsage(processorRef.current!.getMemoryUsage());
        });

        // Initialize FFmpeg WASM
        await processorRef.current.initialize();
        
        setIsInitialized(true);
        setMemoryUsage(processorRef.current.getMemoryUsage());
      } catch (err) {
        const initError: ProcessingError = {
          type: 'processing_error',
          message: err instanceof Error ? err.message : 'Failed to initialize FFmpeg',
          recoverable: true,
          retryable: true
        };
        setError(initError);
        throw initError;
      } finally {
        setIsInitializing(false);
        initializationPromiseRef.current = null;
      }
    })();

    initializationPromiseRef.current = initPromise;
    return initPromise;
  }, [isInitialized, isInitializing, isSupported, quality, outputFormat, maxMemoryUsage]);

  // Process GIF with text overlays
  const processGif = useCallback(async (gifUrl: string, textOverlays: TextOverlay[]): Promise<Uint8Array> => {
    // Ensure FFmpeg is initialized
    if (!isInitialized) {
      await initialize();
    }

    if (!processorRef.current) {
      throw new Error('FFmpeg processor not available');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await processorRef.current.processGifWithText(gifUrl, textOverlays);
      setMemoryUsage(processorRef.current.getMemoryUsage());
      return result.data;
    } catch (err) {
      const processError: ProcessingError = {
        type: 'processing_error',
        message: err instanceof Error ? err.message : 'Failed to process GIF',
        recoverable: true,
        retryable: true
      };
      setError(processError);
      throw processError;
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized, initialize]);

  // Cancel current processing
  const cancelProcessing = useCallback(async () => {
    if (processorRef.current && isProcessing) {
      try {
        await processorRef.current.cancelProcessing();
        setIsProcessing(false);
        setProgress({ progress: 0, stage: 'complete' });
      } catch (err) {
        console.error('Error cancelling processing:', err);
      }
    }
  }, [isProcessing]);

  // Dispose of FFmpeg resources
  const dispose = useCallback(async () => {
    if (processorRef.current) {
      try {
        await processorRef.current.dispose();
      } catch (err) {
        console.error('Error disposing FFmpeg processor:', err);
      }
    }
    
    // Dispose global processor
    await disposeGlobalFFmpegProcessor();
    
    processorRef.current = null;
    setIsInitialized(false);
    setIsProcessing(false);
    setProgress({ progress: 0, stage: 'loading' });
    setMemoryUsage({ current: 0, max: 0, percentage: 0 });
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-initialize if requested
  useEffect(() => {
    if (autoInitialize && isSupported && !isInitialized && !isInitializing) {
      initialize().catch(console.error);
    }
  }, [autoInitialize, isSupported, isInitialized, isInitializing, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't dispose on unmount to allow reuse across components
      // Only dispose when explicitly called
    };
  }, []);

  // Update memory usage periodically when processing
  useEffect(() => {
    if (!isProcessing || !processorRef.current) return;

    const interval = setInterval(() => {
      if (processorRef.current) {
        setMemoryUsage(processorRef.current.getMemoryUsage());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isProcessing]);

  return {
    // State
    isInitialized,
    isInitializing,
    isProcessing,
    progress,
    error,
    memoryUsage,
    
    // Actions
    initialize,
    processGif,
    cancelProcessing,
    dispose,
    clearError,
    
    // Utils
    isSupported
  };
}