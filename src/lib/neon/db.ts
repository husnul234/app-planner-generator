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

export async function updateProject(
  id: string,
  data: {
    name?: string;
    raw_idea?: string;
    tech_stack?: string[];
    status?: "draft" | "clarifying" | "generating" | "ready" | "failed";
  }
): Promise<ProjectRecord> {
  const current = await getProjectById(id);
  if (!current) throw new Error("Project not found");

  const name = data.name ?? current.name;
  const raw_idea = data.raw_idea ?? current.raw_idea;
  const tech_stack = data.tech_stack ?? current.tech_stack;
  const status = data.status ?? current.status;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const rows = await sql`
    UPDATE public.projects
    SET name = ${name}, slug = ${slug}, raw_idea = ${raw_idea}, tech_stack = ${tech_stack}, status = ${status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, user_id, name, slug, raw_idea, tech_stack, status, total_tokens_used, created_at, updated_at;
  `;
  return rows[0] as unknown as ProjectRecord;
}

export async function deleteProject(id: string): Promise<boolean> {
  // Cascades to project_documents and project_interviews automatically
  await sql`DELETE FROM public.projects WHERE id = ${id};`;
  return true;
}

export async function updateProjectDocumentContent(
  docId: string,
  content: string
): Promise<ProjectDocumentRecord> {
  const word_count = content.split(/\s+/).filter(Boolean).length;
  const rows = await sql`
    UPDATE public.project_documents
    SET content = ${content}, word_count = ${word_count}, updated_at = NOW()
    WHERE id = ${docId}
    RETURNING id, project_id, filename, file_slug, content, word_count, status, version, created_at, updated_at;
  `;
  return rows[0] as unknown as ProjectDocumentRecord;
}

export async function createCustomProjectDocument(data: {
  project_id: string;
  filename: string;
  content: string;
}): Promise<ProjectDocumentRecord> {
  const file_slug = data.filename.replace(/\.md$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const word_count = data.content.split(/\s+/).filter(Boolean).length;
  const rows = await sql`
    INSERT INTO public.project_documents (project_id, filename, file_slug, content, word_count, status)
    VALUES (${data.project_id}, ${data.filename}, ${file_slug}, ${data.content}, ${word_count}, 'completed')
    ON CONFLICT (project_id, filename) DO UPDATE SET
      content = EXCLUDED.content,
      word_count = EXCLUDED.word_count,
      updated_at = NOW()
    RETURNING id, project_id, filename, file_slug, content, word_count, status, version, created_at, updated_at;
  `;
  return rows[0] as unknown as ProjectDocumentRecord;
}

export async function deleteProjectDocument(docId: string): Promise<boolean> {
  await sql`DELETE FROM public.project_documents WHERE id = ${docId};`;
  return true;
}

// ----------------------------------------------------------------------------
// PROFILES & TEAM ROLES MANAGEMENT (Role: admin | user)
// ----------------------------------------------------------------------------

export interface ProfileRecord {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "user";
  credits_remaining: number;
  created_at: string;
}

export interface InvitationRecord {
  id: string;
  email: string;
  role: "admin" | "user";
  status: string;
  invited_by: string | null;
  created_at: string;
}

export async function listProfiles(): Promise<ProfileRecord[]> {
  const rows = await sql`
    SELECT id, email, full_name, avatar_url, role, credits_remaining, created_at
    FROM public.profiles
    ORDER BY created_at ASC;
  `;
  return rows as unknown as ProfileRecord[];
}

export async function createOrUpdateProfile(data: {
  id?: string;
  email: string;
  full_name?: string;
  role?: "admin" | "user";
  credits_remaining?: number;
}): Promise<ProfileRecord> {
  const userId = data.id || crypto.randomUUID();
  const role = data.role || "user";
  const name = data.full_name || data.email.split("@")[0];
  const credits = data.credits_remaining ?? 10;

  // Sync to neon_auth.user first to satisfy foreign key
  await sql`
    INSERT INTO neon_auth.user (id, name, email, "emailVerified", "createdAt", "updatedAt", role)
    VALUES (${userId}, ${name}, ${data.email}, true, NOW(), NOW(), ${role})
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
  `;

  const rows = await sql`
    INSERT INTO public.profiles (id, email, full_name, role, credits_remaining)
    VALUES (${userId}, ${data.email}, ${name}, ${role}, ${credits})
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      credits_remaining = EXCLUDED.credits_remaining,
      updated_at = NOW()
    RETURNING id, email, full_name, avatar_url, role, credits_remaining, created_at;
  `;
  return rows[0] as unknown as ProfileRecord;
}

export async function updateProfileRole(id: string, role: "admin" | "user"): Promise<ProfileRecord> {
  await sql`
    UPDATE neon_auth.user SET role = ${role}, "updatedAt" = NOW() WHERE id = ${id};
  `;
  const rows = await sql`
    UPDATE public.profiles
    SET role = ${role}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, email, full_name, avatar_url, role, credits_remaining, created_at;
  `;
  return rows[0] as unknown as ProfileRecord;
}

export async function deleteProfile(id: string): Promise<boolean> {
  await sql`DELETE FROM public.profiles WHERE id = ${id};`;
  await sql`DELETE FROM neon_auth.user WHERE id = ${id};`;
  return true;
}

export async function listInvitations(): Promise<InvitationRecord[]> {
  const rows = await sql`
    SELECT id, email, role, status, invited_by, created_at
    FROM public.invitations
    ORDER BY created_at DESC;
  `;
  return rows as unknown as InvitationRecord[];
}

export async function createInvitation(
  email: string,
  role: "admin" | "user" = "user",
  invitedBy?: string
): Promise<InvitationRecord> {
  const rows = await sql`
    INSERT INTO public.invitations (email, role, status, invited_by)
    VALUES (${email}, ${role}, 'pending', ${invitedBy || null})
    RETURNING id, email, role, status, invited_by, created_at;
  `;
  return rows[0] as unknown as InvitationRecord;
}

export async function deleteInvitation(id: string): Promise<boolean> {
  await sql`DELETE FROM public.invitations WHERE id = ${id};`;
  return true;
}
