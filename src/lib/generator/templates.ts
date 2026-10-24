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

export interface ArchitecturePreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  meta: ProjectMeta;
}

export const ARCHITECTURE_PRESETS: ArchitecturePreset[] = [
  {
    id: "fullstack-saas",
    name: "Fullstack SaaS Platform",
    badge: "Populer",
    description: "Template SaaS lengkap dengan auth JWKS, database serverless, billing, dan role admin/user.",
    meta: {
      appName: "CloudScale SaaS",
      category: "SaaS Web Platform",
      tagline: "Platform SaaS modern dengan arsitektur serverless scalable dan auth terintegrasi.",
      problem: "Kompleksitas setup infrastruktur database, auth, dan billing berulang saat membangun SaaS baru.",
      targetAudience: "Indie Hackers, Solo Founders, dan Engineering Teams",
      coreFeatures: [
        "Autentikasi & RBAC (Admin/User)",
        "Manajemen Langganan & Billing Midtrans/Stripe",
        "Dashboard Metrik & Analitik Realtime",
        "API Token & Webhook Gateway",
      ],
      techStack: ["Next.js 15 App Router", "Neon PostgreSQL Serverless", "Neon Object Storage", "TailwindCSS", "Cloudflare Pages"],
      dbType: "Neon PostgreSQL (@neondatabase/serverless)",
      selectedModel: "Google Gemini 3.8 Flash",
    },
  },
  {
    id: "ai-agent-platform",
    name: "AI Agent & Chatbot Hub",
    badge: "AI Native",
    description: "Arsitektur multi-LLM pool dengan streaming SSE, rotasi kunci BYOK, dan task breakdown.",
    meta: {
      appName: "AgentCraft AI",
      category: "AI Tool & Agentic Workflow",
      tagline: "Platform orkestrasi agent AI multi-model dengan streaming respon dan memory.",
      problem: "Context drift, rate limit LLM tunggal, dan mahalnya biaya inferensi tanpa sistem pooling cerdas.",
      targetAudience: "AI Engineers, Content Creators, dan Enterprise Automation Teams",
      coreFeatures: [
        "Kolam Multi-Key Gemini/Claude BYOK",
        "Streaming Chat SSE dengan Markdown Preview",
        "Vector Knowledge Base & RAG Memory",
        "Execution Task Breakdown Export",
      ],
      techStack: ["Next.js 15", "Neon Serverless Postgres", "Google Gemini 3.8 Flash Pool", "TailwindCSS"],
      dbType: "Neon PostgreSQL (@neondatabase/serverless)",
      selectedModel: "Google Gemini 3.8 Flash",
    },
  },
  {
    id: "ecommerce-marketplace",
    name: "E-Commerce & Digital Store",
    badge: "Transaksi",
    description: "Katalog produk super cepat, keranjang belanja, checkout QRIS/Virtual Account, dan tracking stok.",
    meta: {
      appName: "MarketForge Store",
      category: "E-Commerce & Digital Goods",
      tagline: "Platform toko online cepat dengan manajemen inventori otomatis dan checkout instan.",
      problem: "Lambatnya loading catalog produk dan kesulitan sinkronisasi stok multi-channel secara real-time.",
      targetAudience: "Merchant Online, Brand Lokal, dan Pelaku UMKM Digital",
      coreFeatures: [
        "Katalog Produk & Filter Kategori Cepat",
        "Keranjang Belanja & Payment Gateway QRIS/VA",
        "Order Tracking & Notifikasi WhatsApp",
        "Admin Stock Inventory & Sales Report",
      ],
      techStack: ["Next.js 15", "Neon PostgreSQL Serverless", "Neon Object Storage (Media)", "TailwindCSS"],
      dbType: "Neon PostgreSQL (@neondatabase/serverless)",
      selectedModel: "Google Gemini 3.5 Flash Lite",
    },
  },
  {
    id: "internal-crm",
    name: "Operations & Sales CRM",
    badge: "Enterprise",
    description: "Pipeline deals kanban, manajemen kontak leads, audit log keamanan, dan laporan berkala.",
    meta: {
      appName: "OpsFlow CRM",
      category: "Enterprise Operations & CRM",
      tagline: "Sistem operasi bisnis internal untuk manajemen leads, pipeline deal, dan performa tim.",
      problem: "Data pelanggan tersebar di spreadsheet tidak terenkripsi tanpa audit trail aktivitas tim.",
      targetAudience: "Sales Teams, Operation Leads, dan Pelaku Bisnis B2B",
      coreFeatures: [
        "Visual Kanban Pipeline Deal & Leads",
        "Role-Based Access Control (Admin, Manager, Staff)",
        "Audit Trail Aktivitas & Log Perubahan Data",
        "Ekspor Laporan PDF & Data Tables",
      ],
      techStack: ["Next.js 15", "Neon PostgreSQL Serverless", "Neon Auth JWKS", "TailwindCSS"],
      dbType: "Neon PostgreSQL (@neondatabase/serverless)",
      selectedModel: "Google Gemini 3.8 Flash",
    },
  },
  {
    id: "mobile-api-backend",
    name: "Mobile Edge API Backend",
    badge: "Edge API",
    description: "Backend API berlatensi ultra-rendah untuk Flutter / React Native dengan upload S3 & notifikasi.",
    meta: {
      appName: "AppCore Edge API",
      category: "Mobile Backend & API Gateway",
      tagline: "Backend API berkecepatan tinggi untuk mobile app dengan otentikasi aman dan penyimpanan aset.",
      problem: "Latensi tinggi cold-start serverless tradisional dan biaya database cloud yang membengkak.",
      targetAudience: "Mobile App Developers & Fullstack Engineers",
      coreFeatures: [
        "REST Endpoints Berlatensi Rendah di Edge",
        "Token-Based JWT Auth dengan Refresh Token",
        "Push Notification Service Integration",
        "Upload Media S3 Bucket dengan Presigned URL",
      ],
      techStack: ["Next.js Edge Runtime", "Neon PostgreSQL (@neondatabase/serverless)", "Neon Object Storage", "JWT / JWKS"],
      dbType: "Neon PostgreSQL (@neondatabase/serverless)",
      selectedModel: "Google Gemini 2.5 Flash",
    },
  },
];

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
  {
    filename: "tasks.md",
    file_slug: "tasks",
    title: "Actionable AI Execution Tasks & Milestones",
    description: "Daftar task granular bertahap yang siap dieksekusi langsung oleh AI coding agent (Cursor/Claude/Antigravity) satu per satu.",
    defaultContent: (meta) => `# Actionable AI Execution Tasks: ${meta.appName}
> **Panduan Eksekusi AI Coding (NgodingPakeAI Style):**
> Eksekusi task di bawah ini secara sekuensial (satu per satu). Berikan prompt spesifik tiap task kepada coding agent Anda untuk mencegah context drift dan halusinasi skema.

---

## Ringkasan Eksekusi Proyek
- **Nama Aplikasi:** ${meta.appName}
- **Tech Stack:** ${meta.techStack?.join(", ") || "Next.js 15, Neon Postgres, TailwindCSS"}
- **Database:** ${meta.dbType || "Neon PostgreSQL (@neondatabase/serverless)"}
- **Metode Eksekusi:** Jalankan \`node scripts/cli.js next\` atau salin prompt tiap task di bawah ke AI Agent.

---

## Fase 1: Fondasi Skema Database & Storage

### [ ] TASK-01: Migrasi DDL Tabel PostgreSQL Neon
- **Kategori:** Database
- **File Target:** \`scripts/migrate.js\`, \`src/lib/neon/db.ts\`
- **Deskripsi:** Siapkan tabel utama sesuai dengan spesifikasi \`database_schema.md\`.
- **Prompt Eksekusi AI:**
\`\`\`markdown
Bertindaklah sebagai Database Engineer. Buat skrip migrasi DDL untuk aplikasi "${meta.appName}" menggunakan driver @neondatabase/serverless.
Tabel yang wajib dibuat:
1. profiles (id, email, full_name, role, created_at)
2. projects (id, name, slug, status, created_at)
3. core_data (sesuai kebutuhan fitur: ${meta.coreFeatures?.slice(0, 2).join(", ") || "fitur utama"})
Pastikan menambahkan indeks performa, foreign key yang konsisten, dan connection pooling HTTP.
\`\`\`
- **Kriteria Selesai:** Eksekusi skrip migrasi sukses tanpa error sintaks SQL.

### [ ] TASK-02: Konfigurasi Client Database & Object Storage
- **Kategori:** Infrastruktur & SDK
- **File Target:** \`src/lib/neon/db.ts\`, \`src/lib/neon/storage.ts\`
- **Deskripsi:** Inisialisasi pool koneksi Postgres serverless dan S3 client untuk upload aset.
- **Prompt Eksekusi AI:**
\`\`\`markdown
Implementasikan helper database Neon dan Object Storage S3 di TypeScript.
Fungsi yang dibutuhkan:
- query(sql, params): Eksekusi kueri terisolasi SQL Injection
- uploadObject(key, buffer, contentType): Upload file ke Neon Object Storage
- getObjectUrl(key): Dapatkan URL publik/presigned
Gunakan environment variable DATABASE_URL dan AWS_S3_* yang aman.
\`\`\`
- **Kriteria Selesai:** Script uji koneksi berhasil mengembalikan versi database dan ping S3.

---

## Fase 2: Autentikasi & Core Backend Endpoints

### [ ] TASK-03: Sistem Autentikasi & RBAC
- **Kategori:** Backend & Auth
- **File Target:** \`src/lib/neon/auth.ts\`, \`src/app/api/auth/route.ts\`
- **Deskripsi:** Integrasikan autentikasi berbasis JWKS / Session dengan pemisahan role Admin & User.
- **Prompt Eksekusi AI:**
\`\`\`markdown
Bangun sistem autentikasi untuk ${meta.appName}.
Kebutuhan:
- Validasi JWT / JWKS Neon Auth
- Middleware otorisasi role (admin vs user)
- Endpoint /api/auth untuk registrasi, login, dan verifikasi session pengguna
\`\`\`
- **Kriteria Selesai:** Endpoint login mengembalikan token valid dan middleware menolak akses tidak terotorisasi.

### [ ] TASK-04: REST API Fitur Utama
- **Kategori:** Backend API
- **File Target:** \`src/app/api/.../route.ts\`
- **Deskripsi:** Buat endpoint API sesuai kontrak di \`api_spec.md\` untuk mendukung: ${meta.coreFeatures?.join(", ") || "fitur utama"}.
- **Prompt Eksekusi AI:**
\`\`\`markdown
Implementasikan endpoint REST API berikut sesuai spesifikasi api_spec.md:
${meta.coreFeatures?.map((f, i) => `${i + 1}. Endpoint untuk operasi: ${f}`).join("\n") || "1. CRUD fitur utama"}
Pastikan format response JSON terstandarisasi: { success: boolean, data?: any, error?: string }.
Validasi input request menggunakan type checker yang aman.
\`\`\`
- **Kriteria Selesai:** Seluruh endpoint merespons HTTP 200 dengan payload JSON yang sesuai spesifikasi.

---

## Fase 3: Antarmuka Frontend & State Management

### [ ] TASK-05: Setup Design System & Shared Layout
- **Kategori:** Frontend UI
- **File Target:** \`src/app/globals.css\`, \`tailwind.config.ts\`, \`src/components/layout/Shell.tsx\`
- **Deskripsi:** Terapkan semantic tokens sesuai \`design_sistem.md\` (warna deep dark, aksen emerald/cobalt, font sans & mono).
- **Prompt Eksekusi AI:**
\`\`\`markdown
Konfigurasikan tema TailwindCSS dan layout global untuk ${meta.appName}.
Patuhi aturan Anti-Slop Frontend:
- Tidak boleh menggunakan font generic Inter biasa, gunakan Geist atau font modern sans
- Navigasi single-line dengan tinggi 64px
- Warna latar belakang off-black (#090d16) dan elevated surface (#0f172a)
- Komponen Navbar dengan profil user dan switcher role
\`\`\`
- **Kriteria Selesai:** Layout responsif di desktop (1440px) dan mobile (390px) tanpa overflow horizontal.

### [ ] TASK-06: Implementasi Halaman Dashboard & Interaksi Fitur
- **Kategori:** Frontend UI
- **File Target:** \`src/components/dashboard/...\`, \`src/app/page.tsx\`
- **Deskripsi:** Bangun tampilan antarmuka interaktif berdasarkan sketsa layout \`wireframes.md\`.
- **Prompt Eksekusi AI:**
\`\`\`markdown
Buat komponen dashboard interaktif untuk ${meta.appName}.
Fitur yang harus ada:
- List data dengan pencarian dan filter status
- Form input atau wizard untuk fitur: ${meta.coreFeatures?.[0] || "Fitur 1"}
- State management reaktif dengan optimistik update dan feedback loading/error toast
\`\`\`
- **Kriteria Selesai:** Pengguna dapat melakukan input data dan melihat perubahan data secara real-time.

---

## Fase 4: Integrasi AI, Observability & Deployment

### [ ] TASK-07: AI Agent Integration & Gateway
- **Kategori:** AI Gateway
- **File Target:** \`src/lib/ai/...\`
- **Deskripsi:** Integrasikan inferensi AI (${meta.selectedModel || "Google Gemini"}) dengan multi-key pool dan mekanisme fallback.
- **Prompt Eksekusi AI:**
\`\`\`markdown
Bangun gateway AI dengan sistem rotasi multi-key untuk model ${meta.selectedModel || "Gemini 3.8 Flash"}.
- Tangani error HTTP 429 (Rate Limit) dengan auto-switch ke key berikutnya
- Rantai model fallback jika model utama overload
- Estimasi token usage untuk monitoring kuota
\`\`\`
- **Kriteria Selesai:** Inferensi AI berhasil mengeksekusi prompt dan rotasi kunci berjalan saat disimulasikan error.

### [ ] TASK-08: Pre-flight Verification & Cloudflare Pages Deploy
- **Kategori:** DevOps & QA
- **File Target:** \`package.json\`, \`wrangler.toml\`, \`qa.md\`
- **Deskripsi:** Jalankan audit build, zero-lint error, dan persiapkan konfigurasi edge Cloudflare Pages.
- **Prompt Eksekusi AI:**
\`\`\`markdown
Lakukan final pre-flight check untuk ${meta.appName}:
1. Jalankan TypeScript compile check dan build verifikasi (npm run build)
2. Pastikan tidak ada environment variable rahasia yang bocor ke bundle client
3. Konfigurasikan wrangler.toml untuk deployment ke Cloudflare Pages / Workers
\`\`\`
- **Kriteria Selesai:** \`npm run build\` keluar dengan exit code 0 tanpa peringatan fatal.
`,
  },
];
