import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { photoLibrary, SavedPhoto } from '../lib/photoLibrary';

interface PhotoLibraryViewProps {
  onSelectPhoto: (photo: SavedPhoto) => void;
  onClose: () => void;
}

const PhotoLibraryView: React.FC<PhotoLibraryViewProps> = ({ onSelectPhoto, onClose }) => {
  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<SavedPhoto | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const storageInfo = photoLibrary.getStorageInfo();

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = () => {
    const savedPhotos = photoLibrary.getPhotos();
    // Sort by usage count and timestamp (most used/recent first)
    savedPhotos.sort((a, b) => {
      if (a.usageCount !== b.usageCount) {
        return b.usageCount - a.usageCount;
      }
      return b.timestamp - a.timestamp;
    });
    setPhotos(savedPhotos);
  };

  const handleSelectPhoto = (photo: SavedPhoto) => {
    photoLibrary.incrementUsage(photo.id);
    onSelectPhoto(photo);
  };

  const handleDeletePhoto = (id: string) => {
    if (window.confirm('Delete this photo from your library?')) {
      photoLibrary.deletePhoto(id);
      loadPhotos();
      if (selectedPhoto?.id === id) {
        setSelectedPhoto(null);
      }
    }
  };

  const handleRenamePhoto = (id: string) => {
    if (editName.trim()) {
      photoLibrary.renamePhoto(id, editName.trim());
      loadPhotos();
      setEditingId(null);
      setEditName('');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Header */}
      <div className="relative p-4 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Photo Library</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Storage info */}
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-white/60">{photos.length}/5 photos</span>
          <span className="text-white/40">•</span>
          <span className="text-white/60">{storageInfo.estimatedSizeMB} MB</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <svg className="w-24 h-24 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-white/80 text-lg font-medium mb-2">No Saved Photos</h3>
            <p className="text-white/60 text-sm max-w-xs">
              Save your favorite photos after transforming them to reuse later and save on API costs!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                {/* Photo thumbnail */}
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/5"
                >
                  <img
                    src={photo.thumbnailDataUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-sm font-medium truncate">{photo.name}</p>
                      <p className="text-white/60 text-xs">{formatDate(photo.timestamp)}</p>
                    </div>
                  </div>
                  
                  {/* Usage badge */}
                  {photo.usageCount > 0 && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
                      <span className="text-white text-xs font-medium">{photo.usageCount}×</span>
                    </div>
                  )}
                </button>

                {/* Actions */}
                <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleSelectPhoto(photo)}
                    className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(photo.id);
                      setEditName(photo.name);
                    }}
                    className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.originalDataUrl}
                alt={selectedPhoto.name}
                className="w-full h-auto rounded-xl"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-medium">{selectedPhoto.name}</p>
                <p className="text-white/60 text-sm">Used {selectedPhoto.usageCount} times</p>
              </div>
              <button
                onClick={() => handleSelectPhoto(selectedPhoto)}
                className="absolute top-4 right-4 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Use This Photo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit name modal */}
      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4"
            onClick={() => setEditingId(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-lg font-medium mb-4">Rename Photo</h3>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter photo name"
                className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenamePhoto(editingId);
                  }
                }}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setEditingId(null)}
                  className="flex-1 py-2 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRenamePhoto(editingId)}
                  className="flex-1 py-2 bg-indigo-500 rounded-lg text-white font-medium hover:bg-indigo-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Library tip */}
      {photos.length > 0 && (
        <div className="p-4 bg-white/5 border-t border-white/10">
          <p className="text-white/80 text-sm">
            Save your favorite photos here for quick access
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PhotoLibraryView;