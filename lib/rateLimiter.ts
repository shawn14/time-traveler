/**
 * Rate Limiting System
 * Prevents API abuse and controls costs
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RateLimitEntry {
  requests: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig = {
    maxRequests: 20, // 20 requests
    windowMs: 60 * 60 * 1000, // per hour
    message: 'Rate limit exceeded. Please try again later.'
  };

  /**
   * Check if request is allowed
   */
  checkLimit(identifier: string = 'global'): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    let entry = this.limits.get(identifier);
    
    // Initialize or reset entry
    if (!entry || now > entry.resetTime) {
      entry = {
        requests: 0,
        resetTime: now + this.config.windowMs
      };
      this.limits.set(identifier, entry);
    }
    
    const allowed = entry.requests < this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - entry.requests);
    const resetIn = Math.max(0, entry.resetTime - now);
    
    if (allowed) {
      entry.requests++;
    }
    
    return { allowed, remaining, resetIn };
  }

  /**
   * Throw error if rate limit exceeded
   */
  enforceLimit(identifier: string = 'global'): void {
    const { allowed, remaining, resetIn } = this.checkLimit(identifier);
    
    if (!allowed) {
      const resetInMinutes = Math.ceil(resetIn / 1000 / 60);
      throw new Error(
        `${this.config.message} You have ${remaining} transformations left. Resets in ${resetInMinutes} minutes.`
      );
    }
  }

  /**
   * Get current usage stats
   */
  getUsageStats(identifier: string = 'global'): {
    used: number;
    limit: number;
    remaining: number;
    resetIn: number;
    percentage: number;
  } {
    const now = Date.now();
    const entry = this.limits.get(identifier);
    
    if (!entry || now > entry.resetTime) {
      return {
        used: 0,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetIn: 0,
        percentage: 0
      };
    }
    
    const remaining = Math.max(0, this.config.maxRequests - entry.requests);
    const resetIn = Math.max(0, entry.resetTime - now);
    
    return {
      used: entry.requests,
      limit: this.config.maxRequests,
      remaining,
      resetIn,
      percentage: (entry.requests / this.config.maxRequests) * 100
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Reset limits for identifier
   */
  reset(identifier: string = 'global'): void {
    this.limits.delete(identifier);
  }

  /**
   * Clear all limits
   */
  clearAll(): void {
    this.limits.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Store usage in localStorage for persistence (only in browser environment)
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  const STORAGE_KEY = 'api_rate_limits';

  // Load saved limits on startup
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      // Restore limits if still valid
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (value.resetTime > Date.now()) {
          (rateLimiter as any).limits.set(key, value);
        }
      });
    }
  } catch (e) {
    console.error('Failed to load rate limits:', e);
  }

  // Save limits periodically
  setInterval(() => {
    try {
      const data: Record<string, RateLimitEntry> = {};
      (rateLimiter as any).limits.forEach((value: any, key: string) => {
        data[key] = value;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save rate limits:', e);
    }
  }, 10000); // Every 10 seconds
}