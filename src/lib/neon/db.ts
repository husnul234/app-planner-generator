import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url =
      process.env.DATABASE_URL ||
      "postgresql://placeholder:placeholder@ep-placeholder.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
    _sql = neon(url);
  }
  return _sql;
}

// Lazy callable proxy — must have a function target so typeof sql === "function"
const dummyCallable = function () {} as unknown as NeonQueryFunction<false, false>;

const sql = new Proxy(dummyCallable, {
  get(_target, prop) {
    const realSql = getSql() as unknown as Record<string | symbol, unknown>;
    const val = realSql[prop];
    if (typeof val === "function") {
      return (val as (...a: unknown[]) => unknown).bind(realSql);
    }
    return val;
  },
  apply(_target, thisArg, args) {
    return Reflect.apply(getSql() as unknown as (...a: unknown[]) => unknown, thisArg, args);
  },
});

export { sql };

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
  custom_settings?: Record<string, any>;
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
    SELECT id, email, full_name, avatar_url, role, credits_remaining, custom_settings, created_at
    FROM public.profiles
    ORDER BY created_at ASC;
  `;
  return rows as unknown as ProfileRecord[];
}

export async function getProfileByEmail(email: string): Promise<ProfileRecord | null> {
  const rows = await sql`
    SELECT id, email, full_name, avatar_url, role, credits_remaining, custom_settings, created_at
    FROM public.profiles
    WHERE LOWER(email) = LOWER(${email.trim()})
    LIMIT 1;
  `;
  return (rows[0] as unknown as ProfileRecord) || null;
}

export async function getProfileById(id: string): Promise<ProfileRecord | null> {
  const rows = await sql`
    SELECT id, email, full_name, avatar_url, role, credits_remaining, custom_settings, created_at
    FROM public.profiles
    WHERE id = ${id}
    LIMIT 1;
  `;
  return (rows[0] as unknown as ProfileRecord) || null;
}

export async function createOrUpdateProfile(data: {
  id?: string;
  email: string;
  full_name?: string;
  role?: "admin" | "user";
  credits_remaining?: number;
  custom_settings?: Record<string, any>;
}): Promise<ProfileRecord> {
  const userId = data.id || crypto.randomUUID();
  const role = data.role || "user";
  const name = data.full_name || data.email.split("@")[0];
  const credits = data.credits_remaining ?? 10;
  const settings = JSON.stringify(data.custom_settings || {});

  // Sync to neon_auth.user first to satisfy foreign key
  await sql`
    INSERT INTO neon_auth.user (id, name, email, "emailVerified", "createdAt", "updatedAt", role)
    VALUES (${userId}, ${name}, ${data.email}, true, NOW(), NOW(), ${role})
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
  `;

  const rows = await sql`
    INSERT INTO public.profiles (id, email, full_name, role, credits_remaining, custom_settings)
    VALUES (${userId}, ${data.email}, ${name}, ${role}, ${credits}, ${settings}::jsonb)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      credits_remaining = EXCLUDED.credits_remaining,
      updated_at = NOW()
    RETURNING id, email, full_name, avatar_url, role, credits_remaining, custom_settings, created_at;
  `;
  return rows[0] as unknown as ProfileRecord;
}

export async function updateProfileCustomSettings(
  id: string,
  customSettings: Record<string, any>
): Promise<ProfileRecord> {
  const settingsJson = JSON.stringify(customSettings);
  const rows = await sql`
    UPDATE public.profiles
    SET custom_settings = ${settingsJson}::jsonb, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, email, full_name, avatar_url, role, credits_remaining, custom_settings, created_at;
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

// ----------------------------------------------------------------------------
// BYOK (USER API KEYS POOL - GEMINI, ETC)
// ----------------------------------------------------------------------------

export interface UserApiKeyRecord {
  id: string;
  user_id: string | null;
  provider: string;
  api_key: string;
  key_nickname: string | null;
  is_active: boolean;
  status: string;
  last_used_at: string | null;
  created_at: string;
}

export async function listUserApiKeys(userId?: string): Promise<UserApiKeyRecord[]> {
  const rows = userId
    ? await sql`
        SELECT id, user_id, provider, api_key, key_nickname, is_active, status, last_used_at, created_at
        FROM public.user_api_keys
        WHERE user_id = ${userId}
        ORDER BY created_at DESC;
      `
    : await sql`
        SELECT id, user_id, provider, api_key, key_nickname, is_active, status, last_used_at, created_at
        FROM public.user_api_keys
        ORDER BY created_at DESC;
      `;
  return rows as unknown as UserApiKeyRecord[];
}

export async function addUserApiKey(data: {
  user_id?: string;
  provider?: string;
  api_key: string;
  key_nickname?: string;
}): Promise<UserApiKeyRecord> {
  const provider = data.provider || "gemini";
  const nickname = data.key_nickname || `${provider.toUpperCase()} Key (${data.api_key.slice(-4)})`;
  const rows = await sql`
    INSERT INTO public.user_api_keys (user_id, provider, api_key, key_nickname, is_active, status)
    VALUES (${data.user_id || null}, ${provider}, ${data.api_key.trim()}, ${nickname}, true, 'valid')
    RETURNING id, user_id, provider, api_key, key_nickname, is_active, status, last_used_at, created_at;
  `;
  return rows[0] as unknown as UserApiKeyRecord;
}

export async function updateUserApiKeyStatus(
  id: string,
  status: string,
  isActive?: boolean
): Promise<UserApiKeyRecord> {
  const activeClause = isActive !== undefined ? isActive : true;
  const rows = await sql`
    UPDATE public.user_api_keys
    SET status = ${status}, is_active = ${activeClause}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, user_id, provider, api_key, key_nickname, is_active, status, last_used_at, created_at;
  `;
  return rows[0] as unknown as UserApiKeyRecord;
}

export async function deleteUserApiKey(id: string): Promise<boolean> {
  await sql`DELETE FROM public.user_api_keys WHERE id = ${id};`;
  return true;
}

export async function getActiveGeminiKeys(userId?: string): Promise<string[]> {
  const rows = userId
    ? await sql`
        SELECT api_key
        FROM public.user_api_keys
        WHERE provider = 'gemini' AND is_active = true AND (user_id = ${userId} OR user_id IS NULL)
        ORDER BY created_at ASC;
      `
    : await sql`
        SELECT api_key
        FROM public.user_api_keys
        WHERE provider = 'gemini' AND is_active = true
        ORDER BY created_at ASC;
      `;
  return rows.map((r: any) => r.api_key);
}
