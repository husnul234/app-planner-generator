export interface BlueprintDoc {
  filename: string;
  file_slug: string;
  title: string;
  description: string;
  defaultContent: (meta: ProjectMeta) => string;
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

export const BLUEPRINT_DOCUMENTS: BlueprintDoc[] = [
  {
    filename: "PRD.md",
    file_slug: "prd",
    title: "Product Requirements Document",
    description: "Spesifikasi produk menyeluruh, visi, target user, metrik kesuksesan, dan cakupan fitur.",
    defaultContent: (meta) => `# Product Requirements Document (PRD): ${meta.appName}

## 1. Executive Summary & Vision
- **Nama Aplikasi:** ${meta.appName}
- **Kategori:** ${meta.category || "SaaS / Developer Tool"}
- **Tagline:** ${meta.tagline || "Solusi terstandarisasi untuk pengembangan perangkat lunak modern."}
- **Tujuan Utama:** Memecahkan masalah "${meta.problem || "Inefisiensi alur kerja perencanaan arsitektur"}" bagi ${meta.targetAudience || "Developer dan Product Manager"}.

## 2. Target Pengguna & Persona
1. **Primary Persona:** Technical Lead / Senior Architect yang membutuhkan dokumen arsitektur komprehensif.
2. **Secondary Persona:** Solo Founder / Indie Hacker yang ingin mempercepat fase validasi dan eksekusi kode.

## 3. Fitur Utama & Prioritas (MoSCoW)
${(meta.coreFeatures && meta.coreFeatures.length > 0
  ? meta.coreFeatures
  : [
      "Wizard Interaktif 7 Tahap",
      "Generator 11 Dokumen Blueprint Terstandarisasi",
      "Sinkronisasi Multi-Cloud Neon & Cloudflare",
      "Ekspor Arsip ZIP & Markdown Terpadu",
    ]
)
  .map((feat, idx) => `### 3.${idx + 1} ${feat}\n- **Prioritas:** Must Have\n- **Deskripsi:** Mengimplementasikan ${feat.toLowerCase()} dengan standar performa edge.`)
  .join("\n\n")}

## 4. Metrik Keberhasilan (KPIs)
- **Time to Blueprint:** < 3 menit dari input prompt hingga dokumen lengkap.
- **Export Reliability:** 100% konsistensi format markdown dan kompatibilitas ZIP.
- **Service Uptime:** > 99.9% menggunakan infrastruktur Neon Postgres dan serverless edge.
`,
  },
  {
    filename: "map.md",
    file_slug: "map",
    title: "Peta Navigasi & Information Architecture",
    description: "Struktur hierarki halaman, user flow, sitemap, dan diagram navigasi.",
    defaultContent: (meta) => `# Information Architecture & Sitemap: ${meta.appName}

## 1. Hierarki Navigasi Utama
\`\`\`text
Root /
├── Dashboard Overview (/dashboard)
├── Wizard Perencanaan (/wizard)
│   ├── Tahap 1: Kategori & Ide
│   ├── Tahap 2: Detail Solusi
│   ├── Tahap 3: Fitur Inti
│   ├── Tahap 4: Target Pengguna
│   ├── Tahap 5: Tech Stack (${meta.techStack?.join(", ") || "Next.js, Neon, Tailwind"})
│   ├── Tahap 6: Desain & Flow
│   └── Tahap 7: Model AI (${meta.selectedModel || "Gemini 2.0 Flash"})
├── Workspace Preview (/workspace/[projectId])
│   ├── 11 Tab Dokumen Arsitektur
│   ├── Inspektor Markdown
│   └── Menu Ekspor (ZIP / Single File)
└── Neon Infra Health (/infra)
\`\`\`

## 2. User Journey Flow
1. User memasukkan ide dan preferensi arsitektur di Wizard.
2. Generator menyusun 11 dokumen blueprint secara simultan.
3. User meninjau tiap dokumen di Workspace.
4. User menyimpan ke Neon Postgres dan mengunduh berkas ZIP.
`,
  },
  {
    filename: "architecture.md",
    file_slug: "architecture",
    title: "System Architecture & Tech Stack",
    description: "Arsitektur sistem end-to-end, integrasi Neon Serverless, dan pipeline data.",
    defaultContent: (meta) => `# Arsitektur Sistem: ${meta.appName}

## 1. Komponen Arsitektur Utama
- **Frontend Framework:** Next.js 15 (App Router, React 19, TypeScript)
- **Styling:** TailwindCSS dengan semantic tokens dan prinsip anti-slop
- **Database:** Neon PostgreSQL Serverless (\`@neondatabase/serverless\`)
- **Object Storage:** Neon S3-Compatible Storage (\`@aws-sdk/client-s3\`)
- **Authentication:** Neon Auth (JWKS Verification)
- **Edge Deployment:** Cloudflare Pages / Workers
- **AI Processing:** Multi-LLM Gateway (${meta.selectedModel || "Google Gemini / Anthropic Claude / OpenAI"})

## 2. Diagram Aliran Data (Data Flow)
\`\`\`text
[Client Browser]
      │
      ▼ (HTTPS / Edge)
[Next.js App Router on Cloudflare / Node]
      ├──> Neon Serverless Postgres (Pooler / HTTP)
      ├──> Neon Object Storage (S3 / assets bucket)
      ├──> Neon Serverless Functions (hello endpoint)
      └──> Neon Realtime (WebSockets)
\`\`\`
`,
  },
  {
    filename: "wireframes.md",
    file_slug: "wireframes",
    title: "Wireframes & UI Layout Specifications",
    description: "Layout antarmuka, hierarki visual, mobile-first layouts, dan state interaksi.",
    defaultContent: (meta) => `# Wireframes & UI Layout Specification: ${meta.appName}

## 1. Prinsip Desain Antarmuka
- **Anti-Slop Standard:** Mengikuti rulebook frontend taste (.agents/skills/design-taste-frontend).
- **Variance / Motion / Density:** 6 / 4 / 5.
- **Viewport Hero:** Pas dalam 100dvh awal tanpa scroll artifisial.
- **Navigasi Desktop:** Single line bar, tinggi 64px, tanpa elemen bertumpuk.

## 2. Layout Wireframe: Dashboard & Wizard
\`\`\`text
+--------------------------------------------------------------------------+
|  LOGO  [Dashboard] [Wizard] [Workspace] [Infra Telemetry]   [Status: OK] |
+--------------------------------------------------------------------------+
|  Hero: Rancang 11 Dokumen Blueprint Aplikasi Sekaligus                   |
|  Input Ide Cepat: [ Masukkan ide produk Anda...          ] [ Buat Plan ] |
+--------------------------------------------------------------------------+
|  [Tab 1: PRD] [Tab 2: Map] [Tab 3: Arch] [Tab 4: Wireframes] [Lainnya]    |
|  +-------------------------------------+---------------------------------+
|  | Daftar Bab & Struktur Dokumen       | Preview Dokumen Markdown        |
|  | 1. Ringkasan Eksekutif              | # PRD: ${meta.appName}           |
|  | 2. Fitur Inti                       | Menjelaskan kebutuhan utama...  |
|  | 3. Matriks Sukses                   | [Salin] [Unduh MD] [Unduh ZIP]  |
|  +-------------------------------------+---------------------------------+
+--------------------------------------------------------------------------+
\`\`\`
`,
  },
  {
    filename: "database_schema.md",
    file_slug: "database_schema",
    title: "Database Schema & PostgreSQL DDL",
    description: "Struktur tabel, relasi foreign key, tipe data enumerasi, dan indeks performa.",
    defaultContent: (meta) => `# Database Schema Specification: ${meta.appName}

## 1. Tabel Utama PostgreSQL (Neon)
1. \`public.profiles\`: Profil pengguna tersinkron dengan \`neon_auth.user\`.
2. \`public.projects\`: Blueprint proyek master (nama, slug, tech stack, status).
3. \`public.project_interviews\`: Konteks QnA hasil wawancara interaktif.
4. \`public.project_documents\`: 11 berkas dokumen blueprint per proyek.
5. \`public.template_prompts\`: Master konfigurasi system prompt terpusat.
6. \`public.token_usage_logs\`: Audit kuota dan biaya token inferensi LLM.
7. \`public.audit_logs\`: Riwayat aksi penting dan audit trail keamanan.

## 2. Indeks Performa
- \`idx_projects_user_id\` pada \`projects(user_id)\`
- \`idx_project_docs_project_id\` pada \`project_documents(project_id)\`
`,
  },
  {
    filename: "api_spec.md",
    file_slug: "api_spec",
    title: "REST & Edge API Specifications",
    description: "Kontrak endpoint HTTP, struktur request, response, dan kode status.",
    defaultContent: (meta) => `# API Specification: ${meta.appName}

## 1. Endpoints Overview
- \`GET /api/neon/health\`: Uji diagnostik kesehatan seluruh layanan Neon (Postgres, Storage, Auth, Functions, Realtime).
- \`GET /api/projects\`: Mengambil daftar proyek blueprint yang tersimpan.
- \`POST /api/projects\`: Menyimpan proyek baru, dokumen markdown ke Postgres dan cadangan ke Neon Storage.
- \`POST /api/generate\`: Memulai pipeline sintesis 11 dokumen blueprint berbasis LLM.

## 2. Response Standard
\`\`\`json
{
  "success": true,
  "data": {},
  "timestamp": "2026-10-24T10:00:00Z"
}
\`\`\`
`,
  },
  {
    filename: "design_sistem.md",
    file_slug: "design_sistem",
    title: "Design System & Token Specifications",
    description: "Palet warna semantic, skala tipografi, radius konsisten, dan komponen UI.",
    defaultContent: (meta) => `# Design System Tokens: ${meta.appName}

## 1. Semantic Palette (Anti-Slop)
- Base Surface: \`#090d16\` (Dark Neutral), \`#0f172a\` (Elevated Surface)
- Primary Accent: \`#10b981\` (Emerald High Contrast) / \`#2563eb\` (Cobalt)
- Text Contrast: Minimum WCAG AA (4.5:1 untuk body, 3:1 untuk display)
- Border: 1px subtle \`rgba(255, 255, 255, 0.08)\`

## 2. Typographic Scale
- Display H1: \`text-4xl md:text-5xl tracking-tight font-semibold\`
- Subtitle: \`text-base text-zinc-400 max-w-[65ch] leading-relaxed\`
- Code & Tech: \`font-mono text-sm\`
`,
  },
  {
    filename: "security.md",
    file_slug: "security",
    title: "Security, Auth & Threat Model",
    description: "Validasi token JWKS, enkripsi data at rest/in transit, dan proteksi SSRF/CORS.",
    defaultContent: (meta) => `# Security & Threat Model: ${meta.appName}

## 1. Prinsip Keamanan Inti
1. **Zero Secret Leakage:** Kunci rahasia tersimpan di environment serverless, tidak diekspos ke client bundle.
2. **Neon Auth JWKS Verification:** Validasi tanda tangan EdDSA pada setiap token autentikasi.
3. **Prepared Statements:** Menggunakan driver \`@neondatabase/serverless\` yang mengisolasi input dari SQL injection.
4. **Least Privilege Object Storage:** Akses bucket Neon S3 dibatasi melalui signed credentials.
`,
  },
  {
    filename: "qa.md",
    file_slug: "qa",
    title: "Quality Assurance & Test Strategy",
    description: "Strategi pengujian otomatis, integrasi layanan, dan validasi pre-flight.",
    defaultContent: (meta) => `# QA & Testing Strategy: ${meta.appName}

## 1. Test Matrix
- **Unit Testing:** Validasi parser generator dokumen dan pembuatan arsip ZIP.
- **Integration Testing:** Pengecekan end-to-end seluruh 5 service Neon via \`/api/neon/health\`.
- **Pre-flight Frontend Check:** Audit zero em-dash, WCAG AA contrast, single-line CTAs.
- **Build Verification:** \`npm run build\` lolos tanpa error TypeScript maupun linting.
`,
  },
  {
    filename: "deployment.md",
    file_slug: "deployment",
    title: "Deployment & Infrastructure Guide",
    description: "Panduan deployment ke Cloudflare Pages, Neon Branching, dan otomatisasi CI/CD.",
    defaultContent: (meta) => `# Deployment & Infrastructure Guide: ${meta.appName}

## 1. Target Hosting
- **Edge Hosting:** Cloudflare Pages / Workers
- **Database:** Neon PostgreSQL (Branch: \`production\`)
- **Bucket:** Neon Object Storage (\`assets\`)
- **Functions:** Neon Serverless Compute (\`hello\`)

## 2. Pipeline Deployment
1. Jalankan \`npm run build\` untuk memvalidasi bundle.
2. Jalankan \`node scripts/test-services.js\` untuk memverifikasi seluruh layanan Neon.
3. Commit dan push ke branch \`main\` pada remote GitHub.
4. Cloudflare Pages melakukan auto-deploy secara instan.
`,
  },
  {
    filename: "log.md",
    file_slug: "log",
    title: "Log Generator & Architecture Decision Records",
    description: "Catatan riwayat keputusan arsitektur, parameter generator, dan audit versi.",
    defaultContent: (meta) => `# Changelog & ADR: ${meta.appName}

## ADR-001: Adopsi Neon Serverless Postgres & Object Storage
- **Status:** Diterima & Diimplementasikan
- **Konteks:** Membutuhkan database PostgreSQL dan penyimpanan objek tanpa manajemen server fisik yang kompatibel dengan runtime Cloudflare Pages.
- **Keputusan:** Menggunakan \`@neondatabase/serverless\` dan Neon Object Storage (S3 API).
- **Konsekuensi:** Latensi rendah, koneksi HTTP pooling yang tidak melanggar batas koneksi serverless.
`,
  },
];
