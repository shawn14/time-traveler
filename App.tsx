/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateStyledImage } from './services/apiService';
import PolaroidCardFixed from './components/PolaroidCardFixed';
import SimplePolaroid from './components/SimplePolaroid';
import { createAlbumPage } from './lib/albumUtils';
import Footer from './components/Footer';
import CameraCapture from './components/CameraCapture';

const MODES = {
  'time-traveler': {
    title: 'Time Traveler',
    description: 'Generate yourself through the decades.',
    categories: ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s'],
    getPrompt: (category: string) => `Reimagine the person in this photo in the style of the ${category}. This includes clothing, hairstyle, photo quality, and the overall aesthetic of that decade. The output must be a photorealistic image showing the person clearly.`,
    getFallbackPrompt: (category: string) => `Create a photograph of the person in this image as if they were living in the ${category}. The photograph should capture the distinct fashion, hairstyles, and overall atmosphere of that time period. Ensure the final image is a clear photograph that looks authentic to the era.`,
  },
  'style-sculptor': {
    title: 'Style Sculptor',
    description: 'Reimagine yourself in different artistic styles.',
    categories: ['Cyberpunk', 'Film Noir', 'Vogue Cover', 'Anime', 'Streetwear Hype', 'Baroque Painting'],
    getPrompt: (category: string) => `Transform the person in this photo into a ${category} aesthetic. The style should be dramatic and highly artistic. The output must be a high-quality image that clearly shows the person. For Vogue Cover, think high-fashion editorial. For Film Noir, use dramatic black and white lighting. For Cyberpunk, incorporate neon lights and futuristic elements.`,
    getFallbackPrompt: (category: string) => `Recreate the person in this photo in a ${category} style. The final image should be a clear, artistic representation of that style.`,
  },
  'world-wanderer': {
    title: 'World Wanderer',
    description: 'Place yourself in breathtaking scenes.',
    categories: ['Tokyo Crossing', 'Parisian Café', 'Sahara Expedition', 'Amazon Rainforest', 'Venetian Gondola', 'Himalayan Peak'],
    getPrompt: (category: string) => `Place the person from the photo into a new, realistic scene: ${category}. Their clothing, the lighting, and the overall atmosphere must be adapted to match the environment seamlessly. The output should be a photorealistic image.`,
    getFallbackPrompt: (category:string) => `Create a photorealistic image of the person from the original photo, but place them in this location: ${category}. Make sure they look like they belong in the scene.`,
  },
  'character-creator': {
    title: 'Character Creator',
    description: 'Experiment with new looks and styles.',
    categories: ['Long Hair', 'Short Hair', 'Curly Hair', 'Vibrant Hair Color', 'Full Beard', 'Mustache'],
    getPrompt: (category: string) => {
        switch (category) {
            case 'Vibrant Hair Color':
                return 'Change the hair color of the person in this photo to a vibrant, unconventional color like electric blue, neon pink, or emerald green. The style should be modern and edgy. The output must be a photorealistic image showing the person clearly.';
            case 'Full Beard':
                return 'Add a well-groomed, full beard to the person in this photo. The beard should look realistic and match their hair color and facial structure. The output must be a photorealistic image showing the person clearly.';
            case 'Mustache':
                return 'Add a classic, stylish mustache to the person in this photo. The mustache should look realistic and suit their face. The output must be a photorealistic image showing the person clearly.';
            default:
                // This will cover 'Long Hair', 'Short Hair', 'Curly Hair'
                return `Reimagine the person in this photo with a new hairstyle: ${category}. The hair should look natural and suit their face. The output must be a photorealistic image showing the person clearly.`;
        }
    },
    getFallbackPrompt: (category: string) => `Create a photorealistic image of the person from the original photo, but with this new feature: ${category}. Make sure the result is a clear photograph.`,
  }
};
type Mode = keyof typeof MODES;


// Pre-defined rotations for visual interest
const ROTATIONS = [-5, 3, -3, 4, -4, 2];

const GHOST_POLAROIDS_CONFIG = [
  { initial: { x: "-150%", y: "-100%", rotate: -30 }, transition: { delay: 0.2 } },
  { initial: { x: "150%", y: "-80%", rotate: 25 }, transition: { delay: 0.4 } },
  { initial: { x: "-120%", y: "120%", rotate: 45 }, transition: { delay: 0.6 } },
  { initial: { x: "180%", y: "90%", rotate: -20 }, transition: { delay: 0.8 } },
  { initial: { x: "0%", y: "-200%", rotate: 0 }, transition: { delay: 0.5 } },
  { initial: { x: "100%", y: "150%", rotate: 10 }, transition: { delay: 0.3 } },
];


type ImageStatus = 'pending' | 'done' | 'error';
interface GeneratedImage {
    status: ImageStatus;
    url?: string;
    error?: string;
}

const primaryButtonClasses = "font-permanent-marker text-xl text-center text-black bg-yellow-400 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:-rotate-2 hover:bg-yellow-300 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.2)]";
const secondaryButtonClasses = "font-permanent-marker text-xl text-center text-white bg-white/10 backdrop-blur-sm border-2 border-white/80 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:rotate-2 hover:bg-white hover:text-black";
const modeButtonClasses = "font-permanent-marker text-lg text-center py-2 px-4 rounded-sm transition-all duration-200 border-2";
const activeModeButtonClasses = "bg-yellow-400 text-black border-yellow-400 scale-105 -rotate-2";
const inactiveModeButtonClasses = "bg-black/20 text-white border-white/50 hover:bg-white/20 hover:border-white";


const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};

const resizeImage = (imageDataUrl: string, maxSize: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            if (width > height) {
                if (width > maxSize) {
                    height = Math.round((height * maxSize) / width);
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context for image resizing.'));
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = () => reject(new Error('Failed to load image for resizing.'));
        img.src = imageDataUrl;
    });
};

function App() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<Record<string, GeneratedImage>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [appState, setAppState] = useState<'idle' | 'image-uploaded' | 'generating' | 'results-shown'>('idle');
    const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
    const [currentMode, setCurrentMode] = useState<Mode>('time-traveler');
    const dragAreaRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    const activeModeConfig = MODES[currentMode];

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const resizedImage = await resizeImage(reader.result as string, 1024);
                    console.log('Image resized successfully, data URL length:', resizedImage.length);
                    setUploadedImage(resizedImage);
                    setAppState('image-uploaded');
                    setGeneratedImages({}); // Clear previous results
                } catch (error) {
                    console.error("Error resizing image:", error);
                    alert("There was an issue processing your image. Please try another one.");
                } finally {
                    setIsUploading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoTaken = async (imageDataUrl: string) => {
        setIsCameraOpen(false);
        setIsUploading(true);
        try {
            const resizedImage = await resizeImage(imageDataUrl, 1024);
            setUploadedImage(resizedImage);
            setAppState('image-uploaded');
            setGeneratedImages({}); // Clear previous results
        } catch (error) {
            console.error("Error resizing image from camera:", error);
            alert("There was an issue processing your photo. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleGenerateClick = async () => {
        if (!uploadedImage) return;

        setIsLoading(true);
        setAppState('generating');
        
        const initialImages: Record<string, GeneratedImage> = {};
        activeModeConfig.categories.forEach(category => {
            initialImages[category] = { status: 'pending' };
        });
        setGeneratedImages(initialImages);

        const concurrencyLimit = 2; // Process two items at a time
        const categoriesQueue = [...activeModeConfig.categories];

        const processItem = async (category: string) => {
            try {
                const prompt = activeModeConfig.getPrompt(category);
                const fallbackPrompt = activeModeConfig.getFallbackPrompt(category);
                const resultUrl = await generateStyledImage(uploadedImage, prompt, fallbackPrompt);
                setGeneratedImages(prev => ({
                    ...prev,
                    [category]: { status: 'done', url: resultUrl },
                }));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setGeneratedImages(prev => ({
                    ...prev,
                    [category]: { status: 'error', error: errorMessage },
                }));
                console.error(`Failed to generate image for ${category}:`, err);
            }
        };

        const workers = Array(concurrencyLimit).fill(null).map(async () => {
            while (categoriesQueue.length > 0) {
                const category = categoriesQueue.shift();
                if (category) {
                    await processItem(category);
                }
            }
        });

        await Promise.all(workers);

        setIsLoading(false);
        setAppState('results-shown');
    };

    const handleRegenerateItem = async (category: string) => {
        if (!uploadedImage) return;

        if (generatedImages[category]?.status === 'pending') {
            return;
        }
        
        console.log(`Regenerating image for ${category}...`);
        setGeneratedImages(prev => ({ ...prev, [category]: { status: 'pending' } }));

        try {
            const prompt = activeModeConfig.getPrompt(category);
            const fallbackPrompt = activeModeConfig.getFallbackPrompt(category);
            const resultUrl = await generateStyledImage(uploadedImage, prompt, fallbackPrompt);
            setGeneratedImages(prev => ({ ...prev, [category]: { status: 'done', url: resultUrl } }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setGeneratedImages(prev => ({ ...prev, [category]: { status: 'error', error: errorMessage } }));
            console.error(`Failed to regenerate image for ${category}:`, err);
        }
    };
    
    const handleReset = () => {
        setUploadedImage(null);
        setGeneratedImages({});
        setAppState('idle');
    };

    const handleDownloadIndividualImage = (item: string) => {
        const image = generatedImages[item];
        if (image?.status === 'done' && image.url) {
            const link = document.createElement('a');
            link.href = image.url;
            const filename = `${activeModeConfig.title.toLowerCase().replace(/\s+/g, '-')}-${item.toLowerCase().replace(/\s+/g, '-')}.jpg`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleDownloadAlbum = async () => {
        setIsDownloading(true);
        try {
            const imageData = Object.entries(generatedImages)
                .filter(([, image]) => image.status === 'done' && image.url)
                .reduce((acc, [decade, image]) => {
                    acc[decade] = image!.url!;
                    return acc;
                }, {} as Record<string, string>);

            if (Object.keys(imageData).length < activeModeConfig.categories.length) {
                alert("Please wait for all images to finish generating before downloading the album.");
                return;
            }
            
            const albumTitle = `Generated with ${activeModeConfig.title}`;
            const albumDataUrl = await createAlbumPage(imageData, albumTitle);

            const link = document.createElement('a');
            link.href = albumDataUrl;
            const filename = `${activeModeConfig.title.toLowerCase().replace(/\s+/g, '-')}-album.jpg`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Failed to create or download album:", error);
            alert("Sorry, there was an error creating your album. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <main className="bg-black text-neutral-200 min-h-screen w-full flex flex-col items-center justify-center p-4 pb-24 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05]"></div>
            
            <div className="z-10 flex flex-col items-center justify-center w-full h-full flex-1 min-h-0">
                <div className="text-center mb-10">
                    <AnimatePresence mode="wait">
                         <motion.h1
                            key={activeModeConfig.title}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="text-6xl md:text-8xl font-caveat font-bold text-neutral-100"
                        >
                            {activeModeConfig.title}
                        </motion.h1>
                    </AnimatePresence>
                    <p className="font-permanent-marker text-neutral-300 mt-2 text-xl tracking-wide">{activeModeConfig.description}</p>
                </div>

                {appState === 'idle' && (
                     <div className="relative flex flex-col items-center justify-center w-full">
                        {/* Ghost polaroids for intro animation */}
                        {GHOST_POLAROIDS_CONFIG.map((config, index) => (
                             <motion.div
                                key={index}
                                className="absolute w-80 h-[26rem] rounded-md p-4 bg-neutral-100/10 blur-sm"
                                initial={config.initial}
                                animate={{ x: "0%", y: "0%", rotate: (Math.random() - 0.5) * 20, scale: 0, opacity: 0 }}
                                transition={{ ...config.transition, ease: "circOut", duration: 2 }}
                            />
                        ))}
                        <motion.div
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: 2, duration: 0.8, type: 'spring' }}
                             className="flex flex-col items-center"
                        >
                            <div className="flex justify-center gap-2 md:gap-4 mb-8 flex-wrap">
                                {(Object.keys(MODES) as Mode[]).map((modeKey) => (
                                    <button
                                        key={modeKey}
                                        onClick={() => setCurrentMode(modeKey)}
                                        className={`${modeButtonClasses} ${currentMode === modeKey ? activeModeButtonClasses : inactiveModeButtonClasses}`}
                                        disabled={isUploading}
                                    >
                                        {MODES[modeKey].title}
                                    </button>
                                ))}
                            </div>
                            <label htmlFor="file-upload" className={`cursor-pointer group transform hover:scale-105 transition-transform duration-300 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                 <PolaroidCardFixed 
                                     caption={isUploading ? "Processing..." : "Click to begin"}
                                     status={isUploading ? "pending" : "done"}
                                 />
                            </label>
                            <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} disabled={isUploading} />
                            <div className="mt-8 text-center">
                                <p className="font-permanent-marker text-neutral-500 text-lg">
                                    Click the polaroid to upload a file
                                </p>
                                <p className="my-2 font-permanent-marker text-neutral-600 text-base">or</p>
                                <button 
                                    onClick={() => setIsCameraOpen(true)} 
                                    className={secondaryButtonClasses}
                                    disabled={isUploading}
                                >
                                    {isUploading ? "Processing..." : "Take a Photo"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {appState === 'image-uploaded' && uploadedImage && (
                    <div className="flex flex-col items-center gap-6">
                         <SimplePolaroid 
                            imageUrl={uploadedImage} 
                            caption="Your Photo" 
                         />
                         <div className="flex items-center gap-4 mt-4">
                            <button onClick={handleReset} className={secondaryButtonClasses}>
                                Different Photo
                            </button>
                            <button onClick={handleGenerateClick} className={primaryButtonClasses}>
                                Generate
                            </button>
                         </div>
                    </div>
                )}

                {(appState === 'generating' || appState === 'results-shown') && (
                     <>
                        {isMobile ? (
                            <div className="w-full max-w-sm flex-1 overflow-y-auto mt-4 space-y-8 p-4">
                                {activeModeConfig.categories.map((category) => (
                                    <div key={category} className="flex justify-center">
                                         <PolaroidCardFixed
                                            caption={category}
                                            status={generatedImages[category]?.status || 'pending'}
                                            imageUrl={generatedImages[category]?.url}
                                            error={generatedImages[category]?.error}
                                            onShake={handleRegenerateItem}
                                            onDownload={handleDownloadIndividualImage}
                                            isMobile={isMobile}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div ref={dragAreaRef} className="relative w-full max-w-7xl mt-8 px-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                                    {activeModeConfig.categories.map((category, index) => {
                                        const rotate = ROTATIONS[index];
                                        return (
                                            <motion.div
                                                key={category}
                                                className="flex justify-center"
                                                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{ type: 'spring', stiffness: 100, damping: 20, delay: index * 0.1 }}
                                            >
                                                <div 
                                                    className="cursor-grab active:cursor-grabbing"
                                                    style={{ transform: `rotate(${rotate}deg)` }}
                                                >
                                                    <PolaroidCardFixed 
                                                        dragConstraintsRef={dragAreaRef}
                                                        caption={category}
                                                        status={generatedImages[category]?.status || 'pending'}
                                                        imageUrl={generatedImages[category]?.url}
                                                        error={generatedImages[category]?.error}
                                                        onShake={handleRegenerateItem}
                                                        onDownload={handleDownloadIndividualImage}
                                                        isMobile={isMobile}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                         <div className="h-20 mt-4 flex items-center justify-center">
                            {appState === 'results-shown' && (
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <button 
                                        onClick={handleDownloadAlbum} 
                                        disabled={isDownloading} 
                                        className={`${primaryButtonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isDownloading ? 'Creating Album...' : 'Download Album'}
                                    </button>
                                    <button onClick={handleReset} className={secondaryButtonClasses}>
                                        Start Over
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            {isCameraOpen && (
                <CameraCapture 
                    onCapture={handlePhotoTaken}
                    onClose={() => setIsCameraOpen(false)}
                />
            )}
            <Footer />
        </main>
    );
}

export default App;