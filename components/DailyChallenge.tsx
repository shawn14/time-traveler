import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODES } from '../App';
import { GlassCard } from './ui/glass-card';
import type { ModeKey } from '../MobileApp';

interface DailyChallengeProps {
  mode: ModeKey;
  category: string;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ mode, category }) => {
  const [isVisible, setIsVisible] = useState(true);
  const modeConfig = MODES[mode];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mx-4 mt-2"
      >
        <GlassCard className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 p-4" blur="xl" gradient>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                <h3 className="text-white font-bold text-lg">Daily Challenge</h3>
              </div>
              <p className="text-white/90 text-sm">
                Create a <span className="font-bold">{category}</span> transformation 
                using <span className="font-bold">{modeConfig.title}</span> mode!
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <span className="text-white text-sm font-medium">+100 XP</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1">
                  <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white text-sm font-medium">Streak Bonus</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/60 hover:text-white ml-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
};

export default DailyChallenge;