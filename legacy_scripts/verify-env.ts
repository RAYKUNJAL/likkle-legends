
import { config } from 'dotenv';
config({ path: '.env.local' });

async function verifyEnvironment() {
    console.log("🔍 Verifying Environment Configuration...");

    const requiredKeys = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        // Check for either Gemini key format
        ['GEMINI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY']
    ];

    let missingCount = 0;

    for (const key of requiredKeys) {
        if (Array.isArray(key)) {
            const hasOne = key.some(k => process.env[k]);
            if (!hasOne) {
                console.error(`❌ Missing one of: ${key.join(' or ')}`);
                missingCount++;
            } else {
                const found = key.find(k => process.env[k]);
                console.log(`✅ ${found} is set`);
            }
        } else {
            if (!process.env[key]) {
                console.error(`❌ Missing: ${key}`);
                missingCount++;
            } else {
                console.log(`✅ ${key} is set`);
            }
        }
    }

    if (missingCount > 0) {
        console.log("\n⚠️  Some environment variables are missing. The Agent or Uploads may fail.");
        console.log("Please update your .env.local file.");
    } else {
        console.log("\n✅ All systems go! Environment is ready for Commercial Grade performance.");
    }
}

verifyEnvironment();
