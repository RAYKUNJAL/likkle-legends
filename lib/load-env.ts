// Load environment variables for scripts
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Also try .env
config({ path: resolve(process.cwd(), '.env') });

// Verify critical environment variables
const required = [
    'GEMINI_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease check your .env.local file');
    process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
