/**
 * Honest capability probes for portal surfaces.
 * Used by /api/portal/capabilities and fail-closed voice/studio UI.
 */

export type PortalCapability = {
  available: boolean;
  reason?: string;
};

export type PortalCapabilities = {
  buddy: PortalCapability & { mode: 'text' };
  voice: PortalCapability & { mode: 'turn-based' };
  storyStudio: PortalCapability;
};

function hasValue(value?: string | null) {
  return Boolean(value && value.trim().length > 0);
}

export function hasGeminiKey(env: NodeJS.ProcessEnv = process.env) {
  return hasValue(env.GEMINI_API_KEY);
}

export function hasTtsKeys(env: NodeJS.ProcessEnv = process.env) {
  return (
    hasValue(env.ELEVENLABS_API_KEY) ||
    hasValue(env.GOOGLE_CLOUD_TTS_API_KEY) ||
    hasValue(env.GOOGLE_API_KEY)
  );
}

export function hasSupabaseAdmin(env: NodeJS.ProcessEnv = process.env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  return hasValue(url) && hasValue(env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Story Studio can serve a library story (Supabase) or generate one (Gemini).
 * Mark "coming soon" only when both services are actually missing.
 */
export function hasStoryStudioServices(env: NodeJS.ProcessEnv = process.env) {
  return hasSupabaseAdmin(env) || hasGeminiKey(env);
}

export function getPortalCapabilities(env: NodeJS.ProcessEnv = process.env): PortalCapabilities {
  const buddyReady = hasGeminiKey(env);
  const voiceReady = hasGeminiKey(env) && hasTtsKeys(env);
  const studioReady = hasStoryStudioServices(env);

  return {
    buddy: {
      available: buddyReady,
      mode: 'text',
      reason: buddyReady ? undefined : 'Buddy chat needs GEMINI_API_KEY.',
    },
    voice: {
      available: voiceReady,
      mode: 'turn-based',
      reason: voiceReady
        ? undefined
        : 'Island Voice is turn-based (speak → think → reply). It needs GEMINI_API_KEY plus ElevenLabs or Google TTS.',
    },
    storyStudio: {
      available: studioReady,
      reason: studioReady
        ? undefined
        : 'Story Studio needs the story library (Supabase) or Gemini to write a new story.',
    },
  };
}
