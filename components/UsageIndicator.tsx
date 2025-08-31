import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { rateLimiter } from '../lib/rateLimiter';
import { apiCache } from '../lib/apiCache';
import { apiCircuitBreaker, dailyLimitTracker } from '../lib/circuitBreaker';

interface UsageIndicatorProps {
  className?: string;
}

const UsageIndicator: React.FC<UsageIndicatorProps> = ({ className = '' }) => {
  const [usage, setUsage] = useState(rateLimiter.getUsageStats());
  const [cacheStats, setCacheStats] = useState(apiCache.getStats());
  const [dailyStats, setDailyStats] = useState(dailyLimitTracker.getStats());
  const [circuitState, setCircuitState] = useState(apiCircuitBreaker.getState());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Update usage stats every second
    const interval = setInterval(() => {
      setUsage(rateLimiter.getUsageStats());
      setCacheStats(apiCache.getStats());
      setDailyStats(dailyLimitTracker.getStats());
      setCircuitState(apiCircuitBreaker.getState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const isNearLimit = usage.percentage > 75;
  const isAtLimit = usage.remaining === 0;
  const isDailyLimitNear = dailyStats.remaining < 20;
  const isCircuitOpen = circuitState === 'OPEN';

  return (
    <>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full ${className}`}
      >
        <div className="flex items-center gap-1">
          <span className={`text-sm font-medium ${
            isCircuitOpen ? 'text-red-400' : isAtLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-white'
          }`}>
            {isCircuitOpen ? '⚠️' : `${usage.remaining}/${usage.limit}`}
          </span>
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        {/* Progress bar */}
        <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${usage.percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </button>

      {/* Detailed usage modal */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white text-xl font-bold mb-4">Usage Statistics</h3>
            
            {/* API Usage */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80">API Calls</span>
                <span className={`font-medium ${
                  isAtLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {usage.used} / {usage.limit}
                </span>
              </div>
              
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-2">
                <motion.div
                  className={`h-full ${
                    isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  animate={{ width: `${usage.percentage}%` }}
                />
              </div>
              
              {usage.resetIn > 0 && (
                <p className="text-white/60 text-sm">
                  Resets in {formatTime(usage.resetIn)}
                </p>
              )}
            </div>

            {/* Cache Stats */}
            <div className="mb-6">
              <h4 className="text-white/80 mb-2">Cache Performance</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Cached Results</span>
                  <span className="text-white">{cacheStats.entries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Cache Hits</span>
                  <span className="text-green-400">{cacheStats.totalHits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Cache Size</span>
                  <span className="text-white">{cacheStats.estimatedSizeMB} MB</span>
                </div>
              </div>
            </div>

            {/* Daily Limit */}
            <div className="mb-6">
              <h4 className="text-white/80 mb-2">Daily Limit</h4>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80">API Calls Today</span>
                <span className={`font-medium ${
                  isDailyLimitNear ? 'text-yellow-400' : 'text-white'
                }`}>
                  {dailyStats.used} / {dailyStats.limit}
                </span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-2">
                <motion.div
                  className={`h-full ${
                    isDailyLimitNear ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  animate={{ width: `${(dailyStats.used / dailyStats.limit) * 100}%` }}
                />
              </div>
              <p className="text-white/60 text-sm">
                Estimated cost today: ${dailyStats.estimatedCost.toFixed(2)}
              </p>
            </div>

            {/* Circuit Breaker Status */}
            {isCircuitOpen && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                <p className="text-red-400 font-medium mb-1">⚠️ Circuit Breaker Active</p>
                <p className="text-white/80 text-sm">
                  Too many failures detected. Service will resume automatically in a few minutes.
                </p>
              </div>
            )}

            {/* Cost Savings */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
              <p className="text-green-400 font-medium mb-1">Cost Savings</p>
              <p className="text-white text-2xl font-bold">
                ${(cacheStats.totalHits * 0.04).toFixed(2)}
              </p>
              <p className="text-white/60 text-sm">
                Saved from {cacheStats.totalHits} cached responses
              </p>
            </div>

            {/* Tips */}
            {isNearLimit && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                <p className="text-yellow-400 text-sm font-medium mb-1">💡 Pro Tip</p>
                <p className="text-white/80 text-xs">
                  You're near your limit. Transformations are cached, so retrying the same edit won't use additional credits!
                </p>
              </div>
            )}

            <button
              onClick={() => setShowDetails(false)}
              className="w-full mt-4 py-2 bg-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default UsageIndicator;