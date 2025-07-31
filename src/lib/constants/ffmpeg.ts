/**
 * FFmpeg WASM configuration constants
 */

// FFmpeg WASM core URLs
export const FFMPEG_CONFIG = {
  baseURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
  coreJS: 'ffmpeg-core.js',
  coreWasm: 'ffmpeg-core.wasm',
  workerJS: 'ffmpeg-core.worker.js',
} as const;

// Processing quality settings
export const QUALITY_SETTINGS = {
  low: {
    scale: 0.5,
    fps: 10,
    colors: 128,
    compression: 'high',
  },
  medium: {
    scale: 0.75,
    fps: 15,
    colors: 256,
    compression: 'medium',
  },
  high: {
    scale: 1.0,
    fps: 20,
    colors: 256,
    compression: 'low',
  },
} as const;

// File size limits (in bytes)
export const FILE_LIMITS = {
  maxInputSize: 50 * 1024 * 1024, // 50MB
  maxOutputSize: 25 * 1024 * 1024, // 25MB
  maxDuration: 30, // 30 seconds
  maxDimensions: 1920, // 1920px max width/height
} as const;

// Processing timeouts (in milliseconds)
export const PROCESSING_TIMEOUTS = {
  initialization: 30000, // 30 seconds
  processing: 300000, // 5 minutes
  cleanup: 5000, // 5 seconds
} as const;

// FFmpeg command templates
export const FFMPEG_COMMANDS = {
  // Basic GIF processing with text overlay
  addText: [
    '-i', 'input.gif',
    '-vf', '{textFilters}',
    '-y', 'output.gif'
  ],
  
  // GIF optimization
  optimize: [
    '-i', 'input.gif',
    '-vf', 'scale={width}:{height}:flags=lanczos,fps={fps},palettegen=stats_mode=diff',
    '-y', 'palette.png'
  ],
  
  // Apply palette for better compression
  applyPalette: [
    '-i', 'input.gif',
    '-i', 'palette.png',
    '-lavfi', 'scale={width}:{height}:flags=lanczos,fps={fps} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
    '-y', 'output.gif'
  ],
} as const;

// Text overlay default settings
export const TEXT_OVERLAY_DEFAULTS = {
  fontFamily: 'Arial',
  fontSize: 24,
  fontColor: 'white',
  borderColor: 'black',
  borderWidth: 2,
  shadowColor: 'black',
  shadowOffset: '2:2',
  alpha: 1.0,
} as const;

// Supported input formats
export const SUPPORTED_FORMATS = {
  input: ['gif', 'mp4', 'webm', 'mov', 'avi'],
  output: ['gif', 'mp4', 'webm'],
} as const;

// Memory management settings
export const MEMORY_SETTINGS = {
  maxMemoryUsage: 512 * 1024 * 1024, // 512MB
  cleanupInterval: 30000, // 30 seconds
  gcThreshold: 0.8, // Trigger cleanup at 80% memory usage
} as const;

// Progress tracking stages
export const PROCESSING_STAGES = {
  INITIALIZING: 'initializing',
  LOADING_INPUT: 'loading_input',
  PROCESSING_FRAMES: 'processing_frames',
  APPLYING_TEXT: 'applying_text',
  OPTIMIZING: 'optimizing',
  ENCODING: 'encoding',
  CLEANUP: 'cleanup',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INITIALIZATION_FAILED: 'Failed to initialize FFmpeg WASM',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  UNSUPPORTED_FORMAT: 'Unsupported file format',
  PROCESSING_TIMEOUT: 'Processing timeout exceeded',
  MEMORY_EXCEEDED: 'Memory usage exceeded limit',
  INVALID_DIMENSIONS: 'Invalid image dimensions',
  NETWORK_ERROR: 'Network error while loading file',
  UNKNOWN_ERROR: 'An unknown error occurred during processing',
} as const;