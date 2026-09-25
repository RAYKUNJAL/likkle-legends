/**
 * Journey Stories picture hold.
 * No image-model key, or JOURNEY_ART_HOLD, means do not call Imagen or FLUX.
 * Words still generate. Pages use local SVG placeholders, never a stub remote URL.
 */

export function journeyArtOnHold(env: NodeJS.ProcessEnv = process.env): boolean {
  const flag = (env.JOURNEY_ART_HOLD || '').trim().toLowerCase();
  if (flag === '1' || flag === 'true' || flag === 'yes' || flag === 'hold') return true;
  const gemini = (env.GEMINI_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY || '').trim();
  return !gemini;
}
