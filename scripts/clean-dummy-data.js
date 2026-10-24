const { Pool } = require("@neondatabase/serverless");
const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require("@aws-sdk/client-s3");
require("dotenv").config({ path: ".env.local" });

async function clean() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log("Cleaning Postgres dummy data...");
  await pool.query("DELETE FROM public.project_documents");
  await pool.query("DELETE FROM public.project_interviews");
  await pool.query("DELETE FROM public.projects");
  await pool.query("DELETE FROM public.invitations");
  await pool.query("DELETE FROM public.token_usage_logs");
  await pool.query("DELETE FROM public.audit_logs");
  await pool.query("DELETE FROM public.user_api_keys");
  await pool.query("DELETE FROM public.profiles");
  await pool.query("DELETE FROM neon_auth.user WHERE email NOT IN ('admin@appplanner.ai')");

  // Ensure admin user exists in neon_auth.user
  await pool.query(`
    INSERT INTO neon_auth.user (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
    VALUES 
      ('11111111-1111-1111-1111-111111111111', 'Admin AppPlanner', 'admin@appplanner.ai', true, 'admin', NOW(), NOW()),
      ('22222222-2222-2222-2222-222222222222', 'Developer User', 'user@appplanner.ai', true, 'user', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role
  `);

  // Insert standard initial admin and user in public.profiles
  await pool.query(`
    INSERT INTO public.profiles (id, email, full_name, role, credits_remaining)
    VALUES 
      ('11111111-1111-1111-1111-111111111111', 'admin@appplanner.ai', 'Super Admin', 'admin', 50000),
      ('22222222-2222-2222-2222-222222222222', 'user@appplanner.ai', 'Indie Vibecoder', 'user', 10000)
    ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, full_name = EXCLUDED.full_name
  `);
  console.log("Postgres cleaned and baseline accounts created: admin@appplanner.ai (admin), user@appplanner.ai (user)");

  // Clean S3 bucket assets
  if (process.env.AWS_ACCESS_KEY_ID && process.env.NEON_OBJECT_STORAGE_BUCKET) {
    try {
      const s3 = new S3Client({
        region: process.env.AWS_REGION || "ap-southeast-1",
        endpoint: process.env.AWS_ENDPOINT_URL_S3,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        forcePathStyle: true,
      });

      const listRes = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.NEON_OBJECT_STORAGE_BUCKET,
        })
      );

      if (listRes.Contents && listRes.Contents.length > 0) {
        const objectsToDelete = listRes.Contents.map((obj) => ({ Key: obj.Key }));
        await s3.send(
          new DeleteObjectsCommand({
            Bucket: process.env.NEON_OBJECT_STORAGE_BUCKET,
            Delete: { Objects: objectsToDelete },
          })
        );
        console.log(`Deleted ${objectsToDelete.length} dummy objects from S3 bucket`);
      } else {
        console.log("S3 bucket is already clean.");
      }
    } catch (s3Err) {
      console.warn("S3 cleanup note:", s3Err.message);
    }
  }

  await pool.end();
  console.log("All dummy data successfully cleaned!");
}

clean().catch(console.error);
