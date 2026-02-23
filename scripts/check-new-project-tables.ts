import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function listAllTables() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    console.log('🔍 Listing tables in the new project...');

    // We can't query information_schema directly via PostgREST easily without an RPC
    // But we can try to "peek" at common tables
    const tables = [
        'songs', 'profiles', 'users', 'otp_codes', 'waitlist',
        'site_settings', 'admin_users', 'orders', 'custom_song_requests',
        'storybooks', 'videos', 'characters', 'printables'
    ];

    for (const table of tables) {
        const { error } = await admin.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`❌ Table "${table}" DOES NOT EXIST (or access denied): ${error.message}`);
        } else {
            console.log(`✅ Table "${table}" EXISTS`);
        }
    }
}

listAllTables().catch(console.error);
