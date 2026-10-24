"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calculator,
  DollarSign,
  Clock,
  ShieldCheck,
  TrendingUp,
  Percent,
  Plus,
  Trash2,
  Save,
  Copy,
  Printer,
  FileCheck2,
  Sparkles,
  Sliders,
  RotateCcw,
  Layers,
  Server,
  UserCheck,
  CheckCircle2,
  Info,
  Calendar,
  Building,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DocItem, ProfileItem, ProjectItem } from "../../types";
import {
  RateConfig,
  CostFeatureItem,
  CostAddonItem,
  ComplexityLevel,
  DeveloperRole,
  calculateProjectCost,
  getDefaultRateConfig,
  formatCurrency,
  extractFeaturesFromProject,
  getDefaultAddons,
  generateRABMarkdown,
  parseRABMarkdown,
} from "../../lib/calculator/cost-estimator";

interface ProjectCostEstimatorProps {
  currentProject: ProjectItem | null;
  currentUser: ProfileItem;
  documents: DocItem[];
  onDocumentSaved?: (doc: DocItem) => void;
  onNotice?: (msg: string) => void;
  onOpenWorkspaceDoc?: (filename: string) => void;
}

export default function ProjectCostEstimator({
  currentProject,
  currentUser,
  documents,
  onDocumentSaved,
  onNotice,
  onOpenWorkspaceDoc,
}: ProjectCostEstimatorProps) {
  // 1. Initial Rate Configuration state
  const [config, setConfig] = useState<RateConfig>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`appplanner_rate_settings_${currentUser.id}`);
      if (saved) {
        try {
          return { ...getDefaultRateConfig("IDR"), ...JSON.parse(saved) };
        } catch (e) {
          console.error("Failed to load stored rate settings:", e);
        }
      }
    }
    if (currentUser.custom_settings?.rateConfig) {
      return { ...getDefaultRateConfig("IDR"), ...currentUser.custom_settings.rateConfig };
    }
    return getDefaultRateConfig("IDR");
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isSavingDoc, setIsSavingDoc] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    features: true,
    addons: true,
    summary: true,
  });

  // 2. Features & Addons state
  const [features, setFeatures] = useState<CostFeatureItem[]>([]);
  const [addons, setAddons] = useState<CostAddonItem[]>([]);
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonCost, setNewAddonCost] = useState<number | "">("");
  const [newAddonCategory, setNewAddonCategory] = useState<"infra" | "third_party" | "license" | "maintenance" | "other">("infra");

  // Load existing RAB from project documents if available
  useEffect(() => {
    if (!currentProject) {
      setFeatures([]);
      setAddons([]);
      return;
    }

    const existingRabDoc = documents.find(
      (d) => d.filename.toLowerCase() === "rab.md" || d.filename.toLowerCase() === "rab_estimasi_biaya.md"
    );

    if (existingRabDoc) {
      const parsed = parseRABMarkdown(existingRabDoc.content);
      if (parsed && parsed.features && parsed.features.length > 0) {
        setFeatures(parsed.features);
        if (parsed.addons) setAddons(parsed.addons);
        if (parsed.config) {
          setConfig((prev) => ({ ...prev, ...parsed.config }));
        }
        return;
      }
    }

    // Otherwise extract dynamically from project & PRD
    const extracted = extractFeaturesFromProject(currentProject, documents, config);
    setFeatures(extracted);
    setAddons(getDefaultAddons(config.currency));
  }, [currentProject?.id, documents.length]);

  // Realtime calculation result
  const calculation = useMemo(() => {
    return calculateProjectCost(features, addons, config);
  }, [features, addons, config]);

  // Save Settings to Database & LocalStorage
  const handleSaveSettings = async (newConfig: RateConfig) => {
    setConfig(newConfig);
    if (typeof window !== "undefined") {
      localStorage.setItem(`appplanner_rate_settings_${currentUser.id}`, JSON.stringify(newConfig));
    }

    try {
      await fetch("/api/profile/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          customSettings: {
            ...(currentUser.custom_settings || {}),
            rateConfig: newConfig,
          },
        }),
      });
      if (onNotice) onNotice("Konfigurasi tarif developer berhasil diperbarui!");
    } catch (e) {
      console.error("Failed to sync rate settings to db:", e);
      if (onNotice) onNotice("Tarif disimpan secara lokal di browser.");
    }
    setShowSettingsModal(false);
  };

  // Add a new custom feature
  const handleAddFeature = () => {
    if (!newFeatureName.trim()) return;
    const newFeat: CostFeatureItem = {
      id: `feat-${Date.now()}`,
      name: newFeatureName.trim(),
      description: "Fitur kustom tambahan",
      complexity: "medium",
      estimatedDays: config.baselineDays.medium || 5,
      role: "fullstack",
    };
    setFeatures([...features, newFeat]);
    setNewFeatureName("");
    if (onNotice) onNotice(`Fitur "${newFeat.name}" ditambahkan ke estimasi.`);
  };

  // Delete feature
  const handleDeleteFeature = (id: string) => {
    setFeatures(features.filter((f) => f.id !== id));
  };

  // Update feature complexity & days
  const handleUpdateFeature = (
    id: string,
    field: "complexity" | "estimatedDays" | "role" | "name",
    value: any
  ) => {
    setFeatures(
      features.map((f) => {
        if (f.id !== id) return f;
        if (field === "complexity") {
          const comp = value as ComplexityLevel;
          const defaultDays =
            comp === "custom"
              ? f.estimatedDays
              : config.baselineDays[comp] || f.estimatedDays;
          return { ...f, complexity: comp, estimatedDays: defaultDays };
        }
        return { ...f, [field]: value };
      })
    );
  };

  // Add Add-on
  const handleAddAddon = () => {
    if (!newAddonName.trim() || typeof newAddonCost !== "number") return;
    const newAdd: CostAddonItem = {
      id: `addon-${Date.now()}`,
      name: newAddonName.trim(),
      category: newAddonCategory,
      cost: newAddonCost,
      billingCycle: "one_time",
    };
    setAddons([...addons, newAdd]);
    setNewAddonName("");
    setNewAddonCost("");
  };

  // Delete Add-on
  const handleDeleteAddon = (id: string) => {
    setAddons(addons.filter((a) => a.id !== id));
  };

  // Reset to initial extracted features
  const handleResetToExtracted = () => {
    if (!currentProject) return;
    const extracted = extractFeaturesFromProject(currentProject, documents, config);
    setFeatures(extracted);
    setAddons(getDefaultAddons(config.currency));
    if (onNotice) onNotice("RAB dikembalikan ke hasil analisis blueprint awal.");
  };

  // Save to Project Document (RAB.md)
  const handleSaveToProjectDoc = async () => {
    if (!currentProject) {
      if (onNotice) onNotice("Pilih atau buat proyek terlebih dahulu.");
      return;
    }

    setIsSavingDoc(true);
    try {
      const rabMarkdown = generateRABMarkdown(
        currentProject.name,
        features,
        addons,
        config,
        calculation
      );

      const res = await fetch(`/api/projects/${currentProject.id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: "RAB.md",
          content: rabMarkdown,
        }),
      });

      const data = await res.json();
      if (data.success && data.document) {
        if (onDocumentSaved) onDocumentSaved(data.document);
        if (onNotice) onNotice("Dokumen RAB.md berhasil disimpan ke database Neon & Object Storage!");
        if (onOpenWorkspaceDoc) onOpenWorkspaceDoc("RAB.md");
      } else {
        throw new Error(data.error || "Gagal menyimpan dokumen");
      }
    } catch (e: any) {
      console.error("Save RAB error:", e);
      if (onNotice) onNotice(`Gagal menyimpan RAB: ${e.message}`);
    } finally {
      setIsSavingDoc(false);
    }
  };

  // Copy Quotation Text for WhatsApp / Email
  const handleCopyQuotationText = () => {
    const cur = config.currency;
    const lines = [
      `*PENAWARAN BIAYA & ESTIMASI PENGERJAAN PROYEK*`,
      `Proyek: *${currentProject?.name || "Aplikasi"}*`,
      `Klien: ${config.clientName || "Bapak / Ibu Klien"}`,
      `Developer: ${config.developerName} (${config.developerContact})`,
      `------------------------------------------`,
      `*1. ESTIMASI WAKTU & CAKUPAN:*`,
      `Total Durasi: ${calculation.totalEffortDays} Hari Kerja (~${Math.ceil(calculation.totalEffortDays / 5)} Minggu)`,
      `Jumlah Modul: ${features.length} Fitur Spesifikasi`,
      `Garansi Pemeliharaan: ${config.warrantyDays} Hari Kalender`,
      ``,
      `*2. RINCIAN BIAYA:*`,
      `- Biaya Development Effort: ${formatCurrency(calculation.totalEffortCost, cur)}`,
      `- Biaya Server & Infrastruktur: ${formatCurrency(calculation.totalAddonsCost, cur)}`,
      `- Safety Contingency (+${config.contingencyPercent}%): ${formatCurrency(calculation.contingencyCost, cur)}`,
      `- Management & Profit Margin (+${config.profitMarginPercent}%): ${formatCurrency(calculation.profitMarginCost, cur)}`,
      config.taxPercent > 0 ? `- PPN (+${config.taxPercent}%): ${formatCurrency(calculation.taxCost, cur)}` : null,
      `------------------------------------------`,
      `*GRAND TOTAL INVESTASI: ${formatCurrency(calculation.grandTotal, cur)}*`,
      `------------------------------------------`,
      `*3. TERMIN PEMBAYARAN:*`,
      `- DP (${config.paymentTerms.dpPercent}%): ${formatCurrency(calculation.dpAmount, cur)} saat SPK & Finalisasi Blueprint`,
      `- Termin 2 (${config.paymentTerms.progressPercent}%): ${formatCurrency(calculation.progressAmount, cur)} saat Alpha Demo (80% Fitur)`,
      `- Pelunasan (${config.paymentTerms.finalPercent}%): ${formatCurrency(calculation.finalAmount, cur)} saat Handover & Deployment`,
      ``,
      `Dokumen spesifikasi arsitektur teknis lengkap (11 Berkas Blueprint) siap kami kirimkan. Terima kasih!`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(lines);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
    if (onNotice) onNotice("Rangkuman penawaran disalin ke clipboard! Siap kirim via WhatsApp / Email.");
  };

  // Open Native Browser Print dialog
  const handleTriggerPrint = () => {
    window.print();
  };

  if (!currentProject) {
    return (
      <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-4 max-w-xl mx-auto my-10">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <Calculator className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Belum Ada Proyek yang Dipilih</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Pilih proyek aktif di tab <strong>Proyek Saya</strong> atau generate proyek baru lewat <strong>Wizard 7-Tahap</strong> untuk mulai mengalkulasi Rencana Anggaran Biaya (RAB) proyek klien Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Role: Developer / Freelancer
            </span>
            <span className="text-zinc-500 text-xs">•</span>
            <span className="text-xs text-zinc-400 font-mono">
              Proyek: <strong className="text-zinc-200">{currentProject.name}</strong>
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-400" />
            <span>Kalkulator Biaya Proyek & RAB Klien (Cost Counter)</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Perhitungan estimasi biaya otomatis berbasis kompleksitas 11 dokumen blueprint, durasi kerja, dan konfigurasi tarif Anda.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Sliders className="h-3.5 w-3.5 text-blue-400" />
            <span>Atur Tarif & Rate</span>
          </button>

          <button
            onClick={handleResetToExtracted}
            title="Muat ulang fitur dari analisis PRD & tasks"
            className="px-3 py-2 rounded-xl bg-surface-elevated hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Baseline</span>
          </button>

          <button
            onClick={handleCopyQuotationText}
            className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Copy className="h-3.5 w-3.5 text-amber-400" />
            <span>{copiedQuote ? "Tersalin!" : "Salin Format WA/Email"}</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-zinc-700 text-zinc-200 border border-border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Printer className="h-3.5 w-3.5 text-cyan-400" />
            <span>Cetak / PDF</span>
          </button>

          <button
            onClick={handleSaveToProjectDoc}
            disabled={isSavingDoc}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSavingDoc ? "Menyimpan..." : "Simpan ke Dokumen (RAB.md)"}</span>
          </button>
        </div>
      </div>

      {/* 4 Key Financial Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
            <span>Total Durasi Kerja</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            {calculation.totalEffortDays} <span className="text-xs font-normal text-zinc-400">Hari</span>
          </div>
          <p className="text-[11px] text-zinc-500 pt-1">
            ~{Math.ceil(calculation.totalEffortDays / 5)} Minggu Kalender ({features.length} modul)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
            <span>Biaya Development</span>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            {formatCurrency(calculation.totalEffortCost, config.currency)}
          </div>
          <p className="text-[11px] text-zinc-500 pt-1">
            Rate: {formatCurrency(config.dailyRate, config.currency)} / hari
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
            <span>Buffer & Margin</span>
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            +{config.contingencyPercent + config.profitMarginPercent}%
          </div>
          <p className="text-[11px] text-zinc-500 pt-1">
            {formatCurrency(calculation.contingencyCost + calculation.profitMarginCost, config.currency)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-300 pb-1">
            <span className="font-semibold">Grand Total RAB</span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {formatCurrency(calculation.grandTotal, config.currency)}
          </div>
          <p className="text-[11px] text-emerald-500/80 pt-1">
            DP: {formatCurrency(calculation.dpAmount, config.currency)} ({config.paymentTerms.dpPercent}%)
          </p>
        </div>
      </div>

      {/* Main Grid: Features Breakdown & Addons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Feature Effort Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feature Matrix Card */}
          <div className="rounded-2xl bg-surface border border-border overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border/70 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-400" />
                  <span>Matriks Biaya Fitur & Ruang Lingkup ({features.length} Fitur)</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Ubah tingkat kesulitan tiap fitur untuk menyesuaikan durasi dan biaya otomatis.
                </p>
              </div>
              <button
                onClick={() =>
                  setExpandedSections((prev) => ({ ...prev, features: !prev.features }))
                }
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                {expandedSections.features ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {expandedSections.features && (
              <div className="p-4 sm:p-5 space-y-4">
                {/* List of Features */}
                <div className="space-y-3">
                  {features.map((feat, index) => {
                    const featRate =
                      feat.customRate && feat.customRate > 0
                        ? feat.customRate
                        : config.roleRates?.[feat.role] || config.dailyRate;
                    const subtotal = feat.estimatedDays * featRate;

                    return (
                      <div
                        key={feat.id}
                        className="p-3.5 rounded-xl bg-surface-muted border border-border/70 hover:border-border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        {/* Title & Description */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-zinc-500 w-5">
                              #{index + 1}
                            </span>
                            <input
                              type="text"
                              value={feat.name}
                              onChange={(e) =>
                                handleUpdateFeature(feat.id, "name", e.target.value)
                              }
                              className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 focus:outline-none text-xs sm:text-sm font-semibold text-zinc-100 w-full"
                            />
                          </div>
                          {feat.description && (
                            <p className="text-[11px] text-zinc-400 pl-7 line-clamp-1">
                              {feat.description}
                            </p>
                          )}
                        </div>

                        {/* Controls (Complexity, Days, Role, Subtotal) */}
                        <div className="flex flex-wrap items-center gap-2 pl-7 md:pl-0">
                          {/* Role Selector */}
                          <select
                            value={feat.role}
                            onChange={(e) =>
                              handleUpdateFeature(feat.id, "role", e.target.value as DeveloperRole)
                            }
                            className="bg-surface border border-border text-zinc-300 text-[11px] rounded-lg px-2 py-1 focus:border-emerald-500 focus:outline-none"
                            title="Role pelaksana fitur"
                          >
                            <option value="fullstack">Fullstack</option>
                            <option value="frontend">Frontend</option>
                            <option value="backend">Backend</option>
                            <option value="designer">UI/UX</option>
                            <option value="qa">QA / Test</option>
                            <option value="pm">Lead/PM</option>
                          </select>

                          {/* Complexity Selector */}
                          <select
                            value={feat.complexity}
                            onChange={(e) =>
                              handleUpdateFeature(
                                feat.id,
                                "complexity",
                                e.target.value as ComplexityLevel
                              )
                            }
                            className={`text-[11px] font-medium rounded-lg px-2 py-1 border focus:outline-none ${
                              feat.complexity === "low"
                                ? "bg-emerald-950/30 text-emerald-300 border-emerald-500/30"
                                : feat.complexity === "medium"
                                ? "bg-blue-950/30 text-blue-300 border-blue-500/30"
                                : feat.complexity === "high"
                                ? "bg-purple-950/30 text-purple-300 border-purple-500/30"
                                : "bg-zinc-800 text-zinc-300 border-zinc-700"
                            }`}
                          >
                            <option value="low">Rendah ({config.baselineDays.low}h)</option>
                            <option value="medium">Sedang ({config.baselineDays.medium}h)</option>
                            <option value="high">Tinggi ({config.baselineDays.high}h)</option>
                            <option value="custom">Kustom</option>
                          </select>

                          {/* Days input */}
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={feat.estimatedDays}
                              onChange={(e) =>
                                handleUpdateFeature(
                                  feat.id,
                                  "estimatedDays",
                                  Math.max(0.5, parseFloat(e.target.value) || 0)
                                )
                              }
                              className="w-14 bg-surface border border-border text-zinc-200 text-xs text-center rounded-lg py-1 focus:border-emerald-500 focus:outline-none font-mono"
                            />
                            <span className="text-[10px] text-zinc-400">hari</span>
                          </div>

                          {/* Subtotal */}
                          <div className="w-24 text-right">
                            <span className="text-xs font-mono font-semibold text-zinc-200">
                              {formatCurrency(subtotal, config.currency)}
                            </span>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteFeature(feat.id)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all"
                            title="Hapus fitur dari kalkulasi"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Feature Row */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nama fitur kustom baru (misal: Notifikasi WhatsApp Realtime)..."
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddFeature()}
                    className="flex-1 w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddFeature}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-700 transition-all shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Tambah Fitur</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Infrastructure & Third-Party Addons Card */}
          <div className="rounded-2xl bg-surface border border-border overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border/70 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <Server className="h-4 w-4 text-cyan-400" />
                  <span>Infrastruktur, Server & Lisensi Third-Party ({addons.length} Item)</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Biaya langsung non-coding (Server Neon Postgres, Domain, API Token, Midtrans).
                </p>
              </div>
              <button
                onClick={() =>
                  setExpandedSections((prev) => ({ ...prev, addons: !prev.addons }))
                }
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                {expandedSections.addons ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {expandedSections.addons && (
              <div className="p-4 sm:p-5 space-y-4">
                <div className="space-y-2.5">
                  {addons.map((add) => (
                    <div
                      key={add.id}
                      className="p-3 rounded-xl bg-surface-muted border border-border/70 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 font-mono">
                          {add.category}
                        </span>
                        <span className="font-medium text-zinc-200">{add.name}</span>
                        <span className="text-[10px] text-zinc-500">
                          ({add.billingCycle === "one_time" ? "Sekali bayar" : add.billingCycle === "yearly" ? "Tahunan" : "Bulanan"})
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-zinc-200">
                          {formatCurrency(add.cost, config.currency)}
                        </span>
                        <button
                          onClick={() => handleDeleteAddon(add.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new addon inputs */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Nama add-on (misal: Domain .com & SSL)..."
                      value={newAddonName}
                      onChange={(e) => setNewAddonName(e.target.value)}
                      className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      placeholder="Biaya (Rp/$)..."
                      value={newAddonCost}
                      onChange={(e) =>
                        setNewAddonCost(e.target.value ? parseFloat(e.target.value) : "")
                      }
                      className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      onClick={handleAddAddon}
                      disabled={!newAddonName.trim() || newAddonCost === ""}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-700 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Tambah</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Financial Breakdown & Milestones */}
        <div className="space-y-6">
          {/* Summary Breakdown Card */}
          <div className="rounded-2xl bg-surface border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-border/70 pb-3">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>Rincian Kalkulasi Investasi (RAB)</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-zinc-300">
                <span>Biaya Development Effort:</span>
                <span className="font-mono font-medium">
                  {formatCurrency(calculation.totalEffortCost, config.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-300">
                <span>Infrastruktur & Lisensi:</span>
                <span className="font-mono font-medium">
                  {formatCurrency(calculation.totalAddonsCost, config.currency)}
                </span>
              </div>

              <div className="border-t border-border/50 pt-2 flex items-center justify-between text-zinc-400 font-medium">
                <span>Subtotal Biaya Dasar:</span>
                <span className="font-mono text-zinc-200">
                  {formatCurrency(calculation.baseCost, config.currency)}
                </span>
              </div>

              {/* Contingency Buffer */}
              <div className="flex items-center justify-between text-purple-300">
                <span className="flex items-center gap-1">
                  <span>Risk Buffer (+{config.contingencyPercent}%):</span>
                </span>
                <span className="font-mono">
                  {formatCurrency(calculation.contingencyCost, config.currency)}
                </span>
              </div>

              {/* Profit Margin */}
              <div className="flex items-center justify-between text-blue-300">
                <span>Profit Margin (+{config.profitMarginPercent}%):</span>
                <span className="font-mono">
                  {formatCurrency(calculation.profitMarginCost, config.currency)}
                </span>
              </div>

              {/* Tax if active */}
              {config.taxPercent > 0 && (
                <div className="flex items-center justify-between text-amber-300">
                  <span>PPN (+{config.taxPercent}%):</span>
                  <span className="font-mono">
                    {formatCurrency(calculation.taxCost, config.currency)}
                  </span>
                </div>
              )}

              {/* Grand Total */}
              <div className="border-t-2 border-border pt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Nilai Total Kontrak
                  </span>
                  <span className="text-[10px] text-zinc-400">Termasuk SLA & Garansi</span>
                </div>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {formatCurrency(calculation.grandTotal, config.currency)}
                </span>
              </div>
            </div>

            {/* Payment Terms Milestones */}
            <div className="pt-3 border-t border-border/70 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Skema Termin Pembayaran
              </span>

              <div className="p-2.5 rounded-lg bg-surface-muted border border-border/60 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">
                    Termin 1 (DP {config.paymentTerms.dpPercent}%)
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatCurrency(calculation.dpAmount, config.currency)}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Saat penandatanganan SPK & blueprint arsitektur disetujui.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-muted border border-border/60 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">
                    Termin 2 (Progress {config.paymentTerms.progressPercent}%)
                  </span>
                  <span className="font-mono font-bold text-blue-400">
                    {formatCurrency(calculation.progressAmount, config.currency)}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Saat 80% fitur selesai diuji coba pada staging server.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-muted border border-border/60 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">
                    Termin 3 (Pelunasan {config.paymentTerms.finalPercent}%)
                  </span>
                  <span className="font-mono font-bold text-purple-400">
                    {formatCurrency(calculation.finalAmount, config.currency)}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Saat serah terima source code & go-live production.
                </p>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-[11px] text-blue-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <Info className="h-3.5 w-3.5 text-blue-400" />
                <span>Tips Freelance Anti-Boncos:</span>
              </div>
              <p className="text-zinc-400 leading-normal">
                Risk buffer 15% melindungi Anda dari revisi tak terduga. Selalu sertakan 11 dokumen blueprint agar batasan pekerjaan mengikat secara legal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: PENGATURAN TARIF DEVELOPER (BISA DIATUR SENDIRI OLEH USER)          */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <RateSettingsModal
          config={config}
          onClose={() => setShowSettingsModal(false)}
          onSave={handleSaveSettings}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: CETAK / PRINT PREVIEW INVOICE RAB RESMI                            */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <PrintQuotationModal
          currentProject={currentProject}
          config={config}
          features={features}
          addons={addons}
          calc={calculation}
          onClose={() => setShowPrintModal(false)}
          onPrint={handleTriggerPrint}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// SUBCOMPONENT: MODAL PENGATURAN TARIF DEVELOPER (USER-CONFIGURABLE)
// -----------------------------------------------------------------------------
interface RateSettingsModalProps {
  config: RateConfig;
  onClose: () => void;
  onSave: (c: RateConfig) => void;
}

function RateSettingsModal({ config, onClose, onSave }: RateSettingsModalProps) {
  const [form, setForm] = useState<RateConfig>({ ...config });

  const handleCurrencyChange = (newCur: "IDR" | "USD") => {
    if (newCur === form.currency) return;
    const defaults = getDefaultRateConfig(newCur);
    setForm({
      ...form,
      currency: newCur,
      dailyRate: defaults.dailyRate,
      hourlyRate: defaults.hourlyRate,
      roleRates: { ...defaults.roleRates },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pengaturan Tarif Developer</h3>
              <p className="text-xs text-zinc-400">
                Atur rate harian, asumsi durasi per tingkat kesulitan, dan margin bisnis Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Mata Uang & Standar Rate */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              1. Standar Mata Uang & Tarif Dasar
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Mata Uang</label>
                <select
                  value={form.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value as "IDR" | "USD")}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="IDR">IDR (Rupiah Rp)</option>
                  <option value="USD">USD (Dollar $)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Rate Harian (Daily Rate)</label>
                <input
                  type="number"
                  value={form.dailyRate}
                  onChange={(e) =>
                    setForm({ ...form, dailyRate: Math.max(0, parseFloat(e.target.value) || 0) })
                  }
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Jam Kerja / Hari</label>
                <input
                  type="number"
                  value={form.hoursPerDay}
                  onChange={(e) =>
                    setForm({ ...form, hoursPerDay: Math.max(1, parseInt(e.target.value) || 8) })
                  }
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* 2. Baseline Hari Pengerjaan per Kompleksitas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                2. Baseline Hari Kerja per Tingkat Kompleksitas
              </h4>
              <span className="text-[11px] text-zinc-400">Otomatis saat fitur dipilih</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-surface-muted border border-border/80">
                <span className="text-[11px] font-semibold text-emerald-300 block mb-1">
                  Rendah (Low)
                </span>
                <input
                  type="number"
                  step="0.5"
                  value={form.baselineDays.low}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      baselineDays: {
                        ...form.baselineDays,
                        low: Math.max(0.5, parseFloat(e.target.value) || 1),
                      },
                    })
                  }
                  className="w-full bg-surface border border-border rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">CRUD / Static Page</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted border border-border/80">
                <span className="text-[11px] font-semibold text-blue-300 block mb-1">
                  Sedang (Medium)
                </span>
                <input
                  type="number"
                  step="0.5"
                  value={form.baselineDays.medium}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      baselineDays: {
                        ...form.baselineDays,
                        medium: Math.max(1, parseFloat(e.target.value) || 3),
                      },
                    })
                  }
                  className="w-full bg-surface border border-border rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">Auth, Payment, API</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted border border-border/80">
                <span className="text-[11px] font-semibold text-purple-300 block mb-1">
                  Tinggi (High)
                </span>
                <input
                  type="number"
                  step="0.5"
                  value={form.baselineDays.high}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      baselineDays: {
                        ...form.baselineDays,
                        high: Math.max(2, parseFloat(e.target.value) || 7),
                      },
                    })
                  }
                  className="w-full bg-surface border border-border rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">AI, Realtime, Multi-tenant</span>
              </div>
            </div>
          </div>

          {/* 3. Team Role Rates */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              3. Rate Harian Berdasarkan Peran Tim (Team Rates)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.keys(form.roleRates).map((roleKey) => {
                const rKey = roleKey as keyof typeof form.roleRates;
                return (
                  <div key={rKey} className="p-2.5 rounded-xl bg-surface-muted border border-border/70">
                    <label className="text-[11px] text-zinc-400 capitalize block mb-1">
                      {rKey === "fullstack"
                        ? "Fullstack / Solo"
                        : rKey === "designer"
                        ? "UI/UX Designer"
                        : rKey === "pm"
                        ? "Lead / PM"
                        : rKey}
                    </label>
                    <input
                      type="number"
                      value={form.roleRates[rKey]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          roleRates: {
                            ...form.roleRates,
                            [rKey]: Math.max(0, parseFloat(e.target.value) || 0),
                          },
                        })
                      }
                      className="w-full bg-surface border border-border rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Risk Buffer, Margin & Pajak */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              4. Safety Buffer, Margin Bisnis & Garansi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Risk Contingency (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={form.contingencyPercent}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contingencyPercent: Math.max(0, parseFloat(e.target.value) || 0),
                    })
                  }
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Profit Margin (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.profitMarginPercent}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      profitMarginPercent: Math.max(0, parseFloat(e.target.value) || 0),
                    })
                  }
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Pajak PPN (%)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={form.taxPercent}
                  onChange={(e) =>
                    setForm({ ...form, taxPercent: Math.max(0, parseFloat(e.target.value) || 0) })
                  }
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Garansi Bug (Hari)</label>
                <input
                  type="number"
                  value={form.warrantyDays}
                  onChange={(e) =>
                    setForm({ ...form, warrantyDays: Math.max(0, parseInt(e.target.value) || 0) })
                  }
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* 5. Developer & Client Info for Proposal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              5. Identitas Pengembang & Klien (Kop Penawaran)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Nama Developer / Studio</label>
                <input
                  type="text"
                  value={form.developerName}
                  onChange={(e) => setForm({ ...form, developerName: e.target.value })}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Kontak Resmi (Email/WA)</label>
                <input
                  type="text"
                  value={form.developerContact}
                  onChange={(e) => setForm({ ...form, developerContact: e.target.value })}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Nama Klien</label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Perusahaan Klien</label>
                <input
                  type="text"
                  value={form.clientCompany || ""}
                  onChange={(e) => setForm({ ...form, clientCompany: e.target.value })}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
          >
            Batal
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Simpan Pengaturan Tarif</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SUBCOMPONENT: PRINT / PDF PREVIEW MODAL (CLEAN PRINTABLE VIEW)
// -----------------------------------------------------------------------------
interface PrintQuotationModalProps {
  currentProject: ProjectItem;
  config: RateConfig;
  features: CostFeatureItem[];
  addons: CostAddonItem[];
  calc: any;
  onClose: () => void;
  onPrint: () => void;
}

function PrintQuotationModal({
  currentProject,
  config,
  features,
  addons,
  calc,
  onClose,
  onPrint,
}: PrintQuotationModalProps) {
  const cur = config.currency;
  const quoteRef = `RAB-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-white text-zinc-900 rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Modal Top Control Bar (Hidden when printed) */}
        <div className="p-4 bg-zinc-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold">
              Pratinjau Dokumen Cetak / Unduh PDF (Clean White Format)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-8 sm:p-12 space-y-8 max-h-[80vh] overflow-y-auto print:max-h-none print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                RENCANA ANGGARAN BIAYA
              </h1>
              <p className="text-xs text-zinc-600 font-medium uppercase tracking-wider mt-1">
                Project Investment & Architectural Scope Quotation
              </p>
              <div className="mt-3 text-xs text-zinc-700 space-y-0.5">
                <p>
                  <strong>Proyek:</strong> {currentProject.name}
                </p>
                <p>
                  <strong>No. Referensi:</strong> {quoteRef}
                </p>
                <p>
                  <strong>Tanggal:</strong> {dateStr}
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-zinc-700 space-y-1">
              <span className="px-2.5 py-1 rounded bg-zinc-100 font-bold text-zinc-900 text-sm inline-block">
                {config.developerName}
              </span>
              <p className="text-zinc-500">{config.developerTitle}</p>
              <p className="text-zinc-600 font-mono">{config.developerContact}</p>
            </div>
          </div>

          {/* Client & Executive Meta */}
          <div className="grid grid-cols-2 gap-6 bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-xs">
            <div>
              <span className="font-bold text-zinc-500 uppercase tracking-wider block mb-1 text-[10px]">
                Diberikan Kepada:
              </span>
              <p className="font-bold text-zinc-900 text-sm">{config.clientName}</p>
              {config.clientCompany && <p className="text-zinc-600">{config.clientCompany}</p>}
            </div>
            <div>
              <span className="font-bold text-zinc-500 uppercase tracking-wider block mb-1 text-[10px]">
                Ringkasan Eksekusi:
              </span>
              <p>
                Total Durasi: <strong>{calc.totalEffortDays} Hari Kerja</strong> (~
                {Math.ceil(calc.totalEffortDays / 5)} Minggu)
              </p>
              <p>
                Garansi Bug SLA: <strong>{config.warrantyDays} Hari Kalender</strong>
              </p>
            </div>
          </div>

          {/* Scope Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              1. Rincian Modul & Development Effort
            </h3>
            <table className="w-full text-left text-xs border border-zinc-200">
              <thead className="bg-zinc-100 border-b border-zinc-200">
                <tr>
                  <th className="p-2.5 font-bold w-10 text-center">No</th>
                  <th className="p-2.5 font-bold">Modul Pekerjaan</th>
                  <th className="p-2.5 font-bold text-center">Kompleksitas</th>
                  <th className="p-2.5 font-bold text-center">Durasi</th>
                  <th className="p-2.5 font-bold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {features.map((f, i) => (
                  <tr key={f.id}>
                    <td className="p-2.5 text-center font-mono text-zinc-500">{i + 1}</td>
                    <td className="p-2.5">
                      <span className="font-semibold text-zinc-900">{f.name}</span>
                      {f.description && (
                        <p className="text-[10px] text-zinc-500">{f.description}</p>
                      )}
                    </td>
                    <td className="p-2.5 text-center uppercase text-[10px] font-mono">
                      {f.complexity}
                    </td>
                    <td className="p-2.5 text-center font-mono">{f.estimatedDays} Hari</td>
                    <td className="p-2.5 text-right font-mono font-semibold">
                      {formatCurrency(
                        f.estimatedDays *
                          (f.customRate || config.roleRates?.[f.role] || config.dailyRate),
                        cur
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Infrastructure Addons Table */}
          {addons.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                2. Server, Database & Lisensi Third-Party
              </h3>
              <table className="w-full text-left text-xs border border-zinc-200">
                <thead className="bg-zinc-100 border-b border-zinc-200">
                  <tr>
                    <th className="p-2.5 font-bold w-10 text-center">No</th>
                    <th className="p-2.5 font-bold">Komponen / Server</th>
                    <th className="p-2.5 font-bold text-center">Siklus</th>
                    <th className="p-2.5 font-bold text-right">Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {addons.map((a, i) => (
                    <tr key={a.id}>
                      <td className="p-2.5 text-center font-mono text-zinc-500">{i + 1}</td>
                      <td className="p-2.5 font-semibold text-zinc-900">{a.name}</td>
                      <td className="p-2.5 text-center text-[10px]">
                        {a.billingCycle === "one_time" ? "Satu Kali" : a.billingCycle}
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold">
                        {formatCurrency(a.cost, cur)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Financial Totals */}
          <div className="flex justify-end pt-2">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Biaya Development Effort:</span>
                <span className="font-mono font-semibold">
                  {formatCurrency(calc.totalEffortCost, cur)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Infrastruktur & Lisensi:</span>
                <span className="font-mono font-semibold">
                  {formatCurrency(calc.totalAddonsCost, cur)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Risk Buffer (+{config.contingencyPercent}%):</span>
                <span className="font-mono">{formatCurrency(calc.contingencyCost, cur)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Profit Margin (+{config.profitMarginPercent}%):</span>
                <span className="font-mono">{formatCurrency(calc.profitMarginCost, cur)}</span>
              </div>
              {config.taxPercent > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>PPN (+{config.taxPercent}%):</span>
                  <span className="font-mono">{formatCurrency(calc.taxCost, cur)}</span>
                </div>
              )}
              <div className="border-t-2 border-zinc-900 pt-2 flex justify-between font-bold text-sm text-zinc-900">
                <span>TOTAL INVESTASI:</span>
                <span className="font-mono">{formatCurrency(calc.grandTotal, cur)}</span>
              </div>
            </div>
          </div>

          {/* Payment Terms & Signature */}
          <div className="pt-6 border-t border-zinc-200 grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-1 text-zinc-600">
              <h4 className="font-bold text-zinc-900 text-xs">Termin Pembayaran:</h4>
              <p>• DP {config.paymentTerms.dpPercent}%: {formatCurrency(calc.dpAmount, cur)} (Saat Kickoff SPK)</p>
              <p>• Termin 2 ({config.paymentTerms.progressPercent}%): {formatCurrency(calc.progressAmount, cur)} (Saat Alpha Demo)</p>
              <p>• Pelunasan ({config.paymentTerms.finalPercent}%): {formatCurrency(calc.finalAmount, cur)} (Saat Handover Go-Live)</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center pt-4">
              <div>
                <p className="text-zinc-500 mb-12">Disetujui Oleh (Klien),</p>
                <div className="border-b border-zinc-400 w-32 mx-auto"></div>
                <p className="font-bold text-zinc-900 mt-1">{config.clientName}</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-12">Pengembang / Developer,</p>
                <div className="border-b border-zinc-400 w-32 mx-auto"></div>
                <p className="font-bold text-zinc-900 mt-1">{config.developerName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
