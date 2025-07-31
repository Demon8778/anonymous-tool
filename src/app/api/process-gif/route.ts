import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { gifUrl, text, textColor, textSize, textPosition } = await request.json();

    if (!gifUrl || !text) {
      return NextResponse.json(
        { error: 'GIF URL and text are required' },
        { status: 400 }
      );
    }

    // For now, we'll return the original GIF with overlay information
    // In a production app, you would use a server-side GIF processing library
    // like gif.js, sharp, or a dedicated image processing service
    
    const processedData = {
      originalGif: gifUrl,
      overlay: {
        text,
        textColor,
        textSize,
        textPosition
      },
      processedAt: new Date().toISOString(),
      downloadUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/download-gif?${new URLSearchParams({
        gifUrl,
        text,
        textColor,
        textSize: textSize.toString(),
        textX: textPosition.x.toString(),
        textY: textPosition.y.toString()
      })}`
    };

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error processing GIF:', error);
    return NextResponse.json(
      { error: 'Failed to process GIF' },
      { status: 500 }
    );
  }
}