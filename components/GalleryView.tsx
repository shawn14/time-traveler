import React, { useState } from 'react';
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

interface GalleryViewProps {
  images: TransformedImage[];
}

const GalleryView: React.FC<GalleryViewProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<TransformedImage | null>(null);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="p-4 pt-16 border-b border-white/10">
        <h1 className="text-white text-2xl font-bold">Your Gallery</h1>
        <p className="text-white/60 text-sm mt-1">{images.length} transformations</p>
      </div>

      {/* Grid */}
      {images.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-white text-xl font-bold mb-2">No photos yet</h3>
            <p className="text-white/60">Start creating amazing transformations!</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-1 p-1">
            {images.map((image, index) => (
              <motion.button
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedImage(image)}
                className="aspect-square relative overflow-hidden bg-gray-900"
              >
                <img
                  src={image.transformedUrl}
                  alt={`${image.mode} - ${image.category}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-medium truncate">
                      {MODES[image.mode].title}
                    </p>
                    <p className="text-white/60 text-xs truncate">
                      {image.category}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Full screen view */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-50 flex flex-col"
        >
          <div className="p-4 flex items-center justify-between">
            <button
              onClick={() => setSelectedImage(null)}
              className="p-2 bg-white/10 rounded-full"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <p className="text-white font-medium">{MODES[selectedImage.mode].title}</p>
              <p className="text-white/60 text-sm">{selectedImage.category}</p>
            </div>
            <button className="p-2 bg-white/10 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={selectedImage.transformedUrl}
              alt="Full view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
          
          <div className="p-4">
            <p className="text-white/60 text-center text-sm">
              {formatDate(selectedImage.timestamp)}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GalleryView;