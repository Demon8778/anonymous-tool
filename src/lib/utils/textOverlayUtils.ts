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
  // Use exact same font size as FFmpeg will use - no scaling
  const fontSize = style.fontSize;
  
  // Create a temporary canvas to measure text
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    // Fallback estimation using exact font size
    return {
      width: text.length * fontSize * 0.6,
      height: fontSize * 1.2,
    };
  }

  ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
  const metrics = ctx.measureText(text);
  
  return {
    width: metrics.width,
    height: fontSize * 1.2, // Approximate height
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
  
  // Adjust constraints for center-based positioning
  // Since text is positioned with transform: translate(-50%, -50%), 
  // we need to account for half the text dimensions
  const halfWidth = textBounds.width / 2;
  const halfHeight = textBounds.height / 2;
  
  // Constrain to container bounds with center-based positioning
  const constrainedX = Math.max(halfWidth, Math.min(containerWidth - halfWidth, pixelPos.x));
  const constrainedY = Math.max(halfHeight, Math.min(containerHeight - halfHeight, pixelPos.y));
  
  return pixelsToPosition(constrainedX, constrainedY, containerWidth, containerHeight);
}

/**
 * Generate CSS transform for text positioning
 */
export function getTextTransform(position: Position): string {
  return `translate(${position.x}%, ${position.y}%)`;
}

/**
 * Generate CSS styles for text overlay - NO SCALING
 * Uses exact same font size as will be used in final processing
 */
export function getTextStyles(style: TextStyle, containerWidth?: number): React.CSSProperties {
  // Use the exact same font size that FFmpeg will use
  // No scaling - what you see is what you get
  const fontSize = style.fontSize;
  
  return {
    fontSize: `${fontSize}px`,
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
  // Use a moderate font size that works well across different GIF sizes
  // This exact size will be used in both preview and final output
  const defaultFontSize = 24;
  
  return {
    id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text,
    position,
    style: {
      fontSize: defaultFontSize,
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
  // CRITICAL: Use percentage-based positioning only
  // The percentage coordinates will be applied to both preview and final GIF
  // This ensures consistent positioning regardless of container vs GIF size differences
  
  const constrainedPosition = {
    x: Math.max(5, Math.min(95, newPosition.x)), // Keep some margin from edges
    y: Math.max(5, Math.min(95, newPosition.y))  // Keep some margin from edges
  };
  
  return {
    ...overlay,
    position: constrainedPosition,
  };
}

/**
 * Get touch-friendly drag handle size based on device
 */
export function getDragHandleSize(): number {
  // Check if touch device and screen size
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobile = window.innerWidth < 768; // Mobile breakpoint
  
  if (isTouchDevice && isMobile) {
    return 32; // Smaller for mobile touch devices
  } else if (isTouchDevice) {
    return 40; // Medium for tablet touch devices
  } else {
    return 20; // Small for desktop mouse devices
  }
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