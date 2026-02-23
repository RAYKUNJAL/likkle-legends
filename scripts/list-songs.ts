import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function listAllFiles() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const bucketName = 'songs';
    console.log(`🔍 Listing all files and folders in bucket: ${bucketName}...`);

    // Recursive listing is not directly supported by .list(), so we check top level first
    const { data: files, error } = await admin.storage.from(bucketName).list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
    });

    if (error) {
        console.error('❌ Error listing files:', error.message);
        return;
    }

    console.log(`✅ Found ${files.length} items at root:`);
    for (const file of files) {
        console.log(`${file.id ? '📄' : '📁'} ${file.name}`);
        if (!file.id) {
            // It's a folder, list contents
            const { data: folderFiles } = await admin.storage.from(bucketName).list(file.name);
            if (folderFiles) {
                folderFiles.forEach(f => console.log(`   └─ ${f.name}`));
            }
        }
    }
}

listAllFiles().catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
});
