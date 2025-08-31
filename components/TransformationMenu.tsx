import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODES } from '../App';
import { ModeIcon } from './ui/mode-icons';
import CustomPromptInput from './CustomPromptInput';
import type { ModeKey } from '../MobileApp';

interface TransformationMenuProps {
  capturedImage: string;
  onApplyTransformation: (mode: ModeKey, category: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const TransformationMenu: React.FC<TransformationMenuProps> = ({
  capturedImage,
  onApplyTransformation,
  onClose,
  isLoading = false
}) => {
  const [selectedMode, setSelectedMode] = useState<ModeKey | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedMode, setExpandedMode] = useState<ModeKey | null>(null);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const modes = Object.keys(MODES) as ModeKey[];

  const handleModeClick = (mode: ModeKey) => {
    if (mode === 'custom') {
      setShowCustomPrompt(true);
    } else {
      const modeConfig = MODES[mode];
      
      // If mode has only one category, auto-apply it
      if (modeConfig.categories.length === 1) {
        setSelectedMode(mode);
        setSelectedCategory(modeConfig.categories[0]);
        onApplyTransformation(mode, modeConfig.categories[0]);
      } else {
        setExpandedMode(expandedMode === mode ? null : mode);
        setSelectedMode(mode);
        // Auto-select first category when expanding
        if (expandedMode !== mode) {
          const firstCategory = modeConfig.categories[0];
          setSelectedCategory(firstCategory);
        }
      }
    }
  };
  
  const handleCategoryClick = (mode: ModeKey, category: string) => {
    if (mode === 'photo-editor' && category === 'Custom Request') {
      setSelectedMode(mode);
      setShowCustomPrompt(true);
    } else {
      setSelectedMode(mode);
      handleCategorySelect(category);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleApply = () => {
    if (selectedMode && selectedCategory) {
      onApplyTransformation(selectedMode, selectedCategory);
    }
  };

  const handleCustomPromptSubmit = (prompt: string) => {
    if (selectedMode === 'photo-editor') {
      // For photo editor custom requests
      setSelectedCategory(prompt);
      setShowCustomPrompt(false);
      onApplyTransformation('photo-editor', prompt);
    } else {
      // For regular custom mode
      setSelectedMode('custom');
      setSelectedCategory(prompt);
      setShowCustomPrompt(false);
      onApplyTransformation('custom', prompt);
    }
  };

  return (
    <>
      {/* Custom prompt modal */}
      <AnimatePresence>
        {showCustomPrompt && (
          <CustomPromptInput
            onSubmit={handleCustomPromptSubmit}
            onClose={() => setShowCustomPrompt(false)}
            title={selectedMode === 'photo-editor' ? "Describe Your Edit Request" : "Describe Your Transformation"}
            placeholder={selectedMode === 'photo-editor' ? "e.g. 'Make the background more blurry', 'Add warm sunset tones', 'Remove the person in background'" : undefined}
          />
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-sm mx-4"
            >
              <div className="flex flex-col items-center gap-6">
                {/* Animated AI icon */}
                <div className="relative w-20 h-20">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="absolute inset-2 bg-black rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                
                {/* Loading text */}
                <div className="text-center">
                  <h3 className="text-white font-semibold text-lg mb-2">AI is creating your transformation</h3>
                  <p className="text-white/60 text-sm">This usually takes 10-15 seconds</p>
                </div>
                
                {/* Progress dots */}
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-white/40 rounded-full"
                      animate={{
                        backgroundColor: ["rgba(255,255,255,0.4)", "rgba(255,255,255,1)", "rgba(255,255,255,0.4)"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transformation menu overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex flex-col"
      >
        {/* Header with captured image */}
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Captured image preview */}
          <div className="h-[30vh] bg-black relative overflow-hidden">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
          </div>
        </div>

        {/* Transformation options */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="p-4">
            <h2 className="text-white text-xl font-bold mb-4">Choose a Transformation</h2>
            
            <div className="space-y-3">
              {modes.map((mode) => {
                const modeConfig = MODES[mode];
                const isExpanded = expandedMode === mode;
                const isCustom = mode === 'custom';

                return (
                  <motion.div
                    key={mode}
                    layout
                    className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden"
                  >
                    {/* Mode header */}
                    <button
                      onClick={() => handleModeClick(mode)}
                      className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${modeConfig.colorClass || 'from-gray-500 to-gray-700'} flex items-center justify-center flex-shrink-0`}>
                        <ModeIcon mode={mode} className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-white font-semibold">{modeConfig.title}</h3>
                        <p className="text-white/60 text-sm">{modeConfig.description}</p>
                      </div>
                      {!isCustom && (
                        <svg 
                          className={`w-5 h-5 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {/* Categories */}
                    <AnimatePresence>
                      {isExpanded && !isCustom && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                            {modeConfig.categories.map((category) => {
                              const isSelected = selectedMode === mode && selectedCategory === category;
                              
                              return (
                                <button
                                  key={category}
                                  onClick={() => handleCategoryClick(mode, category)}
                                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                      : 'bg-white/10 text-white hover:bg-white/20'
                                  }`}
                                >
                                  {category}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Apply button */}
        {selectedMode && selectedCategory && selectedMode !== 'custom' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={handleApply}
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-semibold text-white transition-all ${
                isLoading 
                  ? 'bg-gray-600 opacity-50' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Apply ${selectedCategory}`
              )}
            </motion.button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default TransformationMenu;