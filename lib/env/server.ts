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
    throw new Error(`[server-env] Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: keyof ServerEnv): string | undefined {
  return assertEnv(key, true);
}

export const serverEnv: ServerEnv = {
  SUPABASE_URL: assertEnv('SUPABASE_URL')!,
  SUPABASE_ANON_KEY: assertEnv('SUPABASE_ANON_KEY')!,
  SUPABASE_SERVICE_ROLE_KEY: assertEnv('SUPABASE_SERVICE_ROLE_KEY')!,
  GEMINI_API_KEY: optionalEnv('GEMINI_API_KEY'),
  GOOGLE_GENERATIVE_AI_API_KEY: optionalEnv('GOOGLE_GENERATIVE_AI_API_KEY'),
  ELEVENLABS_API_KEY: optionalEnv('ELEVENLABS_API_KEY'),
  PAYPAL_CLIENT_SECRET: optionalEnv('PAYPAL_CLIENT_SECRET'),
  CLOUDFLARE_API_TOKEN: optionalEnv('CLOUDFLARE_API_TOKEN'),
  SENTRY_DSN: optionalEnv('SENTRY_DSN'),
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL.trim() : 'https://www.likklelegends.com',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export const isProd = serverEnv.NODE_ENV === 'production';
