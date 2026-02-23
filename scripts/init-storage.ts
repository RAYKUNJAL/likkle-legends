import { initializeStorageBuckets } from './lib/storage';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    console.log('🚀 Initializing Likkle Legends Storage Buckets...');
    try {
        await initializeStorageBuckets();
        console.log('✅ Storage initialization complete!');
    } catch (error) {
        console.error('❌ Initialization failed:', error);
    }
}

run();
