
import { initializeStorageBuckets } from '../lib/storage';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    console.log('🚀 Initializing storage buckets...');
    try {
        await initializeStorageBuckets();
        console.log('✅ Storage buckets initialized successfully.');
    } catch (error) {
        console.error('❌ Failed to initialize storage buckets:', error);
        process.exit(1);
    }
}

main();
