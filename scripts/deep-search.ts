import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function deepSearch() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    console.log('🔍 Deep Searching for "tantyspice radio"...');

    // 1. Check ALL buckets
    const { data: buckets } = await admin.storage.listBuckets();
    console.log('Available buckets:', buckets?.map(b => b.name));

    // 2. Check for a bucket named exactly "tantyspice radio" or slugified
    const targets = ['tantyspice radio', 'tantyspice-radio', 'public-radio', 'radio'];

    for (const target of targets) {
        console.log(`\nTrying bucket: "${target}"`);
        const { data: files, error } = await admin.storage.from(target).list();
        if (error) {
            console.log(`❌ Bucket "${target}" access error: ${error.message}`);
        } else {
            console.log(`✅ Bucket "${target}" found with ${files.length} items:`, files.map(f => f.name));
        }
    }

    // 3. Check inside "songs" for folders again
    console.log('\nChecking "songs" bucket folders again...');
    const { data: rootSongs } = await admin.storage.from('songs').list();
    for (const item of rootSongs || []) {
        if (!item.id) {
            console.log(`📁 Folder found in songs: ${item.name}`);
            const { data: subFiles } = await admin.storage.from('songs').list(item.name);
            console.log(`   Items in ${item.name}:`, subFiles?.map(f => f.name));
        }
    }
}

deepSearch().catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
});
