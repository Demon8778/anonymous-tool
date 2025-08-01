/**
 * Centralized API client utility with retry mechanisms and error handling
 */

import { API_CONFIG } from '../constants/api';
import { handleApiError } from './errorHandler';
import type { ApiError } from '../types/api';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetryConfig: RetryConfig;

  constructor(baseUrl = '', timeout = 10000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
    this.defaultRetryConfig = {
      maxAttempts: API_CONFIG.RETRY.maxAttempts,
      baseDelay: API_CONFIG.RETRY.baseDelay,
      maxDelay: API_CONFIG.RETRY.maxDelay,
      shouldRetry: this.defaultShouldRetry,
    };
  }

  /**
   * Make an HTTP request with retry logic and error handling
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetryConfig.maxAttempts,
    } = config;

    const url = this.buildUrl(endpoint);
    const requestConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    return this.executeWithRetry(
      () => this.executeRequest<T>(url, requestConfig, timeout),
      { ...this.defaultRetryConfig, maxAttempts: retries }
    );
  }

  /**
   * GET request helper
   */
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request helper
   */
  async post<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  /**
   * PUT request helper
   */
  async put<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  /**
   * DELETE request helper
   */
  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Execute request with timeout
   */
  private async executeRequest<T>(
    url: string,
    config: RequestInit,
    timeout: number
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.createHttpError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw handleApiError(new Error('Request timed out'), {
          component: 'ApiClient',
          action: 'executeRequest',
          metadata: { url, timeout },
        });
      }
      
      throw handleApiError(error, {
        component: 'ApiClient',
        action: 'executeRequest',
        metadata: { url },
      });
    }
  }

  /**
   * Execute function with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retryConfig: RetryConfig
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === retryConfig.maxAttempts || !retryConfig.shouldRetry?.(error, attempt)) {
          break;
        }
        
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(2, attempt - 1),
          retryConfig.maxDelay
        );
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Default retry logic
   */
  private defaultShouldRetry = (error: any, attempt: number): boolean => {
    // Don't retry on client errors (4xx) except for rate limiting
    if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
      return false;
    }
    
    // Retry on network errors, timeouts, and server errors
    if (
      error?.type === 'network_error' ||
      error?.type === 'timeout_error' ||
      error?.status >= 500 ||
      error?.status === 429
    ) {
      return true;
    }
    
    return false;
  };

  /**
   * Create HTTP error from response
   */
  private async createHttpError(response: Response): Promise<ApiError> {
    let message = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      message = errorData.error || errorData.message || message;
    } catch {
      // Ignore JSON parsing errors
    }
    
    const error = new Error(message);
    (error as any).status = response.status;
    
    return handleApiError(error, {
      component: 'ApiClient',
      action: 'createHttpError',
      metadata: { status: response.status, statusText: response.statusText },
    });
  }

  /**
   * Create standardized API error
   */
  private createApiError(
    type: ApiError['type'],
    message: string,
    recoverable: boolean,
    retryable: boolean
  ): ApiError {
    return {
      type,
      message,
      recoverable,
      retryable,
    };
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return `${base}${path}`;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// External API clients
export const tenorClient = new ApiClient(API_CONFIG.TENOR.BASE_URL, API_CONFIG.TIMEOUTS.search);
export const giphyClient = new ApiClient(API_CONFIG.GIPHY.BASE_URL, API_CONFIG.TIMEOUTS.search);