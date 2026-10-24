const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testInsert() {
  const userId = '11111111-1111-1111-1111-111111111111';
  try {
    await sql`
      INSERT INTO neon_auth.user (id, name, email, "emailVerified", "createdAt", "updatedAt", role)
      VALUES (${userId}, 'Lead Architect (Admin)', 'admin@appplanner.ai', true, NOW(), NOW(), 'admin')
      ON CONFLICT (id) DO NOTHING;
    `;
    console.log('Successfully inserted into neon_auth.user');

    await sql`
      INSERT INTO public.profiles (id, email, full_name, role, credits_remaining)
      VALUES (${userId}, 'admin@appplanner.ai', 'Lead Architect (Admin)', 'admin', 100)
      ON CONFLICT (id) DO UPDATE SET role = 'admin', credits_remaining = 100;
    `;
    console.log('Successfully inserted into public.profiles');
  } catch (e) {
    console.error('Insert error:', e);
  }
}

testInsert();
