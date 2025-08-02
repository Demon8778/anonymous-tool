/**
 * Canvas-based text renderer that matches exact GIF dimensions
 * This ensures perfect positioning consistency between preview and final output
 */

import type { TextOverlay } from '@/lib/types/textOverlay';

export interface CanvasTextRenderResult {
  canvas: HTMLCanvasElement;
  textPositions: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

/**
 * Create a canvas with exact GIF dimensions and render text overlays
 */
export function renderTextOnCanvas(
  gifWidth: number,
  gifHeight: number,
  overlays: TextOverlay[]
): CanvasTextRenderResult {
  // Create canvas with exact GIF dimensions
  const canvas = document.createElement('canvas');
  canvas.width = gifWidth;
  canvas.height = gifHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, gifWidth, gifHeight);
  
  const textPositions: CanvasTextRenderResult['textPositions'] = [];

  // Render each text overlay
  overlays.forEach(overlay => {
    if (!overlay.text || !overlay.text.trim()) return;

    // Calculate position in actual pixels on the GIF-sized canvas
    const x = (overlay.position.x / 100) * gifWidth;
    const y = (overlay.position.y / 100) * gifHeight;
    
    console.log(`Canvas: "${overlay.text}" at ${overlay.position.x}%, ${overlay.position.y}% -> ${x}px, ${y}px (GIF: ${gifWidth}x${gifHeight})`);

    // Set up text styling to match FFmpeg exactly
    const fontSize = overlay.style.fontSize;
    ctx.font = `${overlay.style.fontWeight} ${fontSize}px ${overlay.style.fontFamily}`;
    ctx.fillStyle = overlay.style.color;
    ctx.textAlign = 'center'; // Always center for consistency with FFmpeg
    ctx.textBaseline = 'middle'; // Center vertically
    ctx.globalAlpha = overlay.style.opacity;

    // Add stroke if specified
    if (overlay.style.strokeWidth > 0) {
      ctx.strokeStyle = overlay.style.strokeColor;
      ctx.lineWidth = overlay.style.strokeWidth;
      ctx.strokeText(overlay.text, x, y);
    }

    // Draw the text
    ctx.fillText(overlay.text, x, y);

    // Measure text for positioning reference
    const metrics = ctx.measureText(overlay.text);
    const textWidth = metrics.width;
    const textHeight = fontSize; // Approximate height

    textPositions.push({
      id: overlay.id,
      x: x,
      y: y,
      width: textWidth,
      height: textHeight
    });
  });

  return {
    canvas,
    textPositions
  };
}

/**
 * Convert canvas to Uint8Array for FFmpeg processing
 */
export function canvasToUint8Array(canvas: HTMLCanvasElement): Uint8Array {
  // Convert canvas to blob, then to array buffer
  const dataURL = canvas.toDataURL('image/png');
  const base64 = dataURL.split(',')[1];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
}

/**
 * Generate FFmpeg overlay filter using canvas image - PERFECT MATCHING
 */
export function generateCanvasOverlayFilter(): string {
  // Simple overlay filter that composites the text canvas on top of the GIF
  // [0:v] = input GIF, [1:v] = text overlay image
  return '[0:v][1:v]overlay=0:0[v]';
}