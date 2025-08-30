/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Resizes an image to fit within maximum dimensions while maintaining aspect ratio
 * @param imageDataUrl The base64 data URL of the image
 * @param maxWidth Maximum width in pixels
 * @param maxHeight Maximum height in pixels
 * @returns Promise that resolves to the resized image data URL
 */
export async function resizeImage(imageDataUrl: string, maxWidth: number, maxHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!imageDataUrl || typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:')) {
      console.error('Invalid image data URL:', imageDataUrl?.substring(0, 50));
      reject(new Error('Invalid image data URL'));
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        } else {
          height = maxHeight;
          width = height * aspectRatio;
          
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
        }
      }

      // Create canvas and resize
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to data URL with compression
      const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      resolve(resizedDataUrl);
    };

    img.onerror = (event) => {
      console.error('Image load error:', event);
      console.error('Image data URL preview:', imageDataUrl.substring(0, 100) + '...');
      reject(new Error('Failed to load image'));
    };

    img.src = imageDataUrl;
  });
}

/**
 * Converts a File object to a data URL
 * @param file The file to convert
 * @returns Promise that resolves to the data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}