type ServerEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GEMINI_API_KEY?: string;
  GOOGLE_GENERATIVE_AI_API_KEY?: string;
  ELEVENLABS_API_KEY?: string;
  PAYPAL_CLIENT_SECRET?: string;
  CLOUDFLARE_API_TOKEN?: string;
  SENTRY_DSN?: string;
  APP_URL: string;
  NODE_ENV: string;
};

const REQUIRED_KEYS: Array<keyof ServerEnv> = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

function assertEnv(key: keyof ServerEnv, optional = false): string | undefined {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    if (optional) {
      return undefined;
    }
    console.error(`❌ [server-env] Missing required environment variable: ${key}`);
    // Return empty string instead of throwing to avoid crashing the build
    return "";
  }
  return value;
}

function optionalEnv(key: keyof ServerEnv): string | undefined {
  return assertEnv(key, true);
}

// Resolve SUPABASE_URL — accept both naming conventions
const supabaseUrl =
  process.env.SUPABASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  '';

// Resolve SUPABASE_ANON_KEY — accept both naming conventions
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  '';

if (!supabaseUrl) {
  throw new Error('[server-env] Missing required environment variable: SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('[server-env] Missing required environment variable: SUPABASE_ANON_KEY');
}

export const serverEnv: ServerEnv = {
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: supabaseAnonKey,
  SUPABASE_SERVICE_ROLE_KEY: assertEnv('SUPABASE_SERVICE_ROLE_KEY')!,
  GEMINI_API_KEY: optionalEnv('GEMINI_API_KEY'),
  GOOGLE_GENERATIVE_AI_API_KEY: optionalEnv('GOOGLE_GENERATIVE_AI_API_KEY'),
  ELEVENLABS_API_KEY: optionalEnv('ELEVENLABS_API_KEY'),
  PAYPAL_CLIENT_SECRET: optionalEnv('PAYPAL_CLIENT_SECRET'),
  CLOUDFLARE_API_TOKEN: optionalEnv('CLOUDFLARE_API_TOKEN'),
  SENTRY_DSN: optionalEnv('SENTRY_DSN'),
  APP_URL: process.env.NEXT_PUBLIC_APP_URL?.trim() || 'https://www.likklelegends.com',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export const isProd = serverEnv.NODE_ENV === 'production';
