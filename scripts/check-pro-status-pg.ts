import pkg from 'pg';
const { Client } = pkg;
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkProStatus() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        console.log('🔍 Checking Pro 3.1.0 Status...');

        const tables = [
            'parental_consents',
            'family_groups',
            'admin_actions_audit',
            'vendor_compliance',
            'ai_usage'
        ];

        for (const table of tables) {
            try {
                const res = await client.query(`SELECT 1 FROM information_schema.tables WHERE table_name = '${table}'`);
                if (res.rowCount > 0) {
                    console.log(`✅ Table "${table}" is present.`);
                } else {
                    console.log(`❌ Table "${table}" is MISSING.`);
                }
            } catch (e) {
                console.log(`❌ Error checking "${table}":`, e.message);
            }
        }
        await client.end();
    } catch (err) {
        console.error('❌ Database connection failed:', (err as Error).message);
    }
}

checkProStatus();
