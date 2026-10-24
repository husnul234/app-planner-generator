export interface HealthData {
  status: string;
  branch: string;
  timestamp: string;
  services: {
    postgres: { status: string; durationMs: number; info?: { version: string } };
    auth: { status: string; durationMs: number; keysCount?: number };
    storage: { status: string; durationMs: number; bucket?: string };
    functions: { status: string; durationMs: number; output?: string };
    realtime: { status: string; durationMs: number; message?: string };
  };
}

export interface ProjectItem {
  id: string;
  name: string;
  slug: string;
  raw_idea: string;
  tech_stack: string[];
  status: "draft" | "clarifying" | "generating" | "ready" | "failed";
  total_tokens_used: number;
  created_at: string;
  updated_at: string;
}

export interface DocItem {
  id?: string;
  filename: string;
  title?: string;
  description?: string;
  content: string;
  word_count?: number;
}

export interface ProfileItem {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "user";
  credits_remaining: number;
  custom_settings?: Record<string, any>;
  created_at: string;
}

export interface InvitationItem {
  id: string;
  email: string;
  role: "admin" | "user";
  status: string;
  created_at: string;
}

export interface ApiKeyItem {
  id: string;
  provider: string;
  nickname: string;
  maskedKey: string;
  isActive: boolean;
  status: string;
  lastUsedAt?: string | null;
  createdAt: string;
}

export interface ProjectMeta {
  appName: string;
  category: string;
  tagline: string;
  problem: string;
  targetAudience: string;
  coreFeatures: string[];
  techStack: string[];
  dbType: string;
  selectedModel: string;
}

export interface TaskExecutionItem {
  id: string; // e.g. "TASK-01"
  phase: string; // e.g. "Fase 1: Fondasi Skema Database"
  title: string;
  category: string;
  targetFiles: string[];
  description: string;
  aiPrompt: string;
  acceptanceCriteria: string;
  completed: boolean;
}

export interface ArchitecturePreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  meta: ProjectMeta;
}
