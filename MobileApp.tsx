import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// Bottom navigation removed - all navigation now in camera view
import CameraView from './components/CameraView';
import GalleryView from './components/GalleryView';
import ExploreView from './components/ExploreView';
import ProfileView from './components/ProfileView';
import { MODES } from './App';
import { STORAGE_KEYS, safeSetItem, compressImageDataUrl, MAX_SAVED_IMAGES } from './lib/storageUtils';

export type ModeKey = keyof typeof MODES;

interface TransformedImage {
  id: string;
  originalUrl: string;
  transformedUrl: string;
  mode: ModeKey;
  category: string;
  timestamp: number;
}

const MobileApp: React.FC = () => {
  const [showGallery, setShowGallery] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [savedImages, setSavedImages] = useState<TransformedImage[]>([]);
  const [streak, setStreak] = useState(0);
  const [todaysChallenge, setTodaysChallenge] = useState<{mode: ModeKey; category: string} | null>(null);

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_TRANSFORMATIONS);
    if (saved) {
      setSavedImages(JSON.parse(saved));
    }

    const savedStreak = localStorage.getItem(STORAGE_KEYS.USER_STREAK);
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }

    // Generate daily challenge
    generateDailyChallenge();
  }, []);

  const generateDailyChallenge = () => {
    const modes = Object.keys(MODES) as ModeKey[];
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    const categories = MODES[randomMode].categories;
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    setTodaysChallenge({ mode: randomMode, category: randomCategory });
  };

  const handleSaveTransformation = async (image: TransformedImage) => {
    try {
      // Validate images before compression
      if (!image.originalUrl || !image.transformedUrl) {
        console.error('Invalid image URLs:', { 
          original: image.originalUrl?.substring(0, 50), 
          transformed: image.transformedUrl?.substring(0, 50) 
        });
        alert('Cannot save invalid images. Please try capturing again.');
        return;
      }
      
      // Compress images before saving
      const compressedImage = {
        ...image,
        originalUrl: await compressImageDataUrl(image.originalUrl, 0.7),
        transformedUrl: await compressImageDataUrl(image.transformedUrl, 0.7)
      };
      
      // Limit total saved images
      let updated = [compressedImage, ...savedImages];
      if (updated.length > MAX_SAVED_IMAGES) {
        updated = updated.slice(0, MAX_SAVED_IMAGES);
      }
      
      setSavedImages(updated);
      
      // Use safe storage
      const saved = await safeSetItem(STORAGE_KEYS.SAVED_TRANSFORMATIONS, JSON.stringify(updated));
      
      if (!saved) {
        alert('Storage is full. Some older images may have been removed to make space.');
      }
      
      // Update streak
      const lastSave = localStorage.getItem(STORAGE_KEYS.LAST_SAVE_DATE);
      const today = new Date().toDateString();
      
      if (lastSave !== today) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        await safeSetItem(STORAGE_KEYS.USER_STREAK, newStreak.toString());
        await safeSetItem(STORAGE_KEYS.LAST_SAVE_DATE, today);
      }
    } catch (error) {
      console.error('Error saving transformation:', error);
      alert('Failed to save image. Please try again.');
    }
  };

  // Handle back navigation for overlays
  const handleCloseOverlay = () => {
    setShowGallery(false);
    setShowProfile(false);
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Camera view is always active */}
      <CameraView 
        onSaveTransformation={handleSaveTransformation}
        streak={streak}
        todaysChallenge={todaysChallenge}
        onOpenGallery={() => setShowGallery(true)}
        onOpenProfile={() => setShowProfile(true)}
      />
      
      {/* Gallery overlay */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-40 bg-black"
          >
            {/* Back button */}
            <button
              onClick={handleCloseOverlay}
              className="absolute top-4 left-4 z-50 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <GalleryView images={savedImages} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Profile overlay */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-40 bg-black"
          >
            {/* Back button */}
            <button
              onClick={handleCloseOverlay}
              className="absolute top-4 left-4 z-50 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <ProfileView images={savedImages} streak={streak} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileApp;