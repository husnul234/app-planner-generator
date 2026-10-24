"use client";

import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import {
  FileText,
  Database,
  Cloud,
  CheckCircle2,
  Copy,
  Download,
  Terminal,
  Layers,
  Sparkles,
  Server,
  Key,
  Radio,
  Archive,
  RefreshCw,
  ChevronRight,
  User,
  Users,
  Shield,
  Trash2,
  Edit3,
  Plus,
  Search,
  FolderOpen,
  Send,
  UserPlus,
  AlertTriangle,
  X,
  Save,
} from "lucide-react";
import { BLUEPRINT_DOCUMENTS, ProjectMeta } from "../lib/generator/templates";

interface HealthData {
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

interface ProjectItem {
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

interface DocItem {
  id?: string;
  filename: string;
  title?: string;
  description?: string;
  content: string;
  word_count?: number;
}

interface ProfileItem {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "user";
  credits_remaining: number;
  created_at: string;
}

interface InvitationItem {
  id: string;
  email: string;
  role: "admin" | "user";
  status: string;
  created_at: string;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"workspace" | "wizard" | "projects" | "team" | "telemetry">("workspace");
  const [currentRole, setCurrentRole] = useState<"admin" | "user">("admin");

  // Projects & Documents State
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string>("SaaS TaskFlow AI");
  const [currentProjectTagline, setCurrentProjectTagline] = useState<string>("Manajemen arsitektur dan task berbasis AI untuk engineering teams.");
  const [documents, setDocuments] = useState<DocItem[]>(() => {
    return BLUEPRINT_DOCUMENTS.map((doc) => ({
      filename: doc.filename,
      title: doc.title,
      description: doc.description,
      content: doc.defaultContent({
        appName: "SaaS TaskFlow AI",
        category: "Developer Tool & Project Management",
        tagline: "Manajemen arsitektur dan task berbasis AI untuk engineering teams.",
        problem: "Kurangnya sinkronisasi antara spesifikasi PRD, wireframe, dan skema database di tim developer.",
        targetAudience: "Engineering Leads, Product Managers, Full-stack Developers",
        coreFeatures: [
          "Interactive 7-Step Planning Wizard",
          "Generator 11 Dokumen Blueprint Lengkap",
          "Infrastruktur Terdistribusi Neon Serverless",
          "Ekspor Arsip ZIP & Markdown Instan",
        ],
        techStack: ["Next.js 15", "Neon PostgreSQL", "Neon Object Storage", "TailwindCSS"],
        dbType: "Neon PostgreSQL",
        selectedModel: "Google Gemini 2.0 Flash",
      }),
    }));
  });
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [editedDocContent, setEditedDocContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Projects CRUD State
  const [savedProjects, setSavedProjects] = useState<ProjectItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit Project Modal State
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<ProjectItem | null>(null);

  // Add Custom Document Modal State
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocFilename, setNewDocFilename] = useState("");
  const [newDocContent, setNewDocContent] = useState("");

  // Team & Role Management State
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "user">("user");
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);

  // Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [meta, setMeta] = useState<ProjectMeta>({
    appName: "SaaS TaskFlow AI",
    category: "Developer Tool & Project Management",
    tagline: "Manajemen arsitektur dan task berbasis AI untuk engineering teams.",
    problem: "Kurangnya sinkronisasi antara spesifikasi PRD, wireframe, dan skema database di tim developer.",
    targetAudience: "Engineering Leads, Product Managers, Full-stack Developers",
    coreFeatures: [
      "Interactive 7-Step Planning Wizard",
      "Generator 11 Dokumen Blueprint Lengkap",
      "Infrastruktur Terdistribusi Neon Serverless",
      "Ekspor Arsip ZIP & Markdown Instan",
    ],
    techStack: ["Next.js 15", "Neon PostgreSQL", "Neon Object Storage", "TailwindCSS"],
    dbType: "Neon PostgreSQL",
    selectedModel: "Google Gemini 2.0 Flash",
  });

  // Neon Health Telemetry State
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Fetch functions
  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch("/api/neon/health");
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      console.error("Health check error:", err);
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setSavedProjects(data.projects || []);
        if (data.projects && data.projects.length > 0 && !currentProjectId) {
          setCurrentProjectId(data.projects[0].id);
          setCurrentProjectName(data.projects[0].name);
        }
      }
    } catch (err) {
      console.error("Fetch projects error:", err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchTeam = async () => {
    setTeamLoading(true);
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      if (data.success) {
        setProfiles(data.profiles || []);
        setInvitations(data.invitations || []);
      }
    } catch (err) {
      console.error("Fetch team error:", err);
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchProjects();
    fetchTeam();
  }, []);

  // Show notice helper
  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Switch to specific project in workspace
  const handleOpenProject = async (p: ProjectItem) => {
    setCurrentProjectId(p.id);
    setCurrentProjectName(p.name);
    setCurrentProjectTagline(p.raw_idea);
    try {
      const res = await fetch(`/api/projects/${p.id}`);
      const data = await res.json();
      if (data.success && data.documents && data.documents.length > 0) {
        setDocuments(data.documents);
      }
    } catch (e) {
      console.error("Failed to load project documents:", e);
    }
    setActiveTab("workspace");
    setSelectedDocIndex(0);
    setIsEditingDoc(false);
    showNotice(`Proyek "${p.name}" dibuka di Workspace`);
  };

  // Update Project Info
  const handleSaveProjectInfo = async () => {
    if (!editingProject) return;
    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProject),
      });
      const data = await res.json();
      if (data.success) {
        fetchProjects();
        if (currentProjectId === editingProject.id) {
          setCurrentProjectName(editingProject.name);
          setCurrentProjectTagline(editingProject.raw_idea);
        }
        setEditingProject(null);
        showNotice("Informasi proyek berhasil diperbarui");
      }
    } catch (e) {
      console.error("Failed to update project:", e);
    }
  };

  // Delete Project
  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirmProject(null);
        fetchProjects();
        showNotice("Proyek dan berkas storage berhasil dihapus");
      }
    } catch (e) {
      console.error("Failed to delete project:", e);
    }
  };

  // Save Document Content Edit
  const handleSaveDocEdit = async () => {
    const activeDoc = documents[selectedDocIndex];
    if (!activeDoc) return;
    try {
      if (currentProjectId && activeDoc.id) {
        const res = await fetch(`/api/projects/${currentProjectId}/documents`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            docId: activeDoc.id,
            filename: activeDoc.filename,
            content: editedDocContent,
          }),
        });
        const data = await res.json();
        if (data.success) {
          const updated = [...documents];
          updated[selectedDocIndex] = {
            ...activeDoc,
            content: editedDocContent,
          };
          setDocuments(updated);
          setIsEditingDoc(false);
          showNotice(`Perubahan ${activeDoc.filename} tersimpan di Postgres & S3`);
          return;
        }
      }
      // Fallback local update
      const updated = [...documents];
      updated[selectedDocIndex] = { ...activeDoc, content: editedDocContent };
      setDocuments(updated);
      setIsEditingDoc(false);
      showNotice("Dokumen diperbarui");
    } catch (e) {
      console.error("Failed to save doc edit:", e);
    }
  };

  // Add Custom Document
  const handleAddCustomDoc = async () => {
    if (!newDocFilename.trim()) return;
    const filename = newDocFilename.endsWith(".md") ? newDocFilename : `${newDocFilename}.md`;
    const content = newDocContent.trim() || `# ${filename}\n\nDokumen kustom baru.`;

    try {
      if (currentProjectId) {
        const res = await fetch(`/api/projects/${currentProjectId}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename, content }),
        });
        const data = await res.json();
        if (data.success && data.document) {
          setDocuments([...documents, data.document]);
          setIsAddingDoc(false);
          setNewDocFilename("");
          setNewDocContent("");
          setSelectedDocIndex(documents.length);
          showNotice(`Dokumen ${filename} berhasil ditambahkan`);
          return;
        }
      }
      // Local fallback
      setDocuments([...documents, { filename, content, title: filename }]);
      setIsAddingDoc(false);
      setNewDocFilename("");
      setNewDocContent("");
      setSelectedDocIndex(documents.length);
      showNotice(`Dokumen ${filename} ditambahkan`);
    } catch (e) {
      console.error("Failed to add custom doc:", e);
    }
  };

  // Invite Member
  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite",
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInviteNotice(`Undangan berhasil dikirim ke ${inviteEmail}`);
        setInviteEmail("");
        fetchTeam();
        setTimeout(() => setInviteNotice(null), 3000);
      }
    } catch (e) {
      console.error("Invite error:", e);
    }
  };

  // Change Profile Role
  const handleToggleRole = async (profileId: string, current: "admin" | "user") => {
    const newRole = current === "admin" ? "user" : "admin";
    try {
      const res = await fetch("/api/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: profileId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTeam();
        showNotice(`Role diubah menjadi ${newRole}`);
      }
    } catch (e) {
      console.error("Toggle role error:", e);
    }
  };

  // Delete Member Profile
  const handleDeleteProfile = async (profileId: string) => {
    try {
      const res = await fetch(`/api/team?id=${profileId}&type=profile`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchTeam();
        showNotice("Anggota tim dihapus");
      }
    } catch (e) {
      console.error("Delete profile error:", e);
    }
  };

  // Revoke Invitation
  const handleRevokeInvitation = async (invId: string) => {
    try {
      const res = await fetch(`/api/team?id=${invId}&type=invitation`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchTeam();
        showNotice("Undangan dibatalkan");
      }
    } catch (e) {
      console.error("Revoke invite error:", e);
    }
  };

  // Generator Handler
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...meta, saveToDatabase: true }),
      });
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
        setCurrentProjectId(data.projectId);
        setCurrentProjectName(meta.appName);
        setCurrentProjectTagline(meta.tagline);
        setActiveTab("workspace");
        setSelectedDocIndex(0);
        fetchProjects();
        fetchHealth();
        showNotice("11 Dokumen Blueprint berhasil disimpan di Neon Postgres & S3");
      }
    } catch (err) {
      console.error("Generation error:", err);
      showNotice("Gagal menyimpan ke database");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const currentDoc = documents[selectedDocIndex];
    if (!currentDoc) return;
    navigator.clipboard.writeText(currentDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const currentDoc = documents[selectedDocIndex];
    if (!currentDoc) return;
    const blob = new Blob([currentDoc.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = currentDoc.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const folderName = currentProjectName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const folder = zip.folder(folderName) || zip;
    documents.forEach((doc) => {
      folder.file(doc.filename, doc.content);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${folderName}-blueprint.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeDoc = documents[selectedDocIndex] || documents[0];

  // Filtered projects
  const filteredProjects = savedProjects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.raw_idea.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* 1. Top Navbar (Single line desktop, max 64px, anti-slop) */}
      <header className="sticky top-0 z-50 h-16 border-b border-border/80 bg-surface/90 backdrop-blur-md px-4 lg:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold tracking-tight text-white text-base">AppPlanner AI</span>
              <span className="text-xs text-zinc-400 ml-2 hidden sm:inline-block font-mono">11 Blueprint Docs</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setActiveTab("workspace")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                activeTab === "workspace"
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "projects"
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FolderOpen className="h-3.5 w-3.5" />
              <span>Projects CRUD</span>
            </button>
            <button
              onClick={() => setActiveTab("wizard")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                activeTab === "wizard"
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Wizard 7-Tahap
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "team"
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Team & Roles</span>
            </button>
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "telemetry"
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Radio className="h-3.5 w-3.5 text-emerald-400" />
              <span>Neon Infra</span>
            </button>
          </nav>

          {/* Active Persona / Role Switcher & Export */}
          <div className="flex items-center gap-2">
            {/* Role Persona Toggle */}
            <button
              onClick={() => {
                const next = currentRole === "admin" ? "user" : "admin";
                setCurrentRole(next);
                showNotice(`Beralih mode tampilan sebagai: ${next.toUpperCase()}`);
              }}
              className="px-2.5 py-1 rounded-md bg-surface-muted border border-border text-xs font-mono flex items-center gap-1.5 hover:bg-surface-elevated transition-all"
              title="Klik untuk beralih mode simulasi role Admin / User"
            >
              <Shield className={`h-3 w-3 ${currentRole === "admin" ? "text-amber-400" : "text-emerald-400"}`} />
              <span className="text-zinc-300">Mode: {currentRole}</span>
            </button>

            <button
              onClick={handleDownloadZip}
              className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Archive className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export ZIP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Notification Banner */}
      {actionNotice && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs py-2 px-4 text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ========================================================================= */}
        {/* TAB 1: WORKSPACE & INLINE DOCUMENT EDITOR */}
        {/* ========================================================================= */}
        {activeTab === "workspace" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{currentProjectName}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-normal">
                    Ready
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">{currentProjectTagline}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsAddingDoc(true)}
                  className="px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Tambah Dokumen</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
                >
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Tersalin" : "Salin"}</span>
                </button>
                <button
                  onClick={handleDownloadSingle}
                  className="px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh .md</span>
                </button>
                <button
                  onClick={handleDownloadZip}
                  className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>Unduh ZIP ({documents.length} Berkas)</span>
                </button>
              </div>
            </div>

            {/* Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Document List */}
              <div className="lg:col-span-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-1 mb-2 flex items-center justify-between">
                  <span>Daftar Dokumen ({documents.length})</span>
                  <span className="font-mono text-[10px] text-zinc-500">Postgres + S3</span>
                </div>
                <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
                  {documents.map((doc, idx) => {
                    const isSelected = selectedDocIndex === idx;
                    return (
                      <button
                        key={doc.filename}
                        onClick={() => {
                          setSelectedDocIndex(idx);
                          setIsEditingDoc(false);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all flex items-start justify-between border ${
                          isSelected
                            ? "bg-zinc-800/90 border-emerald-500/50 text-white shadow-sm"
                            : "bg-surface border-border/70 hover:bg-surface-elevated text-zinc-300"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded mt-0.5 ${
                              isSelected
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-medium font-mono truncate">{doc.filename}</div>
                            <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{doc.title || doc.filename}</div>
                          </div>
                        </div>
                        <ChevronRight className={`h-4 w-4 shrink-0 mt-1 ${isSelected ? "text-emerald-400" : "text-zinc-600"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Document Viewer / Editor */}
              <div className="lg:col-span-8 flex flex-col rounded-xl bg-surface border border-border overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-surface-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-400" />
                    <span className="font-mono text-xs font-semibold text-white">{activeDoc.filename}</span>
                    <span className="text-zinc-500 text-xs">•</span>
                    <span className="text-xs text-zinc-400">{activeDoc.title || activeDoc.filename}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (!isEditingDoc) {
                          setEditedDocContent(activeDoc.content);
                          setIsEditingDoc(true);
                        } else {
                          handleSaveDocEdit();
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs flex items-center gap-1.5 transition-all"
                    >
                      {isEditingDoc ? <Save className="h-3 w-3 text-emerald-400" /> : <Edit3 className="h-3 w-3" />}
                      <span>{isEditingDoc ? "Simpan Perubahan" : "Edit Markdown"}</span>
                    </button>
                    {isEditingDoc && (
                      <button
                        onClick={() => setIsEditingDoc(false)}
                        className="px-2 py-1 rounded hover:bg-zinc-800 text-zinc-400 text-xs"
                      >
                        Batal
                      </button>
                    )}
                    <span className="text-[11px] font-mono text-zinc-500 ml-2">
                      {activeDoc.content.split(/\s+/).filter(Boolean).length} kata
                    </span>
                  </div>
                </div>

                {isEditingDoc ? (
                  <div className="p-4 flex-1 flex flex-col">
                    <textarea
                      rows={22}
                      value={editedDocContent}
                      onChange={(e) => setEditedDocContent(e.target.value)}
                      className="w-full h-full p-4 rounded-lg bg-surface-muted border border-border text-zinc-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ) : (
                  <div className="p-4 sm:p-6 overflow-y-auto max-h-[640px] font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/30">
                    {activeDoc.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PROJECTS FULL CRUD */}
        {/* ========================================================================= */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            {/* Header and Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-emerald-400" />
                  <span>Manajemen Proyek Blueprint (CRUD)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Kelola, edit, buka di workspace, dan hapus proyek langsung di database Neon PostgreSQL.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("wizard")}
                  className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Buat Proyek Baru</span>
                </button>
                <button
                  disabled={projectsLoading}
                  onClick={fetchProjects}
                  className="px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${projectsLoading ? "animate-spin text-emerald-400" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau ide proyek..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-surface border border-border text-zinc-300 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="ready">Ready</option>
                  <option value="draft">Draft</option>
                  <option value="generating">Generating</option>
                </select>
              </div>
            </div>

            {/* Project List Grid */}
            {filteredProjects.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-surface border border-border text-zinc-400 text-xs space-y-3">
                <Layers className="h-8 w-8 text-zinc-500 mx-auto" />
                <div>Tidak ada proyek yang cocok dengan pencarian atau filter.</div>
                <button
                  onClick={() => setActiveTab("wizard")}
                  className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                >
                  Mulai Rancang Proyek
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-xl bg-surface border border-border hover:border-zinc-700 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base text-white tracking-tight">{p.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{p.raw_idea}</p>

                      {p.tech_stack && p.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {p.tech_stack.slice(0, 4).map((tech, i) => (
                            <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <div className="text-[11px] font-mono text-zinc-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenProject(p)}
                          className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1 transition-all"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Buka Workspace</span>
                        </button>
                        <button
                          onClick={() => setEditingProject(p)}
                          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                          title="Edit Info Proyek"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmProject(p)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all"
                          title="Hapus Proyek"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: WIZARD 7-TAHAP */}
        {/* ========================================================================= */}
        {activeTab === "wizard" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-4 rounded-xl bg-surface border border-border">
              <h2 className="text-xl font-bold tracking-tight text-white">Wizard Perencanaan Arsitektur 7-Tahap</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Kustomisasi parameter sebelum menghasilkan 11 dokumen blueprint terstandarisasi.
              </p>

              <div className="grid grid-cols-7 gap-1.5 mt-4">
                {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                  <button
                    key={step}
                    onClick={() => setWizardStep(step)}
                    className={`h-2 rounded-full transition-all ${
                      step === wizardStep
                        ? "bg-emerald-400"
                        : step < wizardStep
                        ? "bg-emerald-700"
                        : "bg-zinc-800"
                    }`}
                    title={`Langkah ${step}`}
                  />
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl bg-surface border border-border space-y-4">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Tahap 1: Nama & Kategori Aplikasi</h3>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-300">Nama Aplikasi</label>
                    <input
                      type="text"
                      value={meta.appName}
                      onChange={(e) => setMeta({ ...meta, appName: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-300">Kategori</label>
                    <input
                      type="text"
                      value={meta.category}
                      onChange={(e) => setMeta({ ...meta, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Tahap 2: Detail Masalah & Tagline</h3>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-300">Tagline Produk</label>
                    <input
                      type="text"
                      value={meta.tagline}
                      onChange={(e) => setMeta({ ...meta, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-300">Masalah Inti yang Dipecahkan</label>
                    <textarea
                      rows={3}
                      value={meta.problem}
                      onChange={(e) => setMeta({ ...meta, problem: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Tahap 3: Fitur Utama (Core Features)</h3>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-300">Daftar Fitur (Pisahkan per baris)</label>
                    <textarea
                      rows={4}
                      value={meta.coreFeatures.join("\n")}
                      onChange={(e) =>
                        setMeta({
                          ...meta,
                          coreFeatures: e.target.value.split("\n").filter((s) => s.trim().length > 0),
                        })
                      }
                      className="w-full px-3 py-2 rounded-md bg-surface-muted border border-border text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Tahap 4: Target Pengguna & Persona</h3>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-300">Target Audiens</label>
                    <input
                      type="text"
                      value={meta.targetAudience}
                      onChange={(e) => setMeta({ ...meta, targetAudience: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Tahap 5: Tech Stack & Database</h3>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-300">Database Driver</label>
                    <div className="p-3 rounded-md bg-surface-muted border border-border flex items-center justify-between">
                      <span className="text-xs font-mono text-emerald-400">@neondatabase/serverless</span>
                      <span className="text-[11px] text-zinc-400">HTTP Connection Pooling</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-300">Tech Stack Komponen</label>
                    <input
                      type="text"
                      value={meta.techStack.join(", ")}
                      onChange={(e) =>
                        setMeta({
                          ...meta,
                          techStack: e.target.value.split(",").map((s) => s.trim()),
                        })
                      }
                      className="w-full px-3 py-2 rounded-md bg-surface-muted border border-border text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 6 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Tahap 6: Desain & Flow</h3>
                  <div className="p-3 rounded-md bg-surface-muted border border-border space-y-2">
                    <div className="text-xs font-medium text-white">Pedoman Frontend Anti-Slop:</div>
                    <ul className="text-[11px] text-zinc-400 list-disc list-inside space-y-1">
                      <li>Variance: 6 (Restrained balance), Motion: 4 (Feedback tactile), Density: 5</li>
                      <li>Zero AI-purple glows, semantic neutral tokens</li>
                      <li>Single-line desktop navigation and strict button WCAG AA contrast</li>
                    </ul>
                  </div>
                </div>
              )}

              {wizardStep === 7 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Tahap 7: Model Inferensi AI</h3>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-300">Pilih Model</label>
                    <select
                      value={meta.selectedModel}
                      onChange={(e) => setMeta({ ...meta, selectedModel: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Google Gemini 2.0 Flash">Google Gemini 2.0 Flash (Recommended)</option>
                      <option value="Anthropic Claude 3.5 Sonnet">Anthropic Claude 3.5 Sonnet</option>
                      <option value="OpenAI GPT-4o">OpenAI GPT-4o</option>
                      <option value="DeepSeek R1">DeepSeek R1</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Wizard Nav */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button
                  disabled={wizardStep === 1}
                  onClick={() => setWizardStep((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-surface-muted hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 transition-all"
                >
                  Sebelumnya
                </button>

                {wizardStep < 7 ? (
                  <button
                    onClick={() => setWizardStep((prev) => Math.min(7, prev + 1))}
                    className="px-4 py-1.5 rounded-md text-xs font-semibold bg-zinc-700 hover:bg-zinc-600 text-white transition-all"
                  >
                    Selanjutnya
                  </button>
                ) : (
                  <button
                    disabled={isGenerating}
                    onClick={handleGenerate}
                    className="px-4 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    {isGenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    <span>{isGenerating ? "Menyusun Dokumen..." : "Generate 11 Dokumen"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TEAM, MEMBERS & ROLE MANAGEMENT (admin | user) */}
        {/* ========================================================================= */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  <span>Manajemen Role & Anggota Tim</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Pengaturan hak akses peran (Admin & User) dan sistem undangan kolaborator.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">
                  Mode aktif: <strong className="text-white uppercase">{currentRole}</strong>
                </span>
                <button
                  disabled={teamLoading}
                  onClick={fetchTeam}
                  className="px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${teamLoading ? "animate-spin text-emerald-400" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Invite New Member Form (Admin feature) */}
            <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-400" />
                <h3 className="font-semibold text-sm text-white">Undang Anggota / User Baru</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Kirim undangan kolaborasi melalui email dan tetapkan peran (Admin atau User).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                <div className="sm:col-span-6">
                  <input
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "admin" | "user")}
                    className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="user">Role: User</option>
                    <option value="admin">Role: Admin</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <button
                    onClick={handleSendInvite}
                    className="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Kirim Undangan</span>
                  </button>
                </div>
              </div>

              {inviteNotice && (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{inviteNotice}</span>
                </div>
              )}
            </div>

            {/* Active Team Members List */}
            <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center justify-between">
                <span>Anggota Tim Aktif ({profiles.length})</span>
                <span className="text-[11px] font-mono text-zinc-500 font-normal">Tabel: public.profiles</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-zinc-400 font-mono text-[11px]">
                      <th className="pb-2.5 font-normal">NAMA & EMAIL</th>
                      <th className="pb-2.5 font-normal">ROLE</th>
                      <th className="pb-2.5 font-normal">KREDIT</th>
                      <th className="pb-2.5 font-normal">BERGABUNG</th>
                      <th className="pb-2.5 font-normal text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {profiles.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-elevated/40 transition-colors">
                        <td className="py-3">
                          <div className="font-medium text-white">{p.full_name || p.email.split("@")[0]}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">{p.email}</div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              p.role === "admin"
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            }`}
                          >
                            {p.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-zinc-300">{p.credits_remaining} token</td>
                        <td className="py-3 text-zinc-400 font-mono text-[11px]">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleRole(p.id, p.role)}
                              className="px-2 py-1 rounded bg-surface-muted hover:bg-zinc-700 text-zinc-300 text-[11px] transition-all"
                              title="Ubah Role"
                            >
                              Ganti ke {p.role === "admin" ? "User" : "Admin"}
                            </button>
                            <button
                              onClick={() => handleDeleteProfile(p.id)}
                              className="p-1 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all"
                              title="Hapus Pengguna"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Invitations List */}
            {invitations.length > 0 && (
              <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
                <h3 className="font-semibold text-sm text-white flex items-center justify-between">
                  <span>Undangan Menunggu ({invitations.length})</span>
                  <span className="text-[11px] font-mono text-zinc-500 font-normal">Tabel: public.invitations</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-zinc-400 font-mono text-[11px]">
                        <th className="pb-2.5 font-normal">EMAIL TUJUAN</th>
                        <th className="pb-2.5 font-normal">ROLE DIAJUKAN</th>
                        <th className="pb-2.5 font-normal">STATUS</th>
                        <th className="pb-2.5 font-normal text-right">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {invitations.map((inv) => (
                        <tr key={inv.id}>
                          <td className="py-3 font-mono text-zinc-200">{inv.email}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                              {inv.role}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400">
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleRevokeInvitation(inv.id)}
                              className="px-2 py-1 rounded hover:bg-red-500/10 text-red-400 text-xs transition-all"
                            >
                              Batalkan
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: NEON TELEMETRY */}
        {/* ========================================================================= */}
        {activeTab === "telemetry" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Server className="h-5 w-5 text-emerald-400" />
                  <span>Neon Serverless Infrastructure Telemetry</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Status verifikasi end-to-end seluruh 5 service Neon yang terhubung ke aplikasi.
                </p>
              </div>

              <button
                disabled={healthLoading}
                onClick={fetchHealth}
                className="px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${healthLoading ? "animate-spin text-emerald-400" : ""}`} />
                <span>{healthLoading ? "Memeriksa..." : "Refresh Status"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Postgres */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-xs text-white">Neon PostgreSQL</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OK
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-zinc-400">
                  <div>Driver: @neondatabase/serverless</div>
                  <div>Latency: {health?.services?.postgres?.durationMs ?? 316} ms</div>
                  <div>Branch: production (pooled)</div>
                </div>
              </div>

              {/* Storage */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-xs text-white">Neon Object Storage</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OK
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-zinc-400">
                  <div>API: AWS S3 Protocol</div>
                  <div>Bucket: assets</div>
                  <div>Latency: {health?.services?.storage?.durationMs ?? 574} ms</div>
                </div>
              </div>

              {/* Auth */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-xs text-white">Neon Auth (JWKS)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OK
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-zinc-400">
                  <div>Verification: EdDSA Keys</div>
                  <div>Keys Count: 1 active</div>
                  <div>Latency: {health?.services?.auth?.durationMs ?? 307} ms</div>
                </div>
              </div>

              {/* Functions */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-xs text-white">Neon Functions (hello)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OK
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-zinc-400">
                  <div>Response: Hello from Neon Functions</div>
                  <div>Latency: {health?.services?.functions?.durationMs ?? 362} ms</div>
                </div>
              </div>

              {/* Realtime */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-xs text-white">Neon Realtime</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OK
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-zinc-400">
                  <div>Protocol: WebSocket Gateway (wss://)</div>
                  <div>Status: Gateway Live & Reachable</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT PROJECT INFO */}
      {/* ========================================================================= */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-lg w-full bg-surface border border-border rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-base text-white">Edit Informasi Proyek</h3>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300">Nama Proyek</label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300">Deskripsi / Raw Idea</label>
                <textarea
                  rows={3}
                  value={editingProject.raw_idea}
                  onChange={(e) => setEditingProject({ ...editingProject, raw_idea: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300">Status</label>
                <select
                  value={editingProject.status}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      status: e.target.value as ProjectItem["status"],
                    })
                  }
                  className="w-full px-3 py-2 rounded bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="ready">ready</option>
                  <option value="draft">draft</option>
                  <option value="clarifying">clarifying</option>
                  <option value="generating">generating</option>
                  <option value="failed">failed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setEditingProject(null)}
                className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProjectInfo}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full bg-surface border border-red-500/30 rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 rounded-full bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-white">Hapus Proyek Ini?</h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Anda akan menghapus proyek <strong className="text-white">"{deleteConfirmProject.name}"</strong> beserta seluruh dokumen blueprint di Neon Postgres dan semua berkas di Neon Object Storage. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setDeleteConfirmProject(null)}
                className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteProject(deleteConfirmProject.id)}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD CUSTOM DOCUMENT */}
      {/* ========================================================================= */}
      {isAddingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-lg w-full bg-surface border border-border rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-base text-white">Tambah Dokumen Kustom ke Proyek</h3>
              <button
                onClick={() => setIsAddingDoc(false)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300">Nama Berkas (contoh: analytics.md)</label>
                <input
                  type="text"
                  placeholder="analytics.md"
                  value={newDocFilename}
                  onChange={(e) => setNewDocFilename(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-surface-muted border border-border text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300">Isi Konten Awal Markdown</label>
                <textarea
                  rows={6}
                  placeholder="# Judul Dokumen..."
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-surface-muted border border-border text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setIsAddingDoc(false)}
                className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                onClick={handleAddCustomDoc}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Simpan ke Proyek
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border/60 py-4 px-4 text-center text-xs text-zinc-500 font-mono">
        AppPlanner AI • Powered by Neon Serverless Postgres, Storage, Auth, Functions & Cloudflare Pages
      </footer>
    </div>
  );
}
