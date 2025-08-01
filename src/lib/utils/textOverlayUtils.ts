/**
 * Text overlay utility functions for responsive position calculations
 * and text overlay management
 */

import type { TextOverlay, Position, TextStyle } from '@/lib/types/textOverlay';

/**
 * Convert percentage-based position to pixel coordinates
 */
export function positionToPixels(
  position: Position,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  return {
    x: (position.x / 100) * containerWidth,
    y: (position.y / 100) * containerHeight,
  };
}

/**
 * Convert pixel coordinates to percentage-based position
 */
export function pixelsToPosition(
  x: number,
  y: number,
  containerWidth: number,
  containerHeight: number
): Position {
  return {
    x: Math.max(0, Math.min(100, (x / containerWidth) * 100)),
    y: Math.max(0, Math.min(100, (y / containerHeight) * 100)),
  };
}

/**
 * Calculate responsive font size based on container dimensions
 */
export function calculateResponsiveFontSize(
  baseFontSize: number,
  containerWidth: number,
  baseWidth: number = 400
): number {
  const scaleFactor = containerWidth / baseWidth;
  return Math.max(12, Math.min(72, baseFontSize * scaleFactor));
}

/**
 * Get text bounds for positioning calculations
 */
export function getTextBounds(
  text: string,
  style: TextStyle,
  containerWidth: number
): { width: number; height: number } {
  // Create a temporary canvas to measure text
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    // Fallback estimation
    return {
      width: text.length * style.fontSize * 0.6,
      height: style.fontSize * 1.2,
    };
  }

  ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
  const metrics = ctx.measureText(text);
  
  return {
    width: metrics.width,
    height: style.fontSize * 1.2, // Approximate height
  };
}

/**
 * Ensure text position stays within container bounds
 */
export function constrainPosition(
  position: Position,
  textBounds: { width: number; height: number },
  containerWidth: number,
  containerHeight: number
): Position {
  const pixelPos = positionToPixels(position, containerWidth, containerHeight);
  
  // Constrain to container bounds
  const constrainedX = Math.max(0, Math.min(containerWidth - textBounds.width, pixelPos.x));
  const constrainedY = Math.max(0, Math.min(containerHeight - textBounds.height, pixelPos.y));
  
  return pixelsToPosition(constrainedX, constrainedY, containerWidth, containerHeight);
}

/**
 * Generate CSS transform for text positioning
 */
export function getTextTransform(position: Position): string {
  return `translate(${position.x}%, ${position.y}%)`;
}

/**
 * Generate CSS styles for text overlay
 */
export function getTextStyles(style: TextStyle): React.CSSProperties {
  return {
    fontSize: `${style.fontSize}px`,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    color: style.color,
    textAlign: style.textAlign,
    opacity: style.opacity,
    textShadow: style.strokeWidth > 0 
      ? `0 0 ${style.strokeWidth}px ${style.strokeColor}, 0 0 ${style.strokeWidth * 2}px ${style.strokeColor}`
      : 'none',
    userSelect: 'none',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  };
}

/**
 * Create a new text overlay with default values
 */
export function createTextOverlay(
  text: string = 'New Text',
  position: Position = { x: 50, y: 50 }
): TextOverlay {
  return {
    id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text,
    position,
    style: {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2,
      opacity: 1,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    isDragging: false,
  };
}

/**
 * Update text overlay position with bounds checking
 */
export function updateTextOverlayPosition(
  overlay: TextOverlay,
  newPosition: Position,
  containerWidth: number,
  containerHeight: number
): TextOverlay {
  const textBounds = getTextBounds(overlay.text, overlay.style, containerWidth);
  const constrainedPosition = constrainPosition(newPosition, textBounds, containerWidth, containerHeight);
  
  return {
    ...overlay,
    position: constrainedPosition,
  };
}

/**
 * Get touch-friendly drag handle size based on device
 */
export function getDragHandleSize(): number {
  // Check if touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  return isTouchDevice ? 44 : 24; // 44px for touch, 24px for mouse
}

/**
 * Calculate snap positions for text alignment
 */
export function getSnapPositions(containerWidth: number, containerHeight: number): Position[] {
  return [
    // Corners
    { x: 10, y: 10 },
    { x: 90, y: 10 },
    { x: 10, y: 90 },
    { x: 90, y: 90 },
    // Centers
    { x: 50, y: 10 },
    { x: 50, y: 50 },
    { x: 50, y: 90 },
    { x: 10, y: 50 },
    { x: 90, y: 50 },
  ];
}

/**
 * Find nearest snap position
 */
export function findNearestSnapPosition(
  position: Position,
  snapPositions: Position[],
  threshold: number = 10
): Position | null {
  let nearestPosition: Position | null = null;
  let minDistance = threshold;

  for (const snapPos of snapPositions) {
    const distance = Math.sqrt(
      Math.pow(position.x - snapPos.x, 2) + Math.pow(position.y - snapPos.y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestPosition = snapPos;
    }
  }

  return nearestPosition;
}