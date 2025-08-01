/**
 * Error handler tests
 */

import { ErrorHandler, errorHandler, handleError, handleApiError, handleProcessingError } from '../errorHandler';

describe('ErrorHandler', () => {
  beforeEach(() => {
    // Clear any existing error reports
    errorHandler.clearOldReports(0);
  });

  describe('handleError', () => {
    it('should handle basic Error objects', () => {
      const error = new Error('Test error');
      const report = handleError(error, { component: 'Test' });

      expect(report.type).toBe('unknown_error');
      expect(report.userMessage).toBe('An unexpected error occurred. Please try again or contact support.');
      expect(report.technicalMessage).toBe('Unknown error: Test error');
      expect(report.context?.component).toBe('Test');
    });

    it('should handle network errors', () => {
      const error = new Error('Network connection failed');
      const report = handleError(error);

      expect(report.type).toBe('network_error');
      expect(report.userMessage).toBe('Network connection issue. Please check your internet connection and try again.');
      expect(report.recoverable).toBe(true);
      expect(report.retryable).toBe(true);
    });

    it('should handle validation errors', () => {
      const error = new TypeError('Invalid input');
      const report = handleError(error);

      expect(report.type).toBe('validation_error');
      expect(report.userMessage).toBe('Invalid input provided. Please check your data and try again.');
      expect(report.recoverable).toBe(true);
      expect(report.retryable).toBe(false);
    });

    it('should handle timeout errors', () => {
      const error = new Error('Request timeout');
      const report = handleError(error);

      expect(report.type).toBe('timeout_error');
      expect(report.userMessage).toBe('The request timed out. This might be due to a slow connection or server issues.');
      expect(report.recoverable).toBe(true);
      expect(report.retryable).toBe(true);
    });

    it('should handle memory errors', () => {
      const error = new Error('Out of memory');
      const report = handleError(error);

      expect(report.type).toBe('memory_error');
      expect(report.userMessage).toBe('Not enough memory to complete this operation. Try with a smaller file.');
      expect(report.recoverable).toBe(true);
      expect(report.retryable).toBe(true);
    });

    it('should handle processing errors', () => {
      const error = new Error('FFmpeg processing failed');
      const report = handleError(error);

      expect(report.type).toBe('processing_error');
      expect(report.userMessage).toBe('Failed to process the GIF. This might be due to file size or format issues.');
      expect(report.recoverable).toBe(true);
      expect(report.retryable).toBe(true);
    });

    it('should handle format errors', () => {
      const error = new Error('Invalid format detected');
      const report = handleError(error);

      expect(report.type).toBe('format_error');
      expect(report.userMessage).toBe('Unsupported file format or corrupted file.');
      expect(report.recoverable).toBe(false);
      expect(report.retryable).toBe(false);
    });
  });

  describe('handleApiError', () => {
    it('should return ApiError format', () => {
      const error = new Error('API failed');
      const apiError = handleApiError(error, { component: 'API' });

      expect(apiError).toHaveProperty('type');
      expect(apiError).toHaveProperty('message');
      expect(apiError).toHaveProperty('recoverable');
      expect(apiError).toHaveProperty('retryable');
    });
  });

  describe('handleProcessingError', () => {
    it('should return ProcessingError format', () => {
      const error = new Error('Processing failed');
      const processingError = handleProcessingError(error, { component: 'Processing' });

      expect(processingError).toHaveProperty('type');
      expect(processingError).toHaveProperty('message');
      expect(processingError).toHaveProperty('recoverable');
      expect(processingError).toHaveProperty('retryable');
    });
  });

  describe('error suggestions', () => {
    it('should provide relevant suggestions for network errors', () => {
      const error = new Error('Network failed');
      const report = handleError(error);

      expect(report.suggestions).toContain('Check your internet connection');
      expect(report.suggestions).toContain('Try again in a few moments');
    });

    it('should provide relevant suggestions for validation errors', () => {
      const error = new TypeError('Invalid data');
      const report = handleError(error);

      expect(report.suggestions).toContain('Check that all required fields are filled');
      expect(report.suggestions).toContain('Ensure data is in the correct format');
    });

    it('should provide relevant suggestions for processing errors', () => {
      const error = new Error('FFmpeg failed');
      const report = handleError(error);

      expect(report.suggestions).toContain('Try with a smaller GIF file');
      expect(report.suggestions).toContain('Ensure the GIF is not corrupted');
    });
  });

  describe('error context', () => {
    it('should include context information', () => {
      const error = new Error('Test error');
      const context = {
        component: 'TestComponent',
        action: 'testAction',
        metadata: { userId: '123' }
      };
      
      const report = handleError(error, context);

      expect(report.context?.component).toBe('TestComponent');
      expect(report.context?.action).toBe('testAction');
      expect(report.context?.metadata).toEqual({ userId: '123' });
      expect(report.context?.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('error cleanup', () => {
    it('should clear old error reports', () => {
      const error = new Error('Test error');
      const report = handleError(error);
      
      // Verify error is stored
      expect(errorHandler.getErrorReport(report.id)).toBeDefined();
      
      // Clear old reports
      errorHandler.clearOldReports(0);
      
      // Verify error is cleared
      expect(errorHandler.getErrorReport(report.id)).toBeUndefined();
    });
  });
});