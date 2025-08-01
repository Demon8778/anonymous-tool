/**
 * Retry utilities for handling failed operations with exponential backoff
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: any;
  attempts: number;
  totalTime: number;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = () => true,
    onRetry
  } = options;

  let lastError: any;
  let attempt = 0;
  const startTime = Date.now();

  while (attempt < maxAttempts) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      attempt++;

      // Check if we should retry this error
      if (!retryCondition(error) || attempt >= maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;

      // Call retry callback
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }

  throw lastError;
}

/**
 * Retry with circuit breaker pattern
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
  }
}

/**
 * Predefined retry conditions for common scenarios
 */
export const retryConditions = {
  // Retry on network errors
  networkErrors: (error: any): boolean => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('network') || 
             message.includes('fetch') || 
             message.includes('timeout') ||
             message.includes('connection');
    }
    return false;
  },

  // Retry on API errors (but not validation errors)
  apiErrors: (error: any): boolean => {
    if (error && typeof error === 'object' && 'type' in error) {
      const errorType = error.type;
      return errorType === 'api_error' || 
             errorType === 'network_error' || 
             errorType === 'timeout_error';
    }
    return false;
  },

  // Retry on processing errors (but not format errors)
  processingErrors: (error: any): boolean => {
    if (error && typeof error === 'object' && 'type' in error) {
      const errorType = error.type;
      return errorType === 'processing_error' || 
             errorType === 'memory_error' ||
             errorType === 'timeout_error';
    }
    return false;
  },

  // Retry on any retryable error
  retryableErrors: (error: any): boolean => {
    if (error && typeof error === 'object' && 'retryable' in error) {
      return error.retryable === true;
    }
    return false;
  }
};

/**
 * Create a retry wrapper for a function
 */
export function createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    return retryWithBackoff(() => fn(...args), options);
  }) as T;
}

/**
 * Batch retry operations with concurrency control
 */
export async function retryBatch<T>(
  operations: (() => Promise<T>)[],
  options: RetryOptions & { concurrency?: number } = {}
): Promise<RetryResult<T>[]> {
  const { concurrency = 3, ...retryOptions } = options;
  const results: RetryResult<T>[] = [];
  
  // Process operations in batches
  for (let i = 0; i < operations.length; i += concurrency) {
    const batch = operations.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (operation, index) => {
      const startTime = Date.now();
      let attempts = 0;
      
      try {
        const result = await retryWithBackoff(operation, {
          ...retryOptions,
          onRetry: (attempt, error) => {
            attempts = attempt;
            retryOptions.onRetry?.(attempt, error);
          }
        });
        
        return {
          success: true,
          result,
          attempts: attempts + 1,
          totalTime: Date.now() - startTime
        } as RetryResult<T>;
      } catch (error) {
        return {
          success: false,
          error,
          attempts: attempts + 1,
          totalTime: Date.now() - startTime
        } as RetryResult<T>;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Global circuit breakers for different services
 */
export const circuitBreakers = {
  gifSearch: new CircuitBreaker(3, 30000), // 30 seconds
  gifProcessing: new CircuitBreaker(2, 60000), // 1 minute
  apiCalls: new CircuitBreaker(5, 45000) // 45 seconds
};

/**
 * Reset all circuit breakers
 */
export function resetAllCircuitBreakers(): void {
  Object.values(circuitBreakers).forEach(cb => cb.reset());
}