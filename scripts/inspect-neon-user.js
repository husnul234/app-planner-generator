const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function inspectAuthUser() {
  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'neon_auth' AND table_name = 'user'
    ORDER BY ordinal_position;
  `;
  console.log('Columns in neon_auth.user:', cols);
}

inspectAuthUser().catch(console.error);
