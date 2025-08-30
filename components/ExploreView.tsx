import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODES } from '../App';

// Mock data for trending transformations
const TRENDING_TRANSFORMATIONS = [
  {
    id: '1',
    username: '@alex_photo',
    avatar: '👤',
    originalUrl: '/api/placeholder/400/600',
    transformedUrl: '/api/placeholder/400/600',
    mode: 'time-traveler',
    category: '1980s',
    likes: 1234,
    timestamp: Date.now() - 3600000
  },
  {
    id: '2',
    username: '@creative_soul',
    avatar: '🎨',
    originalUrl: '/api/placeholder/400/600',
    transformedUrl: '/api/placeholder/400/600',
    mode: 'style-sculptor',
    category: 'Cyberpunk',
    likes: 2456,
    timestamp: Date.now() - 7200000
  },
  // Add more mock data as needed
];

const ExploreView: React.FC = () => {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  
  const currentPost = TRENDING_TRANSFORMATIONS[currentIndex];
  const touchStartY = useRef(0);

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleSwipe = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex < TRENDING_TRANSFORMATIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowOriginal(false);
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowOriginal(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (Math.abs(diff) > 50) {
      handleSwipe(diff > 0 ? 'up' : 'down');
    }
  };

  return (
    <div 
      className="h-full bg-black relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPost.id}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="h-full relative"
        >
          {/* Image */}
          <div 
            className="absolute inset-0"
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onMouseLeave={() => setShowOriginal(false)}
            onTouchStart={() => setShowOriginal(true)}
            onTouchEnd={() => setShowOriginal(false)}
          >
            <img
              src={showOriginal ? currentPost.originalUrl : currentPost.transformedUrl}
              alt="Transformation"
              className="w-full h-full object-cover"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
          </div>

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
              <h1 className="text-white text-xl font-bold">Discover</h1>
              <button className="p-2 bg-white/10 backdrop-blur-sm rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Right side actions */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-6">
              {/* User avatar */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl mb-2">
                  {currentPost.avatar}
                </div>
                <button className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Follow
                </button>
              </div>

              {/* Like button */}
              <button
                onClick={() => handleLike(currentPost.id)}
                className="flex flex-col items-center"
              >
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  className="mb-1"
                >
                  <svg 
                    className={`w-8 h-8 ${likedPosts.has(currentPost.id) ? 'text-red-500' : 'text-white'}`} 
                    fill={likedPosts.has(currentPost.id) ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </motion.div>
                <span className="text-white text-sm">{currentPost.likes}</span>
              </button>

              {/* Share button */}
              <button className="flex flex-col items-center">
                <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9 9 0 10-13.432 0m13.432 0A9 9 0 0112 21a9 9 0 01-6.716-3.016m13.432 0c.315-.582.496-1.22.496-1.984 0-2.21-1.79-4-4-4s-4 1.79-4 4c0 .764.181 1.402.496 1.984" />
                </svg>
                <span className="text-white text-sm">Share</span>
              </button>
            </div>

            {/* Bottom info */}
            <div className="mt-auto p-4 pb-20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-bold">{currentPost.username}</span>
                <span className="text-white/60">•</span>
                <span className="text-white/60 text-sm">
                  {new Date(currentPost.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="mb-2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {MODES[currentPost.mode as keyof typeof MODES].title} - {currentPost.category}
                </span>
              </div>
              
              <p className="text-white/80 text-sm">
                Hold to see the original photo 👆
              </p>
            </div>

            {/* Swipe indicator */}
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-white/40"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ExploreView;