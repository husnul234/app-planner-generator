const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Running database migrations...');

  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

  // Custom types
  await sql`
    DO $$ BEGIN
      CREATE TYPE public.user_role AS ENUM ('user', 'admin');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE public.project_status AS ENUM ('draft', 'clarifying', 'generating', 'ready', 'failed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE public.doc_status AS ENUM ('pending', 'streaming', 'completed', 'failed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  // Tables
  await sql`
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY REFERENCES neon_auth.user(id) ON DELETE CASCADE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      role public.user_role NOT NULL DEFAULT 'user',
      credits_remaining INTEGER NOT NULL DEFAULT 10,
      custom_settings JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS public.projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES neon_auth.user(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      raw_idea TEXT NOT NULL,
      tech_stack TEXT[] DEFAULT ARRAY[]::TEXT[],
      status public.project_status NOT NULL DEFAULT 'draft',
      total_tokens_used INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS public.project_interviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
      qna_pairs JSONB NOT NULL DEFAULT '[]'::jsonb,
      master_context JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS public.project_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      file_slug TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      word_count INTEGER NOT NULL DEFAULT 0,
      status public.doc_status NOT NULL DEFAULT 'pending',
      version INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      CONSTRAINT unique_project_filename UNIQUE (project_id, filename)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS public.template_prompts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      doc_type TEXT NOT NULL UNIQUE,
      system_prompt TEXT NOT NULL,
      target_model TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
      is_active BOOLEAN NOT NULL DEFAULT true,
      updated_by UUID REFERENCES neon_auth.user(id),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS public.token_usage_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES neon_auth.user(id) ON DELETE CASCADE,
      project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
      doc_type TEXT NOT NULL,
      prompt_tokens INTEGER NOT NULL DEFAULT 0,
      completion_tokens INTEGER NOT NULL DEFAULT 0,
      cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0.000000,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS public.audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES neon_auth.user(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      metadata JSONB DEFAULT '{}'::jsonb,
      ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS public.invitations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL,
      role public.user_role NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'pending',
      invited_by UUID REFERENCES neon_auth.user(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `;

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_project_docs_project_id ON public.project_documents(project_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_project_docs_status ON public.project_documents(status);`;

  console.log('Migration completed successfully.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
