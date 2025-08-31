import React from 'react';
import { motion } from 'framer-motion';
import { MODES } from '../App';
import type { ModeKey } from '../MobileApp';

interface TransformedImage {
  id: string;
  originalUrl: string;
  transformedUrl: string;
  mode: ModeKey;
  category: string;
  timestamp: number;
}

interface ProfileViewProps {
  images: TransformedImage[];
  streak: number;
}

const ProfileView: React.FC<ProfileViewProps> = ({ images, streak }) => {
  const stats = {
    totalTransformations: images.length,
    favoriteMode: getMostUsedMode(images),
    thisWeek: getThisWeekCount(images),
    level: Math.floor(images.length / 10) + 1
  };

  function getMostUsedMode(images: TransformedImage[]): string {
    if (images.length === 0) return 'None';
    
    const modeCounts = images.reduce((acc, img) => {
      acc[img.mode] = (acc[img.mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsed = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0];
    return MODES[mostUsed[0] as ModeKey].title;
  }

  function getThisWeekCount(images: TransformedImage[]): number {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return images.filter(img => img.timestamp > oneWeekAgo).length;
  }

  return (
    <div className="h-full bg-black overflow-y-auto">
      {/* Header */}
      <div className="p-6 pt-20 text-center border-b border-white/10">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl">👤</span>
        </div>
        <h2 className="text-white text-2xl font-bold mb-1">Your Profile</h2>
        <p className="text-white/60">Level {stats.level} Creator</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 p-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center"
        >
          <div className="text-3xl font-bold text-white mb-1">{stats.totalTransformations}</div>
          <div className="text-white/60 text-sm">Total Creations</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center"
        >
          <div className="text-3xl font-bold text-orange-500 mb-1">{streak}🔥</div>
          <div className="text-white/60 text-sm">Day Streak</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center"
        >
          <div className="text-3xl font-bold text-purple-500 mb-1">{stats.thisWeek}</div>
          <div className="text-white/60 text-sm">This Week</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center"
        >
          <div className="text-lg font-bold text-white mb-1">{stats.favoriteMode}</div>
          <div className="text-white/60 text-sm">Favorite Mode</div>
        </motion.div>
      </div>

      {/* Achievements */}
      <div className="p-6">
        <h3 className="text-white text-xl font-bold mb-4">Achievements</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🌟', name: 'First Timer', unlocked: images.length >= 1 },
            { icon: '🎨', name: 'Style Master', unlocked: images.length >= 10 },
            { icon: '🔥', name: 'Week Warrior', unlocked: streak >= 7 },
            { icon: '🌍', name: 'World Traveler', unlocked: images.filter(img => img.mode === 'world-wanderer').length >= 5 },
            { icon: '⏰', name: 'Time Lord', unlocked: images.filter(img => img.mode === 'time-traveler').length >= 10 },
            { icon: '🏆', name: 'Century Club', unlocked: images.length >= 100 },
          ].map((achievement, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: achievement.unlocked ? 1.1 : 1 }}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-3 ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                  : 'bg-white/5 opacity-50'
              }`}
            >
              <div className="text-3xl mb-1">{achievement.icon}</div>
              <div className="text-white text-xs font-medium text-center">{achievement.name}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-6 space-y-3">
        <h3 className="text-white text-xl font-bold mb-4">Settings</h3>
        
        <button className="w-full bg-white/5 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <span className="text-white font-medium">Notifications</span>
          </div>
          <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button className="w-full bg-white/5 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <span className="text-white font-medium">Appearance</span>
          </div>
          <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button className="w-full bg-white/5 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💾</span>
            <span className="text-white font-medium">Backup & Export</span>
          </div>
          <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button className="w-full bg-white/5 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-2xl">ℹ️</span>
            <span className="text-white font-medium">About</span>
          </div>
          <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Spacer for bottom nav */}
      <div className="h-20" />
    </div>
  );
};

export default ProfileView;