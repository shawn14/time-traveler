/**
 * Simple Circuit Breaker to prevent infinite loops and runaway API costs
 */

interface CircuitBreakerConfig {
  failureThreshold: number;  // Number of failures before opening circuit
  resetTimeout: number;      // Time in ms before attempting to close circuit
  monitoringPeriod: number;  // Time window in ms to track failures
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures: number[] = []; // Timestamps of failures
  private lastFailTime: number = 0;
  private successCount: number = 0;
  
  private config: CircuitBreakerConfig = {
    failureThreshold: 10,        // Open circuit after 10 failures
    resetTimeout: 5 * 60 * 1000, // 5 minutes
    monitoringPeriod: 60 * 1000  // Track failures within 1 minute
  };

  constructor(config?: Partial<CircuitBreakerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should be reset to half-open
    if (this.state === 'OPEN') {
      const timeSinceLastFail = Date.now() - this.lastFailTime;
      if (timeSinceLastFail >= this.config.resetTimeout) {
        this.state = 'HALF_OPEN';
        console.log('[Circuit Breaker] Attempting reset to HALF_OPEN');
      } else {
        const waitTime = Math.ceil((this.config.resetTimeout - timeSinceLastFail) / 1000);
        throw new Error(
          `Circuit breaker is OPEN. Too many failures detected. Please wait ${waitTime} seconds before trying again.`
        );
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

  /**
   * Record successful execution
   */
  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      // Close circuit after 3 successful requests
      if (this.successCount >= 3) {
        this.state = 'CLOSED';
        this.failures = [];
        this.successCount = 0;
        console.log('[Circuit Breaker] Circuit CLOSED - System recovered');
      }
    }
  }

  /**
   * Record failed execution
   */
  private onFailure(): void {
    const now = Date.now();
    this.lastFailTime = now;
    
    // Reset success count if in half-open state
    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.successCount = 0;
      console.log('[Circuit Breaker] Circuit OPEN - Failure in HALF_OPEN state');
      return;
    }

    // Add failure timestamp
    this.failures.push(now);
    
    // Remove old failures outside monitoring period
    this.failures = this.failures.filter(
      timestamp => now - timestamp < this.config.monitoringPeriod
    );

    // Check if we should open the circuit
    if (this.failures.length >= this.config.failureThreshold) {
      this.state = 'OPEN';
      console.log(
        `[Circuit Breaker] Circuit OPEN - ${this.failures.length} failures in ${this.config.monitoringPeriod / 1000}s`
      );
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit statistics
   */
  getStats() {
    const now = Date.now();
    const recentFailures = this.failures.filter(
      timestamp => now - timestamp < this.config.monitoringPeriod
    );

    return {
      state: this.state,
      recentFailures: recentFailures.length,
      totalFailures: this.failures.length,
      timeSinceLastFailure: this.lastFailTime ? now - this.lastFailTime : null,
      config: this.config
    };
  }

  /**
   * Force reset the circuit (for emergency use)
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failures = [];
    this.successCount = 0;
    this.lastFailTime = 0;
    console.log('[Circuit Breaker] Circuit manually RESET');
  }
}

// Export singleton instance for API protection
export const apiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 10,        // 10 failures
  resetTimeout: 5 * 60 * 1000, // 5 minutes
  monitoringPeriod: 60 * 1000  // within 1 minute
});

// Daily request limit tracking
class DailyLimitTracker {
  private readonly STORAGE_KEY = 'api_daily_requests';
  private readonly MAX_DAILY_REQUESTS = 100; // ~$4 per day at $0.04/request

  /**
   * Check if daily limit is reached
   */
  checkLimit(): { allowed: boolean; count: number; resetTime: Date } {
    const today = new Date().toDateString();
    const data = this.getStorageData();
    
    // Reset if new day
    if (data.date !== today) {
      data.date = today;
      data.count = 0;
      this.saveStorageData(data);
    }

    const allowed = data.count < this.MAX_DAILY_REQUESTS;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return {
      allowed,
      count: data.count,
      resetTime: tomorrow
    };
  }

  /**
   * Increment request count
   */
  increment(): void {
    const data = this.getStorageData();
    data.count++;
    this.saveStorageData(data);
  }

  /**
   * Get current stats
   */
  getStats() {
    const { allowed, count, resetTime } = this.checkLimit();
    return {
      used: count,
      limit: this.MAX_DAILY_REQUESTS,
      remaining: Math.max(0, this.MAX_DAILY_REQUESTS - count),
      allowed,
      resetTime,
      estimatedCost: count * 0.04 // Assuming $0.04 per request
    };
  }

  private getStorageData(): { date: string; count: number } {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return { date: new Date().toDateString(), count: 0 };
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to read daily limit data:', e);
    }

    return { date: new Date().toDateString(), count: 0 };
  }

  private saveStorageData(data: { date: string; count: number }): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save daily limit data:', e);
    }
  }
}

export const dailyLimitTracker = new DailyLimitTracker();