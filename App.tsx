/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateStyledImage, generateDuelImages, generateCombinedImage } from './services/apiService';
import PolaroidCardFixed from './components/PolaroidCardFixed';
import SimplePolaroid from './components/SimplePolaroid';
import { createAlbumPage } from './lib/albumUtils';
import { getShareCaption, getDuelShareCaption, getFusionShareCaption, shareToClipboard } from './lib/shareUtils';
import Footer from './components/Footer';
import CameraCapture from './components/CameraCapture';
import ModeSelector from './components/ModeSelector';

// Professional modes first, then fun modes
export const MODES = {
  // === PROFESSIONAL MODES ===
  'headshot-pro': {
    title: 'Headshot Pro',
    description: 'Professional headshots for any purpose.',
    categories: ['LinkedIn Professional', 'Corporate Executive', 'Creative Professional', 'Startup Founder', 'Real Estate Agent', 'Medical Professional'],
    colorClass: 'from-blue-600 to-blue-800',
    accentColor: 'blue',
    getPrompt: (category: string) => {
        switch (category) {
            case 'LinkedIn Professional':
                return 'Transform this photo into a polished LinkedIn headshot. Professional business attire, confident smile, clean neutral background, perfect lighting, sharp focus. The image should convey competence and approachability. Output must be a photorealistic professional headshot.';
            case 'Corporate Executive':
                return 'Create an executive-level corporate headshot. High-end business suit, powerful confident expression, premium office or neutral background, magazine-quality lighting. Should convey leadership and authority. Output must be a photorealistic professional portrait.';
            case 'Creative Professional':
                return 'Generate a creative professional headshot. Smart casual attire, warm genuine smile, modern colorful or textured background, artistic lighting. Should show personality while maintaining professionalism. Output must be photorealistic.';
            case 'Startup Founder':
                return 'Create a startup founder headshot. Modern business casual (nice shirt/blazer), confident and approachable expression, tech office or modern background, natural lighting. Should convey innovation and trustworthiness. Output must be photorealistic.';
            case 'Real Estate Agent':
                return 'Generate a real estate agent headshot. Professional attire with a welcoming smile, bright and inviting background, excellent lighting that makes them look trustworthy and successful. Output must be a photorealistic professional photo.';
            case 'Medical Professional':
                return 'Create a medical professional headshot. Clean medical attire or professional clothes, compassionate expression, clinical or neutral background, soft professional lighting. Should inspire trust and competence. Output must be photorealistic.';
        }
    },
    getFallbackPrompt: (category: string) => `Create a professional ${category} headshot. The photo should be suitable for professional use with appropriate attire and setting. Output must be photorealistic.`,
  },
  
  // === TRANSFORMATION & STYLE MODES ===
  'glow-up': {
    title: 'Glow Up',
    description: 'See your best self in every style.',
    categories: ['Red Carpet Ready', 'Model Moment', 'Golden Hour Glow', 'Business Elite', 'Fitness Influencer', 'Main Character Energy'],
    getPrompt: (category: string) => {
        switch (category) {
            case 'Red Carpet Ready':
                return 'Transform the person in this photo into a glamorous Hollywood celebrity at a red carpet event. Perfect makeup, stunning formal attire, professional styling, flawless skin with a healthy glow, and confident posture. The lighting should be professional and flattering. The output must be a photorealistic, high-quality image.';
            case 'Model Moment':
                return 'Transform the person into a high-fashion model in an editorial photoshoot. Professional makeup highlighting their best features, designer clothing, perfect posture, and magazine-quality lighting. The photo should look like it belongs in Vogue. The output must be a photorealistic, stunning image.';
            case 'Golden Hour Glow':
                return 'Enhance the person with perfect golden hour lighting that makes their skin glow, hair shine, and features look their absolute best. Natural but flawless makeup, radiant complexion, and that magical sunset lighting that makes everyone look amazing. The output must be a photorealistic, beautiful image.';
            case 'Business Elite':
                return 'Transform the person into a successful, confident business executive. Impeccable professional attire, perfect grooming, powerful posture, and an aura of success and leadership. The setting should be elegant and professional. The output must be a photorealistic, polished image.';
            case 'Fitness Influencer':
                return 'Transform the person into a fit, energetic fitness influencer. Toned physique, athletic wear, glowing healthy skin, perfect hair even while active, and radiating energy and vitality. The setting should be motivational. The output must be a photorealistic, inspiring image.';
            case 'Main Character Energy':
                return 'Transform the person into the confident main character of their own story. Perfect styling that suits their personality, natural but enhanced features, amazing lighting, and an unmistakable aura of confidence and charisma. They should look like the protagonist everyone roots for. The output must be a photorealistic, captivating image.';
        }
    },
    getFallbackPrompt: (category: string) => `Enhance the person in this photo to look their absolute best in a ${category} style. Make them look confident, attractive, and aspirational while keeping the transformation realistic. The result should be a stunning, photorealistic image.`,
  },
  'hairstyle-finder': {
    title: 'Find Your Best Look',
    description: 'Discover the most stylish modern haircut for you.',
    categories: ['Show Me My Best Look'],
    colorClass: 'from-amber-500 to-orange-600',
    accentColor: 'amber',
    getPrompt: (category: string) => {
      return `Find the BEST MODERN HAIRSTYLE for this person from current trends. Give them a STYLISH, ATTRACTIVE haircut that:

1. Is CURRENTLY TRENDY (2024/2025 styles)
2. Makes them look their absolute BEST
3. Is realistically achievable in a salon
4. Suits their face shape perfectly
5. Works with their hair type

Choose from these modern styles:
- For shorter: Modern textured crop, French crop, modern quiff, stylish undercut fade
- For medium: Textured layers, modern shag, wolf cut, curtain bangs
- For longer: Long layers, beachy waves, sleek and straight, modern bob/lob

The result should look like they just left a high-end salon with a fresh, trendy cut that makes them look amazing. Keep their natural hair color. Make it stylish, modern, and attractive - NOT wild or crazy. The output must be photorealistic.`;
    },
    getFallbackPrompt: (category: string) => `Give this person the most stylish, modern haircut that makes them look their absolute best. Choose from current trendy styles that suit their face. The result should be attractive, fashionable, and realistic - like they just left a top salon. Keep natural hair color. Output must be photorealistic.`,
  },
  
  // === FUN & CREATIVE MODES ===
  'time-traveler': {
    title: 'Time Traveler',
    description: 'Generate yourself through the decades.',
    categories: ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s'],
    colorClass: 'from-purple-500 to-purple-700',
    accentColor: 'purple',
    getPrompt: (category: string) => `Reimagine the person in this photo in the style of the ${category}. This includes clothing, hairstyle, photo quality, and the overall aesthetic of that decade. The output must be a photorealistic image showing the person clearly.`,
    getFallbackPrompt: (category: string) => `Create a photograph of the person in this image as if they were living in the ${category}. The photograph should capture the distinct fashion, hairstyles, and overall atmosphere of that time period. Ensure the final image is a clear photograph that looks authentic to the era.`,
  },
  'character-creator': {
    title: 'Character Creator',
    description: 'Transform into different styles.',
    categories: ['Long Hair', 'Short Hair', 'Curly Hair', 'Straight Hair', 'Full Beard', 'Mustache'],
    colorClass: 'from-green-500 to-green-700',
    accentColor: 'green',
    getPrompt: (category: string) => {
        switch (category) {
            case 'Full Beard':
                return 'Add a well-groomed, full beard to the person in this photo. The beard should look realistic and match their hair color and facial structure. The output must be a photorealistic image showing the person clearly.';
            case 'Mustache':
                return 'Add a classic, stylish mustache to the person in this photo. The mustache should look realistic and suit their face. The output must be a photorealistic image showing the person clearly.';
            default:
                // Hair style changes
                return `Transform the person's hairstyle to ${category}. The new hairstyle should look natural and suit their face shape. Keep their hair color the same unless specified. The output must be a photorealistic image.`;
        }
    },
    getFallbackPrompt: (category: string) => `Create a photorealistic image of the person from the original photo, but with this new feature: ${category}. Make sure the result is a clear photograph.`,
  },
  'avatar-creator': {
    title: 'Avatar Creator',
    description: 'Perfect profile pics for every platform.',
    categories: ['LinkedIn Professional', 'Discord Avatar', 'Zoom Ready', 'Memoji Style', 'Anime Avatar', 'Pixar Character'],
    getPrompt: (category: string) => {
        switch (category) {
            case 'LinkedIn Professional':
                return 'Transform the person into a polished LinkedIn profile photo. Professional business attire, clean neutral background, perfect lighting, confident but approachable expression, sharp focus on face. The image should look like it was taken by a professional photographer. The output must be a photorealistic, corporate-appropriate headshot.';
            case 'Discord Avatar':
                return 'Transform the person into a stylized gaming avatar suitable for Discord. Vibrant colors, slight cartoon/illustrated style while maintaining recognizable features, gaming headset or accessories, cool lighting effects, dynamic expression. The output must be a high-quality digital art style image perfect for a profile picture.';
            case 'Zoom Ready':
                return 'Transform the person for a perfect Zoom call appearance. Well-lit face, professional but comfortable attire, tidy background (home office or virtual background style), friendly expression, camera-angle optimized. The output must be a photorealistic image that looks great on video calls.';
            case 'Memoji Style':
                return 'Transform the person into a 3D cartoon avatar similar to Apple Memoji. Smooth, rounded features, big expressive eyes, simplified but recognizable facial features, clean 3D rendered look, solid color background. The output must be a high-quality 3D-style cartoon avatar.';
            case 'Anime Avatar':
                return 'Transform the person into an anime-style character avatar. Large expressive anime eyes, stylized hair with highlights, smooth skin, manga/anime art style, dynamic pose or expression, possibly with subtle sparkles or effects. The output must be a high-quality anime illustration suitable for a profile picture.';
            case 'Pixar Character':
                return 'Transform the person into a Pixar-style 3D animated character. Exaggerated but appealing features, warm lighting, expressive eyes, smooth 3D rendering, personality-filled expression, cinematic quality. The output must look like a character from a Pixar movie.';
        }
    },
    getFallbackPrompt: (category: string) => `Create a ${category} style avatar of the person. The image should be perfect for use as a profile picture, maintaining their recognizable features while applying the appropriate style. The result should be a high-quality image.`,
  },
  'style-sculptor': {
    title: 'Style Sculptor',
    description: 'Reimagine yourself in different artistic styles.',
    categories: ['Cyberpunk', 'Film Noir', 'Vogue Cover', 'Anime', 'Streetwear Hype', 'Baroque Painting'],
    colorClass: 'from-pink-500 to-pink-700',
    accentColor: 'pink',
    getPrompt: (category: string) => `Transform the person in this photo into a ${category} aesthetic. The style should be dramatic and highly artistic. The output must be a high-quality image that clearly shows the person. For Vogue Cover, think high-fashion editorial. For Film Noir, use dramatic black and white lighting. For Cyberpunk, incorporate neon lights and futuristic elements.`,
    getFallbackPrompt: (category: string) => `Recreate the person in this photo in a ${category} style. The final image should be a clear, artistic representation of that style.`,
  },
  'world-wanderer': {
    title: 'World Wanderer',
    description: 'Place yourself in breathtaking scenes.',
    categories: ['Tokyo Crossing', 'Parisian Café', 'Sahara Expedition', 'Amazon Rainforest', 'Venetian Gondola', 'Himalayan Peak'],
    colorClass: 'from-blue-500 to-blue-700',
    accentColor: 'blue',
    getPrompt: (category: string) => `Place the person from the photo into a new, realistic scene: ${category}. Their clothing, the lighting, and the overall atmosphere must be adapted to match the environment seamlessly. The output should be a photorealistic image.`,
    getFallbackPrompt: (category:string) => `Create a photorealistic image of the person from the original photo, but place them in this location: ${category}. Make sure they look like they belong in the scene.`,
  },
  'what-if': {
    title: 'What If',
    description: 'See alternate versions of yourself.',
    categories: ['If I Was Famous', 'If I Was Royal', 'If I Was a Superhero', 'If I Was in a Band', 'If I Was an Athlete', 'If I Was a Billionaire'],
    getPrompt: (category: string) => {
        switch (category) {
            case 'If I Was Famous':
                return 'Transform the person into a world-famous celebrity at a Hollywood premiere. Paparazzi flashes in background, designer outfit, professional styling, confident pose on red carpet. Include velvet ropes and excited fans. The person should look like an A-list movie star. The output must be a photorealistic, glamorous image.';
            case 'If I Was Royal':
                return 'Transform the person into modern royalty in a palace setting. Elegant crown or tiara, luxurious royal robes or formal attire, regal posture, throne or palace interior visible. They should radiate nobility and grace. The output must be a photorealistic, majestic image.';
            case 'If I Was a Superhero':
                return 'Transform the person into a powerful superhero. Dynamic costume with cape, mask or distinctive features, heroic pose, city skyline or action scene in background. They should look strong, confident, and ready to save the world. The output must be a photorealistic, epic image.';
            case 'If I Was in a Band':
                return 'Transform the person into a rock star performing on stage. Electric guitar or microphone, leather jacket or band attire, stage lights, cheering crowd visible. They should look like a music icon at the peak of their career. The output must be a photorealistic, energetic image.';
            case 'If I Was an Athlete':
                return 'Transform the person into an Olympic champion athlete. Athletic physique, sports uniform with medals, victory pose on podium, stadium or sports venue background. They should radiate strength and achievement. The output must be a photorealistic, inspiring image.';
            case 'If I Was a Billionaire':
                return 'Transform the person into an ultra-wealthy billionaire. Impeccable designer suit or dress, private jet or luxury yacht in background, expensive accessories, confident power pose. They should exude success and sophistication. The output must be a photorealistic, luxurious image.';
        }
    },
    getFallbackPrompt: (category: string) => `Show the person living an alternate life where they are ${category.toLowerCase()}. Make the transformation believable and aspirational, showing them in their element with appropriate setting and styling. The result should be a photorealistic image.`,
  },
  
  // === TRENDING & MEME MODES ===
  'vibe-check': {
    title: 'Vibe Check',
    description: 'Match every trending aesthetic.',
    categories: ['Dark Academia', 'Cottagecore', 'Y2K Aesthetic', 'Clean Girl', 'E-Girl/E-Boy', 'Old Money'],
    getPrompt: (category: string) => {
        switch (category) {
            case 'Dark Academia':
                return 'Transform the person into the Dark Academia aesthetic. Tweed blazer, turtleneck or button-up shirt, vintage glasses, surrounded by old books, antique library or university setting, moody lighting, autumn colors. They should look intellectual and mysterious. The output must be a photorealistic, atmospheric image.';
            case 'Cottagecore':
                return 'Transform the person into the Cottagecore aesthetic. Flowy dress or linen clothing, flower crown or straw hat, pastoral setting with wildflowers, soft natural lighting, vintage cottage or garden background, holding basket or teacup. The output must be a photorealistic, dreamy image.';
            case 'Y2K Aesthetic':
                return 'Transform the person into the Y2K aesthetic. Low-rise jeans, butterfly clips, tinted sunglasses, metallic or holographic clothing, tech accessories, bright colors, glossy lips, futuristic early 2000s vibe. The output must be a photorealistic, nostalgic image.';
            case 'Clean Girl':
                return 'Transform the person into the Clean Girl aesthetic. Slicked back hair, minimal natural makeup, gold jewelry, white or neutral clothing, fresh dewy skin, yoga mat or green juice, bright airy setting. They should look effortlessly put-together. The output must be a photorealistic, fresh image.';
            case 'E-Girl/E-Boy':
                return 'Transform the person into the E-Girl/E-Boy aesthetic. Split-dyed hair, heavy eyeliner, chains and accessories, band t-shirt or striped clothing, platform shoes, LED lights in background, edgy pose. The output must be a photorealistic, alternative style image.';
            case 'Old Money':
                return 'Transform the person into the Old Money aesthetic. Expensive but understated clothing (cashmere, silk, wool), pearl or gold accessories, country club or mansion setting, riding boots or loafers, timeless elegant style. They should exude quiet luxury. The output must be a photorealistic, sophisticated image.';
        }
    },
    getFallbackPrompt: (category: string) => `Transform the person to perfectly embody the ${category} aesthetic. Include all the signature style elements, appropriate setting, and overall vibe associated with this trend. The result should be a photorealistic, aesthetic image.`,
  },
  'meme-machine': {
    title: 'Meme Machine',
    description: 'Become the meme you were born to be.',
    categories: ['Gigachad', 'Anime Protagonist', 'NPC Mode', 'Wojak Feels', 'Based Department', 'Touch Grass'],
    getPrompt: (category: string) => {
        switch (category) {
            case 'Gigachad':
                return 'Transform the person into the Gigachad meme. Extremely chiseled jawline, muscular physique, black and white high contrast photo style, confident stoic expression, perfect posture, dramatic lighting from the side. The output must be a photorealistic image in the iconic Gigachad style.';
            case 'Anime Protagonist':
                return 'Transform the person into an anime protagonist with main character energy. Spiky or flowing hair with highlights, determined expression, dramatic pose, speed lines or energy effects in background, wearing distinctive outfit. They should radiate protagonist power. The output must be in anime art style.';
            case 'NPC Mode':
                return 'Transform the person into a video game NPC. Slightly stiff pose, thousand-yard stare, generic medieval or fantasy clothing, standing in one spot, speech bubble saying something repetitive, low-poly or slightly artificial look. The output must look like a background character from a video game.';
            case 'Wojak Feels':
                return 'Transform the person into a Wojak-style meme character. Simplified facial features, emotional expression (sad, happy, or angry), minimalist art style, meme-appropriate pose or situation, white background. The output must be in the recognizable Wojak art style.';
            case 'Based Department':
                return 'Transform the person to look extraordinarily confident and based. Sunglasses, pointing finger guns, suit or cool outfit, phone to ear calling the based department, supreme confidence radiating from every pore. The output must be a photorealistic, supremely confident image.';
            case 'Touch Grass':
                return 'Transform the person into the ultimate outdoor enthusiast. Touching actual grass, hiking gear, sun on face, huge smile, surrounded by nature, looking refreshed and vitamin D enriched, the antithesis of being too online. The output must be a photorealistic, wholesome outdoor image.';
        }
    },
    getFallbackPrompt: (category: string) => `Transform the person into the ${category} meme format. Make it instantly recognizable as this meme while maintaining their features. The result should be shareable and meme-worthy.`,
  },
  'hair-color': {
    title: 'Hair Color Studio',
    description: 'Try any hair color instantly.',
    categories: ['Blonde', 'Brunette', 'Black', 'Red/Auburn', 'Silver/Gray', 'Pink', 'Blue', 'Purple', 'Rainbow'],
    colorClass: 'from-pink-500 to-purple-600',
    accentColor: 'pink',
    getPrompt: (category: string) => {
        const colorMap: Record<string, string> = {
            'Blonde': 'bright golden blonde, from platinum to honey blonde',
            'Brunette': 'rich brown hair, from light chestnut to deep chocolate',
            'Black': 'deep black hair, glossy and luxurious',
            'Red/Auburn': 'vibrant red or auburn hair, from copper to deep burgundy',
            'Silver/Gray': 'elegant silver or gray hair, from ash gray to metallic silver',
            'Pink': 'vibrant pink hair, from pastel rose to hot pink',
            'Blue': 'electric blue, from navy to bright cyan',
            'Purple': 'deep purple, from lavender to violet',
            'Rainbow': 'multi-colored rainbow hair, vibrant gradient'
        };
        return `Change only the hair color of the person to ${colorMap[category] || category}. Keep everything else exactly the same - face, features, hair style, background. The hair color change should look natural and professional. The output must be a photorealistic image.`;
    },
    getFallbackPrompt: (category: string) => `Change the person's hair color to ${category}. Keep their face and everything else unchanged. The result should be photorealistic.`,
  },
  // === CUSTOM MODE ===
  'custom': {
    title: 'Custom',
    description: 'Create your own transformation with a custom prompt.',
    categories: ['Type your own prompt'],
    colorClass: 'from-indigo-500 to-indigo-700',
    accentColor: 'indigo',
    getPrompt: (category: string) => category, // Use the category as the prompt directly
    getFallbackPrompt: (category: string) => `Transform the person in this photo based on: ${category}`,
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

const primaryButtonClasses = "font-permanent-marker text-base sm:text-lg md:text-xl text-center text-black bg-yellow-400 py-2 sm:py-3 px-4 sm:px-6 md:px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:-rotate-2 hover:bg-yellow-300 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.2)]";
const secondaryButtonClasses = "font-permanent-marker text-base sm:text-lg md:text-xl text-center text-white bg-white/10 backdrop-blur-sm border-2 border-white/80 py-2 sm:py-3 px-4 sm:px-6 md:px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:rotate-2 hover:bg-white hover:text-black";
const modeButtonClasses = "font-permanent-marker text-center py-1.5 sm:py-2 rounded-sm transition-all duration-200 border-2";
const activeModeButtonClasses = "bg-yellow-400 text-black border-yellow-400 scale-105 -rotate-2";
const glowModeActiveClasses = "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-pink-400 scale-105 shadow-lg shadow-purple-500/50";
const whatIfModeActiveClasses = "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 scale-105 shadow-lg shadow-blue-500/50";
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
    const [isSurpriseMode, setIsSurpriseMode] = useState<boolean>(false);
    const [isFusionMode, setIsFusionMode] = useState<boolean>(false);
    const [fusionType, setFusionType] = useState<'combine' | 'merge' | 'wallpaper'>('combine');
    const [uploadedImages, setUploadedImages] = useState<{ image1?: string; image2?: string }>({});
    const dragAreaRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    const activeModeConfig = MODES[currentMode];

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, imageSlot?: 'image1' | 'image2') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const resizedImage = await resizeImage(reader.result as string, 1024);
                    console.log('Image resized successfully, data URL length:', resizedImage.length);
                    
                    if (isFusionMode && imageSlot) {
                        setUploadedImages(prev => ({ ...prev, [imageSlot]: resizedImage }));
                        // Check if both images are uploaded
                        const otherSlot = imageSlot === 'image1' ? 'image2' : 'image1';
                        if (uploadedImages[otherSlot]) {
                            setAppState('image-uploaded');
                        }
                    } else {
                        setUploadedImage(resizedImage);
                        setAppState('image-uploaded');
                    }
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

    const handleGenerateClick = async (randomMode: boolean = false) => {
        // Handle fusion mode
        if (isFusionMode) {
            if (!uploadedImages.image1 || !uploadedImages.image2) {
                alert('Please upload both photos to combine!');
                return;
            }
            
            setIsSurpriseMode(false);
            setIsLoading(true);
            setAppState('generating');
            
            const initialImages: Record<string, GeneratedImage> = {};
            activeModeConfig.categories.forEach(category => {
                initialImages[category] = { status: 'pending' };
            });
            setGeneratedImages(initialImages);

            const concurrencyLimit = 2;
            const categoriesQueue = [...activeModeConfig.categories];

            const processItem = async (category: string) => {
                try {
                    let prompt: string;
                    let fallbackPrompt: string;
                    
                    if (currentMode === 'interior-design' && 'fusionPrompt' in activeModeConfig) {
                        prompt = activeModeConfig.fusionPrompt(fusionType);
                        fallbackPrompt = prompt; // Use same prompt as fallback for wallpaper mode
                    } else {
                        prompt = activeModeConfig.getPrompt(category);
                        fallbackPrompt = activeModeConfig.getFallbackPrompt(category);
                    }
                    
                    const resultUrl = await generateCombinedImage(
                        uploadedImages.image1!, 
                        uploadedImages.image2!, 
                        prompt, 
                        fallbackPrompt,
                        fusionType
                    );
                    setGeneratedImages(prev => ({
                        ...prev,
                        [category]: { 
                            status: 'done', 
                            url: resultUrl
                        },
                    }));
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                    setGeneratedImages(prev => ({
                        ...prev,
                        [category]: { status: 'error', error: errorMessage },
                    }));
                    console.error(`Failed to generate combined image for ${category}:`, err);
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
            return;
        }
        
        // Normal single player mode
        if (!uploadedImage) return;

        // If random mode, pick a random mode and generate only one category
        if (randomMode) {
            const modeKeys = Object.keys(MODES) as Mode[];
            const randomModeKey = modeKeys[Math.floor(Math.random() * modeKeys.length)];
            setCurrentMode(randomModeKey);
            setIsSurpriseMode(true);
            
            const randomModeConfig = MODES[randomModeKey];
            const randomCategory = randomModeConfig.categories[Math.floor(Math.random() * randomModeConfig.categories.length)];
            
            setIsLoading(true);
            setAppState('generating');
            setGeneratedImages({ [randomCategory]: { status: 'pending' } });
            
            try {
                const prompt = randomModeConfig.getPrompt(randomCategory);
                const fallbackPrompt = randomModeConfig.getFallbackPrompt(randomCategory);
                const resultUrl = await generateStyledImage(uploadedImage, prompt, fallbackPrompt);
                setGeneratedImages({ [randomCategory]: { status: 'done', url: resultUrl } });
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setGeneratedImages({ [randomCategory]: { status: 'error', error: errorMessage } });
                console.error(`Failed to generate image for ${randomCategory}:`, err);
            }
            
            setIsLoading(false);
            setAppState('results-shown');
            return;
        }

        // Normal generation flow
        setIsSurpriseMode(false);
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
        setUploadedImages({});
        setGeneratedImages({});
        setAppState('idle');
        setIsSurpriseMode(false);
        setIsFusionMode(false);
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

    const handleShareImage = async (item: string) => {
        const shareCaption = isFusionMode 
            ? getFusionShareCaption(currentMode, item, fusionType)
            : getShareCaption(currentMode, item);
        const shareUrl = `\n\nCheck it out at: ${window.location.origin}`;
        const fullShareText = shareCaption + shareUrl;
        
        const copied = await shareToClipboard(fullShareText);
        if (copied) {
            // Show a temporary toast or notification
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg z-50 font-permanent-marker';
            toast.textContent = 'Caption copied to clipboard! 📋';
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s ease-out';
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 2000);
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
                <div className="text-center mb-6 md:mb-10 px-4">
                    <AnimatePresence mode="wait">
                         <motion.h1
                            key={activeModeConfig.title}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="text-4xl sm:text-6xl md:text-8xl font-caveat font-bold text-neutral-100"
                        >
                            {activeModeConfig.title}
                        </motion.h1>
                    </AnimatePresence>
                    <p className="font-permanent-marker text-neutral-300 mt-2 text-base sm:text-lg md:text-xl tracking-wide px-2">{activeModeConfig.description}</p>
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
                            <ModeSelector 
                                currentMode={currentMode} 
                                onModeChange={setCurrentMode}
                            />
                            
                            <div className="flex flex-col items-center gap-3 mb-6 md:mb-8">
                                <button
                                    onClick={() => setIsFusionMode(!isFusionMode)}
                                    className={`font-permanent-marker text-base sm:text-lg px-4 sm:px-6 py-2 rounded-full transition-all duration-300 ${
                                        isFusionMode 
                                            ? 'bg-purple-600 text-white scale-105 shadow-lg' 
                                            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                    }`}
                                >
                                    {isFusionMode ? '🧬 Fusion Mode ON' : '👤 Solo Mode'}
                                </button>
                                {isFusionMode && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setFusionType('combine')}
                                            className={`font-permanent-marker text-sm px-3 py-1 rounded-full transition-all duration-200 ${
                                                fusionType === 'combine'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                                            }`}
                                        >
                                            🎭 Combine
                                        </button>
                                        <button
                                            onClick={() => setFusionType('merge')}
                                            className={`font-permanent-marker text-sm px-3 py-1 rounded-full transition-all duration-200 ${
                                                fusionType === 'merge'
                                                    ? 'bg-pink-500 text-white'
                                                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                                            }`}
                                        >
                                            🔀 Merge
                                        </button>
                                        {currentMode === 'interior-design' && (
                                            <button
                                                onClick={() => setFusionType('wallpaper')}
                                                className={`font-permanent-marker text-sm px-3 py-1 rounded-full transition-all duration-200 ${
                                                    fusionType === 'wallpaper'
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                                                }`}
                                            >
                                                🖼️ Wallpaper
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            {!isFusionMode ? (
                                <div className="relative group">
                                    <PolaroidCardFixed 
                                        caption={isUploading ? "Processing..." : "Start Here"}
                                        status={isUploading ? "pending" : "done"}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-md">
                                        <div className="flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <label htmlFor="file-upload" className={`cursor-pointer bg-yellow-400 hover:bg-yellow-300 text-black font-permanent-marker px-6 py-3 rounded-sm transform transition-transform hover:scale-105 hover:-rotate-2 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.2)] ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                                Upload Photo
                                            </label>
                                            <button 
                                                onClick={() => setIsCameraOpen(true)} 
                                                className={`bg-white/90 hover:bg-white text-black font-permanent-marker px-6 py-3 rounded-sm transform transition-transform hover:scale-105 hover:rotate-2 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.2)] ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                disabled={isUploading}
                                            >
                                                Take Photo
                                            </button>
                                        </div>
                                    </div>
                                    <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleImageUpload(e)} disabled={isUploading} />
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center">
                                    <div className="flex flex-col items-center">
                                        <h3 className="font-permanent-marker text-yellow-400 text-lg sm:text-xl mb-2">
                                            {currentMode === 'interior-design' && fusionType === 'wallpaper' ? 'Your Room' : 'First Photo'}
                                        </h3>
                                        <label htmlFor="file-upload-image1" className={`cursor-pointer group transform hover:scale-105 transition-transform duration-300 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                             <PolaroidCardFixed 
                                                 imageUrl={uploadedImages.image1}
                                                 caption={uploadedImages.image1 ? "First Ready!" : "Add First Photo"}
                                                 status={uploadedImages.image1 ? "done" : isUploading ? "pending" : "done"}
                                             />
                                        </label>
                                        <input id="file-upload-image1" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleImageUpload(e, 'image1')} disabled={isUploading} />
                                    </div>
                                    
                                    <div className="text-2xl sm:text-4xl font-permanent-marker text-purple-400">
                                        {fusionType === 'wallpaper' ? '🖼️' : fusionType === 'combine' ? '➕' : '🔀'}
                                    </div>
                                    
                                    <div className="flex flex-col items-center">
                                        <h3 className="font-permanent-marker text-pink-400 text-lg sm:text-xl mb-2">
                                            {currentMode === 'interior-design' && fusionType === 'wallpaper' ? 'Wallpaper Pattern' : 'Second Photo'}
                                        </h3>
                                        <label htmlFor="file-upload-image2" className={`cursor-pointer group transform hover:scale-105 transition-transform duration-300 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                             <PolaroidCardFixed 
                                                 imageUrl={uploadedImages.image2}
                                                 caption={uploadedImages.image2 ? "Second Ready!" : "Add Second Photo"}
                                                 status={uploadedImages.image2 ? "done" : isUploading ? "pending" : "done"}
                                             />
                                        </label>
                                        <input id="file-upload-image2" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleImageUpload(e, 'image2')} disabled={isUploading} />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}

                {appState === 'image-uploaded' && (
                    <div className="flex flex-col items-center gap-6">
                        {isFusionMode ? (
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center">
                                <SimplePolaroid 
                                    imageUrl={uploadedImages.image1!} 
                                    caption={currentMode === 'interior-design' && fusionType === 'wallpaper' ? "Your Room" : "First Photo"} 
                                />
                                <div className="text-2xl sm:text-4xl font-permanent-marker text-purple-400">
                                    {fusionType === 'wallpaper' ? '🖼️' : fusionType === 'combine' ? '➕' : '🔀'}
                                </div>
                                <SimplePolaroid 
                                    imageUrl={uploadedImages.image2!} 
                                    caption={currentMode === 'interior-design' && fusionType === 'wallpaper' ? "Wallpaper" : "Second Photo"} 
                                />
                            </div>
                        ) : (
                            <SimplePolaroid 
                                imageUrl={uploadedImage!} 
                                caption="Your Photo" 
                            />
                        )}
                         <div className="flex flex-col items-center gap-4 mt-4">
                            <div className="flex items-center gap-4">
                                <button onClick={handleReset} className={secondaryButtonClasses}>
                                    Different Photo{isFusionMode ? 's' : ''}
                                </button>
                                <button onClick={() => handleGenerateClick(false)} className={primaryButtonClasses}>
                                    {isFusionMode ? `${fusionType === 'wallpaper' ? '🖼️ Apply Wallpaper!' : fusionType === 'combine' ? '🧬 Combine Photos!' : '🧬 Merge Photos!'}` : 'Generate'}
                                </button>
                            </div>
                            {!isFusionMode && (
                                <button 
                                    onClick={() => handleGenerateClick(true)} 
                                    className="font-permanent-marker text-base sm:text-lg md:text-xl text-center text-white bg-gradient-to-r from-purple-600 to-pink-600 py-2 sm:py-3 px-4 sm:px-6 md:px-8 rounded-sm transform transition-all duration-200 hover:scale-110 hover:rotate-3 hover:from-purple-500 hover:to-pink-500 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.3)] flex items-center gap-2"
                                >
                                    <span className="text-xl sm:text-2xl">🎰</span> Surprise Me!
                                </button>
                            )}
                         </div>
                    </div>
                )}

                {(appState === 'generating' || appState === 'results-shown') && (
                     <>
                        {isMobile ? (
                            <div className="w-full max-w-sm flex-1 overflow-y-auto mt-4 space-y-8 p-4">
                                {(isSurpriseMode ? Object.keys(generatedImages) : activeModeConfig.categories).map((category) => (
                                    <div key={category} className="flex justify-center">
                                        <PolaroidCardFixed
                                            caption={category}
                                            status={generatedImages[category]?.status || 'pending'}
                                            imageUrl={generatedImages[category]?.url}
                                            error={generatedImages[category]?.error}
                                            onShake={handleRegenerateItem}
                                            onDownload={handleDownloadIndividualImage}
                                            onShare={handleShareImage}
                                            isMobile={isMobile}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div ref={dragAreaRef} className="relative w-full max-w-7xl mt-8 px-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                                    {(isSurpriseMode ? Object.keys(generatedImages) : activeModeConfig.categories).map((category, index) => {
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
                                                    <div className={currentMode === 'glow-up' && generatedImages[category]?.status === 'done' ? "shadow-lg shadow-purple-500/50 rounded-md" : currentMode === 'what-if' && generatedImages[category]?.status === 'done' ? "shadow-lg shadow-blue-500/50 rounded-md" : ""}>
                                                        <PolaroidCardFixed 
                                                            dragConstraintsRef={dragAreaRef}
                                                            caption={category}
                                                            status={generatedImages[category]?.status || 'pending'}
                                                            imageUrl={generatedImages[category]?.url}
                                                            error={generatedImages[category]?.error}
                                                            onShake={handleRegenerateItem}
                                                            onDownload={handleDownloadIndividualImage}
                                                            onShare={handleShareImage}
                                                            isMobile={isMobile}
                                                        />
                                                    </div>
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
                                    {Object.keys(generatedImages).length > 1 ? (
                                        <button 
                                            onClick={handleDownloadAlbum} 
                                            disabled={isDownloading} 
                                            className={`${primaryButtonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {isDownloading ? 'Creating Album...' : 'Download Album'}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleGenerateClick(true)} 
                                            className="font-permanent-marker text-base sm:text-lg md:text-xl text-center text-white bg-gradient-to-r from-purple-600 to-pink-600 py-2 sm:py-3 px-4 sm:px-6 md:px-8 rounded-sm transform transition-all duration-200 hover:scale-110 hover:rotate-3 hover:from-purple-500 hover:to-pink-500 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.3)] flex items-center gap-2"
                                            disabled={isLoading}
                                        >
                                            <span className="text-xl sm:text-2xl">🎰</span> Try Another Surprise!
                                        </button>
                                    )}
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