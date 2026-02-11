const { Client } = require('pg');
require('dotenv').config();

async function inspectSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Get all tables
        const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log('--- TABLES ---');
        console.log(tablesRes.rows.map(r => r.table_name).join(', '));

        // Check if 'content_items' exists (from our v2.0.0 spec)
        const hasContentItems = tablesRes.rows.some(r => r.table_name === 'content_items');
        console.log(`\n'content_items' exists: ${hasContentItems}`);

        if (hasContentItems) {
            const colRes = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'content_items'
      `);
            console.log('Columns in content_items:', colRes.rows.map(r => r.column_name).join(', '));
        }

        // Check 'children' columns
        const childrenColsRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'children'
    `);
        console.log('\nColumns in children:', childrenColsRes.rows.map(r => r.column_name).join(', '));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

inspectSchema();
