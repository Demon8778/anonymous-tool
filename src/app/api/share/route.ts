/**
 * API endpoints for sharing functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { sharingService } from '@/lib/services/sharingService';
import type { ShareGifRequest, ShareGifResponse, GetSharedGifResponse } from '@/lib/types';

/**
 * POST /api/share - Create a shareable link for a processed GIF
 */
export async function POST(request: NextRequest) {
  try {
    const body: ShareGifRequest = await request.json();
    
    // Validate request body
    if (!body.gifId) {
      return NextResponse.json<ShareGifResponse>({
        success: false,
        error: 'Missing required field: gifId'
      }, { status: 400 });
    }

    // For now, we'll create a mock ProcessedGif since we don't have a database
    // In a real implementation, you would fetch the ProcessedGif from the database
    const mockProcessedGif = {
      id: body.gifId,
      title: body.metadata?.title || 'Custom GIF',
      url: 'https://example.com/gif.gif',
      preview: 'https://example.com/preview.gif',
      width: 480,
      height: 270,
      source: 'mock' as const,
      processedUrl: 'https://example.com/processed.gif',
      processedAt: new Date(),
      textOverlays: [],
      fileSize: 1024000,
      processingTime: 5000
    };

    const shareableLink = await sharingService.createShareableLink(mockProcessedGif);

    return NextResponse.json<ShareGifResponse>({
      success: true,
      data: shareableLink,
      message: 'Shareable link created successfully'
    });

  } catch (error) {
    console.error('Error creating shareable link:', error);
    return NextResponse.json<ShareGifResponse>({
      success: false,
      error: 'Failed to create shareable link'
    }, { status: 500 });
  }
}

/**
 * GET /api/share?id=shareId - Get a shared GIF by its share ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('id');

    if (!shareId) {
      return NextResponse.json<GetSharedGifResponse>({
        success: false,
        error: 'Missing required parameter: id'
      }, { status: 400 });
    }

    const sharedGif = await sharingService.getSharedGif(shareId);

    if (!sharedGif) {
      return NextResponse.json<GetSharedGifResponse>({
        success: false,
        error: 'Shared GIF not found or expired'
      }, { status: 404 });
    }

    // Increment view count
    await sharingService.incrementViewCount(shareId);

    return NextResponse.json<GetSharedGifResponse>({
      success: true,
      data: sharedGif,
      message: 'Shared GIF retrieved successfully'
    });

  } catch (error) {
    console.error('Error retrieving shared GIF:', error);
    return NextResponse.json<GetSharedGifResponse>({
      success: false,
      error: 'Failed to retrieve shared GIF'
    }, { status: 500 });
  }
}