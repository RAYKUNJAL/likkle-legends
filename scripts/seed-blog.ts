import { createPost, generateSlug } from '@/lib/services/blog';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Self-executing function to seed the initial blog post
(async function seedBlog() {
    try {
        const title = "Welcome to the Likkle Legends Blog!";
        const slug = generateSlug(title);

        console.log("Seeding blog post...");

        await createPost({
            title,
            slug,
            excerpt: "We're excited to launch our new blog! Here you'll find tips, stories, and resources for raising proud, confident Caribbean children.",
            content: `
                <h2>Welcome Family!</h2>
                <p>We are thrilled to introduce the Likkle Legends blog, your new home for celebrating Caribbean culture, heritage, and parenting.</p>
                <p>In this space, we'll be sharing:</p>
                <ul>
                    <li><strong>Parenting Tips:</strong> Advice for raising cultural aware children in the diaspora.</li>
                    <li><strong>Fun Activities:</strong> Crafts, recipes, and games from the islands.</li>
                    <li><strong>Education:</strong> History, geography, and language lessons made fun.</li>
                    <li><strong>Stories:</strong> Folklore and legends that connect us to our roots.</li>
                </ul>
                <p>Stay tuned for weekly updates!</p>
            `,
            category: 'culture',
            status: 'published',
            author_name: 'Likkle Legends Team',
            keywords: ['caribbean parenting', 'culture', 'blog launch'],
            tags: ['welcome', 'news'],
            read_time_minutes: 1,
            published_at: new Date().toISOString()
        });

        console.log("✅ Successfully created welcome post!");
    } catch (error) {
        console.error("❌ Failed to seed blog:", error);
    }
})();
