import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function checkSongsTable() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    console.log('🎵 Checking songs table in database...');
    const { data: songs, error } = await admin.from('songs').select('*').order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Error fetching songs:', error.message);
        return;
    }

    console.log(`✅ Found ${songs.length} songs in DB:`);
    songs.forEach(s => {
        console.log(`- [${s.id}] "${s.title}" by ${s.artist} (URL: ${s.audio_url})`);
    });
}

checkSongsTable().catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
});
