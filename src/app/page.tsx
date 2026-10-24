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
  ExternalLink,
  ChevronRight,
  ShieldAlert,
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

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"workspace" | "wizard" | "telemetry" | "history">("workspace");
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Wizard State
  const [wizardStep, setWizardStep] = useState(1);
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

  // Generated Documents State
  const [documents, setDocuments] = useState(() => {
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

  // Neon Health Telemetry State
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Saved Projects History State
  const [savedProjects, setSavedProjects] = useState<any[]>([]);

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
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setSavedProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Fetch projects error:", err);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchProjects();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...meta, saveToDatabase: true }),
      });
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
        setSaveStatus("Tersimpan di Neon Postgres & Object Storage");
        setActiveTab("workspace");
        fetchProjects();
        fetchHealth();
      }
    } catch (err) {
      console.error("Generation error:", err);
      setSaveStatus("Gagal menyimpan ke database");
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
    const folder = zip.folder(meta.appName.toLowerCase().replace(/[^a-z0-9]+/g, "-")) || zip;
    documents.forEach((doc) => {
      folder.file(doc.filename, doc.content);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${meta.appName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-blueprint.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeDoc = documents[selectedDocIndex] || documents[0];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* 1. Header Navigation Bar (Single line, 64px height, high taste) */}
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
          <nav className="flex items-center gap-1 sm:gap-2">
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
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                activeTab === "history"
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              History
            </button>
          </nav>

          {/* Health Status Pill */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-muted border border-border text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-300">Neon: production</span>
            </div>
            <button
              onClick={handleDownloadZip}
              className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Export ZIP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* TAB 1: WORKSPACE PREVIEW & DOCUMENT VIEWER */}
        {activeTab === "workspace" && (
          <div className="space-y-6">
            {/* Top Workspace Header Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{meta.appName}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-normal">
                    Ready
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">{meta.tagline}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
                >
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Tersalin" : "Salin Dokumen"}</span>
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
                  <span>Unduh ZIP (11 Berkas)</span>
                </button>
              </div>
            </div>

            {saveStatus && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>{saveStatus}</span>
                </div>
                <span className="text-zinc-400 text-[11px] font-mono">Neon Postgres + S3 Bucket</span>
              </div>
            )}

            {/* Grid Layout: Left Document Index & Right Markdown Reader */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: 11 Document Selector List */}
              <div className="lg:col-span-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-1 mb-2">
                  Daftar 11 Dokumen Blueprint
                </div>
                <div className="space-y-1.5">
                  {documents.map((doc, idx) => {
                    const isSelected = selectedDocIndex === idx;
                    return (
                      <button
                        key={doc.filename}
                        onClick={() => setSelectedDocIndex(idx)}
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
                            <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{doc.title}</div>
                          </div>
                        </div>
                        <ChevronRight className={`h-4 w-4 shrink-0 mt-1 ${isSelected ? "text-emerald-400" : "text-zinc-600"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Active Document Content Viewer */}
              <div className="lg:col-span-8 flex flex-col rounded-xl bg-surface border border-border overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-surface-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-400" />
                    <span className="font-mono text-xs font-semibold text-white">{activeDoc.filename}</span>
                    <span className="text-zinc-500 text-xs">•</span>
                    <span className="text-xs text-zinc-400">{activeDoc.title}</span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400">
                    {activeDoc.content.split(/\s+/).filter(Boolean).length} kata
                  </div>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto max-h-[640px] font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/30">
                  {activeDoc.content}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE 7-STEP WIZARD */}
        {activeTab === "wizard" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-4 rounded-xl bg-surface border border-border">
              <h2 className="text-xl font-bold tracking-tight text-white">Wizard Perencanaan Arsitektur 7-Tahap</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Kustomisasi parameter sebelum menghasilkan 11 dokumen blueprint terstandarisasi.
              </p>

              {/* Steps Progress Bar */}
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

              {/* Wizard Navigation Buttons */}
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

        {/* TAB 3: NEON INFRASTRUCTURE TELEMETRY */}
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
                className="px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${healthLoading ? "animate-spin text-emerald-400" : ""}`} />
                <span>{healthLoading ? "Memeriksa..." : "Refresh Status"}</span>
              </button>
            </div>

            {/* Service Health Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1: Postgres */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-xs text-white">Neon PostgreSQL</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      health?.services?.postgres?.status === "ok"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {health?.services?.postgres?.status?.toUpperCase() || "CHECKING"}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-zinc-400">
                  <div>Driver: @neondatabase/serverless</div>
                  <div>Latency: {health?.services?.postgres?.durationMs ?? "-"} ms</div>
                  <div>Branch: production (pooled)</div>
                </div>
              </div>

              {/* Card 2: Object Storage */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-xs text-white">Neon Object Storage</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      health?.services?.storage?.status === "ok"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {health?.services?.storage?.status?.toUpperCase() || "CHECKING"}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-zinc-400">
                  <div>API: AWS S3 Protocol</div>
                  <div>Bucket: assets</div>
                  <div>Latency: {health?.services?.storage?.durationMs ?? "-"} ms</div>
                </div>
              </div>

              {/* Card 3: Auth */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-xs text-white">Neon Auth (JWKS)</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      health?.services?.auth?.status === "ok"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {health?.services?.auth?.status?.toUpperCase() || "CHECKING"}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-zinc-400">
                  <div>Verification: EdDSA Keys</div>
                  <div>Keys Count: {health?.services?.auth?.keysCount ?? 1}</div>
                  <div>Latency: {health?.services?.auth?.durationMs ?? "-"} ms</div>
                </div>
              </div>

              {/* Card 4: Functions */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-xs text-white">Neon Functions (hello)</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      health?.services?.functions?.status === "ok"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {health?.services?.functions?.status?.toUpperCase() || "CHECKING"}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-zinc-400">
                  <div>Response: {health?.services?.functions?.output || "Hello from Neon Functions"}</div>
                  <div>Latency: {health?.services?.functions?.durationMs ?? "-"} ms</div>
                </div>
              </div>

              {/* Card 5: Realtime */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-xs text-white">Neon Realtime</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      health?.services?.realtime?.status === "ok"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {health?.services?.realtime?.status?.toUpperCase() || "CHECKING"}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-zinc-400">
                  <div>Protocol: WebSocket (wss://)</div>
                  <div>Status: Connected / Gateway Live</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROJECT HISTORY FROM NEON POSTGRES */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-surface border border-border">
              <h2 className="text-xl font-bold tracking-tight text-white">Riwayat Proyek Blueprint (Neon Postgres)</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Data master proyek yang disimpan di tabel public.projects di database Neon.
              </p>
            </div>

            {savedProjects.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-surface border border-border text-zinc-400 text-xs">
                Belum ada proyek yang tersimpan. Gunakan Wizard 7-Tahap untuk membuat blueprint pertama Anda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedProjects.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-surface border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-white">{p.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">{p.raw_idea}</p>
                    <div className="text-[11px] font-mono text-zinc-500 pt-2 border-t border-border/50 flex items-center justify-between">
                      <span>ID: {p.id.slice(0, 8)}...</span>
                      <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-4 px-4 text-center text-xs text-zinc-500 font-mono">
        AppPlanner AI • Powered by Neon Serverless Postgres, Storage, Auth, Functions & Cloudflare Pages
      </footer>
    </div>
  );
}
