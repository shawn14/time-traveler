import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODES } from '../App';
import { GlassCard, GlassButton } from './ui/glass-card';
import { ModeIcon } from './ui/mode-icons';
import type { ModeKey } from '../MobileApp';

interface ModeCarouselProps {
  currentMode: ModeKey;
  onModeChange: (mode: ModeKey) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onCapture: () => void;
  onUpload: () => void;
  isLoading?: boolean;
}


const MODE_COLORS: Record<ModeKey, string> = {
  'time-traveler': 'from-amber-500 to-orange-500',
  'style-sculptor': 'from-purple-500 to-pink-500',
  'world-wanderer': 'from-green-500 to-teal-500',
  'character-creator': 'from-indigo-500 to-purple-500',
  'glow-up': 'from-pink-500 to-purple-500',
  'what-if': 'from-blue-500 to-cyan-500',
  'avatar-creator': 'from-violet-500 to-purple-500',
  'vibe-check': 'from-rose-500 to-pink-500',
  'meme-machine': 'from-yellow-500 to-red-500',
  'interior-design': 'from-emerald-500 to-teal-500'
};

const ModeCarousel: React.FC<ModeCarouselProps> = ({
  currentMode,
  onModeChange,
  selectedCategory,
  onCategorySelect,
  onCapture,
  onUpload,
  isLoading = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showCategories, setShowCategories] = useState(false);
  const modes = Object.keys(MODES) as ModeKey[];
  const currentModeConfig = MODES[currentMode];

  const handleModeSelect = (mode: ModeKey) => {
    onModeChange(mode);
    // Automatically select the first category of the new mode
    const firstCategory = MODES[mode].categories[0];
    onCategorySelect(firstCategory);
    setShowCategories(false); // Don't show categories since we auto-selected
  };

  const handleCategorySelect = (category: string) => {
    onCategorySelect(category);
    setShowCategories(false);
  };

  return (
    <div className="relative">
      {/* Categories overlay */}
      <AnimatePresence>
        {showCategories && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full left-0 right-0 mb-4 px-4"
          >
            <GlassCard className="p-4" blur="xl" gradient>
              <h3 className="text-white font-bold mb-3 text-center">
                Choose a style
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {currentModeConfig.categories.map((category) => (
                  <GlassButton
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    variant={selectedCategory === category ? 'primary' : 'secondary'}
                    size="sm"
                    className="w-full"
                  >
                    {category}
                  </GlassButton>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode selector */}
      <GlassCard className="rounded-none" blur="xl" opacity={0.3}>
        <div
          ref={scrollRef}
          className="flex gap-4 px-6 py-4 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', WebkitScrollbar: { display: 'none' } }}
        >
          {/* Camera Button */}
          <motion.button
            onClick={onCapture}
            disabled={!selectedCategory || isLoading}
            className="flex-shrink-0"
            whileTap={{ scale: 0.9 }}
          >
            <div className={`relative ${!selectedCategory ? 'opacity-50' : ''}`}>
              {selectedCategory && (
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur opacity-75"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              <GlassCard
                className={`relative w-20 h-20 rounded-2xl flex items-center justify-center ${
                  selectedCategory 
                    ? 'bg-gradient-to-br from-red-500 to-pink-500 ring-2 ring-white/50' 
                    : 'bg-gradient-to-br from-gray-600/30 to-gray-700/30'
                } ${isLoading ? 'animate-pulse' : ''} ${
                  selectedCategory && !isLoading ? 'shadow-lg shadow-red-500/50' : ''
                }`}
                blur="sm"
                gradient={false}
              >
                {isLoading ? (
                  <motion.svg 
                    className="w-8 h-8 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </motion.svg>
                ) : (
                  <>
                    <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedCategory && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-white/20"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    )}
                  </>
                )}
              </GlassCard>
              <p className={`text-white text-sm mt-2 text-center font-medium ${
                selectedCategory ? 'text-white font-bold' : 'text-white/60'
              }`}>
                {!selectedCategory ? 'Select Style First' : 'TAP TO CAPTURE'}
              </p>
            </div>
          </motion.button>

          {/* Upload Button */}
          <motion.button
            onClick={onUpload}
            className="flex-shrink-0"
            whileTap={{ scale: 0.9 }}
          >
            <div className={`relative ${!selectedCategory ? 'opacity-70' : ''}`}>
              <GlassCard
                className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                  selectedCategory 
                    ? 'bg-gradient-to-br from-blue-500/70 to-cyan-500/70 ring-2 ring-white/30' 
                    : 'bg-gradient-to-br from-gray-600/30 to-gray-700/30'
                }`}
                blur="md"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </GlassCard>
              <p className="text-white text-sm mt-2 text-center font-medium">
                Upload
              </p>
            </div>
          </motion.button>

          {/* Divider */}
          <div className="w-px bg-white/20 my-4 mx-2" />

          {/* Mode buttons */}
          {modes.map((mode) => (
            <motion.button
              key={mode}
              onClick={() => handleModeSelect(mode)}
              className="flex-shrink-0"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className="relative"
                animate={currentMode === mode ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br ${
                    MODE_COLORS[mode]
                  }/50`}
                  blur="md"
                  gradient={currentMode === mode}
                >
                  <ModeIcon 
                    mode={mode} 
                    className={`w-10 h-10 text-white ${currentMode === mode ? 'drop-shadow-lg' : ''}`}
                  />
                </GlassCard>
                <p className="text-white text-sm mt-2 text-center font-medium">
                  {MODES[mode].title.split(' ')[0]}
                </p>
              </motion.div>
            </motion.button>
          ))}
        </div>
        
        {/* Selected category indicator */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div 
              className="px-6 pb-4 flex items-center justify-between"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard className="px-4 py-2 inline-flex items-center gap-3" blur="md">
                <span className="text-white text-base font-medium">{MODES[currentMode].title}: {selectedCategory}</span>
                <GlassButton
                  onClick={() => setShowCategories(true)}
                  variant="ghost"
                  size="sm"
                  className="p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </GlassButton>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};

export default ModeCarousel;