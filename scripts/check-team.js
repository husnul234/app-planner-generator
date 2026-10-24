const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const users = await sql`SELECT * FROM neon_auth.user;`;
  console.log('neon_auth.user:', users);
  const profiles = await sql`SELECT * FROM public.profiles;`;
  console.log('public.profiles:', profiles);
  const orgs = await sql`SELECT * FROM neon_auth.organization;`;
  console.log('neon_auth.organization:', orgs);
}

main().catch(console.error);
