const { Pool } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function check() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const res = await pool.query(`
    SELECT conname, pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE conrelid = 'public.profiles'::regclass;
  `);
  console.log("Constraints on public.profiles:", res.rows);
  await pool.end();
}
check().catch(console.error);
