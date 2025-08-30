import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODES } from '../App';
import { ModeIcon } from './ui/mode-icons';
import CustomPromptInput from './CustomPromptInput';
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
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const modes = Object.keys(MODES) as ModeKey[];
  const currentModeConfig = MODES[currentMode];

  const handleModeSelect = (mode: ModeKey) => {
    onModeChange(mode);
    
    if (mode === 'custom') {
      // For custom mode, show the prompt input immediately
      setShowCustomPrompt(true);
      setShowCategories(false);
    } else {
      // Automatically select the first category of the new mode
      const firstCategory = MODES[mode].categories[0];
      onCategorySelect(firstCategory);
      setShowCategories(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    if (currentMode === 'custom' && category === 'Type your own prompt') {
      setShowCustomPrompt(true);
      setShowCategories(false);
    } else {
      onCategorySelect(category);
      setShowCategories(false);
    }
  };
  
  const handleCustomPromptSubmit = (prompt: string) => {
    onCategorySelect(prompt);
    setShowCustomPrompt(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      {/* Custom prompt modal */}
      <AnimatePresence>
        {showCustomPrompt && (
          <CustomPromptInput
            onSubmit={handleCustomPromptSubmit}
            onClose={() => setShowCustomPrompt(false)}
          />
        )}
      </AnimatePresence>
      
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
        <div className="px-4 py-3">
          <button
            onClick={() => {
              if (currentMode === 'custom') {
                setShowCustomPrompt(true);
              } else {
                setShowCategories(!showCategories);
              }
            }}
            className="w-full"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mx-auto max-w-fit flex items-center gap-3 hover:bg-white/20 transition-colors">
              <ModeIcon mode={currentMode} className="w-5 h-5 text-white" />
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-sm">{MODES[currentMode].title}</span>
                <span className="text-white/50">›</span>
                <span className="text-white font-semibold">
                  {currentMode === 'custom' && selectedCategory !== 'Type your own prompt' 
                    ? selectedCategory.length > 30 
                      ? selectedCategory.substring(0, 30) + '...' 
                      : selectedCategory
                    : selectedCategory}
                </span>
              </div>
              <svg className={`w-4 h-4 text-white/60 transition-transform ${showCategories ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            disabled={isLoading}
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
            className="flex gap-3 overflow-x-auto scrollbar-hide py-2"
            style={{ scrollbarWidth: 'none', WebkitScrollbar: { display: 'none' } }}
          >
            {modes.map((mode) => (
              <button
                key={mode}
                onClick={() => handleModeSelect(mode)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all transform ${
                  currentMode === mode
                    ? 'bg-white text-black scale-110 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                <ModeIcon mode={mode} className={`w-5 h-5 ${currentMode === mode ? 'text-black' : 'text-white'}`} />
                <span className="text-sm">{MODES[mode].title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapchatStyleCarousel;