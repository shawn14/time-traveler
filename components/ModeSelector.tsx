import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface Mode {
  key: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  preview?: string;
}

type ModeKey = 'time-traveler' | 'style-sculptor' | 'world-wanderer' | 'character-creator' | 'glow-up' | 'what-if' | 'avatar-creator' | 'vibe-check' | 'meme-machine' | 'interior-design';

interface ModeSelectorProps {
  currentMode: ModeKey;
  onModeChange: (mode: ModeKey) => void;
  disabled?: boolean;
}

const MODES_DATA: Mode[] = [
  {
    key: 'time-traveler',
    title: 'Time Traveler',
    description: 'Journey through the decades',
    emoji: '🕰️',
    gradient: 'from-amber-500 to-orange-500',
    preview: '50s → 60s → 70s → 80s → 90s → 00s'
  },
  {
    key: 'style-sculptor',
    title: 'Style Sculptor',
    description: 'Artistic transformations',
    emoji: '🎨',
    gradient: 'from-purple-500 to-pink-500',
    preview: 'Cyberpunk • Film Noir • Vogue • Anime'
  },
  {
    key: 'world-wanderer',
    title: 'World Wanderer',
    description: 'Travel the globe instantly',
    emoji: '🌍',
    gradient: 'from-green-500 to-teal-500',
    preview: 'Tokyo • Paris • Sahara • Venice'
  },
  {
    key: 'character-creator',
    title: 'Character Creator',
    description: 'Transform your look',
    emoji: '💇',
    gradient: 'from-indigo-500 to-purple-500',
    preview: 'Hair • Beard • Colors • Styles'
  },
  {
    key: 'glow-up',
    title: '✨ Glow Up ✨',
    description: 'Your best self revealed',
    emoji: '💫',
    gradient: 'from-pink-500 to-purple-500',
    preview: 'Red Carpet • Model • CEO • Fitness'
  },
  {
    key: 'what-if',
    title: '❓ What If ❓',
    description: 'Alternate realities await',
    emoji: '🤔',
    gradient: 'from-blue-500 to-cyan-500',
    preview: 'Famous • Royal • Hero • Billionaire'
  },
  {
    key: 'avatar-creator',
    title: 'Avatar Creator',
    description: 'Perfect profile pics',
    emoji: '🎭',
    gradient: 'from-violet-500 to-purple-500',
    preview: 'LinkedIn • Discord • Anime • Pixar'
  },
  {
    key: 'vibe-check',
    title: 'Vibe Check',
    description: 'Trending aesthetics',
    emoji: '🌈',
    gradient: 'from-rose-500 to-pink-500',
    preview: 'Dark Academia • Y2K • Cottagecore'
  },
  {
    key: 'meme-machine',
    title: 'Meme Machine',
    description: 'Become the meme',
    emoji: '🎪',
    gradient: 'from-yellow-500 to-red-500',
    preview: 'Gigachad • Wojak • Touch Grass'
  },
  {
    key: 'interior-design',
    title: 'Interior Design',
    description: 'Transform your space',
    emoji: '🏠',
    gradient: 'from-emerald-500 to-teal-500',
    preview: 'Modern • Boho • Scandi • Luxury'
  }
];

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange, disabled }) => {
  const [selectedIndex, setSelectedIndex] = useState(
    MODES_DATA.findIndex(mode => mode.key === currentMode) || 0
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const isDragging = useRef(false);

  const handlePrevious = () => {
    const newIndex = selectedIndex === 0 ? MODES_DATA.length - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
    onModeChange(MODES_DATA[newIndex].key as ModeKey);
  };

  const handleNext = () => {
    const newIndex = selectedIndex === MODES_DATA.length - 1 ? 0 : selectedIndex + 1;
    setSelectedIndex(newIndex);
    onModeChange(MODES_DATA[newIndex].key as ModeKey);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const endX = e.changedTouches[0].clientX;
    const diff = startX.current - endX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
    isDragging.current = false;
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      <div 
        ref={containerRef}
        className="relative h-40 sm:h-48 flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={disabled}
          className="absolute left-0 z-10 p-2 text-white/80 hover:text-white transition-colors disabled:opacity-50"
          aria-label="Previous mode"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Cards */}
        <div className="relative w-full h-full overflow-hidden px-12">
          <AnimatePresence mode="wait">
            {MODES_DATA.map((mode, index) => {
              const offset = index - selectedIndex;
              const isActive = index === selectedIndex;
              const isVisible = Math.abs(offset) <= 1;
              
              if (!isVisible) return null;

              return (
                <motion.div
                  key={mode.key}
                  className={cn(
                    "absolute inset-0 mx-auto",
                    isActive ? "z-20" : "z-10"
                  )}
                  initial={{ opacity: 0, scale: 0.8, x: 300 * Math.sign(offset) }}
                  animate={{
                    opacity: isActive ? 1 : 0.5,
                    scale: isActive ? 1 : 0.85,
                    x: offset * 250,
                    rotateY: offset * -15,
                  }}
                  exit={{ opacity: 0, scale: 0.8, x: -300 * Math.sign(offset) }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onClick={() => {
                    if (!isActive && !disabled) {
                      setSelectedIndex(index);
                      onModeChange(mode.key as ModeKey);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "relative h-full rounded-xl p-6 cursor-pointer transform transition-all duration-300",
                      `bg-gradient-to-br ${mode.gradient}`,
                      isActive ? "shadow-2xl" : "shadow-lg",
                      !isActive && "hover:scale-105"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center h-full text-white">
                      <div className="text-4xl mb-2">{mode.emoji}</div>
                      <h3 className="font-permanent-marker text-xl sm:text-2xl mb-1">
                        {mode.title}
                      </h3>
                      <p className="text-sm sm:text-base text-white/90 text-center mb-2">
                        {mode.description}
                      </p>
                      {mode.preview && (
                        <p className="text-xs text-white/70 text-center">
                          {mode.preview}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={disabled}
          className="absolute right-0 z-10 p-2 text-white/80 hover:text-white transition-colors disabled:opacity-50"
          aria-label="Next mode"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {MODES_DATA.map((mode, index) => (
          <button
            key={mode.key}
            onClick={() => {
              setSelectedIndex(index);
              onModeChange(mode.key as ModeKey);
            }}
            disabled={disabled}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === selectedIndex 
                ? `bg-gradient-to-r ${mode.gradient} w-8` 
                : "bg-white/30"
            )}
            aria-label={`Select ${mode.title}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;