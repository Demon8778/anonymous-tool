/**
 * Validation utilities tests
 */

import {
  validateSearchQuery,
  validateTextOverlay,
  validateTextOverlays,
  validateGif,
  sanitizeSearchQuery,
  sanitizeTextContent,
  sanitizeFileName,
} from '../validation';
import type { TextOverlay, TextStyle, Position } from '../../types/textOverlay';
import type { Gif } from '../../types/gif';

describe('Validation', () => {
  describe('validateSearchQuery', () => {
    it('should validate valid search queries', () => {
      const result = validateSearchQuery('happy cat');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty queries', () => {
      const result = validateSearchQuery('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Search query cannot be empty');
    });

    it('should reject queries that are too short', () => {
      const result = validateSearchQuery('a');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Search query must be at least 2 characters long');
    });

    it('should reject queries that are too long', () => {
      const longQuery = 'a'.repeat(101);
      const result = validateSearchQuery(longQuery);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Search query cannot exceed 100 characters');
    });

    it('should reject queries with HTML tags', () => {
      const result = validateSearchQuery('<script>alert("xss")</script>');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Search query cannot contain HTML tags');
    });

    it('should warn about very long queries', () => {
      const longQuery = 'a'.repeat(60);
      const result = validateSearchQuery(longQuery);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Very long search queries may not return good results');
    });
  });

  describe('validateTextOverlay', () => {
    const validPosition: Position = { x: 50, y: 50 };
    const validStyle: TextStyle = {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2,
      opacity: 1,
      fontWeight: 'bold',
      textAlign: 'center',
    };

    const validOverlay: TextOverlay = {
      id: 'test-1',
      text: 'Hello World',
      position: validPosition,
      style: validStyle,
      isDragging: false,
    };

    it('should validate valid text overlays', () => {
      const result = validateTextOverlay(validOverlay);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject overlays without ID', () => {
      const overlay = { ...validOverlay, id: '' };
      const result = validateTextOverlay(overlay);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text overlay must have a valid ID');
    });

    it('should reject overlays with invalid positions', () => {
      const overlay = { ...validOverlay, position: { x: -10, y: 50 } };
      const result = validateTextOverlay(overlay);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text overlay position must be between 0 and 100 percent');
    });

    it('should reject overlays with text that is too long', () => {
      const overlay = { ...validOverlay, text: 'a'.repeat(201) };
      const result = validateTextOverlay(overlay);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text overlay cannot exceed 200 characters');
    });

    it('should warn about empty text', () => {
      const overlay = { ...validOverlay, text: '   ' };
      const result = validateTextOverlay(overlay);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Text overlay should have non-empty text content');
    });

    it('should warn about very long text', () => {
      const overlay = { ...validOverlay, text: 'a'.repeat(60) };
      const result = validateTextOverlay(overlay);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Very long text may not display well on GIFs');
    });
  });

  describe('validateTextOverlays', () => {
    const validOverlay: TextOverlay = {
      id: 'test-1',
      text: 'Hello World',
      position: { x: 50, y: 50 },
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

    it('should validate array of valid overlays', () => {
      const result = validateTextOverlays([validOverlay]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn about empty arrays', () => {
      const result = validateTextOverlays([]);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('No text overlays provided');
    });

    it('should warn about too many overlays', () => {
      const overlays = Array(15).fill(validOverlay);
      const result = validateTextOverlays(overlays);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Too many text overlays may impact performance');
    });

    it('should warn about overlapping positions', () => {
      const overlay1 = { ...validOverlay, id: 'test-1', position: { x: 50, y: 50 } };
      const overlay2 = { ...validOverlay, id: 'test-2', position: { x: 52, y: 52 } };
      const result = validateTextOverlays([overlay1, overlay2]);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('very close and may overlap'))).toBe(true);
    });
  });

  describe('validateGif', () => {
    const validGif: Gif = {
      id: 'test-gif-1',
      title: 'Test GIF',
      url: 'https://example.com/test.gif',
      preview: 'https://example.com/test-preview.gif',
      width: 480,
      height: 270,
      source: 'giphy',
    };

    it('should validate valid GIFs', () => {
      const result = validateGif(validGif);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject GIFs without valid URLs', () => {
      const gif = { ...validGif, url: 'invalid-url' };
      const result = validateGif(gif);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('GIF must have a valid URL');
    });

    it('should reject GIFs with invalid dimensions', () => {
      const gif = { ...validGif, width: -10 };
      const result = validateGif(gif);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('GIF must have valid dimensions');
    });

    it('should warn about very large GIFs', () => {
      const gif = { ...validGif, width: 2000, height: 1500 };
      const result = validateGif(gif);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Very large GIFs may cause performance issues');
    });

    it('should warn about extreme aspect ratios', () => {
      const gif = { ...validGif, width: 1000, height: 10 };
      const result = validateGif(gif);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Extreme aspect ratios may not display well');
    });
  });

  describe('sanitization', () => {
    describe('sanitizeSearchQuery', () => {
      it('should remove HTML tags', () => {
        const result = sanitizeSearchQuery('<script>alert("xss")</script>happy');
        expect(result).toBe('scriptalert(xss)/scripthappy');
      });

      it('should normalize whitespace', () => {
        const result = sanitizeSearchQuery('  hello   world  ');
        expect(result).toBe('hello world');
      });

      it('should limit length', () => {
        const longQuery = 'a'.repeat(150);
        const result = sanitizeSearchQuery(longQuery);
        expect(result.length).toBe(100);
      });
    });

    describe('sanitizeTextContent', () => {
      it('should replace line breaks with spaces', () => {
        const result = sanitizeTextContent('hello\nworld\ttest');
        expect(result).toBe('hello world test');
      });

      it('should normalize whitespace', () => {
        const result = sanitizeTextContent('  hello   world  ');
        expect(result).toBe('hello world');
      });

      it('should limit length', () => {
        const longText = 'a'.repeat(250);
        const result = sanitizeTextContent(longText);
        expect(result.length).toBe(200);
      });
    });

    describe('sanitizeFileName', () => {
      it('should replace invalid characters', () => {
        const result = sanitizeFileName('hello<>world|test.gif');
        expect(result).toBe('hello_world_test.gif');
      });

      it('should replace multiple underscores', () => {
        const result = sanitizeFileName('hello___world');
        expect(result).toBe('hello_world');
      });

      it('should limit length', () => {
        const longName = 'a'.repeat(150) + '.gif';
        const result = sanitizeFileName(longName);
        expect(result.length).toBe(100);
      });

      it('should handle empty input', () => {
        const result = sanitizeFileName('');
        expect(result).toBe('untitled');
      });
    });
  });
});