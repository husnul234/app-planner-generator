const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function inspectTables() {
  const invCols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'neon_auth' AND table_name = 'invitation'
    ORDER BY ordinal_position;
  `;
  console.log('Columns in neon_auth.invitation:', invCols);

  const memCols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'neon_auth' AND table_name = 'member'
    ORDER BY ordinal_position;
  `;
  console.log('Columns in neon_auth.member:', memCols);
}

inspectTables().catch(console.error);
