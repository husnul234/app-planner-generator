"use client";

import React, { useState } from "react";
import { Layers, Shield, User, ArrowRight, Sparkles, Key, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { ProfileItem } from "../../types";

interface AuthPageProps {
  onLoginSuccess: (user: ProfileItem) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick 1-Click Login
  const handleQuickLogin = async (targetRole: "admin" | "user") => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "quick-login", role: targetRole }),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        onLoginSuccess(data.profile);
      } else {
        setErrorMsg(data.error || "Gagal melakukan login cepat");
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Form Submit (Login / Register)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Email wajib diisi");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: authMode,
          email: email.trim(),
          password,
          fullName: fullName.trim() || undefined,
          role: authMode === "register" ? role : undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        onLoginSuccess(data.profile);
      } else {
        setErrorMsg(data.error || "Proses autentikasi gagal");
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground selection:bg-emerald-500/30">
      {/* Top Brand Bar */}
      <header className="h-16 border-b border-border/80 bg-surface/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold tracking-tight text-white text-base">AppPlanner AI</span>
            <span className="text-xs text-zinc-400 ml-2 font-mono hidden sm:inline-block">Pre-Development Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400">Neon Auth & Serverless DB</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full space-y-6">
          {/* Headline */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {authMode === "login" ? "Masuk ke AppPlanner" : "Daftar Akun Baru"}
            </h1>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Platform perencanaan arsitektur otomatis dan generator 11 dokumen blueprint dengan isolasi peran Admin & User.
            </p>
          </div>

          {/* Quick 1-Click Access Cards */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider text-center">
              Akses Cepat (Simulasi Role Terisolasi)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin("admin")}
                className="p-3.5 rounded-xl bg-surface border border-border hover:border-amber-500/50 hover:bg-surface-elevated transition-all text-left flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                    Super Admin
                  </span>
                  <Shield className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-[11px] text-zinc-400 mt-1 font-mono">admin@appplanner.ai</div>
                <div className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                  <span>Buka Admin Console</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin("user")}
                className="p-3.5 rounded-xl bg-surface border border-border hover:border-emerald-500/50 hover:bg-surface-elevated transition-all text-left flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    Indie Developer
                  </span>
                  <User className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-[11px] text-zinc-400 mt-1 font-mono">user@appplanner.ai</div>
                <div className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                  <span>Buka User Workspace</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-3 text-[11px] font-mono text-zinc-500 uppercase">
              atau gunakan email
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Form Card */}
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-xl space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-lg bg-surface-muted border border-border">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setErrorMsg(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  authMode === "login"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setErrorMsg(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  authMode === "register"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Daftar
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 font-mono">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authMode === "register" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-300">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Budi Santoso"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-300">Alamat Email</label>
                <input
                  type="email"
                  required
                  placeholder="anda@perusahaan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-white text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-300">Kata Sandi</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-white text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {authMode === "register" && (
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-medium text-zinc-300">Pilih Tipe Peran (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as "user" | "admin")}
                    className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="user">User / Developer (Workspace & Projects)</option>
                    <option value="admin">Admin (System Governance & Telemetry)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-40 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Memproses Autentikasi...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === "login" ? "Masuk ke Dashboard" : "Buat Akun Sekarang"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Supported AI Models Showcase Badge */}
          <div className="p-4 rounded-xl bg-surface border border-border space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Model AI yang Didukung Saat Ini</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                BYOK Pool Ready
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              AppPlanner mendukung rotasi multi-key dengan model prioritas Google AI Studio:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {[
                { name: "Gemini 3.8 Flash", badge: "Prioritas", color: "text-emerald-400 border-emerald-500/30" },
                { name: "Gemini 3.5 Flash Lite", badge: "Lite", color: "text-emerald-400 border-emerald-500/30" },
                { name: "Gemini 3 Flash", badge: "Text-out", color: "text-zinc-300 border-zinc-700" },
                { name: "Gemini 2.5 Flash Lite", badge: "Fast", color: "text-zinc-300 border-zinc-700" },
                { name: "Gemini 2.5 Flash", badge: "Stable", color: "text-zinc-300 border-zinc-700" },
                { name: "Gemini 2.0 Flash", badge: "Legacy", color: "text-zinc-400 border-zinc-700" },
              ].map((m) => (
                <span
                  key={m.name}
                  className={`text-[10px] font-mono px-2 py-1 rounded bg-surface-muted border ${m.color} flex items-center gap-1`}
                >
                  <span className="font-medium text-white">{m.name}</span>
                  <span className="text-[9px] opacity-70">({m.badge})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-4 px-4 text-center text-xs text-zinc-500 font-mono">
        AppPlanner AI • Neon Serverless Postgres, Storage S3, Auth & Functions
      </footer>
    </div>
  );
}
