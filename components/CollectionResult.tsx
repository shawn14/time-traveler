import React from 'react';
import { motion } from 'framer-motion';
import { MODES } from '../App';
import { downloadImage } from '../lib/shareUtils';
import type { ModeKey } from '../MobileApp';

interface CollectionResultProps {
  originalImage: string;
  transformedImages: { category: string; image: string }[];
  mode: ModeKey;
  onRetake: () => void;
  onSaveAll: () => void;
}

const CollectionResult: React.FC<CollectionResultProps> = ({
  originalImage,
  transformedImages,
  mode,
  onRetake,
  onSaveAll
}) => {
  const modeConfig = MODES[mode];

  const handleDownloadAll = async () => {
    for (const { category, image } of transformedImages) {
      await downloadImage(image, `${mode}_${category}_${Date.now()}.jpg`);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm p-4 flex items-center justify-between">
        <button
          onClick={onRetake}
          className="p-2 bg-white/10 rounded-full"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        <h2 className="text-white text-lg font-bold">{modeConfig.title} Collection</h2>
        
        <button
          onClick={handleDownloadAll}
          className="p-2 bg-white/10 rounded-full"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>

      {/* Original image */}
      <div className="p-4">
        <div className="bg-white/10 rounded-lg p-2 mb-4">
          <p className="text-white/60 text-sm mb-2 text-center">Original</p>
          <img src={originalImage} alt="Original" className="w-full rounded-lg" />
        </div>

        {/* Grid of transformed images */}
        <div className="grid grid-cols-2 gap-4">
          {transformedImages.map(({ category, image }, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 rounded-lg p-2"
            >
              <p className="text-white text-sm mb-2 text-center font-medium">{category}</p>
              <img src={image} alt={category} className="w-full rounded-lg" />
              <button
                onClick={async () => await downloadImage(image, `${mode}_${category}_${Date.now()}.jpg`)}
                className="mt-2 w-full bg-white/10 text-white text-sm py-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                Save Photo
              </button>
            </motion.div>
          ))}
        </div>

        {/* Save all button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onSaveAll}
          className="mt-6 w-full bg-purple-500 text-white font-bold py-4 rounded-lg shadow-lg"
        >
          Save Collection to Gallery
        </motion.button>
      </div>
    </div>
  );
};

export default CollectionResult;