// Load environment variables for scripts
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Also try .env
config({ path: resolve(process.cwd(), '.env') });

// Verify critical environment variables
const critical = [
    'GEMINI_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
];

const recommended = [
    'SUPABASE_SERVICE_ROLE_KEY',
];

const missingCritical = critical.filter(key => !process.env[key]);
const missingRecommended = recommended.filter(key => !process.env[key]);

if (missingCritical.length > 0) {
    console.error('❌ Missing critical environment variables:');
    missingCritical.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease check your .env.local file');
    process.exit(1);
}

if (missingRecommended.length > 0) {
    console.warn('⚠️  Warning: Missing recommended environment variables:');
    missingRecommended.forEach(key => console.warn(`   - ${key}`));
    console.warn('   Scripts requiring these might run in limited mode (e.g., local save instead of database)');
}

console.log('✅ Environment variables loaded successfully');
