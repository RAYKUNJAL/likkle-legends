
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('Error: DATABASE_URL is not set in .env');
    process.exit(1);
}

const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    try {
        console.log('Connecting to database...');
        await client.connect();

        // 1. Run Schema Migration
        const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20240217_blog_infrastructure.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('Running blog schema migration...');
        await client.query(sql);
        console.log('✅ Blog schema applied.');

        // 2. Seed Categories
        console.log('Seeding categories...');
        const categories = [
            { name: 'Culture & Heritage', icon: '🏝️', color: 'bg-orange-100', description: 'Celebrating our roots.' },
            { name: 'Parenting Tips', icon: '👨‍👩‍👧‍👦', color: 'bg-blue-100', description: 'Raising global legends.' },
            { name: 'Education', icon: '📚', color: 'bg-green-100', description: 'Learning made fun.' },
            { name: 'News & Updates', icon: '📰', color: 'bg-purple-100', description: 'What\'s new at Likkle Legends.' }
        ];

        for (const cat of categories) {
            // Check if exists
            const existing = await client.query('SELECT id FROM blog_categories WHERE name = $1', [cat.name]);
            if (existing.rows.length === 0) {
                await client.query(
                    'INSERT INTO blog_categories (name, icon, color, description, display_order) VALUES ($1, $2, $3, $4, 0)',
                    [cat.name, cat.icon, cat.color, cat.description]
                );
                console.log(`   + Created category: ${cat.name}`);
            }
        }

        // 3. Seed Welcome Post
        console.log('Seeding welcome post...');
        const welcomeSlug = 'welcome-to-likkle-legends-blog';
        const existingPost = await client.query('SELECT id FROM blog_posts WHERE slug = $1', [welcomeSlug]);

        if (existingPost.rows.length === 0) {
            // Get category ID for 'News & Updates'
            const catRes = await client.query("SELECT id FROM blog_categories WHERE name = 'News & Updates'");
            const catId = catRes.rows[0]?.id;

            if (catId) {
                await client.query(`
                    INSERT INTO blog_posts (
                        title, slug, excerpt, content, category, 
                        status, author_name, published_at, read_time_minutes,
                        ai_generated, view_count
                    ) VALUES (
                        $1, $2, $3, $4, $5, 
                        'published', 'Likkle Legends Team', NOW(), 1,
                        false, 0
                    )
                `, [
                    "Welcome to the Likkle Legends Blog!",
                    welcomeSlug,
                    "We're excited to launch our new blog! Here you'll find tips, stories, and resources for raising proud, confident Caribbean children.",
                    "<h2>Welcome Family!</h2><p>We are thrilled to introduce the Likkle Legends blog, your new home for celebrating Caribbean culture, heritage, and parenting.</p><p>Stay tuned for weekly updates!</p>",
                    catId
                ]);
                console.log('   + Created welcome post.');
            } else {
                console.warn('   ! Could not find category for welcome post.');
            }
        }

        console.log('🎉 Blog migration and seeding complete!');

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
