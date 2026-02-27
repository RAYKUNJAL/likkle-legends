import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local BEFORE other imports
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function restoreBlog() {
    const { batchGeneratePosts, CONTENT_IDEAS } = await import('../lib/services/blog-agent');
    const { resetSupabaseConnection } = await import('../lib/supabase-client');

    // Force reset in case something was cached
    resetSupabaseConnection();

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
