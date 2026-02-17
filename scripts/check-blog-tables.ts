import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkTables() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('blog_posts', 'blog_categories');
        `);

        const tables = res.rows.map(r => r.table_name);
        console.log('Found tables:', tables);

        if (tables.includes('blog_posts')) {
            const countRes = await client.query('SELECT COUNT(*) FROM blog_posts');
            console.log('Blog posts count:', countRes.rows[0].count);
        }

        if (tables.includes('blog_categories')) {
            const catCount = await client.query('SELECT COUNT(*) FROM blog_categories');
            console.log('Blog categories count:', catCount.rows[0].count);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

checkTables();
