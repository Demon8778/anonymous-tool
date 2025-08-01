/**
 * Simple in-memory cache with TTL support for performance optimization
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
  cleanupInterval?: number;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  totalSets: number;
  totalDeletes: number;
}

/**
 * Generic cache implementation with TTL and LRU eviction
 */
export class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly maxSize: number;
  private readonly defaultTTL: number;
  private cleanupTimer: NodeJS.Timeout | null = null;
  
  // Statistics
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes
    
    // Start cleanup timer
    const cleanupInterval = options.cleanupInterval || 60 * 1000; // 1 minute
    this.cleanupTimer = setInterval(() => this.cleanup(), cleanupInterval);
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    
    return entry.data;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const entryTTL = ttl || this.defaultTTL;
    
    // Check if we need to evict entries (only if adding new key)
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: now,
      ttl: entryTTL,
      accessCount: 1,
      lastAccessed: now
    };

    this.cache.set(key, entry);
    this.stats.sets++;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      totalSets: this.stats.sets,
      totalDeletes: this.stats.deletes
    };
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Dispose of cache and cleanup timer
   */
  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }

  // Private methods

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.deletes++;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
      this.stats.deletes++;
    }
  }
}

/**
 * Create a cache key from multiple parameters
 */
export function createCacheKey(...parts: (string | number | boolean | undefined | null)[]): string {
  return parts
    .filter(part => part !== undefined && part !== null)
    .map(part => String(part))
    .join(':');
}

/**
 * Global cache instances for different data types
 */
export const searchResultsCache = new Cache<any>({
  maxSize: 50,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 2 * 60 * 1000 // 2 minutes
});

export const gifMetadataCache = new Cache<any>({
  maxSize: 200,
  defaultTTL: 15 * 60 * 1000, // 15 minutes
  cleanupInterval: 5 * 60 * 1000 // 5 minutes
});

export const processedGifCache = new Cache<any>({
  maxSize: 20,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  cleanupInterval: 2 * 60 * 1000 // 2 minutes
});

/**
 * Dispose all global caches
 */
export function disposeAllCaches(): void {
  searchResultsCache.dispose();
  gifMetadataCache.dispose();
  processedGifCache.dispose();
}