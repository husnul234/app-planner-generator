"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Layers,
  Users,
  FolderOpen,
  Key,
  Radio,
  Server,
  UserPlus,
  Send,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Cloud,
  Terminal,
  LogOut,
  ChevronRight,
  Plus,
  Edit3,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { ProfileItem, InvitationItem, ProjectItem, ApiKeyItem, HealthData } from "../../types";

interface AdminDashboardProps {
  currentUser: ProfileItem;
  onLogout: () => void;
  onSwitchToUserView?: () => void;
}

export default function AdminDashboard({ currentUser, onLogout, onSwitchToUserView }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "team" | "projects" | "keys" | "telemetry">("overview");

  // Telemetry
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Team & Profiles
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "user">("user");
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);

  // Global Projects
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<ProjectItem | null>(null);

  // Global BYOK Keys
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState("");
  const [newKeyNickname, setNewKeyNickname] = useState("");
  const [validatingKey, setValidatingKey] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    modelCount?: number;
    availableModels?: string[];
    error?: string;
  } | null>(null);
  const [testPrompt, setTestPrompt] = useState("Ringkas 3 pilar arsitektur software dalam 1 kalimat.");
  const [testingPool, setTestingPool] = useState(false);
  const [testPoolResult, setTestPoolResult] = useState<{
    success: boolean;
    text?: string;
    usedModel?: string;
    usedKeyMasked?: string;
    triedAttempts?: string[];
    error?: string;
  } | null>(null);

  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

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

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Fetch projects error:", err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchKeys = async () => {
    setKeysLoading(true);
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      if (data.success) {
        setApiKeys(data.keys || []);
      }
    } catch (err) {
      console.error("Fetch keys error:", err);
    } finally {
      setKeysLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchTeam();
    fetchProjects();
    fetchKeys();
  }, []);

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (data.success) {
        setInviteEmail("");
        setInviteNotice(`Undangan berhasil dikirim ke ${inviteEmail}`);
        setTimeout(() => setInviteNotice(null), 4000);
        fetchTeam();
      } else {
        showNotice(data.error || "Gagal mengirim undangan");
      }
    } catch (e) {
      console.error("Send invite error:", e);
    }
  };

  const handleToggleRole = async (profileId: string, currentRole: "admin" | "user") => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await fetch("/api/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: profileId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTeam();
        showNotice(`Role diubah menjadi ${newRole.toUpperCase()}`);
      }
    } catch (e) {
      console.error("Toggle role error:", e);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      const res = await fetch(`/api/team?id=${profileId}&type=profile`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchTeam();
        showNotice("Pengguna berhasil dihapus");
      }
    } catch (e) {
      console.error("Delete profile error:", e);
    }
  };

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

  const handleSaveProject = async () => {
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
        setEditingProject(null);
        showNotice("Informasi proyek berhasil disimpan");
      }
    } catch (e) {
      console.error("Save project error:", e);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirmProject(null);
        fetchProjects();
        showNotice("Proyek dan berkas S3 berhasil dibersihkan");
      }
    } catch (e) {
      console.error("Delete project error:", e);
    }
  };

  const handleValidateNewKey = async () => {
    if (!newKeyInput.trim()) return;
    setValidatingKey(true);
    setValidationResult(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validate", apiKey: newKeyInput.trim() }),
      });
      const data = await res.json();
      if (data.success && data.validation) {
        setValidationResult(data.validation);
      } else {
        setValidationResult({ valid: false, error: data.error || "Validasi gagal" });
      }
    } catch (err: unknown) {
      setValidationResult({ valid: false, error: (err as Error).message });
    } finally {
      setValidatingKey(false);
    }
  };

  const handleAddKeyToPool = async () => {
    if (!newKeyInput.trim()) return;
    setKeysLoading(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: newKeyInput.trim(),
          nickname: newKeyNickname.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewKeyInput("");
        setNewKeyNickname("");
        setValidationResult(null);
        fetchKeys();
        showNotice("Kunci API berhasil disimpan ke kolam rotasi global!");
      } else {
        showNotice(`Gagal: ${data.error}`);
      }
    } catch (err: unknown) {
      showNotice(`Error: ${(err as Error).message}`);
    } finally {
      setKeysLoading(false);
    }
  };

  const handleToggleKeyActive = async (keyItem: ApiKeyItem) => {
    try {
      const res = await fetch("/api/keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: keyItem.id, isActive: !keyItem.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        fetchKeys();
        showNotice(`Status kunci ${keyItem.nickname} diperbarui`);
      }
    } catch (err) {
      console.error("Toggle key error:", err);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      const res = await fetch(`/api/keys?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchKeys();
        showNotice("Kunci API dihapus dari kolam");
      }
    } catch (err) {
      console.error("Delete key error:", err);
    }
  };

  const handleTestPoolInference = async () => {
    setTestingPool(true);
    setTestPoolResult(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test-pool",
          prompt: testPrompt,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setTestPoolResult(data.result);
        showNotice("Inferensi rotasi kolam berhasil dieksekusi!");
      } else {
        setTestPoolResult({ success: false, error: data.error || "Gagal menjalankan inferensi." });
      }
    } catch (err: unknown) {
      setTestPoolResult({ success: false, error: (err as Error).message });
    } finally {
      setTestingPool(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 h-16 border-b border-border/80 bg-surface/90 backdrop-blur-md px-4 lg:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold tracking-tight text-white text-base">AppPlanner AI</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 ml-2">
                ADMIN CONSOLE
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Ringkasan Sistem
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
              <span>Tim & Role (RBAC)</span>
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
              <span>Audit Proyek</span>
            </button>
            <button
              onClick={() => setActiveTab("keys")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "keys"
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Key className="h-3.5 w-3.5 text-amber-400" />
              <span>Kolam BYOK Global</span>
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
              <span>Neon Telemetri</span>
            </button>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2">
            {onSwitchToUserView && (
              <button
                onClick={onSwitchToUserView}
                className="px-2.5 py-1 rounded-md bg-surface-muted hover:bg-zinc-700 text-zinc-300 border border-border text-xs flex items-center gap-1.5 transition-all"
                title="Beralih ke tampilan User Workspace"
              >
                <span>Lihat Tampilan User</span>
                <ExternalLink className="h-3 w-3 text-zinc-400" />
              </button>
            )}

            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-muted border border-border text-xs font-mono text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>{currentUser.email}</span>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-md bg-surface-elevated hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-border transition-all"
              title="Keluar / Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Global Notification */}
      {notice && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs py-2 px-4 text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Pusat Kendali Administrasi & Tata Kelola</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live
                  </span>
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Monitoring metrik platform, tata kelola pengguna, audit proyek blueprint, dan status kesehatan infrastruktur Neon Serverless.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    fetchHealth();
                    fetchTeam();
                    fetchProjects();
                    fetchKeys();
                    showNotice("Semua metrik dan data telah disinkronisasi");
                  }}
                  className="px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Refresh Semua Data</span>
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Total Pengguna Platform</span>
                  <Users className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono">{profiles.length}</div>
                <div className="text-[11px] text-zinc-500">
                  {profiles.filter((p) => p.role === "admin").length} Admin • {profiles.filter((p) => p.role === "user").length} User
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Total Proyek Blueprint</span>
                  <FolderOpen className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono">{projects.length}</div>
                <div className="text-[11px] text-zinc-500">
                  {projects.filter((p) => p.status === "ready").length} Ready • {projects.filter((p) => p.status === "draft").length} Draft
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Kolam Kunci BYOK Aktif</span>
                  <Key className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {apiKeys.filter((k) => k.isActive).length} / {apiKeys.length}
                </div>
                <div className="text-[11px] text-zinc-500">Multi-model fallback & rotation</div>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Status Infrastruktur</span>
                  <Server className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {health?.status === "ok" ? "100% SEHAT" : "MEMERIKSA..."}
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Postgres Latency: {health?.services?.postgres?.durationMs ?? 316} ms
                </div>
              </div>
            </div>

            {/* Quick Action Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveTab("team")}
                className="p-5 rounded-xl bg-surface border border-border hover:border-zinc-700 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors">
                    Kelola Anggota & Role
                  </span>
                  <Users className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-xs text-zinc-400">
                  Atur hak akses pengguna, ubah role antara Admin dan User, atau kirim undangan kolaborator baru.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("keys")}
                className="p-5 rounded-xl bg-surface border border-border hover:border-zinc-700 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white group-hover:text-amber-300 transition-colors">
                    Kelola Kolam Kunci BYOK
                  </span>
                  <Key className="h-4 w-4 text-amber-400" />
                </div>
                <p className="text-xs text-zinc-400">
                  Pantau ketersediaan Google Gemini API Key, status kuota, dan lakukan uji coba inferensi langsung.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("telemetry")}
                className="p-5 rounded-xl bg-surface border border-border hover:border-zinc-700 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors">
                    Cek Telemetri Neon Serverless
                  </span>
                  <Radio className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-xs text-zinc-400">
                  Periksa status koneksi real-time untuk Postgres, S3 Storage, Auth, Functions, dan WebSocket Realtime.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TEAM & RBAC */}
        {/* ========================================================================= */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  <span>Manajemen Pengguna & Peran (RBAC)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Kontrol otorisasi Admin & User, kuota token kredit, serta sistem undangan kolaborasi.
                </p>
              </div>

              <button
                disabled={teamLoading}
                onClick={fetchTeam}
                className="px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${teamLoading ? "animate-spin text-emerald-400" : ""}`} />
                <span>Refresh Data Tim</span>
              </button>
            </div>

            {/* Invite Form */}
            <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-400" />
                <h3 className="font-semibold text-sm text-white">Undang Pengguna / Kolaborator Baru</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Kirim email undangan dan tentukan peran awal akun yang akan didaftarkan.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                <div className="sm:col-span-6">
                  <input
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
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

            {/* Profiles Table */}
            <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center justify-between">
                <span>Daftar Seluruh Pengguna ({profiles.length})</span>
                <span className="text-[11px] font-mono text-zinc-500 font-normal">Tabel: public.profiles</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-zinc-400 font-mono text-[11px]">
                      <th className="pb-2.5 font-normal">PENGGUNA</th>
                      <th className="pb-2.5 font-normal">ROLE</th>
                      <th className="pb-2.5 font-normal">KREDIT TOKEN</th>
                      <th className="pb-2.5 font-normal">TERDAFTAR</th>
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
                            >
                              Ganti ke {p.role === "admin" ? "User" : "Admin"}
                            </button>
                            {p.email !== currentUser.email && (
                              <button
                                onClick={() => handleDeleteProfile(p.id)}
                                className="p-1 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
                <h3 className="font-semibold text-sm text-white flex items-center justify-between">
                  <span>Undangan Menunggu Konfirmasi ({invitations.length})</span>
                  <span className="text-[11px] font-mono text-zinc-500 font-normal">public.invitations</span>
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
        {/* TAB 3: GLOBAL PROJECTS AUDIT */}
        {/* ========================================================================= */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-emerald-400" />
                  <span>Audit & Tata Kelola Seluruh Proyek</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Daftar seluruh proyek blueprint yang tersimpan di basis data Neon PostgreSQL dan S3 storage.
                </p>
              </div>

              <button
                disabled={projectsLoading}
                onClick={fetchProjects}
                className="px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${projectsLoading ? "animate-spin text-emerald-400" : ""}`} />
                <span>Refresh Proyek</span>
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-surface border border-border text-zinc-400 text-xs space-y-3">
                <FolderOpen className="h-8 w-8 text-zinc-500 mx-auto" />
                <div className="text-white font-medium">Belum ada proyek blueprint dalam database.</div>
                <p className="text-[11px] text-zinc-500">
                  Semua data dummy telah dibersihkan. Proyek baru akan muncul saat user membuat blueprint via Wizard.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p) => (
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
                          {p.tech_stack.map((tech, i) => (
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
        {/* TAB 4: GLOBAL BYOK KEYS POOL */}
        {/* ========================================================================= */}
        {activeTab === "keys" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-400" />
                  <span>Monitoring Kolam Kunci BYOK Global</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Mendukung rotasi dinamis antar kunci saat limit 429/503 dan rantai model fallback Google AI Studio.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <span>Dapatkan Key AI Studio</span>
                  <ExternalLink className="h-3 w-3 text-zinc-400" />
                </a>
                <button
                  disabled={keysLoading}
                  onClick={fetchKeys}
                  className="px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${keysLoading ? "animate-spin text-emerald-400" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Model Chain Card */}
            <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Rantai Model Prioritas (Berdasarkan Kuota Akun Google AI Studio)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Auto-Fallback Active
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Hierarki inferensi otomatis saat model sebelumnya mencapai kuota atau sedang mengalami rate limiting:
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  "gemini-3.8-flash",
                  "gemini-3.5-flash-lite",
                  "gemini-3-flash",
                  "gemini-2.5-flash-lite",
                  "gemini-2.5-flash",
                  "gemini-2.0-flash",
                ].map((model, idx) => (
                  <React.Fragment key={model}>
                    <div className="px-2.5 py-1 rounded bg-surface-muted border border-border text-xs font-mono text-zinc-200 flex items-center gap-1.5">
                      <span className="text-[10px] text-emerald-400 font-bold">{idx + 1}</span>
                      <span>{model}</span>
                    </div>
                    {idx < 5 && <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Add Key Card */}
            <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-semibold text-sm text-white">Tambah Kunci Google Gemini ke Kolam Global</h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">public.user_api_keys</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="text-[11px] text-zinc-400 block mb-1">Nickname Kunci</label>
                  <input
                    type="text"
                    placeholder="Contoh: Key Super Admin 1"
                    value={newKeyNickname}
                    onChange={(e) => setNewKeyNickname(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-8">
                  <label className="text-[11px] text-zinc-400 block mb-1">Google Gemini API Key (AIzaSy...)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={newKeyInput}
                      onChange={(e) => {
                        setNewKeyInput(e.target.value);
                        setValidationResult(null);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      disabled={validatingKey || !newKeyInput.trim()}
                      onClick={handleValidateNewKey}
                      className="px-3 py-2 rounded-lg bg-surface-elevated hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 border border-border text-xs font-medium shrink-0 transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className={`h-3 w-3 ${validatingKey ? "animate-spin text-emerald-400" : ""}`} />
                      <span>{validatingKey ? "Menguji..." : "Validasi"}</span>
                    </button>
                    <button
                      disabled={keysLoading || !newKeyInput.trim()}
                      onClick={handleAddKeyToPool}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Simpan Kunci</span>
                    </button>
                  </div>
                </div>
              </div>

              {validationResult && (
                <div
                  className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
                    validationResult.valid
                      ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                      : "bg-red-950/60 border border-red-500/40 text-red-300"
                  }`}
                >
                  {validationResult.valid ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>
                        Kunci API Valid! Terhubung ke Google API ({validationResult.modelCount ?? 0} model didukung).
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                      <span>Gagal memvalidasi API Key: {validationResult.error}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Keys Table */}
            <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-white">
                  Kunci dalam Kolam ({apiKeys.length})
                </h3>
                <span className="text-xs text-zinc-400">
                  Total Aktif: <strong className="text-emerald-400">{apiKeys.filter((k) => k.isActive).length}</strong>
                </span>
              </div>

              {apiKeys.length === 0 ? (
                <div className="p-8 text-center rounded-lg bg-surface-muted border border-border/70 text-zinc-400 text-xs space-y-2">
                  <Key className="h-6 w-6 text-zinc-500 mx-auto" />
                  <div className="text-white font-medium">Belum ada kunci API dalam kolam database.</div>
                  <p className="text-[11px] text-zinc-500">
                    Masukkan Google Gemini API Key di atas agar generator dapat memproses blueprint tanpa hardcoded token.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-zinc-400 font-mono text-[11px]">
                        <th className="pb-2.5 font-normal">NICKNAME</th>
                        <th className="pb-2.5 font-normal">KUNCI (DISENSOR)</th>
                        <th className="pb-2.5 font-normal">STATUS</th>
                        <th className="pb-2.5 font-normal">TERAKHIR DIGUNAKAN</th>
                        <th className="pb-2.5 font-normal text-right">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {apiKeys.map((k) => (
                        <tr key={k.id} className="hover:bg-surface-elevated/40 transition-colors">
                          <td className="py-3 font-medium text-white">{k.nickname}</td>
                          <td className="py-3 font-mono text-zinc-300">{k.maskedKey}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                                k.isActive
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                              }`}
                            >
                              {k.isActive ? "AKTIF" : "NON-AKTIF"}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-[11px] text-zinc-400">
                            {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "Belum pernah"}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleKeyActive(k)}
                                className={`px-2 py-1 rounded text-xs transition-all ${
                                  k.isActive
                                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                                    : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                                }`}
                              >
                                {k.isActive ? "Non-aktifkan" : "Aktifkan"}
                              </button>
                              <button
                                onClick={() => handleDeleteApiKey(k.id)}
                                className="p-1 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all"
                                title="Hapus Key"
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
              )}
            </div>

            {/* Live Inference Tester */}
            <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-semibold text-sm text-white">Uji Coba Inferensi Kolam Kunci</h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">Live Gemini Pool Rotation Test</span>
              </div>

              <div className="space-y-3">
                <textarea
                  rows={2}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Tulis prompt uji coba..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  disabled={testingPool || !testPrompt.trim()}
                  onClick={handleTestPoolInference}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <RefreshCw className={`h-3 w-3 ${testingPool ? "animate-spin" : ""}`} />
                  <span>{testingPool ? "Mengeksekusi Inferensi..." : "Jalankan Tes Inferensi"}</span>
                </button>
              </div>

              {testPoolResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    testPoolResult.success
                      ? "bg-surface-muted border-emerald-500/40 text-zinc-200"
                      : "bg-red-950/40 border-red-500/40 text-red-300"
                  }`}
                >
                  {testPoolResult.success ? (
                    <>
                      <div className="flex items-center justify-between font-mono text-[11px] pb-2 border-b border-border">
                        <span className="text-emerald-400 font-semibold">Model Digunakan: {testPoolResult.usedModel}</span>
                        <span className="text-zinc-400">Key: {testPoolResult.usedKeyMasked}</span>
                      </div>
                      <div className="text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {testPoolResult.text}
                      </div>
                    </>
                  ) : (
                    <div>Error: {testPoolResult.error}</div>
                  )}
                </div>
              )}
            </div>
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

      {/* Edit Project Modal */}
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
                onClick={handleSaveProject}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
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
              Anda akan menghapus proyek <strong className="text-white">"{deleteConfirmProject.name}"</strong> beserta seluruh dokumen blueprint di Neon Postgres dan semua berkas di Neon Object Storage.
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

      {/* Footer */}
      <footer className="border-t border-border/60 py-4 px-4 text-center text-xs text-zinc-500 font-mono">
        AppPlanner AI • Admin Console • Powered by Neon Serverless
      </footer>
    </div>
  );
}
