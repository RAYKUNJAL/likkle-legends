import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function syncTantyMusic() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const bucketName = 'Tanty spice radio';
    console.log(`📻 Syncing music from bucket: "${bucketName}"...`);

    const { data: files, error } = await admin.storage.from(bucketName).list();

    if (error) {
        console.error('❌ Error listing files:', error.message);
        return;
    }

    if (!files || files.length === 0) {
        console.log('⚠️ No files found in bucket.');
        return;
    }

    console.log(`✅ Found ${files.length} tracks. Creating database entries...`);

    for (const file of files) {
        if (!file.name.endsWith('.mp3')) continue;

        const { data: urlData } = admin.storage.from(bucketName).getPublicUrl(file.name);
        const publicUrl = urlData.publicUrl;

        // Clean up title (remove .mp3 and parentheticals)
        const cleanTitle = file.name.replace('.mp3', '').replace(/\(.*\)/, '').trim();

        console.log(`🎵 Syncing: "${cleanTitle}"`);

        const { error: dbError } = await admin
            .from('songs')
            .upsert({
                title: cleanTitle,
                artist: 'Likkle Legends',
                audio_url: publicUrl,
                category: 'culture', // Default to culture
                is_active: true,
                display_order: 10
            }, { onConflict: 'title' });

        if (dbError) {
            console.error(`   ❌ DB Error for ${cleanTitle}:`, dbError.message);
        }
    }

    console.log('\n✨ Sync Complete! Tanty Spice Radio is now live with your tracks.');
}

syncTantyMusic().catch(console.error);
