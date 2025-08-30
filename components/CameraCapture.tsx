/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useEffect, useState } from 'react';

interface CameraCaptureProps {
    onCapture: (imageDataUrl: string) => void;
    onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let streamInstance: MediaStream;

        const startCamera = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    streamInstance = await navigator.mediaDevices.getUserMedia({ 
                        video: { facingMode: 'user' } 
                    });
                    setStream(streamInstance);
                    if (videoRef.current) {
                        videoRef.current.srcObject = streamInstance;
                    }
                } else {
                    setError("Your browser does not support camera access.");
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
                if (err instanceof Error) {
                     if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                        setError("Camera permission denied. Please enable it in your browser settings.");
                    } else {
                        setError("Could not access the camera. Please ensure it is not in use by another application.");
                    }
                } else {
                     setError("An unknown error occurred while accessing the camera.");
                }
            }
        };

        startCamera();

        return () => {
            if (streamInstance) {
                streamInstance.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Set canvas dimensions to match video to get a clear picture
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const context = canvas.getContext('2d');
            if (context) {
                // Flip the image horizontally for a mirror effect, which is more natural for selfies
                context.translate(canvas.width, 0);
                context.scale(-1, 1);
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageDataUrl = canvas.toDataURL('image/jpeg');
                onCapture(imageDataUrl);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-neutral-800 rounded-lg shadow-xl p-4 border border-neutral-700">
                <h2 className="text-xl font-permanent-marker text-center text-white mb-4">Take a Photo</h2>
                {error ? (
                    <div className="text-red-400 text-center p-8 bg-neutral-900 rounded-md">
                        <p className="font-bold text-lg">Camera Error</p>
                        <p className="mt-2">{error}</p>
                    </div>
                ) : (
                     <div className="relative w-full aspect-square bg-black rounded-md overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                            // Mirror the video for a more natural selfie experience
                            style={{ transform: 'scaleX(-1)' }}
                            aria-label="Live camera feed"
                        />
                         {!stream && <div className="absolute inset-0 flex items-center justify-center text-white">Starting camera...</div>}
                    </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

                <div className="mt-6 flex justify-center items-center gap-4">
                    <button 
                        onClick={onClose}
                        className="font-permanent-marker text-lg text-center text-white bg-white/10 backdrop-blur-sm border-2 border-white/80 py-2 px-6 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:rotate-2 hover:bg-white hover:text-black"
                    >
                        Cancel
                    </button>
                    {!error && (
                        <button
                            onClick={handleCapture}
                            disabled={!stream}
                            className="font-permanent-marker text-lg text-center text-black bg-yellow-400 py-2 px-6 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:-rotate-2 hover:bg-yellow-300 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Capture photo"
                        >
                           Capture
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CameraCapture;
