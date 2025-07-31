/**
 * FFmpeg WASM utility service for GIF processing with text overlays
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import type { TextOverlay } from '../types/textOverlay';
import type { ProcessingProgress } from '../types/gif';
import type { ProcessingError } from '../types/api';
import {
  FFMPEG_CONFIG,
  QUALITY_SETTINGS,
  FILE_LIMITS,
  PROCESSING_TIMEOUTS,
  FFMPEG_COMMANDS,
  TEXT_OVERLAY_DEFAULTS,
  PROCESSING_STAGES,
  ERROR_MESSAGES,
  MEMORY_SETTINGS,
} from '../constants/ffmpeg';
import {
  escapeTextForFFmpeg,
  validateOverlayPosition,
  estimateMemoryUsage,
  generateProcessingId,
} from './ffmpegHelpers';

export interface FFmpegProcessorOptions {
  quality?: 'low' | 'medium' | 'high';
  outputFormat?: 'gif' | 'mp4' | 'webm';
  maxMemoryUsage?: number;
  enableProgress?: boolean;
}

export interface ProcessingResult {
  data: Uint8Array;
  fileSize: number;
  processingTime: number;
  metadata: {
    width: number;
    height: number;
    duration?: number;
    frameCount?: number;
  };
}

/**
 * FFmpeg WASM processor for handling GIF text overlay operations
 */
export class FFmpegProcessor {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;
  private isProcessing = false;
  private currentProgress: ProcessingProgress = {
    progress: 0,
    stage: 'loading',
  };
  private progressCallback?: (progress: ProcessingProgress) => void;
  private processingStartTime = 0;
  private memoryUsage = 0;

  constructor(private options: FFmpegProcessorOptions = {}) {
    this.options = {
      quality: 'medium',
      outputFormat: 'gif',
      maxMemoryUsage: MEMORY_SETTINGS.maxMemoryUsage,
      enableProgress: true,
      ...options,
    };
  }

  /**
   * Initialize FFmpeg WASM with core and worker modules
   */
  async initialize(): Promise<void> {
    if (this.isLoaded && this.ffmpeg) {
      return;
    }

    try {
      this.updateProgress(0, 'loading', 'Initializing FFmpeg...');
      
      this.ffmpeg = new FFmpeg();
      
      // Set up event listeners for progress tracking and logging
      this.ffmpeg.on('log', this.handleLog.bind(this));
      this.ffmpeg.on('progress', this.handleProgress.bind(this));

      // Load FFmpeg core modules with timeout
      const initPromise = this.ffmpeg.load({
        coreURL: await toBlobURL(
          `${FFMPEG_CONFIG.baseURL}/${FFMPEG_CONFIG.coreJS}`,
          'text/javascript'
        ),
        wasmURL: await toBlobURL(
          `${FFMPEG_CONFIG.baseURL}/${FFMPEG_CONFIG.coreWasm}`,
          'application/wasm'
        ),
        workerURL: await toBlobURL(
          `${FFMPEG_CONFIG.baseURL}/${FFMPEG_CONFIG.workerJS}`,
          'text/javascript'
        ),
      });

      // Add timeout to initialization
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(ERROR_MESSAGES.INITIALIZATION_FAILED));
        }, PROCESSING_TIMEOUTS.initialization);
      });

      await Promise.race([initPromise, timeoutPromise]);
      
      this.isLoaded = true;
      this.updateProgress(1, 'complete', 'FFmpeg initialized successfully');
      
    } catch (error) {
      this.isLoaded = false;
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.INITIALIZATION_FAILED;
      throw this.createProcessingError('processing_error', errorMessage, true, true);
    }
  }

  /**
   * Process GIF with text overlays using FFmpeg WASM
   */
  async processGifWithText(
    gifUrl: string,
    textOverlays: TextOverlay[]
  ): Promise<ProcessingResult> {
    if (!this.isLoaded || !this.ffmpeg) {
      throw this.createProcessingError(
        'processing_error',
        ERROR_MESSAGES.INITIALIZATION_FAILED,
        true,
        false
      );
    }

    if (this.isProcessing) {
      throw this.createProcessingError(
        'processing_error',
        'Another processing operation is already in progress',
        false,
        true
      );
    }

    this.isProcessing = true;
    this.processingStartTime = Date.now();

    try {
      // Validate input
      await this.validateInput(gifUrl, textOverlays);

      // Stage 1: Load input file
      this.updateProgress(0.1, 'loading', 'Loading input GIF...');
      const gifData = await this.loadInputFile(gifUrl);
      
      // Stage 2: Write input to FFmpeg filesystem
      this.updateProgress(0.2, 'processing', 'Preparing input file...');
      await this.ffmpeg.writeFile('input.gif', gifData);

      // Stage 3: Generate text overlay filters
      this.updateProgress(0.3, 'processing', 'Generating text overlays...');
      const textFilters = this.generateTextFilters(textOverlays);

      // Stage 4: Execute FFmpeg processing
      this.updateProgress(0.4, 'processing', 'Processing frames...');
      await this.executeFFmpegCommand(textFilters);

      // Stage 5: Read output file
      this.updateProgress(0.8, 'encoding', 'Encoding output...');
      const outputData = await this.ffmpeg.readFile('output.gif');

      // Stage 6: Cleanup and prepare result
      this.updateProgress(0.9, 'encoding', 'Finalizing...');
      await this.cleanup(['input.gif', 'output.gif', 'palette.png']);

      const result: ProcessingResult = {
        data: outputData as Uint8Array,
        fileSize: (outputData as Uint8Array).length,
        processingTime: Date.now() - this.processingStartTime,
        metadata: {
          width: 0, // Will be populated by caller if needed
          height: 0, // Will be populated by caller if needed
        },
      };

      this.updateProgress(1, 'complete', 'Processing complete');
      return result;

    } catch (error) {
      await this.cleanup(['input.gif', 'output.gif', 'palette.png']);
      
      if (error instanceof Error) {
        throw this.createProcessingError(
          'processing_error',
          error.message,
          true,
          true
        );
      }
      
      throw this.createProcessingError(
        'processing_error',
        ERROR_MESSAGES.UNKNOWN_ERROR,
        false,
        true
      );
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get current processing progress
   */
  getProgress(): ProcessingProgress {
    return { ...this.currentProgress };
  }

  /**
   * Set progress callback for real-time updates
   */
  setProgressCallback(callback: (progress: ProcessingProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Cancel current processing operation
   */
  async cancelProcessing(): Promise<void> {
    if (!this.isProcessing) {
      return;
    }

    try {
      // FFmpeg doesn't have a direct cancel method, so we'll clean up
      await this.cleanup(['input.gif', 'output.gif', 'palette.png']);
      this.isProcessing = false;
      this.updateProgress(0, 'complete', 'Processing cancelled');
    } catch (error) {
      // Ignore cleanup errors during cancellation
      this.isProcessing = false;
    }
  }

  /**
   * Check if FFmpeg is currently processing
   */
  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage(): { current: number; max: number; percentage: number } {
    return {
      current: this.memoryUsage,
      max: this.options.maxMemoryUsage || MEMORY_SETTINGS.maxMemoryUsage,
      percentage: this.memoryUsage / (this.options.maxMemoryUsage || MEMORY_SETTINGS.maxMemoryUsage),
    };
  }

  /**
   * Dispose of FFmpeg instance and clean up resources
   */
  async dispose(): Promise<void> {
    if (this.ffmpeg && this.isLoaded) {
      try {
        await this.cleanup(['input.gif', 'output.gif', 'palette.png']);
        this.ffmpeg.terminate();
      } catch (error) {
        // Ignore cleanup errors during disposal
      }
    }
    
    this.ffmpeg = null;
    this.isLoaded = false;
    this.isProcessing = false;
    this.memoryUsage = 0;
  }

  // Private methods

  private async validateInput(gifUrl: string, textOverlays: TextOverlay[]): Promise<void> {
    if (!gifUrl || typeof gifUrl !== 'string') {
      throw new Error('Invalid GIF URL provided');
    }

    if (!Array.isArray(textOverlays)) {
      throw new Error('Invalid text overlays provided');
    }

    // Validate text overlays
    for (const overlay of textOverlays) {
      if (!overlay.text || typeof overlay.text !== 'string') {
        continue; // Skip empty text overlays
      }

      if (!overlay.position || typeof overlay.position.x !== 'number' || typeof overlay.position.y !== 'number') {
        throw new Error('Invalid text overlay position');
      }

      if (!validateOverlayPosition(overlay.position.x, overlay.position.y)) {
        throw new Error('Text overlay position must be between 0 and 100 percent');
      }
    }
  }

  private async loadInputFile(gifUrl: string): Promise<Uint8Array> {
    try {
      const data = await fetchFile(gifUrl);
      
      // Check file size
      if (data.length > FILE_LIMITS.maxInputSize) {
        throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
      }

      this.memoryUsage += data.length;
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  private generateTextFilters(overlays: TextOverlay[]): string {
    const activeOverlays = overlays.filter(overlay => overlay.text && overlay.text.trim());
    
    if (activeOverlays.length === 0) {
      return 'null'; // No text overlays to apply
    }

    const filters = activeOverlays.map((overlay, index) => {
      const x = `${overlay.position.x}*w/100`;
      const y = `${overlay.position.y}*h/100`;
      
      // Escape special characters in text
      const escapedText = escapeTextForFFmpeg(overlay.text);
      
      // Build drawtext filter with all styling options
      const drawTextOptions = [
        `text='${escapedText}'`,
        `x=${x}`,
        `y=${y}`,
        `fontsize=${overlay.style.fontSize || TEXT_OVERLAY_DEFAULTS.fontSize}`,
        `fontcolor=${overlay.style.color || TEXT_OVERLAY_DEFAULTS.fontColor}`,
        `bordercolor=${overlay.style.strokeColor || TEXT_OVERLAY_DEFAULTS.borderColor}`,
        `borderw=${overlay.style.strokeWidth || TEXT_OVERLAY_DEFAULTS.borderWidth}`,
        `alpha=${overlay.style.opacity || TEXT_OVERLAY_DEFAULTS.alpha}`,
      ];

      // Add font weight if specified
      if (overlay.style.fontWeight === 'bold') {
        drawTextOptions.push('fontweight=bold');
      }

      // Add text alignment
      if (overlay.style.textAlign) {
        const alignMap = {
          'left': 'left',
          'center': 'center',
          'right': 'right',
        };
        drawTextOptions.push(`text_align=${alignMap[overlay.style.textAlign]}`);
      }

      return `drawtext=${drawTextOptions.join(':')}`;
    });

    return filters.join(',');
  }

  private async executeFFmpegCommand(textFilters: string): Promise<void> {
    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    const qualitySettings = QUALITY_SETTINGS[this.options.quality || 'medium'];
    
    // Build FFmpeg command based on quality settings and text filters
    const command = [
      '-i', 'input.gif',
      '-vf', textFilters,
      '-y', 'output.gif'
    ];

    // Add quality-specific options
    if (qualitySettings.fps) {
      command.splice(-2, 0, '-r', qualitySettings.fps.toString());
    }

    // Execute with timeout
    const execPromise = this.ffmpeg.exec(command);
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(ERROR_MESSAGES.PROCESSING_TIMEOUT));
      }, PROCESSING_TIMEOUTS.processing);
    });

    await Promise.race([execPromise, timeoutPromise]);
  }

  private async cleanup(files: string[]): Promise<void> {
    if (!this.ffmpeg) {
      return;
    }

    const cleanupPromises = files.map(async (file) => {
      try {
        await this.ffmpeg!.deleteFile(file);
      } catch (error) {
        // Ignore file not found errors
      }
    });

    await Promise.allSettled(cleanupPromises);
    
    // Reset memory usage
    this.memoryUsage = 0;
  }

  private updateProgress(progress: number, stage: ProcessingProgress['stage'], message?: string): void {
    this.currentProgress = {
      progress: Math.max(0, Math.min(1, progress)),
      stage,
      timeRemaining: this.calculateTimeRemaining(progress),
    };

    if (this.options.enableProgress && this.progressCallback) {
      this.progressCallback({ ...this.currentProgress });
    }
  }

  private calculateTimeRemaining(progress: number): number | undefined {
    if (progress <= 0 || !this.processingStartTime) {
      return undefined;
    }

    const elapsed = Date.now() - this.processingStartTime;
    const estimated = elapsed / progress;
    return Math.max(0, estimated - elapsed);
  }

  private handleLog(message: { type: string; message: string }): void {
    // Log FFmpeg messages for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[FFmpeg ${message.type}]:`, message.message);
    }
  }

  private handleProgress(progress: { progress: number; time: number }): void {
    // Update progress based on FFmpeg's internal progress reporting
    if (this.options.enableProgress && progress.progress >= 0) {
      const normalizedProgress = Math.max(0.4, Math.min(0.8, 0.4 + (progress.progress * 0.4)));
      this.updateProgress(normalizedProgress, 'processing');
    }
  }

  private createProcessingError(
    type: ProcessingError['type'],
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

/**
 * Singleton instance for global FFmpeg processor
 */
let globalFFmpegProcessor: FFmpegProcessor | null = null;

/**
 * Get or create global FFmpeg processor instance
 */
export function getFFmpegProcessor(options?: FFmpegProcessorOptions): FFmpegProcessor {
  if (!globalFFmpegProcessor) {
    globalFFmpegProcessor = new FFmpegProcessor(options);
  }
  return globalFFmpegProcessor;
}

/**
 * Dispose of global FFmpeg processor instance
 */
export async function disposeGlobalFFmpegProcessor(): Promise<void> {
  if (globalFFmpegProcessor) {
    await globalFFmpegProcessor.dispose();
    globalFFmpegProcessor = null;
  }
}

// Re-export utility functions from helpers
export {
  validateGifFormat,
  estimateProcessingTime,
  escapeTextForFFmpeg,
  convertColorForFFmpeg,
  validateOverlayPosition,
  estimateMemoryUsage,
  formatProcessingTime,
  validateFileSize,
  formatFileSize,
  generateProcessingId,
  calculateProgress,
} from './ffmpegHelpers';