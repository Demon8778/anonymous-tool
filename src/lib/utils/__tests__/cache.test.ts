/**
 * Tests for cache utility
 */

import { Cache, createCacheKey } from '../cache';

describe('Cache', () => {
  let cache: Cache<string>;

  beforeEach(() => {
    cache = new Cache<string>({
      maxSize: 3,
      defaultTTL: 1000, // 1 second
      cleanupInterval: 100 // 100ms
    });
  });

  afterEach(() => {
    cache.dispose();
  });

  describe('basic operations', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should delete keys', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
      expect(cache.delete('nonexistent')).toBe(false);
    });

    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe('TTL functionality', () => {
    it('should expire entries after TTL', async () => {
      cache.set('key1', 'value1', 50); // 50ms TTL
      expect(cache.get('key1')).toBe('value1');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(cache.get('key1')).toBeNull();
    });

    it('should use default TTL when not specified', async () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
      
      // Should still be there after a short time
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(cache.get('key1')).toBe('value1');
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used items when max size is reached', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      // Access key3 to make it more recently used
      cache.get('key3');
      
      // Add key4, should evict one of the older entries
      cache.set('key4', 'value4');
      
      // Should have exactly 3 items
      expect(cache.size()).toBe(3);
      
      // key4 should definitely be there (just added)
      expect(cache.get('key4')).toBe('value4');
      
      // key3 should be there (recently accessed)
      expect(cache.get('key3')).toBe('value3');
      
      // At least one of key1 or key2 should be evicted
      const key1Exists = cache.get('key1') !== null;
      const key2Exists = cache.get('key2') !== null;
      expect(key1Exists && key2Exists).toBe(false); // Both can't exist
    });
  });

  describe('statistics', () => {
    it('should track cache statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // Hit
      cache.get('nonexistent'); // Miss
      
      const stats = cache.getStats();
      expect(stats.totalHits).toBe(1);
      expect(stats.totalMisses).toBe(1);
      expect(stats.totalSets).toBe(1);
      expect(stats.size).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });
  });

  describe('cleanup', () => {
    it('should clean up expired entries automatically', async () => {
      const shortTTLCache = new Cache<string>({
        defaultTTL: 50,
        cleanupInterval: 25
      });

      shortTTLCache.set('key1', 'value1');
      expect(shortTTLCache.size()).toBe(1);
      
      // Wait for cleanup to run
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(shortTTLCache.size()).toBe(0);
      
      shortTTLCache.dispose();
    });
  });
});

describe('createCacheKey', () => {
  it('should create cache keys from multiple parameters', () => {
    expect(createCacheKey('search', 'cats', 10, 0)).toBe('search:cats:10:0');
  });

  it('should filter out null and undefined values', () => {
    expect(createCacheKey('search', 'cats', null, undefined, 10)).toBe('search:cats:10');
  });

  it('should handle different data types', () => {
    expect(createCacheKey('test', 123, true, 'string')).toBe('test:123:true:string');
  });
});