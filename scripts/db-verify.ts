import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env
config({ path: resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;

async function verify() {
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL missing in .env');
        process.exit(1);
    }

    console.log('🚀 Connecting to Supabase Postgres...');
    const client = new Client({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected!\n');

        const tables = [
            'promoters',
            'contests',
            'contest_entries',
            'referral_clicks',
            'leads',
            'support_messages',
            'storybooks',
            'songs',
            'videos',
            'games',
            'printables',
            'characters',
            'generated_content',
            'purchased_content',
            'site_settings',
            'announcements',
            'custom_song_requests'
        ];

        console.log('📊 Checking Tables:');
        for (const table of tables) {
            try {
                const res = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${table}')`);
                const exists = res.rows[0].exists;
                if (exists) {
                    const countRes = await client.query(`SELECT count(*) FROM ${table}`);
                    console.log(`✅ ${table.padEnd(20)}: Exists (${countRes.rows[0].count} rows)`);
                } else {
                    console.log(`❌ ${table.padEnd(20)}: DOES NOT EXIST`);
                }
            } catch (err: any) {
                console.log(`❌ ${table.padEnd(20)}: Error - ${err.message}`);
            }
        }

        console.log('\n💎 Checking Enums:');
        const enumRes = await client.query(`
            SELECT t.typname, string_agg(e.enumlabel, ', ') as labels
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid 
            WHERE t.typname IN ('affiliate_status', 'contest_status', 'admin_role')
            GROUP BY t.typname
        `);

        if (enumRes.rows.length === 0) {
            console.log('❌ Enums NOT FOUND');
        } else {
            enumRes.rows.forEach(row => {
                console.log(`✅ ${row.typname.padEnd(20)}: [${row.labels}]`);
            });
        }

    } catch (err: any) {
        console.error('💥 Connection failure:', err.message);
    } finally {
        await client.end();
    }
}

verify();
