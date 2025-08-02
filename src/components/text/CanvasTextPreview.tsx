/**
 * Canvas-based text preview that matches exact GIF dimensions
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { TextOverlay } from '@/lib/types/textOverlay';
import { renderTextOnCanvas } from '@/lib/utils/canvasTextRenderer';

interface CanvasTextPreviewProps {
  gifWidth: number;
  gifHeight: number;
  overlays: TextOverlay[];
  className?: string;
}

export function CanvasTextPreview({
  gifWidth,
  gifHeight,
  overlays,
  className
}: CanvasTextPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasDataUrl, setCanvasDataUrl] = useState<string>('');

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      // Render text on a canvas with exact GIF dimensions
      const result = renderTextOnCanvas(gifWidth, gifHeight, overlays);
      
      // Convert to data URL for display
      const dataUrl = result.canvas.toDataURL('image/png');
      setCanvasDataUrl(dataUrl);
      
      console.log('Canvas text positions:', result.textPositions);
    } catch (error) {
      console.error('Error rendering canvas text:', error);
    }
  }, [gifWidth, gifHeight, overlays]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* Canvas overlay with exact GIF dimensions */}
      <canvas
        ref={canvasRef}
        width={gifWidth}
        height={gifHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />
      
      {/* Debug: Show canvas as image */}
      {canvasDataUrl && (
        <img
          src={canvasDataUrl}
          alt="Text overlay preview"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10,
            opacity: 0.8
          }}
        />
      )}
    </div>
  );
}