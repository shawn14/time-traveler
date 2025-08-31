import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODES } from '../App';
import { ModeIcon } from './ui/mode-icons';
import CustomPromptInput from './CustomPromptInput';
import type { ModeKey } from '../MobileApp';

interface ModeSelectionGridProps {
  currentMode: ModeKey;
  selectedCategory: string;
  onSelectMode: (mode: ModeKey, category: string) => void;
  onClose: () => void;
}

const ModeSelectionGrid: React.FC<ModeSelectionGridProps> = ({
  currentMode,
  selectedCategory,
  onSelectMode,
  onClose
}) => {
  const [expandedMode, setExpandedMode] = useState<ModeKey | null>(currentMode);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const modes = Object.keys(MODES) as ModeKey[];

  const handleModeClick = (mode: ModeKey) => {
    if (mode === 'custom') {
      setShowCustomPrompt(true);
    } else {
      setExpandedMode(expandedMode === mode ? null : mode);
    }
  };

  const handleCategorySelect = (mode: ModeKey, category: string) => {
    onSelectMode(mode, category);
    onClose();
  };

  const handleCustomPromptSubmit = (prompt: string) => {
    onSelectMode('custom', prompt);
    setShowCustomPrompt(false);
    onClose();
  };

  return (
    <>
      {/* Custom prompt modal */}
      <AnimatePresence>
        {showCustomPrompt && (
          <CustomPromptInput
            onSubmit={handleCustomPromptSubmit}
            onClose={() => setShowCustomPrompt(false)}
            title="Create Your Transformation"
          />
        )}
      </AnimatePresence>

      {/* Mode selection overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50"
        onClick={onClose}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <h2 className="text-white text-xl font-bold">Choose a Mode</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable mode grid */}
          <div className="flex-1 overflow-y-auto pb-safe">
            <div className="p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
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
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${modeConfig.colorClass || 'from-gray-500 to-gray-700'} flex items-center justify-center`}>
                        <ModeIcon mode={mode} className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-white font-semibold text-lg">{modeConfig.title}</h3>
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

                    {/* Categories grid */}
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
                              const isSelected = currentMode === mode && selectedCategory === category;
                              
                              return (
                                <button
                                  key={category}
                                  onClick={() => handleCategorySelect(mode, category)}
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
      </motion.div>
    </>
  );
};

export default ModeSelectionGrid;