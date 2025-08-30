import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SnapchatStyleCarousel from './SnapchatStyleCarousel';
import ResultScreen from './ResultScreen';
import CollectionResult from './CollectionResult';
import DailyChallenge from './DailyChallenge';
import { MODES } from '../App';
import { generateStyledImage } from '../services/apiService';
import { resizeImage } from '../lib/imageUtils';
import { useCameraStream } from '../hooks/useCameraStream';
import type { ModeKey } from '../MobileApp';

interface CameraViewProps {
  onSaveTransformation: (image: any) => void;
  streak: number;
  todaysChallenge: { mode: ModeKey; category: string } | null;
}

const CameraView: React.FC<CameraViewProps> = ({ onSaveTransformation, streak, todaysChallenge }) => {
  const [currentMode, setCurrentMode] = useState<ModeKey>('time-traveler');
  const [selectedCategory, setSelectedCategory] = useState<string>('1950s'); // Default to 1950s
  const [isCapturing, setIsCapturing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [originalImage, setOriginalImage] = useState<string>('');
  const [transformedImage, setTransformedImage] = useState<string>('');
  const [transformedImages, setTransformedImages] = useState<{category: string; image: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [outputMode, setOutputMode] = useState<'single' | 'collection'>('single');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the new camera hook
  const { videoRef, state: cameraState, error: cameraError, retry: retryCamera, stream } = useCameraStream({
    facingMode: cameraFacing,
    enabled: !showResult
  });

  // Helper to check if camera is ready
  const isCameraReady = cameraState === 'ready';

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedCategory || !isCameraReady) {
      if (!isCameraReady) {
        console.log('Camera not ready yet');
      }
      return;
    }
    
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      // Mirror image for front camera
      if (cameraFacing === 'user') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      
      setOriginalImage(imageDataUrl);
      await processImage(imageDataUrl);
    }
    
    setIsCapturing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageDataUrl = event.target?.result as string;
      setOriginalImage(imageDataUrl);
      await processImage(imageDataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageDataUrl: string) => {
    setIsLoading(true);
    try {
      const resizedImage = await resizeImage(imageDataUrl, 1200, 1200);
      const modeConfig = MODES[currentMode];
      
      if (outputMode === 'single') {
        // Single image mode
        const prompt = modeConfig.getPrompt(selectedCategory);
        const fallbackPrompt = modeConfig.getFallbackPrompt(selectedCategory);
        const result = await generateStyledImage(resizedImage, prompt, fallbackPrompt);
        setTransformedImage(result);
        setShowResult(true);
        
        // Camera will be stopped when showing results
      } else {
        // Collection mode - process all categories
        const results: {category: string; image: string}[] = [];
        const categories = modeConfig.categories;
        
        for (let i = 0; i < categories.length; i++) {
          const category = categories[i];
          const prompt = modeConfig.getPrompt(category);
          const fallbackPrompt = modeConfig.getFallbackPrompt(category);
          
          try {
            const result = await generateStyledImage(resizedImage, prompt, fallbackPrompt);
            results.push({ category, image: result });
          } catch (error) {
            console.error(`Error processing ${category}:`, error);
          }
        }
        
        setTransformedImages(results);
        setShowResult(true);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to process image. Make sure the server is running on port 3001.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    const transformation = {
      id: Date.now().toString(),
      originalUrl: originalImage,
      transformedUrl: transformedImage,
      mode: currentMode,
      category: selectedCategory,
      timestamp: Date.now()
    };
    onSaveTransformation(transformation);
  };

  const handleRetake = () => {
    setShowResult(false);
    setOriginalImage('');
    setTransformedImage('');
    setTransformedImages([]);
    // Camera will restart via useEffect when showResult becomes false
  };

  const toggleCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (showResult) {
    if (outputMode === 'collection') {
      return (
        <CollectionResult
          originalImage={originalImage}
          transformedImages={transformedImages}
          mode={currentMode}
          onRetake={handleRetake}
          onSaveAll={() => {
            // Save all images
            transformedImages.forEach(({ category, image }) => {
              const transformation = {
                id: Date.now().toString() + category,
                originalUrl: originalImage,
                transformedUrl: image,
                mode: currentMode,
                category,
                timestamp: Date.now()
              };
              onSaveTransformation(transformation);
            });
          }}
        />
      );
    }
    
    return (
      <ResultScreen
        originalImage={originalImage}
        transformedImage={transformedImage}
        mode={currentMode}
        category={selectedCategory}
        onSave={handleSave}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <div className="relative h-full flex flex-col bg-black">
      {/* Camera preview */}
      <div className="flex-1 relative overflow-hidden">
        {cameraState === 'error' ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <svg className="w-24 h-24 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-400 text-lg mb-2 font-medium">Camera Error</p>
              <p className="text-gray-400 text-sm">{cameraError}</p>
              <button
                onClick={retryCamera}
                className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : cameraState === 'idle' || cameraState === 'starting' || cameraState === 'stopped' ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center">
              {cameraState === 'starting' ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-4">
                    <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" style={{ stroke: '#9CA3AF' }}></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ fill: '#9CA3AF' }}></path>
                    </svg>
                  </div>
                  <p className="text-gray-400 text-lg mb-2">Initializing camera...</p>
                  <p className="text-gray-500 text-sm">This may take a moment</p>
                </>
              ) : cameraState === 'stopped' ? (
                <>
                  <svg className="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-400 text-lg mb-2">Camera Stopped</p>
                  <p className="text-gray-500 text-sm mb-4">Ready to take another photo?</p>
                  <button
                    onClick={retryCamera}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                  >
                    Restart Camera
                  </button>
                </>
              ) : (
                <>
                  <svg className="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-400 text-lg mb-2">Camera Ready</p>
                  <p className="text-gray-500 text-sm mb-4">Tap below to start</p>
                  <button
                    onClick={retryCamera}
                    className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    Enable Camera
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay={true}
              playsInline={true}
              muted={true}
              className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
              style={{ WebkitTransform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none' }}
            />
          </>
        )}
        
        {/* Debug info for iOS testing */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-0 left-0 bg-black/70 text-white text-xs p-2 z-50">
            <div>State: {cameraState}</div>
            <div>Stream: {stream ? 'Active' : 'None'}</div>
            <div>Video: {videoRef.current ? 'Mounted' : 'Not mounted'}</div>
            {videoRef.current && (
              <>
                <div>Playing: {videoRef.current.paused ? 'No' : 'Yes'}</div>
                <div>ReadyState: {videoRef.current.readyState}</div>
              </>
            )}
          </div>
        )}
        
        {/* Top bar overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between">
            {/* Camera flip */}
            <button
              onClick={toggleCamera}
              className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            {/* Center info */}
            <div className="flex items-center gap-3">
              {/* Streak counter */}
              <div className="px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full flex items-center gap-1">
                <span className="text-white font-bold">{streak}</span>
                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Output mode */}
              <button
                onClick={() => setOutputMode(outputMode === 'single' ? 'collection' : 'single')}
                className="px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full"
              >
                <span className="text-white text-sm font-medium">
                  {outputMode === 'single' ? '1x' : '9x'}
                </span>
              </button>
            </div>
            
            {/* Settings/More */}
            <button className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Daily challenge notification */}
        {todaysChallenge && (
          <div className="absolute top-20 left-4 right-4">
            <DailyChallenge
              mode={todaysChallenge.mode}
              category={todaysChallenge.category}
            />
          </div>
        )}

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 rounded-full bg-white p-1"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                </motion.div>
                <p className="text-white text-lg font-medium">Creating your transformation...</p>
                <p className="text-white/60 text-sm">This may take a moment</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Bottom controls - Snapchat style */}
      <SnapchatStyleCarousel
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        onCapture={handleCapture}
        onUpload={() => fileInputRef.current?.click()}
        isLoading={isLoading || cameraState === 'starting'}
      />
      
      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default CameraView;