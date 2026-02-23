import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function inspect() {
    const { createAdminClient } = await import('./lib/admin');
    const admin = createAdminClient();

    console.log('--- Table Inspection ---');
    const { data, error } = await admin.rpc('get_table_info', { table_name: 'songs' });

    // Fallback if RPC doesn't exist
    if (error) {
        console.log('RPC failed, trying raw query...');
        const { data: rawData, error: rawError } = await admin
            .from('songs')
            .select('*')
            .limit(1);
        console.log('Can select from songs:', !rawError);
        if (rawError) console.error(rawError);
    } else {
        console.log(data);
    }
}
inspect();
