/**
 * Photo Library Storage System
 * Manages user's saved photos for reuse to reduce API costs
 */

interface SavedPhoto {
  id: string;
  name: string;
  originalDataUrl: string;
  thumbnailDataUrl: string;
  timestamp: number;
  usageCount: number;
}

class PhotoLibrary {
  private readonly STORAGE_KEY = 'user_photo_library';
  private readonly MAX_PHOTOS = 5;
  private readonly THUMBNAIL_SIZE = 150;

  /**
   * Get all saved photos
   */
  getPhotos(): SavedPhoto[] {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load photo library:', error);
      return [];
    }
  }

  /**
   * Save a photo to the library
   */
  async savePhoto(originalDataUrl: string, name?: string): Promise<SavedPhoto | null> {
    try {
      const photos = this.getPhotos();
      
      // Check if photo already exists (by comparing data URLs)
      const existingIndex = photos.findIndex(p => p.originalDataUrl === originalDataUrl);
      if (existingIndex !== -1) {
        // Update usage count for existing photo
        photos[existingIndex].usageCount++;
        this.saveToStorage(photos);
        return photos[existingIndex];
      }

      // Generate thumbnail
      const thumbnailDataUrl = await this.generateThumbnail(originalDataUrl);
      
      const newPhoto: SavedPhoto = {
        id: Date.now().toString(),
        name: name || `Photo ${photos.length + 1}`,
        originalDataUrl,
        thumbnailDataUrl,
        timestamp: Date.now(),
        usageCount: 0
      };

      // Remove oldest photo if at max capacity
      if (photos.length >= this.MAX_PHOTOS) {
        // Sort by usage count and timestamp, remove least used/oldest
        photos.sort((a, b) => {
          if (a.usageCount !== b.usageCount) {
            return a.usageCount - b.usageCount;
          }
          return a.timestamp - b.timestamp;
        });
        photos.shift(); // Remove first (least used/oldest)
      }

      photos.push(newPhoto);
      this.saveToStorage(photos);
      
      return newPhoto;
    } catch (error) {
      console.error('Failed to save photo:', error);
      return null;
    }
  }

  /**
   * Delete a photo from the library
   */
  deletePhoto(id: string): boolean {
    try {
      const photos = this.getPhotos();
      const filtered = photos.filter(p => p.id !== id);
      
      if (filtered.length < photos.length) {
        this.saveToStorage(filtered);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete photo:', error);
      return false;
    }
  }

  /**
   * Rename a photo
   */
  renamePhoto(id: string, newName: string): boolean {
    try {
      const photos = this.getPhotos();
      const photo = photos.find(p => p.id === id);
      
      if (photo) {
        photo.name = newName;
        this.saveToStorage(photos);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to rename photo:', error);
      return false;
    }
  }

  /**
   * Increment usage count when a photo is used
   */
  incrementUsage(id: string): void {
    try {
      const photos = this.getPhotos();
      const photo = photos.find(p => p.id === id);
      
      if (photo) {
        photo.usageCount++;
        this.saveToStorage(photos);
      }
    } catch (error) {
      console.error('Failed to update usage count:', error);
    }
  }

  /**
   * Get storage size estimate
   */
  getStorageInfo(): { photos: number; estimatedSizeMB: number } {
    const photos = this.getPhotos();
    let totalSize = 0;
    
    photos.forEach(photo => {
      // Rough estimate: each character in base64 is 1 byte
      totalSize += photo.originalDataUrl.length;
      totalSize += photo.thumbnailDataUrl.length;
    });
    
    return {
      photos: photos.length,
      estimatedSizeMB: Number((totalSize / 1024 / 1024).toFixed(2))
    };
  }

  /**
   * Clear all photos
   */
  clearAll(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Generate thumbnail for a photo
   */
  private async generateThumbnail(dataUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(dataUrl); // Fallback to original
          return;
        }

        // Calculate dimensions to maintain aspect ratio
        const aspectRatio = img.width / img.height;
        let width = this.THUMBNAIL_SIZE;
        let height = this.THUMBNAIL_SIZE;
        
        if (aspectRatio > 1) {
          height = width / aspectRatio;
        } else {
          width = height * aspectRatio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG for smaller size
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      
      img.onerror = () => {
        resolve(dataUrl); // Fallback to original
      };
      
      img.src = dataUrl;
    });
  }

  /**
   * Save photos to localStorage
   */
  private saveToStorage(photos: SavedPhoto[]): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(photos));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
        // Could implement cleanup of old photos here if quota exceeded
      }
    }
  }
}

// Export singleton instance
export const photoLibrary = new PhotoLibrary();
export type { SavedPhoto };