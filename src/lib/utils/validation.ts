/**
 * Input validation utilities
 */

import type { TextOverlay, TextStyle, Position } from '../types/textOverlay';
import type { Gif } from '../types/gif';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule<T> {
  name: string;
  validate: (value: T) => boolean;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Base validator class
 */
export class Validator<T> {
  private rules: ValidationRule<T>[] = [];

  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule);
    return this;
  }

  validate(value: T): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of this.rules) {
      if (!rule.validate(value)) {
        if (rule.severity === 'error') {
          errors.push(rule.message);
        } else {
          warnings.push(rule.message);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Search query validation
 */
export class SearchQueryValidator extends Validator<string> {
  constructor() {
    super();
    this.setupRules();
  }

  private setupRules() {
    this.addRule({
      name: 'required',
      validate: (query) => typeof query === 'string' && query.trim().length > 0,
      message: 'Search query cannot be empty',
      severity: 'error',
    });

    this.addRule({
      name: 'minLength',
      validate: (query) => query.trim().length >= 2,
      message: 'Search query must be at least 2 characters long',
      severity: 'error',
    });

    this.addRule({
      name: 'maxLength',
      validate: (query) => query.trim().length <= 100,
      message: 'Search query cannot exceed 100 characters',
      severity: 'error',
    });

    this.addRule({
      name: 'noHtml',
      validate: (query) => !/<[^>]*>/g.test(query),
      message: 'Search query cannot contain HTML tags',
      severity: 'error',
    });

    this.addRule({
      name: 'noScripts',
      validate: (query) => !/script|javascript|vbscript/i.test(query),
      message: 'Search query contains potentially harmful content',
      severity: 'error',
    });

    this.addRule({
      name: 'reasonableLength',
      validate: (query) => query.trim().length <= 50,
      message: 'Very long search queries may not return good results',
      severity: 'warning',
    });
  }
}

/**
 * Text overlay validation
 */
export class TextOverlayValidator extends Validator<TextOverlay> {
  constructor() {
    super();
    this.setupRules();
  }

  private setupRules() {
    this.addRule({
      name: 'hasId',
      validate: (overlay) => typeof overlay.id === 'string' && overlay.id.length > 0,
      message: 'Text overlay must have a valid ID',
      severity: 'error',
    });

    this.addRule({
      name: 'hasText',
      validate: (overlay) => typeof overlay.text === 'string',
      message: 'Text overlay must have text content',
      severity: 'error',
    });

    this.addRule({
      name: 'textLength',
      validate: (overlay) => overlay.text.length <= 200,
      message: 'Text overlay cannot exceed 200 characters',
      severity: 'error',
    });

    this.addRule({
      name: 'hasPosition',
      validate: (overlay) => overlay.position && typeof overlay.position === 'object',
      message: 'Text overlay must have a valid position',
      severity: 'error',
    });

    this.addRule({
      name: 'validPosition',
      validate: (overlay) => this.isValidPosition(overlay.position),
      message: 'Text overlay position must be between 0 and 100 percent',
      severity: 'error',
    });

    this.addRule({
      name: 'hasStyle',
      validate: (overlay) => overlay.style && typeof overlay.style === 'object',
      message: 'Text overlay must have a valid style',
      severity: 'error',
    });

    this.addRule({
      name: 'validStyle',
      validate: (overlay) => this.isValidTextStyle(overlay.style),
      message: 'Text overlay has invalid style properties',
      severity: 'error',
    });

    this.addRule({
      name: 'textNotEmpty',
      validate: (overlay) => overlay.text.trim().length > 0,
      message: 'Text overlay should have non-empty text content',
      severity: 'warning',
    });

    this.addRule({
      name: 'reasonableTextLength',
      validate: (overlay) => overlay.text.length <= 50,
      message: 'Very long text may not display well on GIFs',
      severity: 'warning',
    });
  }

  private isValidPosition(position: Position): boolean {
    return (
      typeof position.x === 'number' &&
      typeof position.y === 'number' &&
      position.x >= 0 &&
      position.x <= 100 &&
      position.y >= 0 &&
      position.y <= 100
    );
  }

  private isValidTextStyle(style: TextStyle): boolean {
    return (
      typeof style.fontSize === 'number' &&
      style.fontSize > 0 &&
      style.fontSize <= 200 &&
      typeof style.fontFamily === 'string' &&
      style.fontFamily.length > 0 &&
      typeof style.color === 'string' &&
      this.isValidColor(style.color) &&
      typeof style.strokeColor === 'string' &&
      this.isValidColor(style.strokeColor) &&
      typeof style.strokeWidth === 'number' &&
      style.strokeWidth >= 0 &&
      style.strokeWidth <= 20 &&
      typeof style.opacity === 'number' &&
      style.opacity >= 0 &&
      style.opacity <= 1 &&
      ['normal', 'bold'].includes(style.fontWeight) &&
      ['left', 'center', 'right'].includes(style.textAlign)
    );
  }

  private isValidColor(color: string): boolean {
    // Check for hex colors
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return true;
    }
    
    // Check for rgb/rgba colors
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
      return true;
    }
    
    // Check for named colors (basic set)
    const namedColors = [
      'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
      'pink', 'brown', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy',
      'maroon', 'olive', 'teal', 'silver', 'aqua', 'fuchsia'
    ];
    
    return namedColors.includes(color.toLowerCase());
  }
}

/**
 * GIF validation
 */
export class GifValidator extends Validator<Gif> {
  constructor() {
    super();
    this.setupRules();
  }

  private setupRules() {
    this.addRule({
      name: 'hasId',
      validate: (gif) => typeof gif.id === 'string' && gif.id.length > 0,
      message: 'GIF must have a valid ID',
      severity: 'error',
    });

    this.addRule({
      name: 'hasUrl',
      validate: (gif) => typeof gif.url === 'string' && this.isValidUrl(gif.url),
      message: 'GIF must have a valid URL',
      severity: 'error',
    });

    this.addRule({
      name: 'hasPreview',
      validate: (gif) => typeof gif.preview === 'string' && this.isValidUrl(gif.preview),
      message: 'GIF must have a valid preview URL',
      severity: 'error',
    });

    this.addRule({
      name: 'hasDimensions',
      validate: (gif) => 
        typeof gif.width === 'number' && 
        typeof gif.height === 'number' &&
        gif.width > 0 && 
        gif.height > 0,
      message: 'GIF must have valid dimensions',
      severity: 'error',
    });

    this.addRule({
      name: 'hasTitle',
      validate: (gif) => typeof gif.title === 'string',
      message: 'GIF must have a title',
      severity: 'error',
    });

    this.addRule({
      name: 'validSource',
      validate: (gif) => ['tenor', 'giphy', 'mock'].includes(gif.source),
      message: 'GIF must have a valid source',
      severity: 'error',
    });

    this.addRule({
      name: 'reasonableSize',
      validate: (gif) => gif.width <= 1920 && gif.height <= 1080,
      message: 'Very large GIFs may cause performance issues',
      severity: 'warning',
    });

    this.addRule({
      name: 'reasonableAspectRatio',
      validate: (gif) => {
        const aspectRatio = gif.width / gif.height;
        return aspectRatio >= 0.1 && aspectRatio <= 10;
      },
      message: 'Extreme aspect ratios may not display well',
      severity: 'warning',
    });
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * File validation
 */
export class FileValidator extends Validator<File> {
  constructor() {
    super();
    this.setupRules();
  }

  private setupRules() {
    this.addRule({
      name: 'isFile',
      validate: (file) => file instanceof File,
      message: 'Must be a valid file',
      severity: 'error',
    });

    this.addRule({
      name: 'hasName',
      validate: (file) => typeof file.name === 'string' && file.name.length > 0,
      message: 'File must have a name',
      severity: 'error',
    });

    this.addRule({
      name: 'validType',
      validate: (file) => file.type.startsWith('image/'),
      message: 'File must be an image',
      severity: 'error',
    });

    this.addRule({
      name: 'isGif',
      validate: (file) => file.type === 'image/gif',
      message: 'File must be a GIF',
      severity: 'error',
    });

    this.addRule({
      name: 'reasonableSize',
      validate: (file) => file.size <= 50 * 1024 * 1024, // 50MB
      message: 'File size cannot exceed 50MB',
      severity: 'error',
    });

    this.addRule({
      name: 'notTooSmall',
      validate: (file) => file.size >= 1024, // 1KB
      message: 'File seems too small to be a valid GIF',
      severity: 'warning',
    });

    this.addRule({
      name: 'recommendedSize',
      validate: (file) => file.size <= 10 * 1024 * 1024, // 10MB
      message: 'Large files may take longer to process',
      severity: 'warning',
    });
  }
}

// Validator instances
export const searchQueryValidator = new SearchQueryValidator();
export const textOverlayValidator = new TextOverlayValidator();
export const gifValidator = new GifValidator();
export const fileValidator = new FileValidator();

// Convenience functions
export const validateSearchQuery = (query: string): ValidationResult =>
  searchQueryValidator.validate(query);

export const validateTextOverlay = (overlay: TextOverlay): ValidationResult =>
  textOverlayValidator.validate(overlay);

export const validateTextOverlays = (overlays: TextOverlay[]): ValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Validate individual overlays
  overlays.forEach((overlay, index) => {
    const result = validateTextOverlay(overlay);
    allErrors.push(...result.errors.map(error => `Overlay ${index + 1}: ${error}`));
    allWarnings.push(...result.warnings.map(warning => `Overlay ${index + 1}: ${warning}`));
  });

  // Validate collection-level rules
  if (overlays.length === 0) {
    allWarnings.push('No text overlays provided');
  }

  if (overlays.length > 10) {
    allWarnings.push('Too many text overlays may impact performance');
  }

  // Check for overlapping positions
  const positions = overlays.map(o => o.position);
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const distance = Math.sqrt(
        Math.pow(positions[i].x - positions[j].x, 2) +
        Math.pow(positions[i].y - positions[j].y, 2)
      );
      if (distance < 10) {
        allWarnings.push(`Overlays ${i + 1} and ${j + 1} are very close and may overlap`);
      }
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
};

export const validateGif = (gif: Gif): ValidationResult =>
  gifValidator.validate(gif);

export const validateFile = (file: File): ValidationResult =>
  fileValidator.validate(file);

// Sanitization functions
export const sanitizeSearchQuery = (query: string): string => {
  if (typeof query !== 'string') return '';
  
  return query
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove HTML/script injection characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 100); // Limit length
};

export const sanitizeTextContent = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .trim()
    .replace(/[\r\n\t]/g, ' ') // Replace line breaks and tabs with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 200); // Limit length
};

export const sanitizeFileName = (fileName: string): string => {
  if (typeof fileName !== 'string' || !fileName.trim()) return 'untitled';
  
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid characters
    .replace(/_{2,}/g, '_') // Replace multiple underscores
    .substring(0, 100); // Limit length
};