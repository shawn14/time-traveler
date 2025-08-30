import { useState, useRef, useCallback, useEffect } from 'react';

type CameraState = 'idle' | 'starting' | 'ready' | 'error' | 'stopped';

interface CameraStreamState {
  state: CameraState;
  stream: MediaStream | null;
  error: string | null;
}

interface UseCameraStreamOptions {
  facingMode?: 'user' | 'environment';
  enabled?: boolean;
}

export function useCameraStream(options: UseCameraStreamOptions = {}) {
  const { facingMode = 'user', enabled = true } = options;
  
  const [cameraState, setCameraState] = useState<CameraStreamState>({
    state: 'idle',
    stream: null,
    error: null
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  
  // Stop the camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState({
      state: 'stopped',
      stream: null,
      error: null
    });
  }, []);
  
  // Track if camera is starting to prevent multiple calls
  const isStartingRef = useRef(false);
  
  // Start the camera stream
  const startCamera = useCallback(async () => {
    // Prevent multiple simultaneous starts
    if (isStartingRef.current) {
      console.log('Camera already starting');
      return;
    }
    
    isStartingRef.current = true;
    
    // Set a timeout to reset the flag if something goes wrong
    const timeoutId = setTimeout(() => {
      isStartingRef.current = false;
    }, 10000); // 10 second timeout
    
    setCameraState({
      state: 'starting',
      stream: null,
      error: null
    });
    
    try {
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in your browser');
      }
      
      // Check HTTPS on iOS
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      if (isIOS && window.location.protocol !== 'https:') {
        throw new Error('Camera requires HTTPS on iOS');
      }
      
      // Request camera access
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Check if component is still mounted
      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      
      streamRef.current = stream;
      
      // Set up video element if available
      if (videoRef.current) {
        const video = videoRef.current;
        
        // Set iOS-specific attributes before setting stream
        video.setAttribute('autoplay', 'true');
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('muted', 'true');
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        
        // For iOS, we need to set srcObject and play in the right order
        video.srcObject = stream;
        
        // On iOS, we need to wait for loadedmetadata before playing
        if (isIOS) {
          await new Promise<void>((resolve) => {
            const handleMetadata = () => {
              video.removeEventListener('loadedmetadata', handleMetadata);
              resolve();
            };
            video.addEventListener('loadedmetadata', handleMetadata);
            // Timeout after 3 seconds
            setTimeout(() => {
              video.removeEventListener('loadedmetadata', handleMetadata);
              resolve();
            }, 3000);
          });
        }
        
        // Try to play the video
        try {
          await video.play();
          console.log('Video playing successfully');
        } catch (e) {
          console.log('Video autoplay failed, trying again:', e);
          // On iOS, sometimes we need to try playing again after a small delay
          if (isIOS) {
            setTimeout(async () => {
              try {
                await video.play();
                console.log('Video playing after retry');
              } catch (e2) {
                console.log('Video play retry also failed:', e2);
              }
            }, 100);
          }
        }
      }
      
      setCameraState({
        state: 'ready',
        stream,
        error: null
      });
      
      // Reset the starting flag on success
      clearTimeout(timeoutId);
      isStartingRef.current = false;
      
    } catch (err: any) {
      console.error('Camera error:', err);
      
      let errorMessage = 'Unable to access camera';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera is being used by another app.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setCameraState({
        state: 'error',
        stream: null,
        error: errorMessage
      });
      
      // Clear timeout and reset flag on error
      clearTimeout(timeoutId);
      isStartingRef.current = false;
    }
  }, [facingMode]);
  
  // Retry camera initialization
  const retry = useCallback(async () => {
    console.log('Retry camera called, current state:', cameraState.state);
    
    // Reset the starting flag
    isStartingRef.current = false;
    
    // First stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Reset state to idle
    setCameraState({
      state: 'idle',
      stream: null,
      error: null
    });
    
    // Small delay to ensure cleanup
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Start camera
    if (mountedRef.current) {
      startCamera();
    }
  }, [startCamera]);
  
  // Handle enabled state and lifecycle
  useEffect(() => {
    if (enabled && cameraState.state === 'idle') {
      // Only auto-start from idle state, not from stopped state
      startCamera();
    } else if (!enabled && (cameraState.state === 'ready' || cameraState.state === 'starting')) {
      stopCamera();
    }
  }, [enabled, cameraState.state, startCamera, stopCamera]);
  
  // Handle facingMode changes
  useEffect(() => {
    if (enabled && cameraState.state === 'ready') {
      stopCamera();
      setTimeout(() => {
        if (mountedRef.current) {
          startCamera();
        }
      }, 100);
    }
  }, [facingMode]);
  
  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      isStartingRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  return {
    videoRef,
    state: cameraState.state,
    stream: cameraState.stream,
    error: cameraState.error,
    retry,
    stopCamera
  };
}