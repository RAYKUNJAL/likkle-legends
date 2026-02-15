import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

async function listTables() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('--- TABLES in PUBLIC ---');
        const resTables = await client.query("SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public'");
        resTables.rows.forEach(r => console.log(` [${r.table_type}] ${r.table_name}`));

        const tableName = process.argv[2];
        if (tableName) {
            console.log(`\n🔍 Inspecting "${tableName}":`);
            const resCols = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1 AND table_schema = 'public'
            `, [tableName]);
            resCols.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));
        }

    } catch (err: any) {
        console.error('💥 Error:', err.message);
    } finally {
        await client.end();
    }
}

listTables();
