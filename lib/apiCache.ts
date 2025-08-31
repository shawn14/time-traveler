/**
 * API Response Caching System
 * Reduces API costs by caching identical transformation requests
 */

interface CacheEntry {
  result: string;
  timestamp: number;
  hitCount: number;
}

class APICache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 100; // Maximum cache entries
  private ttl: number = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate a hash key for cache lookup
   */
  private async generateKey(imageData: string, prompt: string): Promise<string> {
    // Create a hash from image + prompt
    // For images, we'll use a sample of the data to avoid hashing huge strings
    const imageSample = imageData.substring(0, 100) + imageData.substring(imageData.length - 100);
    const textToHash = imageSample + prompt;
    
    // Simple hash function (in production, use crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < textToHash.length; i++) {
      const char = textToHash.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `cache_${hash}_${prompt.length}`;
  }

  /**
   * Get cached result if available
   */
  async get(imageData: string, prompt: string): Promise<string | null> {
    const key = await this.generateKey(imageData, prompt);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Update hit count
    entry.hitCount++;
    
    console.log(`[Cache Hit] Saved API call! Key: ${key}, Hits: ${entry.hitCount}`);
    return entry.result;
  }

  /**
   * Store result in cache
   */
  async set(imageData: string, prompt: string, result: string): Promise<void> {
    const key = await this.generateKey(imageData, prompt);
    
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      console.log(`[Cache] Evicted oldest entry: ${oldestKey}`);
    }
    
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      hitCount: 0
    });
    
    console.log(`[Cache] Stored new entry: ${key}, Total entries: ${this.cache.size}`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let totalHits = 0;
    let totalSize = 0;
    
    this.cache.forEach(entry => {
      totalHits += entry.hitCount;
      totalSize += entry.result.length;
    });
    
    return {
      entries: this.cache.size,
      totalHits,
      estimatedSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      maxEntries: this.maxSize
    };
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    let removed = 0;
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        removed++;
      }
    });
    
    if (removed > 0) {
      console.log(`[Cache] Cleaned up ${removed} expired entries`);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log('[Cache] Cleared all entries');
  }
}

// Export singleton instance
export const apiCache = new APICache();

// Auto-cleanup every hour (only in browser environment)
if (typeof window !== 'undefined') {
  setInterval(() => apiCache.cleanup(), 60 * 60 * 1000);
}