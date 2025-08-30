import { Router } from 'express';
import multer from 'multer';
import { generateStyledImage, generateCombinedImage } from '../services/gemini.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/generate-image', upload.single('image'), async (req, res) => {
  try {
    const { prompt, fallbackPrompt } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!prompt || !fallbackPrompt) {
      return res.status(400).json({ error: 'Prompt and fallbackPrompt are required' });
    }

    // Convert the uploaded file to base64 data URL
    const base64Data = req.file.buffer.toString('base64');
    const imageDataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

    // Call the Gemini service
    const resultUrl = await generateStyledImage(imageDataUrl, prompt, fallbackPrompt);
    
    res.json({ imageUrl: resultUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.post('/generate-duel', upload.fields([
  { name: 'player1', maxCount: 1 },
  { name: 'player2', maxCount: 1 }
]), async (req, res) => {
  try {
    const { prompt, fallbackPrompt } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files?.player1?.[0] || !files?.player2?.[0]) {
      return res.status(400).json({ error: 'Both player images are required' });
    }

    if (!prompt || !fallbackPrompt) {
      return res.status(400).json({ error: 'Prompt and fallbackPrompt are required' });
    }

    // Convert both uploaded files to base64 data URLs
    const player1Base64 = files.player1[0].buffer.toString('base64');
    const player1DataUrl = `data:${files.player1[0].mimetype};base64,${player1Base64}`;
    
    const player2Base64 = files.player2[0].buffer.toString('base64');
    const player2DataUrl = `data:${files.player2[0].mimetype};base64,${player2Base64}`;

    // Generate images for both players in parallel
    const [player1Result, player2Result] = await Promise.all([
      generateStyledImage(player1DataUrl, prompt, fallbackPrompt),
      generateStyledImage(player2DataUrl, prompt, fallbackPrompt)
    ]);
    
    res.json({ 
      player1ImageUrl: player1Result,
      player2ImageUrl: player2Result
    });
  } catch (error) {
    console.error('Error generating duel images:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.post('/combine-images', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]), async (req, res) => {
  try {
    const { prompt, fallbackPrompt, combineType = 'combine' } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files?.image1?.[0] || !files?.image2?.[0]) {
      return res.status(400).json({ error: 'Both images are required' });
    }

    if (!prompt || !fallbackPrompt) {
      return res.status(400).json({ error: 'Prompt and fallbackPrompt are required' });
    }

    if (!['combine', 'merge'].includes(combineType)) {
      return res.status(400).json({ error: 'combineType must be either "combine" or "merge"' });
    }

    // Convert both uploaded files to base64 data URLs
    const image1Base64 = files.image1[0].buffer.toString('base64');
    const image1DataUrl = `data:${files.image1[0].mimetype};base64,${image1Base64}`;
    
    const image2Base64 = files.image2[0].buffer.toString('base64');
    const image2DataUrl = `data:${files.image2[0].mimetype};base64,${image2Base64}`;

    // Generate combined image
    const resultUrl = await generateCombinedImage(
      image1DataUrl, 
      image2DataUrl, 
      prompt, 
      fallbackPrompt,
      combineType as 'combine' | 'merge'
    );
    
    res.json({ imageUrl: resultUrl });
  } catch (error) {
    console.error('Error generating combined image:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;