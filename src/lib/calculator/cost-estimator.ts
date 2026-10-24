import { DocItem, ProjectItem } from "../../types";

export type CurrencyType = "IDR" | "USD";
export type RateType = "daily" | "hourly";
export type ComplexityLevel = "low" | "medium" | "high" | "custom";
export type DeveloperRole = "fullstack" | "frontend" | "backend" | "designer" | "qa" | "pm";

export interface RateConfig {
  currency: CurrencyType;
  rateType: RateType;
  dailyRate: number; // in currency units (e.g. 500000 IDR or 350 USD)
  hourlyRate: number; // in currency units (e.g. 62500 IDR or 45 USD)
  hoursPerDay: number; // default 8
  baselineDays: {
    low: number; // default 2
    medium: number; // default 5
    high: number; // default 10
  };
  roleRates: {
    fullstack: number;
    frontend: number;
    backend: number;
    designer: number;
    qa: number;
    pm: number;
  };
  contingencyPercent: number; // default 15 (%)
  profitMarginPercent: number; // default 20 (%)
  taxPercent: number; // default 0 (%)
  paymentTerms: {
    dpPercent: number; // default 50 (%)
    progressPercent: number; // default 30 (%)
    finalPercent: number; // default 20 (%)
  };
  warrantyDays: number; // default 30 days
  validityDays: number; // default 14 days
  developerName: string;
  developerTitle: string;
  developerContact: string;
  clientName: string;
  clientCompany?: string;
  clientNotes: string;
}

export interface CostFeatureItem {
  id: string;
  name: string;
  description: string;
  complexity: ComplexityLevel;
  estimatedDays: number;
  role: DeveloperRole;
  customRate?: number;
}

export interface CostAddonItem {
  id: string;
  name: string;
  category: "infra" | "third_party" | "license" | "maintenance" | "other";
  cost: number;
  billingCycle: "one_time" | "monthly" | "yearly";
}

export interface CostCalculationResult {
  features: {
    item: CostFeatureItem;
    effectiveDailyRate: number;
    subtotal: number;
  }[];
  totalEffortDays: number;
  totalEffortCost: number;
  totalAddonsCost: number;
  baseCost: number;
  contingencyCost: number;
  subtotalWithContingency: number;
  profitMarginCost: number;
  subtotalWithProfit: number;
  taxCost: number;
  grandTotal: number;
  dpAmount: number;
  progressAmount: number;
  finalAmount: number;
}

export const DEFAULT_IDR_RATES: RateConfig = {
  currency: "IDR",
  rateType: "daily",
  dailyRate: 500000,
  hourlyRate: 65000,
  hoursPerDay: 8,
  baselineDays: {
    low: 2,
    medium: 5,
    high: 10,
  },
  roleRates: {
    fullstack: 500000,
    frontend: 450000,
    backend: 500000,
    designer: 350000,
    qa: 250000,
    pm: 400000,
  },
  contingencyPercent: 15,
  profitMarginPercent: 20,
  taxPercent: 0,
  paymentTerms: {
    dpPercent: 50,
    progressPercent: 30,
    finalPercent: 20,
  },
  warrantyDays: 30,
  validityDays: 14,
  developerName: "Indie Software Architect",
  developerTitle: "Fullstack Engineer & Product Builder",
  developerContact: "dev@appplanner.ai",
  clientName: "Bapak / Ibu Klien",
  clientCompany: "Perusahaan Klien",
  clientNotes: "Estimasi biaya mencakup 11 dokumen blueprint spesifikasi, implementasi kode, testing, dan deployment cloud.",
};

export const DEFAULT_USD_RATES: RateConfig = {
  currency: "USD",
  rateType: "hourly",
  dailyRate: 320,
  hourlyRate: 40,
  hoursPerDay: 8,
  baselineDays: {
    low: 2,
    medium: 5,
    high: 10,
  },
  roleRates: {
    fullstack: 320,
    frontend: 280,
    backend: 320,
    designer: 240,
    qa: 180,
    pm: 260,
  },
  contingencyPercent: 15,
  profitMarginPercent: 20,
  taxPercent: 0,
  paymentTerms: {
    dpPercent: 50,
    progressPercent: 30,
    finalPercent: 20,
  },
  warrantyDays: 30,
  validityDays: 14,
  developerName: "Lead Software Architect",
  developerTitle: "Fullstack Solutions Engineer",
  developerContact: "engineer@appplanner.ai",
  clientName: "Client Partner",
  clientCompany: "Client Org",
  clientNotes: "Estimate includes full architectural blueprint specifications, code implementation, automated tests, and edge cloud setup.",
};

export function getDefaultRateConfig(currency: CurrencyType = "IDR"): RateConfig {
  return currency === "USD" ? { ...DEFAULT_USD_RATES } : { ...DEFAULT_IDR_RATES };
}

export function formatCurrency(amount: number, currency: CurrencyType = "IDR"): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getRoleDailyRate(role: DeveloperRole, config: RateConfig): number {
  if (config.roleRates && config.roleRates[role] !== undefined) {
    return config.roleRates[role];
  }
  return config.dailyRate;
}

export function calculateProjectCost(
  features: CostFeatureItem[],
  addons: CostAddonItem[],
  config: RateConfig
): CostCalculationResult {
  let totalEffortDays = 0;
  let totalEffortCost = 0;

  const featuresBreakdown = features.map((feat) => {
    let effectiveRate = config.dailyRate;
    if (feat.customRate !== undefined && feat.customRate > 0) {
      effectiveRate = feat.customRate;
    } else {
      effectiveRate = getRoleDailyRate(feat.role, config);
    }

    const subtotal = feat.estimatedDays * effectiveRate;
    totalEffortDays += feat.estimatedDays;
    totalEffortCost += subtotal;

    return {
      item: feat,
      effectiveDailyRate: effectiveRate,
      subtotal,
    };
  });

  const totalAddonsCost = addons.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  const baseCost = totalEffortCost + totalAddonsCost;

  const contingencyCost = Math.round((baseCost * (config.contingencyPercent || 0)) / 100);
  const subtotalWithContingency = baseCost + contingencyCost;

  const profitMarginCost = Math.round(
    (subtotalWithContingency * (config.profitMarginPercent || 0)) / 100
  );
  const subtotalWithProfit = subtotalWithContingency + profitMarginCost;

  const taxCost = Math.round((subtotalWithProfit * (config.taxPercent || 0)) / 100);
  const grandTotal = subtotalWithProfit + taxCost;

  // Milestone breakdown
  const dpPercent = config.paymentTerms?.dpPercent ?? 50;
  const progressPercent = config.paymentTerms?.progressPercent ?? 30;
  const finalPercent = config.paymentTerms?.finalPercent ?? 20;

  const dpAmount = Math.round((grandTotal * dpPercent) / 100);
  const progressAmount = Math.round((grandTotal * progressPercent) / 100);
  const finalAmount = grandTotal - dpAmount - progressAmount; // avoid rounding discrepancies

  return {
    features: featuresBreakdown,
    totalEffortDays,
    totalEffortCost,
    totalAddonsCost,
    baseCost,
    contingencyCost,
    subtotalWithContingency,
    profitMarginCost,
    subtotalWithProfit,
    taxCost,
    grandTotal,
    dpAmount,
    progressAmount,
    finalAmount,
  };
}

export function getDefaultAddons(currency: CurrencyType = "IDR"): CostAddonItem[] {
  if (currency === "USD") {
    return [
      {
        id: "addon-1",
        name: "Cloud Database (Neon Postgres Serverless)",
        category: "infra",
        cost: 25,
        billingCycle: "monthly",
      },
      {
        id: "addon-2",
        name: "Custom Domain & Global Edge CDN (Cloudflare)",
        category: "infra",
        cost: 15,
        billingCycle: "yearly",
      },
      {
        id: "addon-3",
        name: "AI LLM Token Allowance (Gemini / OpenAI API)",
        category: "third_party",
        cost: 30,
        billingCycle: "one_time",
      },
      {
        id: "addon-4",
        name: "Payment Gateway Integration (Stripe / Midtrans)",
        category: "third_party",
        cost: 20,
        billingCycle: "one_time",
      },
    ];
  }

  return [
    {
      id: "addon-1",
      name: "Cloud Serverless Database (Neon Postgres Serverless)",
      category: "infra",
      cost: 350000,
      billingCycle: "yearly",
    },
    {
      id: "addon-2",
      name: "Domain .com & SSL Cloudflare Edge Deployment",
      category: "infra",
      cost: 180000,
      billingCycle: "yearly",
    },
    {
      id: "addon-3",
      name: "Alokasi Kuota Token API AI (Gemini BYOK Multi-LLM)",
      category: "third_party",
      cost: 300000,
      billingCycle: "one_time",
    },
    {
      id: "addon-4",
      name: "Konfigurasi & Webhook Payment Gateway (Midtrans/Xendit)",
      category: "third_party",
      cost: 250000,
      billingCycle: "one_time",
    },
  ];
}

function getBaselineDays(cfg: RateConfig, complexity: ComplexityLevel): number {
  if (complexity === "low") return cfg.baselineDays.low;
  if (complexity === "high") return cfg.baselineDays.high;
  return cfg.baselineDays.medium;
}

export function extractFeaturesFromProject(
  project?: ProjectItem | null,
  documents?: DocItem[],
  config?: RateConfig
): CostFeatureItem[] {
  const cfg = config || DEFAULT_IDR_RATES;
  const features: CostFeatureItem[] = [];

  // 1. Try to parse from PRD.md if present
  const prdDoc = documents?.find((d) => d.filename.toLowerCase() === "prd.md");
  if (prdDoc && prdDoc.content) {
    const lines = prdDoc.content.split("\n");
    let inFeaturesSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.match(/^##\s+3\.\s+Fitur Utama/i) || line.match(/^##\s+Fitur Utama/i) || line.match(/###\s+3\.\d+/i)) {
        inFeaturesSection = true;
      } else if (line.match(/^##\s+[4-9]\./i) || (inFeaturesSection && line.startsWith("## ") && !line.includes("3."))) {
        inFeaturesSection = false;
      }

      if (inFeaturesSection) {
        const featureMatch = line.match(/^###\s+3\.\d+\s+(.+)$/i);
        if (featureMatch) {
          const name = featureMatch[1].trim();
          let description = "";
          if (i + 1 < lines.length && lines[i + 1].trim().startsWith("- **Deskripsi:**")) {
            description = lines[i + 1].replace(/^- \*\*Deskripsi:\*\*\s*/i, "").trim();
          }

          const complexity = inferComplexity(name, description);
          const estimatedDays = getBaselineDays(cfg, complexity);
          const role = inferRole(name);

          features.push({
            id: `feat-${features.length + 1}`,
            name,
            description: description || `Implementasi modul ${name}`,
            complexity,
            estimatedDays,
            role,
          });
        }
      }
    }
  }

  // 2. Try to parse from tasks.md if PRD didn't give features
  if (features.length === 0) {
    const tasksDoc = documents?.find((d) => d.filename.toLowerCase() === "tasks.md");
    if (tasksDoc && tasksDoc.content) {
      const taskMatches = tasksDoc.content.matchAll(/###\s+\[[ x]\]\s+TASK-\d+:\s+([^\n]+)/gi);
      for (const m of taskMatches) {
        const taskTitle = m[1].trim();
        const complexity = inferComplexity(taskTitle, "");
        const estimatedDays = getBaselineDays(cfg, complexity);
        const role = inferRole(taskTitle);

        features.push({
          id: `feat-${features.length + 1}`,
          name: taskTitle,
          description: `Pengerjaan spesifikasi task ${taskTitle}`,
          complexity,
          estimatedDays,
          role,
        });
      }
    }
  }

  // 3. Fallback to raw_idea / standard core features if empty
  if (features.length === 0) {
    const standardModules = [
      {
        name: "Autentikasi Pengguna & Role Based Access Control (RBAC)",
        complexity: "medium" as ComplexityLevel,
        role: "backend" as DeveloperRole,
        desc: "Sistem login, register JWKS, session guard, dan pemisahan hak akses admin & user.",
      },
      {
        name: "Dashboard & Navigation Management",
        complexity: "low" as ComplexityLevel,
        role: "frontend" as DeveloperRole,
        desc: "Antarmuka dashboard responsif, navigasi cepat, dan layout workspace.",
      },
      {
        name: "Core Business Logic & Data CRUD Engine",
        complexity: "medium" as ComplexityLevel,
        role: "fullstack" as DeveloperRole,
        desc: "Pengolahan database serverless Neon, validasi form, dan API endpoints.",
      },
      {
        name: "Integrasi Eksternal & Automated Generator Pipeline",
        complexity: "high" as ComplexityLevel,
        role: "fullstack" as DeveloperRole,
        desc: "Pipeline automasi terintegrasi, API pihak ketiga, dan export dokumen.",
      },
      {
        name: "Testing, UAT, & Edge Cloud Production Deployment",
        complexity: "medium" as ComplexityLevel,
        role: "qa" as DeveloperRole,
        desc: "Quality assurance menyeluruh, verifikasi keamanan, dan deployment Cloudflare Pages.",
      },
    ];

    standardModules.forEach((mod, idx) => {
      features.push({
        id: `feat-${idx + 1}`,
        name: mod.name,
        description: mod.desc,
        complexity: mod.complexity,
        estimatedDays: getBaselineDays(cfg, mod.complexity),
        role: mod.role,
      });
    });
  }

  return features;
}

function inferComplexity(title: string, desc: string): ComplexityLevel {
  const text = `${title} ${desc}`.toLowerCase();
  if (
    text.includes("ai") ||
    text.includes("pipeline") ||
    text.includes("realtime") ||
    text.includes("collaboration") ||
    text.includes("multi-tenant") ||
    text.includes("streaming") ||
    text.includes("engine") ||
    text.includes("orkestrasi")
  ) {
    return "high";
  }

  if (
    text.includes("auth") ||
    text.includes("rbac") ||
    text.includes("payment") ||
    text.includes("billing") ||
    text.includes("gateway") ||
    text.includes("export") ||
    text.includes("api") ||
    text.includes("database") ||
    text.includes("migration")
  ) {
    return "medium";
  }

  return "low";
}

function inferRole(title: string): DeveloperRole {
  const text = title.toLowerCase();
  if (text.includes("ui") || text.includes("design") || text.includes("ux") || text.includes("wireframe")) {
    return "designer";
  }
  if (text.includes("qa") || text.includes("test") || text.includes("audit") || text.includes("security")) {
    return "qa";
  }
  if (text.includes("database") || text.includes("api") || text.includes("backend") || text.includes("auth")) {
    return "backend";
  }
  if (text.includes("dashboard") || text.includes("frontend") || text.includes("page") || text.includes("view")) {
    return "frontend";
  }
  return "fullstack";
}

export function generateRABMarkdown(
  projectName: string,
  features: CostFeatureItem[],
  addons: CostAddonItem[],
  config: RateConfig,
  calc: CostCalculationResult
): string {
  const cur = config.currency;
  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const validUntilStr = new Date(
    Date.now() + (config.validityDays || 14) * 24 * 60 * 60 * 1000
  ).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const quoteNo = `RAB-${Date.now().toString().slice(-6)}`;

  // Serialized raw state for bi-directional loading
  const rawState = {
    quoteNo,
    projectName,
    config,
    features,
    addons,
    updatedAt: new Date().toISOString(),
  };

  const jsonEmbedded = Buffer.from(JSON.stringify(rawState)).toString("base64");

  return `# RENCANA ANGGARAN BIAYA (RAB) & PENAWARAN PENGEMBANGAN
**Dokumen Penawaran Teknis & Finansial Pengembangan Aplikasi**

---

## 1. Informasi Penawaran Proyek
- **Nomor Referensi:** \`${quoteNo}\`
- **Tanggal Diterbitkan:** ${todayStr}
- **Masa Berlaku Penawaran:** ${validUntilStr} (${config.validityDays} hari)
- **Nama Proyek:** ${projectName}
- **Nama Klien / Perusahaan:** ${config.clientName || "Klien Terhormat"} ${config.clientCompany ? `(${config.clientCompany})` : ""}
- **Lead Developer / Arsitek:** ${config.developerName} (${config.developerTitle})
- **Kontak Resmi:** ${config.developerContact}

---

## 2. Ringkasan Eksekutif & Asumsi Pengembangan
- **Estimasi Total Durasi Pengerjaan:** **${calc.totalEffortDays} Hari Kerja** (~${Math.ceil(calc.totalEffortDays / 5)} Minggu Kalender)
- **Standar Rate Developer:** ${formatCurrency(config.dailyRate, cur)} / hari kerja
- **Garansi Pemeliharaan (Bug-Free SLA):** ${config.warrantyDays} Hari Kalender pasca-Handover
- **Catatan & Ruang Lingkup:** ${config.clientNotes || "Pengembangan mengacu pada 11 dokumen blueprint spesifikasi arsitektur yang telah divalidasi bersama."}

---

## 3. Rincian Ruang Lingkup & Biaya Fitur (Development Effort)

| No | Modul / Fitur Pekerjaan | Kompleksitas | Role | Durasi | Rate / Hari | Subtotal |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
${calc.features
  .map(
    (f, idx) =>
      `| ${idx + 1} | **${f.item.name}**<br>_${f.item.description || "-"}_ | \`${f.item.complexity.toUpperCase()}\` | ${f.item.role} | ${f.item.estimatedDays} Hari | ${formatCurrency(f.effectiveDailyRate, cur)} | ${formatCurrency(f.subtotal, cur)} |`
  )
  .join("\n")}
| | **SUBTOTAL DEVELOPMENT EFFORT** | | | **${calc.totalEffortDays} Hari** | | **${formatCurrency(calc.totalEffortCost, cur)}** |

---

## 4. Rincian Infrastruktur, Server & Lisensi Third-Party

| No | Komponen Layanan / Server | Kategori | Siklus Biaya | Estimasi Biaya |
| :---: | :--- | :---: | :---: | :---: |
${
  addons.length > 0
    ? addons
        .map(
          (a, idx) =>
            `| ${idx + 1} | **${a.name}** | \`${a.category}\` | ${a.billingCycle === "one_time" ? "Satu Kali (One-Time)" : a.billingCycle === "yearly" ? "Tahunan (Yearly)" : "Bulanan (Monthly)"} | ${formatCurrency(a.cost, cur)} |`
        )
        .join("\n")
    : "| - | Tidak ada biaya infrastruktur tambahan | - | - | Rp 0 |"
}
| | **SUBTOTAL BIAYA INFRASTRUKTUR & LISENSI** | | | **${formatCurrency(calc.totalAddonsCost, cur)}** |

---

## 5. Rekapitulasi Rencana Anggaran Biaya (RAB Final)

| No | Komponen Biaya | Nilai Kalkulasi |
| :---: | :--- | :---: |
| 1 | **Total Biaya Development Effort** (${calc.totalEffortDays} Hari Kerja) | ${formatCurrency(calc.totalEffortCost, cur)} |
| 2 | **Total Infrastruktur & Lisensi Third-Party** | ${formatCurrency(calc.totalAddonsCost, cur)} |
| | **SUBTOTAL BIAYA DASAR (BASE COST)** | **${formatCurrency(calc.baseCost, cur)}** |
| 3 | **Risk & Contingency Buffer (+${config.contingencyPercent}%)** *(Antisipasi revisi & ketidakpastian teknis)* | ${formatCurrency(calc.contingencyCost, cur)} |
| | **Subtotal dengan Buffer** | **${formatCurrency(calc.subtotalWithContingency, cur)}** |
| 4 | **Profit & Business Markup (+${config.profitMarginPercent}%)** *(Quality assurance, setup tools & manajemen)* | ${formatCurrency(calc.profitMarginCost, cur)} |
| | **Subtotal Sebelum Pajak** | **${formatCurrency(calc.subtotalWithProfit, cur)}** |
${config.taxPercent > 0 ? `| 5 | **Pajak PPN (+${config.taxPercent}%)** | ${formatCurrency(calc.taxCost, cur)} |\n` : ""}| | **GRAND TOTAL NILAI INVESTASI PROYEK** | **${formatCurrency(calc.grandTotal, cur)}** |

---

## 6. Skema Pembayaran & Termin Milestone

Pembayaran dilakukan secara bertahap berbasis pencapaian (milestone-based):

1. **Termin 1 (Uang Muka / DP ${config.paymentTerms.dpPercent}%):** **${formatCurrency(calc.dpAmount, cur)}**
   - *Syarat Pencairan:* Penandatanganan MoU / Surat Perintah Kerja (SPK) & Finalisasi 11 Dokumen Blueprint.
   - *Target Output:* Repository disiapkan, Database Neon dimigrasikan, dan skema auth terpasang.

2. **Termin 2 (Progress ${config.paymentTerms.progressPercent}%):** **${formatCurrency(calc.progressAmount, cur)}**
   - *Syarat Pencairan:* Penyelesaian 80% fitur utama (Alpha Demo) & review fungsional pertama.
   - *Target Output:* Alur bisnis utama dapat diuji coba di environment staging.

3. **Termin 3 (Pelunasan & Serah Terima ${config.paymentTerms.finalPercent}%):** **${formatCurrency(calc.finalAmount, cur)}**
   - *Syarat Pencairan:* User Acceptance Testing (UAT) disetujui, serah terima source code, domain & hosting go-live.
   - *Target Output:* Deployment production & masa garansi aktif.

---

## 7. Ketentuan Layanan & Garansi (SLA)
1. **Garansi Bug-Free:** Bebas biaya perbaikan kendala teknis (bug) selama **${config.warrantyDays} hari kalender** terhitung sejak tanggal go-live production.
2. **Perubahan Ruang Lingkup (Scope Creep):** Fitur tambahan di luar 11 dokumen blueprint awal akan dihitung sebagai *Change Request (CR)* terpisah dengan tarif harian standar developer (${formatCurrency(config.dailyRate, cur)} / hari).
3. **Kepemilikan Intelektual (IP Rights):** 100% kepemilikan source code dan database dialihkan ke Klien setelah pembayaran lunas diselesaikan.

---

<!-- PROJECT_COST_ESTIMATE_DATA: ${jsonEmbedded} -->
`;
}

export function parseRABMarkdown(content: string): {
  quoteNo?: string;
  projectName?: string;
  config?: RateConfig;
  features?: CostFeatureItem[];
  addons?: CostAddonItem[];
} | null {
  try {
    const match = content.match(/<!--\s*PROJECT_COST_ESTIMATE_DATA:\s*([A-Za-z0-9+/=]+)\s*-->/);
    if (!match) return null;
    const base64Str = match[1];
    const jsonStr = Buffer.from(base64Str, "base64").toString("utf-8");
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse RAB markdown data tag:", e);
    return null;
  }
}
