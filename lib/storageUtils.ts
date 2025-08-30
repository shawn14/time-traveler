export const STORAGE_KEYS = {
  SAVED_TRANSFORMATIONS: 'savedTransformations',
  USER_STREAK: 'userStreak',
  LAST_SAVE_DATE: 'lastSaveDate',
} as const;

export const MAX_SAVED_IMAGES = 50; // Limit number of saved images
export const STORAGE_WARNING_THRESHOLD = 0.9; // Warn when 90% full

/**
 * Compress image data URL by reducing quality
 */
export async function compressImageDataUrl(dataUrl: string, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    // If the dataUrl is empty or invalid, return it as-is
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      resolve(dataUrl);
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(dataUrl); // Return original if can't get context
          return;
        }
        
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert to compressed JPEG
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (error) {
        console.error('Error compressing image:', error);
        resolve(dataUrl); // Return original on error
      }
    };
    
    img.onerror = () => {
      console.error('Failed to load image for compression');
      resolve(dataUrl); // Return original on error
    };
    
    img.src = dataUrl;
  });
}

/**
 * Get estimated storage usage
 */
export function getStorageUsage(): { used: number; percentage: number } {
  let totalSize = 0;
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length + key.length;
    }
  }
  
  // Estimate 5MB limit (common for localStorage)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  const percentage = (totalSize / maxSize) * 100;
  
  return {
    used: totalSize,
    percentage: Math.min(percentage, 100)
  };
}

/**
 * Clean up old transformations to free up space
 */
export function cleanupOldTransformations(transformations: any[], keepCount: number = 30): any[] {
  // Sort by timestamp (newest first) and keep only the most recent
  return transformations
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, keepCount);
}

/**
 * Safe localStorage setItem with quota handling
 */
export async function safeSetItem(key: string, value: string): Promise<boolean> {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof Error && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.warn('localStorage quota exceeded, attempting cleanup...');
      
      // Try to clean up old data
      const transformations = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_TRANSFORMATIONS) || '[]');
      const cleaned = cleanupOldTransformations(transformations, 20); // Keep only 20 most recent
      
      // Compress images in the remaining transformations
      const compressed = await Promise.all(
        cleaned.map(async (t: any) => ({
          ...t,
          originalUrl: t.originalUrl ? await compressImageDataUrl(t.originalUrl, 0.5) : '',
          transformedUrl: t.transformedUrl ? await compressImageDataUrl(t.transformedUrl, 0.5) : ''
        }))
      );
      
      // Try again with compressed data
      try {
        localStorage.setItem(STORAGE_KEYS.SAVED_TRANSFORMATIONS, JSON.stringify(compressed));
        localStorage.setItem(key, value);
        return true;
      } catch (e2) {
        console.error('Failed to save even after cleanup:', e2);
        return false;
      }
    }
    throw e;
  }
}