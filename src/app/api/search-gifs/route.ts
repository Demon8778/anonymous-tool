import { NextRequest, NextResponse } from 'next/server';
import { gifSearchService } from '@/lib/services/gifSearchService';
import { API_CONFIG, HTTP_STATUS } from '@/lib/constants/api';
import type { SearchGifsRequest, SearchGifsResponse, ApiError } from '@/lib/types/api';

/**
 * Enhanced GIF search API endpoint with proper validation and error handling
 */
export async function GET(request: NextRequest) {
  try {
    // Extract and validate search parameters
    const { searchParams } = new URL(request.url);
    const searchRequest = validateSearchRequest(searchParams);

    // Perform search using the service
    const searchResult = await gifSearchService.searchGifs(
      searchRequest.query,
      {
        limit: searchRequest.limit,
        offset: searchRequest.offset,
      }
    );

    // Return successful response
    const response: SearchGifsResponse = {
      success: true,
      data: searchResult,
    };

    return NextResponse.json(response, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Error in search-gifs API:', error);
    return handleApiError(error);
  }
}

/**
 * Validate search request parameters
 */
function validateSearchRequest(searchParams: URLSearchParams): SearchGifsRequest {
  const query = searchParams.get('q');
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');

  // Validate query parameter
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw createValidationError('Search query is required and cannot be empty');
  }

  if (query.length > 100) {
    throw createValidationError('Search query cannot exceed 100 characters');
  }

  // Validate and parse limit parameter
  let limit = API_CONFIG.TENOR.DEFAULT_LIMIT;
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      throw createValidationError('Limit must be a positive integer');
    }
    if (parsedLimit > API_CONFIG.TENOR.MAX_LIMIT) {
      throw createValidationError(`Limit cannot exceed ${API_CONFIG.TENOR.MAX_LIMIT}`);
    }
    limit = parsedLimit;
  }

  // Validate and parse offset parameter
  let offset = 0;
  if (offsetParam) {
    const parsedOffset = parseInt(offsetParam, 10);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      throw createValidationError('Offset must be a non-negative integer');
    }
    offset = parsedOffset;
  }

  return {
    query: query.trim(),
    limit,
    offset,
  };
}

/**
 * Handle API errors and return appropriate responses
 */
function handleApiError(error: unknown): NextResponse {
  // Handle known API errors
  if (isApiError(error)) {
    const statusCode = getStatusCodeForError(error);
    const response: SearchGifsResponse = {
      success: false,
      error: error.message,
    };

    return NextResponse.json(response, { status: statusCode });
  }

  // Handle validation errors
  if (error instanceof Error && error.message.includes('validation')) {
    const response: SearchGifsResponse = {
      success: false,
      error: error.message,
    };

    return NextResponse.json(response, { status: HTTP_STATUS.BAD_REQUEST });
  }

  // Handle unexpected errors
  const response: SearchGifsResponse = {
    success: false,
    error: 'An unexpected error occurred while searching for GIFs',
  };

  return NextResponse.json(response, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
}

/**
 * Get appropriate HTTP status code for API error
 */
function getStatusCodeForError(error: ApiError): number {
  switch (error.type) {
    case 'validation_error':
      return HTTP_STATUS.BAD_REQUEST;
    case 'network_error':
      return HTTP_STATUS.BAD_GATEWAY;
    case 'api_error':
      return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    default:
      return HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }
}

/**
 * Create validation error
 */
function createValidationError(message: string): ApiError {
  return {
    type: 'validation_error',
    message,
    recoverable: true,
    retryable: false,
  };
}

/**
 * Type guard for API errors
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'recoverable' in error &&
    'retryable' in error
  );
}