import { Router } from 'express';
import multer from 'multer';
import { generateStyledImage } from '../services/gemini.js';

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

export default router;