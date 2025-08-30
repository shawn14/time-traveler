import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODES } from '../App';
import { ModeIcon } from './ui/mode-icons';
import type { ModeKey } from '../MobileApp';

interface SnapchatStyleCarouselProps {
  currentMode: ModeKey;
  onModeChange: (mode: ModeKey) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onCapture: () => void;
  onUpload: () => void;
  isLoading?: boolean;
}

const SnapchatStyleCarousel: React.FC<SnapchatStyleCarouselProps> = ({
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
    setShowCategories(false);
  };

  const handleCategorySelect = (category: string) => {
    onCategorySelect(category);
    setShowCategories(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      {/* Categories overlay */}
      <AnimatePresence>
        {showCategories && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full mb-4 left-4 right-4"
          >
            <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-4">
              <h3 className="text-white font-medium mb-3 text-center">
                Choose a style
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {currentModeConfig.categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main controls */}
      <div className="bg-black/80 backdrop-blur-xl pb-safe">
        {/* Selected mode and category */}
        <div className="px-4 py-2">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-white/60 text-sm">{MODES[currentMode].title}</span>
              <span className="text-white font-medium">{selectedCategory}</span>
              <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Bottom controls row */}
        <div className="flex items-center justify-between px-4 pb-4">
          {/* Upload button */}
          <button
            onClick={onUpload}
            className="w-12 h-12 flex items-center justify-center"
          >
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </button>

          {/* Capture button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onCapture}
            disabled={!selectedCategory || isLoading}
            className="relative"
          >
            {/* Outer ring */}
            <div className={`w-20 h-20 rounded-full ${
              !selectedCategory ? 'bg-white/20' : 'bg-white'
            } p-1 ${isLoading ? 'animate-pulse' : ''}`}>
              {/* Inner circle */}
              <div className={`w-full h-full rounded-full ${
                !selectedCategory ? 'bg-white/30' : 'bg-white'
              } ${isLoading ? 'bg-red-500' : ''}`} />
            </div>
            {isLoading && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-500"
                animate={{ scale: [1, 1.2], opacity: [1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.button>

          {/* Mode carousel toggle */}
          <button
            onClick={() => {
              // Scroll to next mode
              const currentIndex = modes.indexOf(currentMode);
              const nextIndex = (currentIndex + 1) % modes.length;
              handleModeSelect(modes[nextIndex]);
            }}
            className="w-12 h-12 flex items-center justify-center"
          >
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <ModeIcon mode={currentMode} className="w-6 h-6 text-white" />
            </div>
          </button>
        </div>

        {/* Mode selector */}
        <div className="px-4 pb-4">
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide py-2"
            style={{ scrollbarWidth: 'none', WebkitScrollbar: { display: 'none' } }}
          >
            {modes.map((mode) => (
              <button
                key={mode}
                onClick={() => handleModeSelect(mode)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currentMode === mode
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {MODES[mode].title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapchatStyleCarousel;