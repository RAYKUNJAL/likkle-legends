const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase...');

    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    let sql = fs.readFileSync(schemaPath, 'utf8');

    // Split SQL by semicolons, but IGNORE semicolons inside DO $$ blocks
    // This is a more robust splitter for this specific schema
    const statements = [];
    let current = '';
    let inDollaredQuote = false;

    const lines = sql.split('\n');
    for (const line of lines) {
      if (line.includes('$$')) {
        inDollaredQuote = !inDollaredQuote;
      }

      current += line + '\n';

      if (!inDollaredQuote && line.trim().endsWith(';')) {
        statements.push(current.trim());
        current = '';
      }
    }
    if (current.trim()) statements.push(current.trim());

    console.log(`Executing ${statements.length} refined statements...`);

    for (let i = 0; i < statements.length; i++) {
      try {
        if (!statements[i]) continue;
        await client.query(statements[i]);
      } catch (err) {
        console.error(`Error in statement ${i + 1}:`);
        console.error(statements[i]);
        console.error('ERROR DETAIL:', err.message);
        throw err;
      }
    }

    console.log('✅ Success! Database schema initialized.');

  } catch (err) {
    console.error('Fatal initialization error:', err.message);
  } finally {
    await client.end();
  }
}

runSchema();
