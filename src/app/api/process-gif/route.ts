import { NextRequest, NextResponse } from 'next/server';
import type { ProcessingRequest, ProcessGifResponse, ApiError } from '@/lib/types/api';
import type { Gif } from '@/lib/types/gif';
import type { TextOverlay } from '@/lib/types/textOverlay';
import { getGifProcessingService } from '@/lib/services/gifProcessingService';

/**
 * Process GIF with text overlays using FFmpeg WASM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationError = validateProcessingRequest(body);
    if (validationError) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationError.message 
        } as ProcessGifResponse,
        { status: 400 }
      );
    }

    const { gifUrl, textOverlays, outputFormat = 'gif', quality = 'medium' } = body as ProcessingRequest;

    // Create Gif object from URL (in a real app, this might come from a database)
    const gif: Gif = {
      id: generateGifId(gifUrl),
      title: 'User Selected GIF',
      url: gifUrl,
      preview: gifUrl,
      width: 0, // Will be determined during processing
      height: 0, // Will be determined during processing
      source: 'mock',
    };

    // Get processing service instance
    const processingService = getGifProcessingService({
      quality,
      outputFormat,
      enableProgress: true,
    });

    // Process the GIF with text overlays
    const processedGif = await processingService.processGif(gif, textOverlays);

    // Return successful response
    const response: ProcessGifResponse = {
      success: true,
      data: processedGif,
      message: 'GIF processed successfully',
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error processing GIF:', error);
    
    // Handle different types of errors
    const apiError = handleProcessingError(error);
    
    const response: ProcessGifResponse = {
      success: false,
      error: apiError.message,
    };

    // Return appropriate HTTP status based on error type
    const statusCode = getStatusCodeForError(apiError);
    return NextResponse.json(response, { status: statusCode });
  }
}

/**
 * Get processing progress for ongoing operations
 */
export async function GET(request: NextRequest) {
  try {
    const processingService = getGifProcessingService();
    const progress = await processingService.getProcessingProgress();
    const status = processingService.getProcessingStatus();
    const memoryUsage = processingService.getMemoryUsage();

    return NextResponse.json({
      success: true,
      data: {
        progress,
        status: status?.status || 'idle',
        memoryUsage,
        isProcessing: processingService.isProcessing(),
      },
    });

  } catch (error) {
    console.error('Error getting processing progress:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get processing progress' 
      },
      { status: 500 }
    );
  }
}

/**
 * Cancel ongoing processing operation
 */
export async function DELETE(request: NextRequest) {
  try {
    const processingService = getGifProcessingService();
    await processingService.cancelProcessing();

    return NextResponse.json({
      success: true,
      message: 'Processing cancelled successfully',
    });

  } catch (error) {
    console.error('Error cancelling processing:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel processing' 
      },
      { status: 500 }
    );
  }
}

// Helper functions

function validateProcessingRequest(body: any): ApiError | null {
  if (!body || typeof body !== 'object') {
    return {
      type: 'validation_error',
      message: 'Invalid request body',
      recoverable: false,
      retryable: false,
    };
  }

  if (!body.gifUrl || typeof body.gifUrl !== 'string') {
    return {
      type: 'validation_error',
      message: 'GIF URL is required and must be a string',
      recoverable: false,
      retryable: false,
    };
  }

  if (!body.textOverlays || !Array.isArray(body.textOverlays)) {
    return {
      type: 'validation_error',
      message: 'Text overlays are required and must be an array',
      recoverable: false,
      retryable: false,
    };
  }

  // Validate text overlays
  for (let i = 0; i < body.textOverlays.length; i++) {
    const overlay = body.textOverlays[i];
    
    if (!overlay || typeof overlay !== 'object') {
      return {
        type: 'validation_error',
        message: `Text overlay at index ${i} is invalid`,
        recoverable: false,
        retryable: false,
      };
    }

    if (overlay.text && typeof overlay.text !== 'string') {
      return {
        type: 'validation_error',
        message: `Text overlay at index ${i} has invalid text`,
        recoverable: false,
        retryable: false,
      };
    }

    if (!overlay.position || 
        typeof overlay.position.x !== 'number' || 
        typeof overlay.position.y !== 'number' ||
        overlay.position.x < 0 || overlay.position.x > 100 ||
        overlay.position.y < 0 || overlay.position.y > 100) {
      return {
        type: 'validation_error',
        message: `Text overlay at index ${i} has invalid position`,
        recoverable: false,
        retryable: false,
      };
    }
  }

  // Validate optional parameters
  if (body.outputFormat && !['gif', 'mp4', 'webm'].includes(body.outputFormat)) {
    return {
      type: 'validation_error',
      message: 'Output format must be gif, mp4, or webm',
      recoverable: false,
      retryable: false,
    };
  }

  if (body.quality && !['low', 'medium', 'high'].includes(body.quality)) {
    return {
      type: 'validation_error',
      message: 'Quality must be low, medium, or high',
      recoverable: false,
      retryable: false,
    };
  }

  return null;
}

function generateGifId(gifUrl: string): string {
  // Generate a simple ID based on the URL
  const hash = gifUrl.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return `gif_${Math.abs(hash)}_${Date.now()}`;
}

function handleProcessingError(error: unknown): ApiError {
  // If it's already a structured error, use it
  if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
    const structuredError = error as ApiError;
    return structuredError;
  }

  // Handle different types of errors
  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        type: 'network_error',
        message: 'Failed to fetch GIF. Please check the URL and try again.',
        recoverable: true,
        retryable: true,
      };
    }

    if (error.message.includes('memory') || error.message.includes('Memory')) {
      return {
        type: 'api_error',
        message: 'Insufficient memory to process this GIF. Try with a smaller file.',
        recoverable: true,
        retryable: true,
      };
    }

    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return {
        type: 'timeout_error',
        message: 'Processing timed out. The GIF may be too large or complex.',
        recoverable: true,
        retryable: true,
      };
    }

    return {
      type: 'api_error',
      message: error.message,
      recoverable: true,
      retryable: true,
    };
  }

  return {
    type: 'unknown_error',
    message: 'An unexpected error occurred while processing the GIF',
    recoverable: false,
    retryable: true,
  };
}

function getStatusCodeForError(error: ApiError): number {
  switch (error.type) {
    case 'validation_error':
      return 400;
    case 'timeout_error':
      return 408;
    case 'network_error':
      return 502;
    case 'api_error':
      return 500;
    case 'unknown_error':
    default:
      return 500;
  }
}