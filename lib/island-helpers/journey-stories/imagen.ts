/**
 * Imagen bytes for one Journey Stories page.
 * No key, or art on hold: no request, no invented URL.
 */
import { journeyArtOnHold } from './art-hold';
export function geminiImageKey(): string | null {
  const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '').trim();
  return key || null;
}

export function hasGeminiImageKey(): boolean {
  return Boolean(geminiImageKey());
}

export async function generateJourneyImageBytes(prompt: string): Promise<Buffer | null> {
  if (journeyArtOnHold()) return null;
  const key = geminiImageKey();
  if (!key) return null;

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: key });
    const model = (process.env.GEMINI_IMAGE_MODEL || 'imagen-3.0-generate-002').trim();
    const response = await ai.models.generateImages({
      model,
      prompt,
      config: { numberOfImages: 1 },
    });
    const bytes = response?.generatedImages?.[0]?.image?.imageBytes;
    if (!bytes) return null;
    return Buffer.from(bytes, 'base64');
  } catch {
    return null;
  }
}
