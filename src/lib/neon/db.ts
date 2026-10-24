import { neon } from "@neondatabase/serverless";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }
  return url;
}

export const sql = neon(getDatabaseUrl());

export interface ProjectRecord {
  id: string;
  user_id?: string | null;
  name: string;
  slug: string;
  raw_idea: string;
  tech_stack: string[];
  status: "draft" | "clarifying" | "generating" | "ready" | "failed";
  total_tokens_used: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectDocumentRecord {
  id: string;
  project_id: string;
  filename: string;
  file_slug: string;
  content: string;
  word_count: number;
  status: "pending" | "streaming" | "completed" | "failed";
  version: number;
  created_at: string;
  updated_at: string;
}

export async function checkDatabaseHealth() {
  const start = Date.now();
  const rows = await sql`
    SELECT 
      current_database() AS database, 
      current_user AS user, 
      version() AS version, 
      NOW() AS current_time;
  `;
  const duration = Date.now() - start;
  return {
    status: "ok",
    durationMs: duration,
    info: rows[0],
  };
}

export async function listProjects(limit = 20): Promise<ProjectRecord[]> {
  const rows = await sql`
    SELECT id, user_id, name, slug, raw_idea, tech_stack, status, total_tokens_used, created_at, updated_at
    FROM public.projects
    ORDER BY created_at DESC
    LIMIT ${limit};
  `;
  return rows as unknown as ProjectRecord[];
}

export async function getProjectById(id: string): Promise<ProjectRecord | null> {
  const rows = await sql`
    SELECT id, user_id, name, slug, raw_idea, tech_stack, status, total_tokens_used, created_at, updated_at
    FROM public.projects
    WHERE id = ${id}
    LIMIT 1;
  `;
  return (rows[0] as unknown as ProjectRecord) || null;
}

export async function getProjectDocuments(projectId: string): Promise<ProjectDocumentRecord[]> {
  const rows = await sql`
    SELECT id, project_id, filename, file_slug, content, word_count, status, version, created_at, updated_at
    FROM public.project_documents
    WHERE project_id = ${projectId}
    ORDER BY created_at ASC;
  `;
  return rows as unknown as ProjectDocumentRecord[];
}

export async function saveProject(data: {
  name: string;
  slug: string;
  raw_idea: string;
  tech_stack: string[];
  status?: "draft" | "clarifying" | "generating" | "ready" | "failed";
}): Promise<ProjectRecord> {
  const rows = await sql`
    INSERT INTO public.projects (name, slug, raw_idea, tech_stack, status)
    VALUES (${data.name}, ${data.slug}, ${data.raw_idea}, ${data.tech_stack}, ${data.status || "ready"})
    RETURNING id, user_id, name, slug, raw_idea, tech_stack, status, total_tokens_used, created_at, updated_at;
  `;
  return rows[0] as unknown as ProjectRecord;
}

export async function saveProjectDocument(data: {
  project_id: string;
  filename: string;
  file_slug: string;
  content: string;
  word_count: number;
  status?: "pending" | "streaming" | "completed" | "failed";
}): Promise<ProjectDocumentRecord> {
  const rows = await sql`
    INSERT INTO public.project_documents (project_id, filename, file_slug, content, word_count, status)
    VALUES (${data.project_id}, ${data.filename}, ${data.file_slug}, ${data.content}, ${data.word_count}, ${data.status || "completed"})
    ON CONFLICT (project_id, filename) DO UPDATE SET
      content = EXCLUDED.content,
      word_count = EXCLUDED.word_count,
      status = EXCLUDED.status,
      updated_at = NOW()
    RETURNING id, project_id, filename, file_slug, content, word_count, status, version, created_at, updated_at;
  `;
  return rows[0] as unknown as ProjectDocumentRecord;
}
