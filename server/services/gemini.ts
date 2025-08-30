// Server-side Gemini service using REST API
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = 'models/gemini-2.5-flash-image-preview';

interface GenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
}

async function callGeminiAPI(payload: any): Promise<GenerateContentResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const response = await fetch(
    `${GEMINI_API_BASE_URL}/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new Error(`Gemini API request failed: ${response.statusText}`);
  }

  return response.json() as Promise<GenerateContentResponse>;
}

function processGeminiResponse(response: GenerateContentResponse): string {
  const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(
    part => part.inlineData
  );

  if (imagePartFromResponse?.inlineData) {
    const { mimeType, data } = imagePartFromResponse.inlineData;
    return `data:${mimeType};base64,${data}`;
  }

  const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;
  console.error('API did not return an image. Response:', textResponse);
  throw new Error(
    `The AI model responded with text instead of an image: "${
      textResponse || 'No text response received.'
    }"`
  );
}

async function callGeminiWithRetry(
  imagePart: any,
  textPart: any
): Promise<GenerateContentResponse> {
  const maxRetries = 3;
  const initialDelay = 1000;

  const payload = {
    contents: [
      {
        parts: [imagePart, textPart],
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callGeminiAPI(payload);
    } catch (error) {
      console.error(`Error calling Gemini API (Attempt ${attempt}/${maxRetries}):`, error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      const isInternalError = errorMessage.includes('500') || errorMessage.includes('INTERNAL');

      if (isInternalError && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`Internal error detected. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Gemini API call failed after all retries.');
}

export async function generateStyledImage(
  imageDataUrl: string,
  prompt: string,
  fallbackPrompt: string
): Promise<string> {
  const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
  }
  const [, mimeType, base64Data] = match;

  const imagePart = {
    inlineData: { mimeType, data: base64Data },
  };

  // First attempt with the original prompt
  try {
    console.log('Attempting generation with original prompt...');
    const textPart = { text: prompt };
    const response = await callGeminiWithRetry(imagePart, textPart);
    return processGeminiResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    const isNoImageError = errorMessage.includes(
      'The AI model responded with text instead of an image'
    );

    if (isNoImageError) {
      console.warn('Original prompt was likely blocked. Trying a fallback prompt.');

      // Second attempt with the fallback prompt
      try {
        console.log('Attempting generation with fallback prompt...');
        const fallbackTextPart = { text: fallbackPrompt };
        const fallbackResponse = await callGeminiWithRetry(imagePart, fallbackTextPart);
        return processGeminiResponse(fallbackResponse);
      } catch (fallbackError) {
        console.error('Fallback prompt also failed.', fallbackError);
        const finalErrorMessage =
          fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        throw new Error(
          `The AI model failed with both original and fallback prompts. Last error: ${finalErrorMessage}`
        );
      }
    } else {
      console.error('An unrecoverable error occurred during image generation.', error);
      throw new Error(`The AI model failed to generate an image. Details: ${errorMessage}`);
    }
  }
}