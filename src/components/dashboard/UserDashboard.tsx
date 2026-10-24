"use client";

import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import {
  FileText,
  Layers,
  Sparkles,
  Key,
  Archive,
  RefreshCw,
  ChevronRight,
  FolderOpen,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  Edit3,
  Copy,
  Download,
  Trash2,
  LogOut,
  ExternalLink,
  Mic,
  MicOff,
  ListTodo,
  CheckSquare,
  Terminal,
  ArrowRight,
  Code2,
  Calculator,
  Sliders,
} from "lucide-react";
import { ProfileItem, ProjectItem, DocItem, ApiKeyItem, ProjectMeta, TaskExecutionItem } from "../../types";
import { ARCHITECTURE_PRESETS, ArchitecturePreset } from "../../lib/generator/templates";
import ProjectCostEstimator from "./ProjectCostEstimator";

interface UserDashboardProps {
  currentUser: ProfileItem;
  onLogout: () => void;
}

export default function UserDashboard({ currentUser, onLogout }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<"workspace" | "projects" | "wizard" | "keys" | "cost">("workspace");
  const [workspaceView, setWorkspaceView] = useState<"docs" | "tasks" | "cost">("docs");

  // Speech-to-Text State (NgodingPakeAI Voice Input)
  const [isListening, setIsListening] = useState(false);
  const [speechTarget, setSpeechTarget] = useState<"problem" | "tagline" | null>(null);

  // Task Runner State
  const [taskFilterPhase, setTaskFilterPhase] = useState("all");
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [expandedTaskPrompts, setExpandedTaskPrompts] = useState<Record<string, boolean>>({});

  // Projects & Documents State (NO DUMMY DATA)
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectItem | null>(null);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [editedDocContent, setEditedDocContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocFilename, setNewDocFilename] = useState("");
  const [newDocContent, setNewDocContent] = useState("");

  // Projects CRUD Modals
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<ProjectItem | null>(null);

  // Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [meta, setMeta] = useState<ProjectMeta>({
    appName: "",
    category: "SaaS Web Platform",
    tagline: "",
    problem: "",
    targetAudience: "Engineering Teams & Developers",
    coreFeatures: ["Autentikasi Pengguna & Role", "Generator Arsitektur Terpadu", "Ekspor Markdown & ZIP"],
    techStack: ["Next.js 15", "Neon PostgreSQL", "Neon Object Storage", "TailwindCSS"],
    dbType: "Neon PostgreSQL (@neondatabase/serverless)",
    selectedModel: "Google Gemini 3.8 Flash",
  });

  // Personal BYOK Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState("");
  const [newKeyNickname, setNewKeyNickname] = useState("");
  const [validatingKey, setValidatingKey] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    modelCount?: number;
    error?: string;
  } | null>(null);
  const [testPrompt, setTestPrompt] = useState("Jelaskan 3 pilar arsitektur software yang scalable.");
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

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        const list = data.projects || [];
        setProjects(list);
        if (list.length > 0 && !currentProject) {
          handleOpenProject(list[0]);
        }
      }
    } catch (e) {
      console.error("Fetch projects error:", e);
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
    } catch (e) {
      console.error("Fetch keys error:", e);
    } finally {
      setKeysLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchKeys();
  }, []);

  const handleOpenProject = async (p: ProjectItem) => {
    setCurrentProject(p);
    try {
      const res = await fetch(`/api/projects/${p.id}`);
      const data = await res.json();
      if (data.success && data.documents) {
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

  const handleSaveDocEdit = async () => {
    const activeDoc = documents[selectedDocIndex];
    if (!activeDoc || !currentProject) return;
    try {
      if (activeDoc.id) {
        const res = await fetch(`/api/projects/${currentProject.id}/documents`, {
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
          updated[selectedDocIndex] = { ...activeDoc, content: editedDocContent };
          setDocuments(updated);
          setIsEditingDoc(false);
          showNotice(`Perubahan ${activeDoc.filename} tersimpan di Postgres & S3`);
          return;
        }
      }
      const updated = [...documents];
      updated[selectedDocIndex] = { ...activeDoc, content: editedDocContent };
      setDocuments(updated);
      setIsEditingDoc(false);
      showNotice("Dokumen diperbarui");
    } catch (e) {
      console.error("Save doc edit error:", e);
    }
  };

  const handleAddCustomDoc = async () => {
    if (!newDocFilename.trim() || !currentProject) return;
    const filename = newDocFilename.endsWith(".md") ? newDocFilename : `${newDocFilename}.md`;
    const content = newDocContent.trim() || `# ${filename}\n\nDokumen kustom baru.`;

    try {
      const res = await fetch(`/api/projects/${currentProject.id}/documents`, {
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
        showNotice(`Dokumen "${filename}" ditambahkan ke proyek`);
      }
    } catch (e) {
      console.error("Add doc error:", e);
    }
  };

  const handleRABDocumentSaved = (doc: DocItem) => {
    const existingIdx = documents.findIndex((d) => d.filename.toLowerCase() === doc.filename.toLowerCase());
    if (existingIdx >= 0) {
      const updated = [...documents];
      updated[existingIdx] = doc;
      setDocuments(updated);
    } else {
      setDocuments([...documents, doc]);
    }
  };

  const handleOpenWorkspaceDoc = (filename: string) => {
    const idx = documents.findIndex((d) => d.filename.toLowerCase() === filename.toLowerCase());
    if (idx >= 0) {
      setSelectedDocIndex(idx);
      setWorkspaceView("docs");
      setActiveTab("workspace");
    }
  };

  const handleCopySingle = () => {
    const activeDoc = documents[selectedDocIndex];
    if (!activeDoc) return;
    navigator.clipboard.writeText(activeDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const activeDoc = documents[selectedDocIndex];
    if (!activeDoc) return;
    const blob = new Blob([activeDoc.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = activeDoc.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    if (documents.length === 0) return;
    const zip = new JSZip();
    const folderName = (currentProject?.name || "blueprint").toLowerCase().replace(/[^a-z0-9]+/g, "-");
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

  const handleCopyAiBundle = () => {
    if (documents.length === 0) return;
    const bundleHeader = `# AI CONTEXT MASTER BUNDLE: ${(currentProject?.name || "PROJECT").toUpperCase()}\n` +
      `# Generated by AppPlanner AI (11 Complete Pre-Development Specifications)\n` +
      `# Instructions for AI (Cursor / Claude / Antigravity / Windsurf):\n` +
      `# Gunakan 11 dokumen spesifikasi arsitektur di bawah ini sebagai SINGLE SOURCE OF TRUTH.\n` +
      `# Dilarang mengubah nama kolom database atau kontrak API tanpa memperbarui dokumen ini.\n\n` +
      `================================================================================\n\n`;

    const bundleBody = documents
      .map(
        (doc, i) =>
          `################################################################################\n` +
          `### DOKUMEN ${i + 1}/${documents.length}: ${doc.filename}\n` +
          `### Deskripsi: ${doc.title || doc.filename}\n` +
          `################################################################################\n\n` +
          doc.content.trim() +
          `\n\n`
      )
      .join("\n");

    navigator.clipboard.writeText(bundleHeader + bundleBody);
    showNotice(`AI Context Master Bundle (${documents.length} Berkas) tersalin ke clipboard!`);
  };

  // Speech-to-Text Voice Input Handler (NgodingPakeAI Voice Input)
  const handleStartSpeech = (targetField: "problem" | "tagline") => {
    if (typeof window === "undefined") return;
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showNotice("Browser Anda belum mendukung Web Speech API. Silakan input teks secara langsung.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "id-ID";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTarget(targetField);
        showNotice("🎤 Mendengarkan suara Anda... Silakan berbicara.");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (targetField === "problem") {
          setMeta((prev) => ({
            ...prev,
            problem: prev.problem ? `${prev.problem} ${transcript}` : transcript,
          }));
        } else if (targetField === "tagline") {
          setMeta((prev) => ({
            ...prev,
            tagline: prev.tagline ? `${prev.tagline} ${transcript}` : transcript,
          }));
        }
        showNotice(`✓ Teks berhasil didengar: "${transcript}"`);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setSpeechTarget(null);
        if (event.error === "not-allowed") {
          showNotice("Akses mikrofon ditolak oleh browser.");
        } else {
          showNotice(`Perekaman suara selesai (${event.error})`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setSpeechTarget(null);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setSpeechTarget(null);
    }
  };

  // Preset Selection Handler
  const handleSelectPreset = (preset: ArchitecturePreset) => {
    setMeta({ ...preset.meta });
    showNotice(`✓ Template codebase "${preset.name}" berhasil dimuat!`);
  };

  // Parse tasks.md into TaskExecutionItem[]
  const parseTasksFromMarkdown = (content: string): TaskExecutionItem[] => {
    if (!content) return [];
    const lines = content.split("\n");
    const tasks: TaskExecutionItem[] = [];
    let currentTask: TaskExecutionItem | null = null;
    let currentPhase = "Umum";
    let inPromptBlock = false;
    let promptLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith("## Fase ") || line.startsWith("## Phase ")) {
        currentPhase = line.replace(/^##\s*/, "").trim();
        continue;
      }

      const taskMatch = line.match(/^###\s*\[([ xX])\]\s*(TASK-\d+):\s*(.+)$/);
      if (taskMatch) {
        if (currentTask) {
          if (promptLines.length > 0) {
            currentTask.aiPrompt = promptLines.join("\n").trim();
          }
          tasks.push(currentTask);
        }

        currentTask = {
          id: taskMatch[2],
          completed: taskMatch[1].toLowerCase() === "x",
          title: taskMatch[3].trim(),
          phase: currentPhase,
          category: "General",
          targetFiles: [],
          description: "",
          aiPrompt: "",
          acceptanceCriteria: "",
        };
        promptLines = [];
        inPromptBlock = false;
        continue;
      }

      if (currentTask) {
        if (line.startsWith("```markdown")) {
          inPromptBlock = true;
          continue;
        }
        if (inPromptBlock && line.startsWith("```")) {
          inPromptBlock = false;
          continue;
        }
        if (inPromptBlock) {
          promptLines.push(line);
          continue;
        }

        if (line.startsWith("- **Kategori:**")) {
          currentTask.category = line.replace("- **Kategori:**", "").trim();
        } else if (line.startsWith("- **File Target:**")) {
          currentTask.targetFiles = line
            .replace("- **File Target:**", "")
            .split(",")
            .map((f) => f.replace(/[`*]/g, "").trim());
        } else if (line.startsWith("- **Deskripsi:**")) {
          currentTask.description = line.replace("- **Deskripsi:**", "").trim();
        } else if (line.startsWith("- **Kriteria Selesai:**")) {
          currentTask.acceptanceCriteria = line.replace("- **Kriteria Selesai:**", "").trim();
        }
      }
    }

    if (currentTask) {
      if (promptLines.length > 0) {
        currentTask.aiPrompt = promptLines.join("\n").trim();
      }
      tasks.push(currentTask);
    }

    return tasks;
  };

  // Toggle Task Completion in tasks.md document
  const handleToggleTask = async (taskId: string) => {
    const tasksDocIndex = documents.findIndex((d) => d.filename === "tasks.md");
    if (tasksDocIndex === -1) {
      showNotice("File tasks.md belum ditemukan di proyek ini.");
      return;
    }

    const tasksDoc = documents[tasksDocIndex];
    let content = tasksDoc.content;

    const uncheckedRegex = new RegExp(`###\\s*\\[ \\]\\s*${taskId}:`);
    const checkedRegex = new RegExp(`###\\s*\\[[xX]\\]\\s*${taskId}:`);

    let newStatusIsDone = false;
    if (uncheckedRegex.test(content)) {
      content = content.replace(uncheckedRegex, `### [x] ${taskId}:`);
      newStatusIsDone = true;
    } else if (checkedRegex.test(content)) {
      content = content.replace(checkedRegex, `### [ ] ${taskId}:`);
      newStatusIsDone = false;
    } else {
      return;
    }

    const updatedDocs = [...documents];
    updatedDocs[tasksDocIndex] = { ...tasksDoc, content };
    setDocuments(updatedDocs);

    showNotice(`Task ${taskId} ditandai ${newStatusIsDone ? "SELESAI ✓" : "BELUM SELESAI"}`);

    if (currentProject && tasksDoc.id) {
      try {
        await fetch(`/api/projects/${currentProject.id}/documents`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            docId: tasksDoc.id,
            filename: tasksDoc.filename,
            content,
          }),
        });
      } catch (err) {
        console.error("Auto-sync task status error:", err);
      }
    }
  };

  // Copy Task Prompt to Clipboard
  const handleCopyTaskPrompt = (task: TaskExecutionItem) => {
    const promptText = `# TASK EXECUTION PROMPT: ${task.id} - ${task.title}\n` +
      `# Target Project: ${currentProject?.name || meta.appName}\n` +
      `# Phase: ${task.phase} | Category: ${task.category}\n` +
      (task.targetFiles.length > 0 ? `# Target Files: ${task.targetFiles.join(", ")}\n` : "") +
      `# Instructions for AI Coding Agent (Cursor / Claude / Antigravity / Windsurf):\n\n` +
      `${task.aiPrompt || task.description}\n\n` +
      (task.acceptanceCriteria ? `## Kriteria Keberhasilan:\n${task.acceptanceCriteria}\n` : "");

    navigator.clipboard.writeText(promptText);
    setCopiedTaskId(task.id);
    showNotice(`✓ Prompt ${task.id} tersalin! Tempelkan ke AI coding agent Anda.`);
    setTimeout(() => setCopiedTaskId(null), 3000);
  };

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
        if (currentProject?.id === editingProject.id) {
          setCurrentProject(editingProject);
        }
        setEditingProject(null);
        showNotice("Informasi proyek diperbarui");
      }
    } catch (e) {
      console.error("Update project error:", e);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirmProject(null);
        if (currentProject?.id === id) {
          setCurrentProject(null);
          setDocuments([]);
        }
        fetchProjects();
        showNotice("Proyek dan berkas storage berhasil dihapus");
      }
    } catch (e) {
      console.error("Delete project error:", e);
    }
  };

  // Generate Blueprint via Wizard
  const handleGenerateBlueprint = async () => {
    if (!meta.appName.trim()) {
      showNotice("Silakan isi nama aplikasi terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...meta, saveToDatabase: true, userId: currentUser.id }),
      });
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
        const newProj: ProjectItem = {
          id: data.projectId,
          name: meta.appName,
          slug: meta.appName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          raw_idea: meta.problem,
          tech_stack: meta.techStack,
          status: "ready",
          total_tokens_used: data.aiMetrics?.tokensEstimate || 1200,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCurrentProject(newProj);
        setActiveTab("workspace");
        setSelectedDocIndex(0);
        fetchProjects();
        showNotice("11 Dokumen Blueprint berhasil disusun dan disimpan di Neon Postgres!");
      } else {
        showNotice(data.error || "Gagal menyusun dokumen");
      }
    } catch (err: unknown) {
      showNotice(`Error: ${(err as Error).message}`);
    } finally {
      setIsGenerating(false);
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
          userId: currentUser.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewKeyInput("");
        setNewKeyNickname("");
        setValidationResult(null);
        fetchKeys();
        showNotice("Kunci API berhasil disimpan ke kolam rotasi!");
      } else {
        showNotice(`Gagal menyimpan: ${data.error}`);
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
        showNotice(`Kunci ${keyItem.nickname} diperbarui`);
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
        showNotice("Kunci API dihapus");
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
        body: JSON.stringify({ action: "test-pool", prompt: testPrompt }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setTestPoolResult(data.result);
        showNotice("Tes inferensi berhasil!");
      } else {
        setTestPoolResult({ success: false, error: data.error || "Gagal mengeksekusi inferensi." });
      }
    } catch (err: unknown) {
      setTestPoolResult({ success: false, error: (err as Error).message });
    } finally {
      setTestingPool(false);
    }
  };

  const activeDoc = documents[selectedDocIndex];

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.raw_idea.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 h-16 border-b border-border/80 bg-surface/90 backdrop-blur-md px-4 lg:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold tracking-tight text-white text-base">AppPlanner AI</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-2">
                WORKSPACE
              </span>
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
              <span>Proyek Saya ({projects.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("wizard")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "wizard"
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Wizard 7-Tahap</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("cost");
                setWorkspaceView("cost");
              }}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "cost"
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Calculator className="h-3.5 w-3.5 text-blue-400" />
              <span>Kalkulator Biaya (RAB)</span>
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
              <span>Kunci BYOK</span>
            </button>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-muted border border-border text-xs font-mono text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{currentUser.email}</span>
              <span className="text-zinc-500">•</span>
              <span className="text-emerald-400">{currentUser.credits_remaining} token</span>
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: WORKSPACE & INLINE EDITOR */}
        {/* ========================================================================= */}
        {activeTab === "workspace" && (
          <div className="space-y-6">
            {!currentProject || documents.length === 0 ? (
              // ZERO DUMMY DATA EMPTY STATE
              <div className="p-12 sm:p-16 rounded-2xl bg-surface border border-border text-center space-y-5 shadow-sm max-w-2xl mx-auto my-8">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-white">Belum Ada Proyek Blueprint</h2>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Ubah ide mentah Anda menjadi 11 dokumen spesifikasi teknis terpadu (PRD, Arsitektur, Skema PostgreSQL, Wireframes, dan API Spec) dalam hitungan detik.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveTab("wizard")}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Mulai Wizard 7-Tahap</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("keys")}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <Key className="h-4 w-4 text-amber-400" />
                    <span>Atur Kunci BYOK Gemini</span>
                  </button>
                </div>

                {/* Architecture Template Presets (NgodingPakeAI Adaptation) */}
                <div className="pt-5 border-t border-border/60 text-left">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Code2 className="h-4 w-4 text-emerald-400" />
                      <span>Pilih Template Codebase Siap Pakai</span>
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">5 Preset Produksi</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ARCHITECTURE_PRESETS.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => {
                          handleSelectPreset(preset);
                          setActiveTab("wizard");
                        }}
                        className="p-3 rounded-xl bg-surface-muted hover:bg-surface-elevated border border-border/70 hover:border-emerald-500/40 cursor-pointer transition-all text-left space-y-1.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {preset.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {preset.description}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 pt-0.5 font-medium">
                          <span>Gunakan template</span>
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // ACTIVE PROJECT WORKSPACE
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <span>{currentProject.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-normal">
                        Ready
                      </span>
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1">{currentProject.raw_idea}</p>
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
                      onClick={handleCopyAiBundle}
                      className="px-3 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                      title="Gabungkan seluruh 11 dokumen menjadi 1 prompt master untuk Cursor / Claude / Antigravity"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Bundle Prompt AI</span>
                    </button>
                    <button
                      onClick={handleCopySingle}
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

                {/* Workspace View Mode Selector (Dokumen vs AI Task Runner) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWorkspaceView("docs")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        workspaceView === "docs"
                          ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Dokumen Blueprint ({documents.length})</span>
                    </button>
                    <button
                      onClick={() => setWorkspaceView("tasks")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        workspaceView === "tasks"
                          ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <ListTodo className="h-3.5 w-3.5 text-amber-400" />
                      <span>AI Task Runner (Ngoding Mode)</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                        CLI Ready
                      </span>
                    </button>
                    <button
                      onClick={() => setWorkspaceView("cost")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        workspaceView === "cost"
                          ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Calculator className="h-3.5 w-3.5 text-blue-400" />
                      <span>Kalkulator Biaya (RAB)</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                        Estimator
                      </span>
                    </button>
                  </div>

                  <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Eksekusi Terminal:</span>
                    <code
                      onClick={() => {
                        navigator.clipboard.writeText("node scripts/cli.js next");
                        showNotice("Perintah CLI 'node scripts/cli.js next' disalin ke clipboard!");
                      }}
                      className="px-2 py-0.5 rounded bg-surface-muted text-emerald-400 font-mono cursor-pointer hover:bg-zinc-800 border border-border"
                      title="Klik untuk salin perintah"
                    >
                      node scripts/cli.js next
                    </code>
                  </div>
                </div>

                {workspaceView === "cost" ? (
                  <ProjectCostEstimator
                    currentProject={currentProject}
                    currentUser={currentUser}
                    documents={documents}
                    onDocumentSaved={handleRABDocumentSaved}
                    onNotice={showNotice}
                    onOpenWorkspaceDoc={handleOpenWorkspaceDoc}
                  />
                ) : workspaceView === "tasks" ? (
                  /* ========================================================================= */
                  /* AI TASK RUNNER VIEW (NGODING PAKE AI ADAPTATION)                          */
                  /* ========================================================================= */
                  <div className="space-y-6">
                    {(() => {
                      const tasksDoc = documents.find((d) => d.filename === "tasks.md");
                      const allTasks = tasksDoc ? parseTasksFromMarkdown(tasksDoc.content) : [];
                      const completedCount = allTasks.filter((t) => t.completed).length;
                      const progressPct = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;
                      const phases = ["all", ...Array.from(new Set(allTasks.map((t) => t.phase)))];
                      const displayedTasks =
                        taskFilterPhase === "all"
                          ? allTasks
                          : allTasks.filter((t) => t.phase === taskFilterPhase);

                      if (allTasks.length === 0) {
                        return (
                          <div className="p-8 rounded-xl bg-surface border border-border text-center space-y-4">
                            <ListTodo className="h-8 w-8 text-amber-400 mx-auto" />
                            <h3 className="text-base font-semibold text-white">Berkas tasks.md Belum Tersedia di Proyek Ini</h3>
                            <p className="text-xs text-zinc-400 max-w-md mx-auto">
                              Tambahkan dokumen tasks.md untuk mengaktifkan AI Task Runner yang membagi arsitektur menjadi langkah coding siap pakai.
                            </p>
                            <button
                              onClick={() => {
                                setNewDocFilename("tasks.md");
                                setNewDocContent(`# Actionable AI Execution Tasks: ${currentProject.name}\n\n## Fase 1: Fondasi Skema Database & Storage\n### [ ] TASK-01: Migrasi DDL Tabel PostgreSQL Neon\n- **Kategori:** Database\n- **File Target:** scripts/migrate.js, src/lib/neon/db.ts\n- **Deskripsi:** Siapkan tabel utama sesuai database_schema.md.\n- **Prompt Eksekusi AI:\n\`\`\`markdown\nBertindaklah sebagai Database Engineer. Buat skrip migrasi DDL untuk aplikasi menggunakan driver @neondatabase/serverless.\n\`\`\`\n- **Kriteria Selesai:** Eksekusi skrip migrasi sukses tanpa error.\n`);
                                setIsAddingDoc(true);
                              }}
                              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                            >
                              Buat Berkas tasks.md Sekarang
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-5">
                          {/* Progress & CLI Banner */}
                          <div className="p-4 rounded-xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-white flex items-center gap-1.5">
                                  <CheckSquare className="h-4 w-4 text-emerald-400" />
                                  <span>Progres Eksekusi AI Coding</span>
                                </span>
                                <span className="font-mono text-zinc-300">
                                  {completedCount} / {allTasks.length} Task ({progressPct}%)
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const nextTask = allTasks.find((t) => !t.completed);
                                  if (nextTask) {
                                    handleCopyTaskPrompt(nextTask);
                                  } else {
                                    showNotice("Semua task telah selesai!");
                                  }
                                }}
                                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Salin Prompt Task Berikutnya</span>
                              </button>
                            </div>
                          </div>

                          {/* Phase Filter Tabs */}
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                            {phases.map((ph) => (
                              <button
                                key={ph}
                                onClick={() => setTaskFilterPhase(ph)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                                  taskFilterPhase === ph
                                    ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                                    : "bg-surface-muted text-zinc-400 hover:text-zinc-200 border border-transparent"
                                }`}
                              >
                                {ph === "all" ? "Semua Fase" : ph}
                              </button>
                            ))}
                          </div>

                          {/* Task Cards List */}
                          <div className="space-y-3">
                            {displayedTasks.map((t) => {
                              const isPromptExpanded = expandedTaskPrompts[t.id];
                              return (
                                <div
                                  key={t.id}
                                  className={`p-4 rounded-xl border transition-all ${
                                    t.completed
                                      ? "bg-surface/50 border-border/50 opacity-75"
                                      : "bg-surface border-border hover:border-zinc-700"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 min-w-0">
                                      <button
                                        onClick={() => handleToggleTask(t.id)}
                                        className={`mt-0.5 h-5 w-5 rounded flex items-center justify-center transition-all ${
                                          t.completed
                                            ? "bg-emerald-500 text-zinc-950"
                                            : "border border-zinc-600 hover:border-emerald-400"
                                        }`}
                                        title={t.completed ? "Tandai belum selesai" : "Tandai selesai"}
                                      >
                                        {t.completed && <CheckCircle2 className="h-4 w-4" />}
                                      </button>

                                      <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-mono text-xs font-bold text-white">{t.id}</span>
                                          <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-border font-medium">
                                            {t.category}
                                          </span>
                                          <span className="text-xs text-zinc-500">•</span>
                                          <span className="text-[11px] text-zinc-400">{t.phase}</span>
                                        </div>

                                        <h4
                                          className={`text-sm font-semibold ${
                                            t.completed ? "line-through text-zinc-400" : "text-zinc-100"
                                          }`}
                                        >
                                          {t.title}
                                        </h4>

                                        {t.description && (
                                          <p className="text-xs text-zinc-400 leading-relaxed">{t.description}</p>
                                        )}

                                        {t.targetFiles.length > 0 && (
                                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                            <span className="text-[10px] text-zinc-500">Target:</span>
                                            {t.targetFiles.map((file) => (
                                              <span
                                                key={file}
                                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800/80 text-zinc-300 border border-border"
                                              >
                                                {file}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                        onClick={() => handleCopyTaskPrompt(t)}
                                        className="px-2.5 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1 transition-all active:scale-95"
                                        title="Salin Prompt Khusus Task Ini untuk AI Agent"
                                      >
                                        {copiedTaskId === t.id ? (
                                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                        ) : (
                                          <Copy className="h-3.5 w-3.5" />
                                        )}
                                        <span>{copiedTaskId === t.id ? "Tersalin" : "Salin Prompt"}</span>
                                      </button>

                                      {t.aiPrompt && (
                                        <button
                                          onClick={() =>
                                            setExpandedTaskPrompts((prev) => ({
                                              ...prev,
                                              [t.id]: !prev[t.id],
                                            }))
                                          }
                                          className="px-2.5 py-1.5 rounded-md bg-surface-elevated hover:bg-zinc-700 text-zinc-300 border border-border text-xs transition-all"
                                        >
                                          {isPromptExpanded ? "Tutup Prompt" : "Lihat Prompt"}
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {isPromptExpanded && t.aiPrompt && (
                                    <div className="mt-3 p-3 rounded-lg bg-surface-muted border border-border/80 space-y-2">
                                      <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                                        <span>Prompt AI Siap Eksekusi:</span>
                                        <span className="text-[10px] text-emerald-400">Siap tempel ke Cursor / Claude</span>
                                      </div>
                                      <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono bg-zinc-950 p-2.5 rounded border border-border/60 overflow-x-auto">
                                        {t.aiPrompt}
                                      </pre>
                                      {t.acceptanceCriteria && (
                                        <div className="text-[11px] text-zinc-400 pt-1">
                                          <span className="font-semibold text-emerald-400">Kriteria Selesai: </span>
                                          {t.acceptanceCriteria}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  /* ========================================================================= */
                  /* DOKUMEN BLUEPRINT VIEW (ORIGINAL WORKSPACE GRID)                          */
                  /* ========================================================================= */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* File List */}
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
                                <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                                  {doc.title || doc.filename}
                                </div>
                              </div>
                            </div>
                            <ChevronRight
                              className={`h-4 w-4 shrink-0 mt-1 ${isSelected ? "text-emerald-400" : "text-zinc-600"}`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Viewer / Editor */}
                  <div className="lg:col-span-8 flex flex-col rounded-xl bg-surface border border-border overflow-hidden">
                    {activeDoc && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY PROJECTS CRUD */}
        {/* ========================================================================= */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-emerald-400" />
                  <span>Daftar Proyek Saya</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Kelola blueprint arsitektur yang telah Anda generate dan simpan di database.
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
                <div className="text-white font-medium">Belum ada proyek yang terdaftar.</div>
                <p className="text-[11px] text-zinc-500">
                  Gunakan Wizard 7-Tahap untuk menghasilkan 11 dokumen blueprint terpadu.
                </p>
                <button
                  onClick={() => setActiveTab("wizard")}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Rancang Proyek Baru</span>
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
                          onClick={() => {
                            handleOpenProject(p);
                            setWorkspaceView("cost");
                            setActiveTab("workspace");
                          }}
                          className="px-2.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium flex items-center gap-1 transition-all"
                          title="Hitung Biaya & RAB Klien"
                        >
                          <Calculator className="h-3 w-3" />
                          <span>Hitung RAB</span>
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
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <span>Wizard Perencanaan Arsitektur 7-Tahap</span>
              </h2>
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
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Tahap 1: Nama & Kategori Aplikasi</h3>
                    <span className="text-[11px] text-zinc-500 font-mono">Langkah 1 dari 4</span>
                  </div>

                  {/* Architecture Preset Quick Selector */}
                  <div className="p-3.5 rounded-xl bg-surface-muted/60 border border-border/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Pilih Preset Template Cepat (Opsional)</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">1-Klik Auto-Fill</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {ARCHITECTURE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className="p-2.5 rounded-lg bg-surface hover:bg-surface-elevated border border-border/70 hover:border-emerald-500/40 transition-all text-left space-y-1 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                              {preset.name}
                            </span>
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400">
                              {preset.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 line-clamp-1">{preset.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-zinc-300">Nama Aplikasi</label>
                    <input
                      type="text"
                      placeholder="Contoh: DocuFlow AI / Smart Inventory"
                      value={meta.appName}
                      onChange={(e) => setMeta({ ...meta, appName: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-300">Kategori</label>
                    <input
                      type="text"
                      placeholder="Contoh: Developer Tool & SaaS Architecture"
                      value={meta.category}
                      onChange={(e) => setMeta({ ...meta, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Tahap 2: Detail Masalah & Tagline</h3>
                    <span className="text-[11px] text-zinc-500 font-mono">Dikte Suara Tersedia 🎤</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-zinc-300">Tagline Produk</label>
                      <button
                        type="button"
                        onClick={() => handleStartSpeech("tagline")}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                          isListening && speechTarget === "tagline"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-border"
                        }`}
                        title="Diktekan tagline dengan suara Anda"
                      >
                        {isListening && speechTarget === "tagline" ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                            <span>Mendengarkan...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="h-3 w-3 text-emerald-400" />
                            <span>Input Suara</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Contoh: Solusi terstandarisasi perencanaan blueprint aplikasi lengkap."
                      value={meta.tagline}
                      onChange={(e) => setMeta({ ...meta, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-zinc-300">Masalah Inti yang Dipecahkan</label>
                      <button
                        type="button"
                        onClick={() => handleStartSpeech("problem")}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                          isListening && speechTarget === "problem"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-border"
                        }`}
                        title="Diktekan masalah inti produk dengan suara Anda"
                      >
                        {isListening && speechTarget === "problem" ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                            <span>Mendengarkan...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="h-3 w-3 text-emerald-400" />
                            <span>Input Suara</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      placeholder="Jelaskan masalah utama pengguna Anda (atau klik 'Input Suara' untuk mendiktekan)..."
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
                  <h3 className="text-sm font-semibold text-white">Tahap 6: Desain & Standar Anti-Slop</h3>
                  <div className="p-3 rounded-md bg-surface-muted border border-border space-y-2">
                    <div className="text-xs font-medium text-white">Prinsip Frontend Taste:</div>
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
                  <h3 className="text-sm font-semibold text-white">Tahap 7: Model Inferensi AI (Didukung Saat Ini)</h3>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-300">Pilih Model Mesin Generator</label>
                    <select
                      value={meta.selectedModel}
                      onChange={(e) => setMeta({ ...meta, selectedModel: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    >
                      <option value="Google Gemini 3.8 Flash">Google Gemini 3.8 Flash (Prioritas Kuota Tertinggi)</option>
                      <option value="Google Gemini 3.5 Flash Lite">Google Gemini 3.5 Flash Lite (Cepat & Hemat)</option>
                      <option value="Google Gemini 3 Flash">Google Gemini 3 Flash</option>
                      <option value="Google Gemini 2.5 Flash Lite">Google Gemini 2.5 Flash Lite</option>
                      <option value="Google Gemini 2.5 Flash">Google Gemini 2.5 Flash (Stabil)</option>
                      <option value="Google Gemini 2.0 Flash">Google Gemini 2.0 Flash</option>
                      <option value="Anthropic Claude 3.5 Sonnet">Anthropic Claude 3.5 Sonnet</option>
                      <option value="OpenAI GPT-4o">OpenAI GPT-4o</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Navigation */}
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
                    onClick={handleGenerateBlueprint}
                    className="px-4 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    {isGenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    <span>{isGenerating ? "Menyusun 11 Dokumen..." : "Generate 11 Dokumen"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PERSONAL BYOK KEYS */}
        {/* ========================================================================= */}
        {activeTab === "keys" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-400" />
                  <span>Kunci API Google Gemini (BYOK Multi-Key)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Tambahkan kunci API pribadi Anda. Kunci tidak di-hardcode dan mendukung rotasi otomatis antar model.
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

            {/* Model Hierarchy Card */}
            <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Rantai Model Prioritas (Google AI Studio)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Fallback Chain Active
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Sistem secara otomatis mencoba model berikutnya bila kuota habis (429) atau server sibuk (503):
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

            {/* Add Key Form */}
            <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-semibold text-sm text-white">Tambah Kunci Google Gemini Baru</h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Tersimpan di Neon Postgres</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="text-[11px] text-zinc-400 block mb-1">Nickname Kunci</label>
                  <input
                    type="text"
                    placeholder="Contoh: Key Utama Saya"
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
                      <span>Kunci API Valid! ({validationResult.modelCount ?? 0} model Google Generative AI terdeteksi).</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                      <span>Validasi gagal: {validationResult.error}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Keys Table */}
            <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-white">Daftar Kunci Saya ({apiKeys.length})</h3>
                <span className="text-xs text-zinc-400">
                  Aktif: <strong className="text-emerald-400">{apiKeys.filter((k) => k.isActive).length}</strong>
                </span>
              </div>

              {apiKeys.length === 0 ? (
                <div className="p-8 text-center rounded-lg bg-surface-muted border border-border/70 text-zinc-400 text-xs space-y-2">
                  <Key className="h-6 w-6 text-zinc-500 mx-auto" />
                  <div className="text-white font-medium">Belum ada kunci API yang tersimpan.</div>
                  <p className="text-[11px] text-zinc-500">
                    Tambahkan kunci Google Gemini Anda di atas untuk menjalankan inferensi AI generator.
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
                                title="Hapus Kunci"
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

            {/* Inference Tester */}
            <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-semibold text-sm text-white">Uji Coba Inferensi Kunci</h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">Live Pool Test</span>
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
                  <span>{testingPool ? "Mengeksekusi..." : "Jalankan Tes"}</span>
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
                        <span className="text-emerald-400 font-semibold">Model: {testPoolResult.usedModel}</span>
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
        {/* TAB 5: PROJECT COST ESTIMATOR & RAB COUNTER                               */}
        {/* ========================================================================= */}
        {activeTab === "cost" && (
          <div className="space-y-6">
            {/* Project Switcher Bar if projects exist */}
            {projects.length > 0 && (
              <div className="p-3.5 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-zinc-300 font-medium">Pilih Proyek Aktif untuk Estimasi Biaya (RAB):</span>
                </div>
                <select
                  value={currentProject?.id || ""}
                  onChange={(e) => {
                    const selected = projects.find((p) => p.id === e.target.value);
                    if (selected) handleOpenProject(selected);
                  }}
                  className="bg-surface-elevated border border-border text-xs text-white rounded-lg px-3 py-1.5 focus:border-emerald-500 focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <ProjectCostEstimator
              currentProject={currentProject}
              currentUser={currentUser}
              documents={documents}
              onDocumentSaved={handleRABDocumentSaved}
              onNotice={showNotice}
              onOpenWorkspaceDoc={handleOpenWorkspaceDoc}
            />
          </div>
        )}
      </main>

      {/* Modal Edit Project */}
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
                <label className="text-zinc-300">Deskripsi / Ide</label>
                <textarea
                  rows={3}
                  value={editingProject.raw_idea}
                  onChange={(e) => setEditingProject({ ...editingProject, raw_idea: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface-muted border border-border text-white text-xs focus:outline-none focus:border-emerald-500"
                />
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

      {/* Modal Delete Confirm */}
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

      {/* Modal Add Custom Doc */}
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
                Simpan Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border/60 py-4 px-4 text-center text-xs text-zinc-500 font-mono">
        AppPlanner AI • Developer Workspace • Powered by Neon Serverless
      </footer>
    </div>
  );
}
