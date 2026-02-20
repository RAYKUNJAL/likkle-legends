import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local BEFORE other imports
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { batchGeneratePosts, CONTENT_IDEAS } from '../lib/services/blog-agent';
import { resetSupabaseConnection } from '../lib/supabase-client';

// Force reset in case something was cached
resetSupabaseConnection();

async function restoreBlog() {
    console.log('🔄 Restoring missing blog posts...');

    // Pick 5 random topics to start
    const topics = [...CONTENT_IDEAS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);

    console.log(`📝 Generating ${topics.length} posts... This may take a few minutes.`);

    try {
        const posts = await batchGeneratePosts(topics, {
            autoPublish: true,
            delayMs: 3000 // Give Gemini some breathing room
        });

        console.log(`✅ Success! Generated ${posts.length} blog posts.`);
        posts.forEach(p => console.log(`   - ${p.title} (${p.slug})`));
    } catch (error) {
        console.error('❌ Restoration failed:', error);
    }
}

restoreBlog();
