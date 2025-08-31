import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { MODES } from '../App';
import { ModeIcon } from './ui/mode-icons';
import CustomPromptInput from './CustomPromptInput';
import type { ModeKey } from '../MobileApp';

interface SwipeableModeCarouselProps {
  currentMode: ModeKey;
  onModeChange: (mode: ModeKey) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  isActive: boolean;
}

const SwipeableModeCarousel: React.FC<SwipeableModeCarouselProps> = ({
  currentMode,
  onModeChange,
  selectedCategory,
  onCategorySelect,
  isActive
}) => {
  const modes = Object.keys(MODES) as ModeKey[];
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [showModifyPrompt, setShowModifyPrompt] = useState(false);
  const currentIndex = modes.indexOf(currentMode);
  
  const x = useMotionValue(0);
  const scale = useTransform(x, [-100, 0, 100], [0.9, 1, 0.9]);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    
    if (info.offset.x > swipeThreshold && currentIndex > 0) {
      // Swipe right - go to previous mode
      onModeChange(modes[currentIndex - 1]);
    } else if (info.offset.x < -swipeThreshold && currentIndex < modes.length - 1) {
      // Swipe left - go to next mode
      onModeChange(modes[currentIndex + 1]);
    }
  };

  const handleCustomPromptSubmit = (prompt: string) => {
    onCategorySelect(prompt);
    setShowCustomPrompt(false);
    setShowModifyPrompt(false);
  };

  // Auto-select first category when mode changes (except for custom mode)
  useEffect(() => {
    if (currentMode !== 'custom' && (!selectedCategory || selectedCategory === 'Type your own prompt')) {
      const firstCategory = MODES[currentMode].categories[0];
      onCategorySelect(firstCategory);
    }
  }, [currentMode]);

  // Show custom prompt modal when custom mode is selected and no prompt is set
  useEffect(() => {
    if (currentMode === 'custom' && (selectedCategory === 'Type your own prompt' || !selectedCategory)) {
      setShowCustomPrompt(true);
    }
  }, [currentMode, selectedCategory]);

  return (
    <>
      {/* Custom/Modify prompt modal */}
      <AnimatePresence>
        {(showCustomPrompt || showModifyPrompt) && (
          <CustomPromptInput
            onSubmit={handleCustomPromptSubmit}
            onClose={() => {
              setShowCustomPrompt(false);
              setShowModifyPrompt(false);
            }}
            initialPrompt={showModifyPrompt ? selectedCategory : ''}
            title={showModifyPrompt ? 'Modify Prompt' : 'Custom Prompt'}
          />
        )}
      </AnimatePresence>

      {/* Mode display */}
      <div className={`fixed bottom-44 left-0 right-0 z-20 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="px-8">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x, scale, opacity }}
            className="bg-black/60 backdrop-blur-xl rounded-3xl p-4 mx-auto max-w-xs shadow-2xl"
          >
            {/* Mode icon and title */}
            <div className="flex flex-col items-center text-center">
              <ModeIcon mode={currentMode} className="w-12 h-12 text-white mb-2" />
              <h2 className="text-white text-xl font-bold mb-1">{MODES[currentMode].title}</h2>
              <p className="text-white/60 text-xs mb-3 max-w-[200px]">{MODES[currentMode].description}</p>
              
              {/* Selected category or prompt */}
              <div className="bg-white/10 rounded-full px-3 py-1.5 mb-3 max-w-[250px]">
                <p className="text-white text-sm font-medium truncate">
                  {currentMode === 'custom' && selectedCategory !== 'Type your own prompt' 
                    ? selectedCategory
                    : selectedCategory || 'Select a style'}
                </p>
              </div>

              {/* Chat/Modify button */}
              <button
                onClick={() => setShowModifyPrompt(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-full px-3 py-1.5 transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-white text-sm font-medium">
                  {currentMode === 'custom' ? 'Edit Prompt' : 'Customize'}
                </span>
              </button>
            </div>

            {/* Swipe indicators */}
            <div className="flex justify-center gap-1.5 mt-4">
              {modes.map((mode, index) => (
                <div
                  key={mode}
                  className={`h-1 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'w-6 bg-white' 
                      : 'w-1 bg-white/30'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SwipeableModeCarousel;