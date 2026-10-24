const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const wal = await sql`SHOW wal_level;`;
  console.log('wal_level:', wal);
  const pubs = await sql`SELECT * FROM pg_publication;`;
  console.log('publications:', pubs);
  const slots = await sql`SELECT * FROM pg_replication_slots;`;
  console.log('replication_slots:', slots);
}

main().catch(console.error);
