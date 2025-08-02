/**
 * Helper functions for FFmpeg processing that don't require FFmpeg imports
 */

/**
 * Utility function to validate GIF file format
 */
export function validateGifFormat(data: Uint8Array): boolean {
  if (data.length < 6) {
    return false;
  }
  
  // Check GIF file signature
  const signature = new TextDecoder().decode(data.slice(0, 6));
  return signature === 'GIF87a' || signature === 'GIF89a';
}

/**
 * Utility function to estimate processing time based on file size
 */
export function estimateProcessingTime(fileSize: number, overlayCount: number): number {
  // Base processing time: ~1 second per MB + 0.5 seconds per text overlay
  const baseMBTime = 1000; // 1 second per MB
  const overlayTime = 500; // 0.5 seconds per overlay
  const fileSizeMB = fileSize / (1024 * 1024);
  
  return Math.max(2000, (fileSizeMB * baseMBTime) + (overlayCount * overlayTime));
}

/**
 * Utility function to escape text for FFmpeg drawtext filter
 */
export function escapeTextForFFmpeg(text: string): string {
  // Escape special characters that have meaning in FFmpeg drawtext filter
  return text
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/:/g, '\\:')    // Escape colons
    .replace(/'/g, "\\'");   // Escape single quotes
}

/**
 * Utility function to convert hex color to FFmpeg color format
 */
export function convertColorForFFmpeg(hexColor: string): string {
  // Remove # if present and ensure it's a valid hex color
  const cleanHex = hexColor.replace('#', '');
  
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    return 'white'; // Default fallback
  }
  
  return `0x${cleanHex}`;
}

/**
 * Utility function to validate text overlay position
 */
export function validateOverlayPosition(x: number, y: number): boolean {
  return (
    typeof x === 'number' && 
    typeof y === 'number' && 
    x >= 0 && x <= 100 && 
    y >= 0 && y <= 100
  );
}

/**
 * Utility function to calculate memory usage estimate
 */
export function estimateMemoryUsage(fileSize: number, overlayCount: number): number {
  // Rough estimate: file size * 3 (for processing) + overlay overhead
  const processingMultiplier = 3;
  const overlayOverhead = overlayCount * 1024; // 1KB per overlay
  
  return (fileSize * processingMultiplier) + overlayOverhead;
}

/**
 * Utility function to format processing time for display
 */
export function formatProcessingTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const remainingMs = milliseconds % 1000;
  
  if (seconds < 60) {
    return remainingMs > 0 ? `${seconds}.${Math.floor(remainingMs / 100)}s` : `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Utility function to validate file size limits
 */
export function validateFileSize(fileSize: number, maxSize: number): { valid: boolean; error?: string } {
  if (fileSize <= 0) {
    return { valid: false, error: 'File size must be greater than 0' };
  }
  
  if (fileSize > maxSize) {
    return { 
      valid: false, 
      error: `File size (${formatFileSize(fileSize)}) exceeds maximum limit (${formatFileSize(maxSize)})` 
    };
  }
  
  return { valid: true };
}

/**
 * Utility function to format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Utility function to generate unique processing ID
 */
export function generateProcessingId(): string {
  return `ffmpeg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Utility function to calculate progress percentage
 */
export function calculateProgress(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (current / total) * 100));
}

/**
 * Utility function to generate FFmpeg position expression for text alignment
 */
export function generateTextPositionExpression(
  positionPercent: number,
  alignment: 'left' | 'center' | 'right',
  axis: 'x' | 'y'
): string {
  const dimension = axis === 'x' ? 'w' : 'h';
  const textDimension = axis === 'x' ? 'text_w' : 'text_h';
  const basePosition = `(${positionPercent}*${dimension}/100)`;
  
  if (axis === 'y') {
    // Vertical positioning is always center-based
    return `max(0, min(${dimension}-${textDimension}, ${basePosition}-(${textDimension}/2)))`;
  }
  
  // Horizontal positioning depends on alignment
  switch (alignment) {
    case 'left':
      return `max(0, min(${dimension}-${textDimension}, ${basePosition}))`;
    case 'right':
      return `max(0, min(${dimension}-${textDimension}, ${basePosition}-${textDimension}))`;
    case 'center':
    default:
      return `max(0, min(${dimension}-${textDimension}, ${basePosition}-(${textDimension}/2)))`;
  }
}