/**
 * GIF Processing Service
 * Handles GIF processing operations using FFmpeg WASM utilities
 */

import type { Gif, ProcessedGif, ProcessingProgress } from "../types/gif";
import type { TextOverlay } from "../types/textOverlay";
import type { GifProcessingService, ProcessingError } from "../types/api";
import {
  FFmpegProcessor,
  getFFmpegProcessor,
  type FFmpegProcessorOptions,
} from "../utils/ffmpegUtils";
import { generateProcessingId } from "../utils/ffmpegHelpers";
import { handleProcessingError } from "../utils/errorHandler";
import { validateGif, validateTextOverlays } from "../utils/validation";
import {
  retryWithBackoff,
  retryConditions,
  circuitBreakers,
} from "../utils/retryUtils";
import { processedGifCache, createCacheKey } from "../utils/cache";

export interface ProcessingOptions {
  quality?: "low" | "medium" | "high";
  outputFormat?: "gif" | "mp4" | "webm";
  enableProgress?: boolean;
  maxMemoryUsage?: number;
}

export interface ProcessingStatus {
  id: string;
  status:
    | "idle"
    | "initializing"
    | "processing"
    | "complete"
    | "error"
    | "cancelled";
  progress: ProcessingProgress;
  error?: ProcessingError;
  result?: ProcessedGif;
  startTime?: Date;
  endTime?: Date;
}

/**
 * Service class for handling GIF processing operations
 */
export class GifProcessingServiceImpl implements GifProcessingService {
  private processor: FFmpegProcessor;
  private currentProcessing: ProcessingStatus | null = null;
  private progressCallbacks: Set<(progress: ProcessingProgress) => void> =
    new Set();

  constructor(options: ProcessingOptions = {}) {
    const processorOptions: FFmpegProcessorOptions = {
      quality: options.quality || "medium",
      outputFormat: options.outputFormat || "gif",
      enableProgress: options.enableProgress !== false,
      maxMemoryUsage: options.maxMemoryUsage,
    };

    this.processor = getFFmpegProcessor(processorOptions);
    this.processor.setProgressCallback(this.handleProgressUpdate.bind(this));
  }

  /**
   * Process a GIF with text overlays with caching and retry logic
   */
  async processGif(gif: Gif, overlays: TextOverlay[]): Promise<ProcessedGif> {
    // Check if already processing
    if (
      this.currentProcessing &&
      this.currentProcessing.status === "processing"
    ) {
      throw this.createProcessingError(
        "processing_error",
        "Another processing operation is already in progress",
        false,
        true
      );
    }

    // Create cache key for processed GIF
    const cacheKey = createCacheKey(
      "processed",
      gif.id,
      JSON.stringify(overlays)
    );

    // Check cache first
    const cachedResult = processedGifCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const processingId = generateProcessingId();
    const startTime = new Date();

    // Initialize processing status
    this.currentProcessing = {
      id: processingId,
      status: "initializing",
      progress: { progress: 0, stage: "loading" },
      startTime,
    };

    try {
      // Validate inputs
      this.validateProcessingInputs(gif, overlays);

      // Update status to processing
      this.currentProcessing.status = "processing";
      this.notifyProgressUpdate();

      // Process with retry logic and circuit breaker
      const result = await circuitBreakers.gifProcessing.execute(() =>
        retryWithBackoff(
          async () => {
            // Initialize FFmpeg if not already done
            if (!this.processor.isCurrentlyProcessing()) {
              await this.processor.initialize();
            }

            // Process the GIF with text overlays
            return await this.processor.processGifWithText(gif.url, overlays);
          },
          {
            maxAttempts: 2,
            baseDelay: 2000,
            retryCondition: retryConditions.processingErrors,
            onRetry: (attempt, error) => {
              console.warn(`GIF processing retry attempt ${attempt}:`, error);
              // Reset processing status for retry
              this.currentProcessing!.progress = {
                progress: 0,
                stage: "loading",
              };
              this.notifyProgressUpdate();
            },
          }
        )
      );

      // Create processed GIF object
      const processedGif: ProcessedGif = {
        ...gif,
        id: processingId,
        processedUrl: this.createBlobUrl(result.data),
        processedAt: new Date(),
        textOverlays: overlays,
        fileSize: result.fileSize,
        processingTime: result.processingTime,
      };

      // Cache the result
      processedGifCache.set(cacheKey, processedGif);

      // Update status to complete
      this.currentProcessing = {
        ...this.currentProcessing,
        status: "complete",
        progress: { progress: 1, stage: "complete" },
        result: processedGif,
        endTime: new Date(),
      };

      this.notifyProgressUpdate();
      return processedGif;
    } catch (error) {
      const processingError = handleProcessingError(error, {
        component: "GifProcessingService",
        action: "processGif",
        metadata: { gifId: gif.id, overlayCount: overlays.length },
      });

      // Update status to error
      this.currentProcessing = {
        ...this.currentProcessing,
        status: "error",
        error: processingError,
        endTime: new Date(),
      };

      this.notifyProgressUpdate();
      throw processingError;
    }
  }

  /**
   * Get current processing progress
   */
  async getProcessingProgress(): Promise<ProcessingProgress> {
    if (!this.currentProcessing) {
      return { progress: 0, stage: "loading" };
    }

    return this.currentProcessing.progress;
  }

  /**
   * Cancel current processing operation
   */
  async cancelProcessing(): Promise<void> {
    if (
      !this.currentProcessing ||
      this.currentProcessing.status !== "processing"
    ) {
      return;
    }

    try {
      await this.processor.cancelProcessing();

      this.currentProcessing = {
        ...this.currentProcessing,
        status: "cancelled",
        progress: { progress: 0, stage: "complete" },
        endTime: new Date(),
      };

      this.notifyProgressUpdate();
    } catch (error) {
      console.error("Error cancelling processing:", error);
      // Still mark as cancelled even if cleanup failed
      this.currentProcessing = {
        ...this.currentProcessing,
        status: "cancelled",
        endTime: new Date(),
      };
    }
  }

  /**
   * Get current processing status
   */
  getProcessingStatus(): ProcessingStatus | null {
    return this.currentProcessing ? { ...this.currentProcessing } : null;
  }

  /**
   * Subscribe to progress updates
   */
  onProgressUpdate(
    callback: (progress: ProcessingProgress) => void
  ): () => void {
    this.progressCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.progressCallbacks.delete(callback);
    };
  }

  /**
   * Check if processor is currently processing
   */
  isProcessing(): boolean {
    return this.currentProcessing?.status === "processing" || false;
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage(): { current: number; max: number; percentage: number } {
    return this.processor.getMemoryUsage();
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(): {
    totalProcessed: number;
    averageProcessingTime: number;
    totalProcessingTime: number;
    successRate: number;
  } {
    // This would be implemented with persistent storage in a real application
    return {
      totalProcessed: 0,
      averageProcessingTime: 0,
      totalProcessingTime: 0,
      successRate: 1,
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): any {
    return processedGifCache.getStats();
  }

  /**
   * Clear processed GIF cache
   */
  clearCache(): void {
    processedGifCache.clear();
  }

  /**
   * Dispose of resources
   */
  async dispose(): Promise<void> {
    this.progressCallbacks.clear();
    await this.processor.dispose();
    this.currentProcessing = null;
  }

  // Private methods

  private validateProcessingInputs(gif: Gif, overlays: TextOverlay[]): void {
    // Validate GIF
    const gifValidation = validateGif(gif);
    if (!gifValidation.isValid) {
      throw handleProcessingError(new Error(gifValidation.errors[0]), {
        component: "GifProcessingService",
        action: "validateGif",
      });
    }

    // Validate text overlays array
    if (!Array.isArray(overlays)) {
      throw handleProcessingError(new Error("Invalid text overlays provided"), {
        component: "GifProcessingService",
        action: "validateTextOverlays",
      });
    }

    // Validate text overlays
    const overlaysValidation = validateTextOverlays(overlays);
    if (!overlaysValidation.isValid) {
      throw handleProcessingError(new Error(overlaysValidation.errors[0]), {
        component: "GifProcessingService",
        action: "validateTextOverlays",
      });
    }

    // Check that at least one overlay has text
    const hasValidOverlay = overlays.some(
      (overlay) => overlay.text && overlay.text.trim().length > 0
    );

    if (!hasValidOverlay) {
      throw handleProcessingError(
        new Error("At least one text overlay with content is required"),
        {
          component: "GifProcessingService",
          action: "validateTextOverlays",
        }
      );
    }
  }

  private createBlobUrl(data: Uint8Array): string {
    const blob = new Blob([data], { type: "image/gif" });
    return URL.createObjectURL(blob);
  }

  private handleProgressUpdate(progress: ProcessingProgress): void {
    if (this.currentProcessing) {
      this.currentProcessing.progress = progress;
      this.notifyProgressUpdate();
    }
  }

  private notifyProgressUpdate(): void {
    if (this.currentProcessing) {
      const progress = this.currentProcessing.progress;
      this.progressCallbacks.forEach((callback) => {
        try {
          callback(progress);
        } catch (error) {
          console.error("Error in progress callback:", error);
        }
      });
    }
  }

  // Remove this method as we're now using the centralized error handler

  private createProcessingError(
    type: ProcessingError["type"],
    message: string,
    recoverable: boolean,
    retryable: boolean
  ): ProcessingError {
    return {
      type,
      message,
      recoverable,
      retryable,
    };
  }
}

// Singleton instance for global use
let globalProcessingService: GifProcessingServiceImpl | null = null;

/**
 * Get or create global processing service instance
 */
export function getGifProcessingService(
  options?: ProcessingOptions
): GifProcessingServiceImpl {
  if (!globalProcessingService) {
    globalProcessingService = new GifProcessingServiceImpl(options);
  }
  return globalProcessingService;
}

/**
 * Dispose of global processing service instance
 */
export async function disposeGlobalProcessingService(): Promise<void> {
  if (globalProcessingService) {
    await globalProcessingService.dispose();
    globalProcessingService = null;
  }
}

// Export default instance
export const gifProcessingService = getGifProcessingService();
