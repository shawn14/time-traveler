import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODES } from '../App';
import { getShareCaption, shareToClipboard, downloadImage, shareImage } from '../lib/shareUtils';
import { GlassCard, GlassButton, FloatingOrb } from './ui/glass-card';
import type { ModeKey } from '../MobileApp';

interface ResultScreenProps {
  originalImage: string;
  transformedImage: string;
  mode: ModeKey;
  category: string;
  onSave: () => void;
  onRetake: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  originalImage,
  transformedImage,
  mode,
  category,
  onSave,
  onRetake
}) => {
  const [showBefore, setShowBefore] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [saved, setSaved] = useState(false);
  const modeConfig = MODES[mode];

  const handleSave = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleShare = async () => {
    const caption = getShareCaption(mode, category);
    const filename = `${mode}_${category}_${Date.now()}.jpg`;
    
    // Try native share first (better for mobile)
    const shareSuccess = await shareImage(transformedImage, caption, filename);
    
    if (!shareSuccess) {
      // Fallback to copying caption
      const success = await shareToClipboard(caption);
      if (success) {
        setShowShareMenu(false);
        alert('Caption copied! You can now share your photo on social media.');
      }
    } else {
      setShowShareMenu(false);
    }
  };

  const handleDownload = async () => {
    await downloadImage(transformedImage, `${mode}_${category}_${Date.now()}.jpg`);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex flex-col overflow-hidden">
      {/* Floating orbs for depth */}
      <FloatingOrb size="lg" color="purple" delay={0} />
      <FloatingOrb size="md" color="pink" delay={2} />
      <FloatingOrb size="sm" color="blue" delay={4} />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <GlassCard className="p-1" blur="xl">
            <GlassButton
              onClick={onRetake}
              variant="ghost"
              size="md"
              className="rounded-full p-2"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </GlassButton>
          </GlassCard>
          
          <GlassCard className="px-4 py-2" blur="xl" gradient>
            <p className="text-white font-medium text-sm">
              {modeConfig.title} • {category}
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Image container */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        <GlassCard className="p-2" blur="md" gradient>
          <AnimatePresence mode="wait">
            {showBefore ? (
              <motion.img
                key="before"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                src={originalImage}
                alt="Original"
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            ) : (
              <motion.img
                key="after"
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                src={transformedImage}
                alt="Transformed"
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Before/After toggle */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="px-6 py-3" blur="xl" gradient>
            <button
              onTouchStart={() => setShowBefore(true)}
              onTouchEnd={() => setShowBefore(false)}
              onMouseDown={() => setShowBefore(true)}
              onMouseUp={() => setShowBefore(false)}
              onMouseLeave={() => setShowBefore(false)}
              className="flex items-center gap-2"
            >
              <motion.svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={showBefore ? { scale: 1.2 } : { scale: 1 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </motion.svg>
              <span className="text-white font-medium">Hold to see before</span>
            </button>
          </GlassCard>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="p-6 pb-8">
        <div className="flex gap-3">
          <GlassButton
            onClick={handleSave}
            disabled={saved}
            size="lg"
            className="flex-1 bg-gradient-to-r from-purple-600/50 to-pink-600/50 flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <motion.svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
                <span>Saved!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                </svg>
                <span>Save</span>
              </>
            )}
          </GlassButton>

          <GlassButton
            onClick={() => setShowShareMenu(!showShareMenu)}
            variant="secondary"
            size="lg"
            className="px-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9 9 0 10-13.432 0m13.432 0A9 9 0 0112 21a9 9 0 01-6.716-3.016m13.432 0c.315-.582.496-1.22.496-1.984 0-2.21-1.79-4-4-4s-4 1.79-4 4c0 .764.181 1.402.496 1.984" />
            </svg>
          </GlassButton>
        </div>

        {/* Share menu */}
        <AnimatePresence>
          {showShareMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-3"
            >
              <GlassCard className="p-3" blur="xl">
                <div className="flex gap-2">
                  <GlassButton
                    onClick={handleShare}
                    variant="secondary"
                    size="md"
                    className="flex-1"
                  >
                    {navigator.share ? 'Share' : 'Copy Caption'}
                  </GlassButton>
                  <GlassButton
                    onClick={handleDownload}
                    variant="secondary"
                    size="md"
                    className="flex-1"
                  >
                    Save Photo
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <GlassButton
          onClick={onRetake}
          variant="ghost"
          size="lg"
          className="w-full mt-3"
        >
          Try Another
        </GlassButton>
      </div>
    </div>
  );
};

export default ResultScreen;