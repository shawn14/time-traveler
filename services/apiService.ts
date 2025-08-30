/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Server-side API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

/**
 * Converts image data URL to Blob for multipart upload
 */
function dataURLtoBlob(dataURL: string): Blob {
  const match = dataURL.match(/^data:(.*?);base64,(.*)$/);
  if (!match) {
    throw new Error('Invalid data URL');
  }
  
  const mimeType = match[1];
  const base64 = match[2];
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  
  return new Blob([array], { type: mimeType });
}

/**
 * Generates a styled image from a source image and a prompt using the server API.
 * @param imageDataUrl A data URL string of the source image (e.g., 'data:image/png;base64,...').
 * @param prompt The primary prompt to guide the image generation.
 * @param fallbackPrompt A safer, alternative prompt to use if the first one fails.
 * @returns A promise that resolves to a base64-encoded image data URL of the generated image.
 */
export async function generateStyledImage(
  imageDataUrl: string,
  prompt: string,
  fallbackPrompt: string
): Promise<string> {
  try {
    // Convert data URL to Blob
    const imageBlob = dataURLtoBlob(imageDataUrl);
    
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.jpg');
    formData.append('prompt', prompt);
    formData.append('fallbackPrompt', fallbackPrompt);
    
    // Make request to server API
    const response = await fetch(`${API_BASE_URL}/api/gemini/generate-image`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate image');
    }
    
    const result = await response.json();
    return result.imageUrl;
    
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

/**
 * Generates styled images for both players in duel mode
 * @param player1ImageUrl Player 1's image data URL
 * @param player2ImageUrl Player 2's image data URL
 * @param prompt The primary prompt to guide the image generation
 * @param fallbackPrompt A safer, alternative prompt to use if the first one fails
 * @returns A promise that resolves to an object with both players' generated images
 */
export async function generateDuelImages(
  player1ImageUrl: string,
  player2ImageUrl: string,
  prompt: string,
  fallbackPrompt: string
): Promise<{ player1: string; player2: string }> {
  try {
    // Convert data URLs to Blobs
    const player1Blob = dataURLtoBlob(player1ImageUrl);
    const player2Blob = dataURLtoBlob(player2ImageUrl);
    
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('player1', player1Blob, 'player1.jpg');
    formData.append('player2', player2Blob, 'player2.jpg');
    formData.append('prompt', prompt);
    formData.append('fallbackPrompt', fallbackPrompt);
    
    // Make request to server API
    const response = await fetch(`${API_BASE_URL}/api/gemini/generate-duel`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate duel images');
    }
    
    const result = await response.json();
    return {
      player1: result.player1ImageUrl,
      player2: result.player2ImageUrl
    };
    
  } catch (error) {
    console.error('Error generating duel images:', error);
    throw error;
  }
}