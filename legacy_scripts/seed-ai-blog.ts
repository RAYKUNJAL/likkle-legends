
import { batchGeneratePosts, CONTENT_IDEAS } from '@/lib/services/blog-agent';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Force polyfill for fetch in Node environment if needed (Next.js usually handles this but scripts might not)
// We'll rely on global fetch if available (Node 18+)

// Helper to select random items
function getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

(async function main() {
    console.log('🌴 Likkle Legends AI Blog Seeder 🌴');
    console.log('=======================================');

    try {
        // Validation
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY in .env.local');
        }

        console.log('Using API Key:', process.env.GOOGLE_GENERATIVE_AI_API_KEY.substring(0, 10) + '...');

        // Pick 3 random ideas
        const topics = getRandomItems(CONTENT_IDEAS, 3);

        console.log(`\nSelected ${topics.length} topics for generation:`);
        topics.forEach(t => console.log(`- [${t.category}] ${t.topic}`));

        console.log('\n🚀 Starting generation (this may take 30-60 seconds per post)...');

        const posts = await batchGeneratePosts(topics, {
            autoPublish: true, // Publish immediately
            delayMs: 2000 // Polite delay
        });

        console.log('\n✅ Batch Generation Complete!');
        console.log(`Successfully generated ${posts.length} posts:`);

        posts.forEach(p => {
            console.log(`\n📄 ${p.title}`);
            console.log(`   Slug: ${p.slug}`);
            console.log(`   Status: ${p.status}`);
            console.log(`   Category: ${p.category}`);
        });

    } catch (error: any) {
        console.error('\n❌ Error seeding blog:', error);
        console.error(error.message);
    }
})();
