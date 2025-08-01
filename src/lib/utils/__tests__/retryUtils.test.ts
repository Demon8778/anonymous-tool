/**
 * Tests for retry utilities
 */

import { 
  retryWithBackoff, 
  retryConditions, 
  CircuitBreaker,
  createRetryWrapper
} from '../retryUtils';

describe('retryWithBackoff', () => {
  it('should succeed on first attempt', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    
    const result = await retryWithBackoff(mockFn);
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');
    
    const result = await retryWithBackoff(mockFn, {
      maxAttempts: 3,
      baseDelay: 10
    });
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should fail after max attempts', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));
    
    await expect(retryWithBackoff(mockFn, {
      maxAttempts: 2,
      baseDelay: 10
    })).rejects.toThrow('Always fails');
    
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should respect retry condition', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Non-retryable'));
    
    await expect(retryWithBackoff(mockFn, {
      maxAttempts: 3,
      baseDelay: 10,
      retryCondition: () => false
    })).rejects.toThrow('Non-retryable');
    
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should call onRetry callback', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValue('success');
    
    const onRetry = jest.fn();
    
    await retryWithBackoff(mockFn, {
      maxAttempts: 2,
      baseDelay: 10,
      onRetry
    });
    
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });
});

describe('retryConditions', () => {
  describe('networkErrors', () => {
    it('should return true for network errors', () => {
      expect(retryConditions.networkErrors(new Error('Network failed'))).toBe(true);
      expect(retryConditions.networkErrors(new Error('fetch failed'))).toBe(true);
      expect(retryConditions.networkErrors(new Error('timeout occurred'))).toBe(true);
      expect(retryConditions.networkErrors(new Error('connection lost'))).toBe(true);
    });

    it('should return false for non-network errors', () => {
      expect(retryConditions.networkErrors(new Error('Validation failed'))).toBe(false);
      expect(retryConditions.networkErrors(new Error('Invalid input'))).toBe(false);
    });
  });

  describe('apiErrors', () => {
    it('should return true for retryable API errors', () => {
      expect(retryConditions.apiErrors({ type: 'api_error' })).toBe(true);
      expect(retryConditions.apiErrors({ type: 'network_error' })).toBe(true);
      expect(retryConditions.apiErrors({ type: 'timeout_error' })).toBe(true);
    });

    it('should return false for non-retryable API errors', () => {
      expect(retryConditions.apiErrors({ type: 'validation_error' })).toBe(false);
      expect(retryConditions.apiErrors({ type: 'format_error' })).toBe(false);
    });
  });

  describe('retryableErrors', () => {
    it('should return true for errors marked as retryable', () => {
      expect(retryConditions.retryableErrors({ retryable: true })).toBe(true);
    });

    it('should return false for errors not marked as retryable', () => {
      expect(retryConditions.retryableErrors({ retryable: false })).toBe(false);
      expect(retryConditions.retryableErrors({})).toBe(false);
    });
  });
});

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker(2, 100); // 2 failures, 100ms recovery
  });

  it('should start in closed state', () => {
    expect(circuitBreaker.getState()).toBe('closed');
  });

  it('should execute function when closed', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    
    const result = await circuitBreaker.execute(mockFn);
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should open after failure threshold', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Failure'));
    
    // First failure
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Failure');
    expect(circuitBreaker.getState()).toBe('closed');
    
    // Second failure - should open circuit
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Failure');
    expect(circuitBreaker.getState()).toBe('open');
  });

  it('should reject immediately when open', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Failure'));
    
    // Trigger failures to open circuit
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Failure');
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Failure');
    
    // Should now reject immediately
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Circuit breaker is open');
    expect(mockFn).toHaveBeenCalledTimes(2); // Not called the third time
  });

  it('should transition to half-open after recovery timeout', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Failure'));
    
    // Open the circuit
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Failure');
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Failure');
    expect(circuitBreaker.getState()).toBe('open');
    
    // Wait for recovery timeout
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Next call should transition to half-open
    const successFn = jest.fn().mockResolvedValue('success');
    const result = await circuitBreaker.execute(successFn);
    
    expect(result).toBe('success');
    expect(circuitBreaker.getState()).toBe('closed');
  });

  it('should reset state', () => {
    circuitBreaker.reset();
    expect(circuitBreaker.getState()).toBe('closed');
  });
});

describe('createRetryWrapper', () => {
  it('should create a retry wrapper function', async () => {
    const originalFn = jest.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValue('success');
    
    const wrappedFn = createRetryWrapper(originalFn, {
      maxAttempts: 2,
      baseDelay: 10
    });
    
    const result = await wrappedFn('arg1', 'arg2');
    
    expect(result).toBe('success');
    expect(originalFn).toHaveBeenCalledTimes(2);
    expect(originalFn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});