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
    id: "pos-fnb-retail",
    name: "POS Kasir & Restoran F&B",
    badge: "F&B / Retail",
    description: "Sistem kasir POS cepat, cetak struk bluetooth, manajemen meja/stok bahan baku, dan laporan laba.",
    meta: {
      appName: "POS Warung Dimsum",
      category: "Kasir POS & F&B Management",
      tagline: "Aplikasi kasir dan manajemen stok bahan baku real-time untuk kuliner & restoran.",
      problem: "Pencatatan penjualan manual menimbulkan selisih kas, stok bahan baku bocor, dan laporan laba tidak akurat.",
      targetAudience: "Kasir, Waiter, Manager Outlet, dan Pemilik Usaha Kuliner",
      coreFeatures: [
        "Terminal Kasir Cepat & Cetak Struk Bluetooth",
        "Manajemen Menu, Kategori & Variasi Harga",
        "Pencatatan Stok Bahan Baku & Kartu Stok Realtime",
        "Laporan Penjualan Harian, Omzet & Laba Bersih",
        "Shift Kasir & Rekonsiliasi Kas Harian",
      ],
      techStack: ["Next.js 15", "Neon PostgreSQL (@neondatabase/serverless)", "TailwindCSS", "Cloudflare Pages"],
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

// Helper to determine domain profile based on inputs
function getDomainProfile(meta: ProjectMeta) {
  const text = `${meta.appName} ${meta.category} ${meta.problem} ${meta.coreFeatures.join(" ")}`.toLowerCase();
  
  const isPos = /pos|kasir|cashier|resto|warung|dimsum|makanan|f&b|cafe|kafe|struk|meja|kitchen|dapur|menu/.test(text);
  const isEcommerce = /e-commerce|ecommerce|toko|toko online|checkout|cart|keranjang|produk|belanja|store/.test(text);
  const isAi = /ai|agent|chatbot|gpt|gemini|llm|rag|prompt|model/.test(text);
  const isCrm = /crm|sales|lead|leads|pipeline|deal|pelanggan|kontak|client/.test(text);
  
  if (isPos) return "pos";
  if (isEcommerce) return "ecommerce";
  if (isAi) return "ai";
  if (isCrm) return "crm";
  return "saas";
}

export const BLUEPRINT_DOCUMENTS: BlueprintDoc[] = [
  // =========================================================================
  // 1. PRD.md
  // =========================================================================
  {
    filename: "PRD.md",
    file_slug: "prd",
    title: "Product Requirements Document (PRD)",
    description: "Spesifikasi produk menyeluruh, visi, target user, metrik kesuksesan, dan cakupan fitur mendalam.",
    defaultContent: (meta) => {
      const domain = getDomainProfile(meta);
      const appName = meta.appName || "AppPlanner Project";
      const category = meta.category || "Web Application";
      const problem = meta.problem || "Inefisiensi alur kerja dan ketiadaan sistem terpadu";
      const audience = meta.targetAudience || "Pengguna umum dan tim operasional";
      const features = meta.coreFeatures && meta.coreFeatures.length > 0
        ? meta.coreFeatures
        : ["Autentikasi & Role Pengguna", "Dashboard Operasional", "Manajemen Data Utama", "Laporan & Ekspor Data"];

      return `# Product Requirements Document (PRD): ${appName}

## 1. Executive Summary & Problem Context
- **Nama Aplikasi:** ${appName}
- **Kategori Industri:** ${category}
- **Tagline Produk:** ${meta.tagline || `Platform cerdas untuk modernisasi alur kerja ${category.toLowerCase()}.`}
- **Latar Belakang & Masalah Utama:**
  ${problem}
- **Visi Solusi:**
  Membangun aplikasi web berperforma tinggi, aman, dan mudah digunakan yang mendigitalkan seluruh proses operasional mulai dari input data harian, eksekusi transaksi, hingga laporan analitik realtime.

---

## 2. Target Pengguna & Analisis Persona
1. **Primary Persona - Operator / End-User:**
   - **Peran:** Pelaksana operasional harian yang berinteraksi langsung dengan sistem (misal: Kasir, Staf Admin, atau Pengguna Akhir).
   - **Tantangan Saat Ini:** Terlalu banyak langkah manual, rawan salah hitung, proses lambat saat jam sibuk.
   - **Kebutuhan Sistem:** Antarmuka responsif, shortcut cepat, input minimal klik, dan visual feedback yang jelas.

2. **Secondary Persona - Manager / Supervisor:**
   - **Peran:** Pengawas operasional dan penanggung jawab harian.
   - **Tantangan Saat Ini:** Sulit memonitor aktivitas staf secara real-time dan tracking selisih data.
   - **Kebutuhan Sistem:** Dashboard monitoring, validasi pembatalan/diskon, dan notifikasi kejanggalan.

3. **Tertiary Persona - Business Owner / Stakeholder:**
   - **Peran:** Pengambil keputusan strategis dan pemilik modal bisnis.
   - **Tantangan Saat Ini:** Laporan keuangan terlambat, tidak ada visibilitas laba/rugi harian secara akurat.
   - **Kebutuhan Sistem:** Ringkasan analitik ringkas di perangkat mobile, ekspor laporan berkala (PDF/Excel), dan audit keamanan.

---

## 3. Cakupan Fitur Mendalam & Spesifikasi Fungsional (MoSCoW Matrix)

### 3.1 Kategori Must-Have (Prioritas Kritis)
${features.map((feat, idx) => `#### 3.1.${idx + 1} Fitur: ${feat}
- **User Story:** Sebagai pengguna, saya ingin dapat menggunakan modul *${feat}* agar operasional harian berjalan akurat tanpa hambatan.
- **Spesifikasi Fungsional:**
  1. Sistem menyediakan antarmuka terdedikasi untuk input, edit, dan review data *${feat}*.
  2. Validasi otomatis pada sisi klien dan server untuk mencegah data korup atau input ganda.
  3. Sinkronisasi data real-time dengan basis data ${meta.dbType || "PostgreSQL"}.
- **Kriteria Keberhasilan (Acceptance Criteria):**
  - **Given:** Pengguna telah melakukan otentikasi dengan hak akses yang sesuai.
  - **When:** Pengguna mengeksekusi aksi pada modul *${feat}*.
  - **Then:** Sistem merespons dalam waktu < 200ms, data tersimpan persisten, dan audit log tercatat.
- **Penanganan Edge Case:** Jika koneksi jaringan tidak stabil, sistem menampilkan notifikasi ramah dan mencoba kembali (*retry mechanism*).`).join("\n\n")}

### 3.2 Kategori Should-Have (Sangat Dianjurkan)
- **Ekspor Laporan Format Standar:** Mendukung unduhan laporan dalam format PDF, CSV, dan Markdown terpadu.
- **Audit Trail & Log Aktivitas:** Pencatatan setiap aksi mutasi data penting (siapa, kapan, apa yang diubah).
- **Mode Hemat Data & Responsif Penuh:** Tampilan sempurna pada mobile (390px), tablet (768px), dan desktop (1440px).

### 3.3 Kategori Could-Have (Direncanakan pada Rilis Berikutnya)
- Integrasi bot notifikasi otomatis (Telegram / WhatsApp Webhook) untuk alert penting.
- AI Smart Insights: Rekomendasi otomatis berdasarkan tren data transaksi masa lalu.

---

## 4. Kebutuhan Non-Fungsional (NFR)
1. **Performa:**
   - Waktu muat halaman pertama (*First Contentful Paint*): < 1.0 detik pada jaringan 4G.
   - Latensi query basis data: P95 < 80ms menggunakan pooling Neon Serverless HTTP driver.
2. **Ketersediaan & Keandalan (Reliability):**
   - Target SLA uptime 99.9% berjalan di edge network Cloudflare Pages.
3. **Keamanan & Kepatuhan:**
   - Enkripsi end-to-end data transit melalui protokol HTTPS/TLS 1.3.
   - Zero hardcoded credential: Seluruh API key dan token disimpan dalam environment variables terisolasi.
   - Proteksi injeksi SQL via parameter binding prepared statements.

---

## 5. Metrik Keberhasilan & Key Performance Indicators (KPI)
- **Efisiensi Waktu Transaksi:** Reduksi waktu operasional manual hingga 60% dalam 30 hari pertama implementasi.
- **Akurasi Data:** Nol selisih perhitungan matematis dan rekonsiliasi data 100% cocok.
- **Tingkat Adopsi Pengguna:** User dapat menguasai sistem dalam waktu kurang dari 15 menit pelatihan mandiri.
`;
    },
  },

  // =========================================================================
  // 2. map.md
  // =========================================================================
  {
    filename: "map.md",
    file_slug: "map",
    title: "Peta Navigasi & Information Architecture",
    description: "Hierarki rute halaman, alur interaksi pengguna (user journeys), dan sitemap lengkap.",
    defaultContent: (meta) => {
      const domain = getDomainProfile(meta);
      const appName = meta.appName || "AppPlanner Project";

      return `# Information Architecture & Sitemap: ${appName}

## 1. Peta Navigasi & Struktur Rute (Sitemap)

\`\`\`text
Root (/) ── Landing Page & Gerbang Masuk
├── Autentikasi (/auth)
│   ├── Login Akun (/auth?mode=login)
│   ├── Registrasi Mandiri (/auth?mode=register)
│   └── Lupa Password & Reset (/auth/reset)
├── Area Kerja Utama (/workspace)
${domain === "pos" ? `│   ├── Terminal Kasir POS (/pos/terminal)
│   │   ├── Katalog Menu & Kategori
│   │   ├── Keranjang Pesanan (Cart Sidebar)
│   │   └── Modal Pembayaran (Cash, QRIS, Transfer)
│   ├── Manajemen Menu & Produk (/menu)
│   │   ├── Daftar Menu & Varian Harga
│   │   └── Tambah / Edit Menu
│   ├── Manajemen Stok Bahan Baku (/inventory)
│   │   ├── Kartu Stok & Bahan Masuk
│   │   └── Log Penyesuaian & Opname
│   ├── Riwayat Transaksi & Order (/orders)
│   │   ├── Detail Struk & Cetak Ulang
│   │   └── Pembatalan / Refund
│   ├── Buka / Tutup Shift Kasir (/shifts)
│   └── Laporan Keuangan & Laba Rugi (/reports)`
: domain === "ecommerce" ? `│   ├── Katalog Belanja (/shop)
│   ├── Keranjang Belanja (/cart)
│   ├── Checkout & Pembayaran (/checkout)
│   ├── Riwayat Order Pelanggan (/orders)
│   └── Admin Panel Produk & Pesanan (/admin)`
: `│   ├── Dashboard Ringkasan (/dashboard)
│   ├── Manajemen Data Entitas (/items)
│   ├── Generator & Wizard (/wizard)
│   ├── Laporan Analitik (/reports)
│   └── Pengaturan Profil & BYOK (/settings)`}
└── Pusat Pengaturan & Audit (/settings)
    ├── Konfigurasi Tarif & Rate RAB (/settings/rates)
    ├── Kunci API & Model Gemini (/settings/keys)
    └── Log Keamanan & Aktivitas (/settings/logs)
\`\`\`

---

## 2. Alur Pengguna Utama (Core User Journeys)

### Journey 1: Alur Kerja Harian Kasir / Operator Utama
1. **Login & Buka Shift:** Operator memasukkan kredensial dan modal kas awal (petty cash).
2. **Entri Transaksi:** Memilih item produk dari grid visual atau pencarian cepat, mengatur jumlah item dan catatan khusus.
3. **Pembayaran:** Memilih metode pembayaran (Tunai dengan kalkulator kembalian otomatis, atau QRIS instan).
4. **Pencetakan Bukti:** Sistem mencetak struk transaksi via printer thermal atau mengirimkan bukti digital.
5. **Update Inventori Otomatis:** Stok berkurang seketika secara atomik di database PostgreSQL.

### Journey 2: Alur Pemilik Usaha / Manager (Monitoring & Analitik)
1. **Akses Dashboard:** Membuka dashboard analitik dari laptop maupun smartphone.
2. **Review Omzet & Margin:** Memantau metrik total pendapatan, item terlaris, dan estimasi laba kotor hari berjalan.
3. **Pemeriksaan Stok Kritis:** Mendapatkan notifikasi bahan baku yang telah menyentuh batas minimum (*reorder point*).
4. **Tutup Kasir:** Memvalidasi laporan tutup shift harian untuk mencocokkan uang fisik dengan total di sistem.

---

## 3. Matriks Hak Akses Halaman (RBAC Route Guard)
| Rute Halaman | Pengunjung Umum | Operator / Staf | Manager / Owner | Super Admin |
| :--- | :---: | :---: | :---: | :---: |
| \`/\` (Halaman Depan) | Akses Penuh | Akses Penuh | Akses Penuh | Akses Penuh |
| \`/auth\` (Login/Daftar) | Akses Penuh | Redirect | Redirect | Redirect |
| \`/workspace/terminal\` | Ditolak (401) | Akses Penuh | Akses Penuh | Akses Penuh |
| \`/workspace/inventory\` | Ditolak (401) | Hanya Baca | Akses Penuh | Akses Penuh |
| \`/workspace/reports\` | Ditolak (401) | Ditolak (403) | Akses Penuh | Akses Penuh |
| \`/settings/system\` | Ditolak (401) | Ditolak (403) | Akses Penuh | Akses Penuh |
`;
    },
  },

  // =========================================================================
  // 3. architecture.md
  // =========================================================================
  {
    filename: "architecture.md",
    file_slug: "architecture",
    title: "System Architecture & Infrastructure",
    description: "Arsitektur sistem menyeluruh, integrasi database serverless Neon, dan alur data.",
    defaultContent: (meta) => {
      const appName = meta.appName || "AppPlanner Project";
      return `# System Architecture & Infrastructure: ${appName}

## 1. Topologi Arsitektur Sistem

\`\`\`text
                  ┌──────────────────────────────────────────────┐
                  │          KLIEN & PERANGKAT PENGGUNA          │
                  │   Desktop Browser (1440px) / Mobile (390px)  │
                  └──────────────────────┬───────────────────────┘
                                         │ HTTPS / HTTP/3
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │         CLOUDFLARE EDGE NETWORK              │
                  │   - Global CDN Caching & DDoS Protection     │
                  │   - SSL/TLS Termination                      │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │       APPLICATION ENGINE (Next.js 15)        │
                  │   - React 19 Server Components               │
                  │   - Edge & Node Serverless API Routes        │
                  │   - Middleware Auth & RBAC Token Validator   │
                  └──────────┬───────────────────┬───────────────┘
                             │                   │
                 SQL / HTTP  │                   │ S3 API
                 Connection  │                   │
                             ▼                   ▼
     ┌───────────────────────────────┐   ┌───────────────────────────────┐
     │      NEON POSTGRESQL          │   │      NEON OBJECT STORAGE      │
     │ - Serverless HTTP Pooler      │   │ - S3-Compatible Storage       │
     │ - Branching (prod/staging)    │   │ - Upload Struk & Gambar Menu  │
     │ - Auto-scaling & Instant DDL  │   │ - Presigned Asset Delivery    │
     └───────────────────────────────┘   └───────────────────────────────┘
\`\`\`

---

## 2. Rincian Komponen Teknologi (Technology Stack)
1. **Frontend Layer:**
   - **Framework:** Next.js 15 dengan App Router dan React 19.
   - **Styling & UI:** TailwindCSS dengan semantic design tokens bertema gelap (deep emerald / dark slate).
   - **Iconography & Visual:** Lucide React icons dengan rendering SVG super ringan.
   - **State & Local Caching:** React State, URLSearchParams, dan LocalStorage untuk sesi persisten.

2. **Backend & API Layer:**
   - **Runtime:** Edge Runtime untuk latensi ultra-rendah dan Serverless Functions untuk komputasi berat.
   - **Database Client:** Driver \`@neondatabase/serverless\` yang mengeliminasi masalah *connection pool exhaustion* pada lingkungan cloud modern.
   - **Object Storage SDK:** AWS SDK v3 S3 Client (\`@aws-sdk/client-s3\`) terhubung ke endpoint Neon Storage S3.

3. **Database Layer (Neon PostgreSQL):**
   - Mode koneksi menggunakan Pooler URL untuk transactional queries berlatensi < 50ms.
   - Branching terisolasi: Cabang \`production\` untuk live, cabang \`dev\` untuk migrasi dan eksperimen skema.

---

## 3. Diagram Aliran Data Transaksi (Data Flow Lifecycle)
1. Pengguna menyelesaikan aksi di frontend.
2. Request dikirim melalui fetch API ke endpoint internal (misal \`POST /api/orders\`).
3. Middleware memvalidasi kredensial pengguna dan memastikan hak akses mencukupi.
4. Route handler mengeksekusi prepared query SQL berparameter ke Neon PostgreSQL dalam satu blok transaksi database (\`BEGIN ... COMMIT\`).
5. Jika ada berkas bukti (struk/media), berkas dikompresi dan diunggah ke Neon Object Storage S3.
6. Respons JSON dikembalikan ke browser dengan kode status standar HTTP 200/201.
`;
    },
  },

  // =========================================================================
  // 4. wireframes.md
  // =========================================================================
  {
    filename: "wireframes.md",
    file_slug: "wireframes",
    title: "Wireframes & UI Layout Specifications",
    description: "Layout antarmuka visual mendalam, mobile-first responsive screens, dan spesifikasi komponen UI.",
    defaultContent: (meta) => {
      const domain = getDomainProfile(meta);
      const appName = meta.appName || "AppPlanner Project";

      return `# Wireframes & UI Layout Specification: ${appName}

## 1. Standar Desain Antarmuka
- **Anti-Slop Philosophy:** UI bersih, tipografi proporsional, hierarki visual jelas tanpa dekorasi artifisial berlebihan.
- **Warna Aksen:** Latar belakang dark zinc (\`#090d16\`), kartu kontras (\`#0f172a\`), aksen interaktif Emerald (\`#10b981\`).
- **Touch Targets:** Minimal 44x44px pada layar sentuh mobile untuk kenyamanan klik satu jari.

---

## 2. Wireframe Layar 1: Antarmuka Operasional / Terminal Utama

\`\`\`text
+-----------------------------------------------------------------------------------+
|  [LOGO] ${appName.padEnd(20)} [Shift: Aktif] [Kasir: Budi]   [10,000 Token] [Keluar] |
+-----------------------------------------------------------------------------------+
|  [ Kategori: Semua ] [ Kategori 1 ] [ Kategori 2 ] [ Kategori 3 ]  [Cari Menu...] |
+-------------------------------------------------------------+---------------------+
|                                                             | PESANAN SAAT INI    |
|  +--------------------+  +--------------------+             | Meja: [ 04 ]        |
|  | [Foto Produk]      |  | [Foto Produk]      |             |---------------------|
|  | Dimsum Siomay Ayam |  | Hakau Udang Spesial|             | 2x Siomay Ayam      |
|  | Rp 20.000          |  | Rp 25.000          |             |    Rp 40.000  [-] [+]
|  | [ + Tambah ]       |  | [ + Tambah ]       |             | 1x Hakau Udang      |
|  +--------------------+  +--------------------+             |    Rp 25.000  [-] [+]
|                                                             |---------------------|
|  +--------------------+  +--------------------+             | Subtotal: Rp 65.000 |
|  | [Foto Produk]      |  | [Foto Produk]      |             | PB1 (10%): Rp 6.500 |
|  | Pangsit Goreng May |  | Es Teh Manis Jumbo |             | TOTAL:    Rp 71.500 |
|  | Rp 22.000          |  | Rp 8.000           |             |---------------------|
|  | [ + Tambah ]       |  | [ + Tambah ]       |             | [  BAYAR SEKARANG ] |
|  +--------------------+  +--------------------+             | [Batal] [Simpan Draft
+-------------------------------------------------------------+---------------------+
\`\`\`

---

## 3. Wireframe Layar 2: Modal Konfirmasi Pembayaran & Cetak Struk

\`\`\`text
                 +---------------------------------------------+
                 |          PEMBAYARAN TRANSAKSI               |
                 |          Total Tagihan: Rp 71.500           |
                 +---------------------------------------------+
                 |  PILIH METODE PEMBAYARAN:                   |
                 |  [ (•) TUNAI ]  [ ( ) QRIS ]  [ ( ) DEBIT ] |
                 |                                             |
                 |  Uang Diterima (Tunai):                     |
                 |  [ Rp 100.000                             ] |
                 |  Kembalian:                                 |
                 |  [ Rp 28.500 (Otomatis Dihitung)          ] |
                 |                                             |
                 |  Pilihan Cepat Nominal:                     |
                 |  [ Rp 75.000 ]  [ Rp 100.000 ]  [ Pas ]     |
                 |                                             |
                 |  -----------------------------------------  |
                 |  [ X Batal ]        [ PROSES & CETAK STRUK ]|
                 +---------------------------------------------+
\`\`\`

---

## 4. Wireframe Layar 3: Manajemen Data & Laporan (Mobile View 390px)

\`\`\`text
+-------------------------------------+
| [=] ${appName.padEnd(18)}  [O] |
+-------------------------------------+
| Ringkasan Hari Ini                  |
| ┌─────────────────────────────────┐ |
| │ Total Penjualan:   Rp 3.420.000 │ |
| │ Total Transaksi:   48 Struk     │ |
| │ Laba Kotor:        Rp 1.850.000 │ |
| └─────────────────────────────────┘ |
|                                     |
| Menu Terlaris Hari Ini:             |
| 1. Siomay Ayam (68 porsi)           |
| 2. Hakau Udang (42 porsi)           |
| 3. Es Lemon Tea (35 gelas)          |
|                                     |
| [ + Transaksi Baru ]                |
| [ Unduh Laporan PDF ]               |
+-------------------------------------+
\`\`\`
`;
    },
  },

  // =========================================================================
  // 5. database_schema.md
  // =========================================================================
  {
    filename: "database_schema.md",
    file_slug: "database_schema",
    title: "Database Schema & PostgreSQL DDL",
    description: "Skema DDL lengkap, tabel relasional berindeks, tipe data, dan konstrain integritas data.",
    defaultContent: (meta) => {
      const appName = meta.appName || "AppPlanner Project";
      const domain = getDomainProfile(meta);

      return `# Database Schema Specification: ${appName}

## 1. Skema Relasional PostgreSQL (Neon Serverless)
Seluruh tabel dibuat dengan konvensi penamaan standar SQL modern: identifier lowercase, singular/plural konsisten, primary key \`UUID\` atau \`SERIAL\`, dan timestamp \`TIMESTAMPTZ\`.

---

## 2. Skrip DDL Produksi Siap Eksekusi (PostgreSQL DDL)

\`\`\`sql
-- Aktifkan ekstensi UUID jika belum tersedia
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL PENGGUNA & PROFIL
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(150),
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'cashier', 'user')),
  avatar_url TEXT,
  credits_remaining INTEGER NOT NULL DEFAULT 10000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABEL KATEGORI PRODUK / MODUL
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABEL ITEM PRODUK / DATA MASTER
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sku VARCHAR(50) UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cost_price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_alert INTEGER NOT NULL DEFAULT 5,
  unit VARCHAR(30) DEFAULT 'pcs',
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABEL TRANSAKSI / ORDERS MASTER
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(100) DEFAULT 'Pelanggan Umum',
  table_number VARCHAR(30),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  grand_total NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'qris', 'debit', 'transfer')),
  payment_status VARCHAR(30) NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  order_status VARCHAR(30) NOT NULL DEFAULT 'completed' CHECK (order_status IN ('pending', 'processing', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABEL RINCIAN ITEM TRANSAKSI
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  item_name VARCHAR(200) NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(14, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABEL LOG MUTASI STOK / INVENTORI
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  change_type VARCHAR(30) NOT NULL CHECK (change_type IN ('sale', 'restock', 'adjustment', 'waste')),
  change_amount INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  current_stock INTEGER NOT NULL,
  reference_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABEL LOG AUDIT SISTEM
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
\`\`\`

---

## 3. Indeks Performa & Optimasi Kueri

\`\`\`sql
-- Indeks pencarian & pengurutan cepat
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory_logs(product_id, created_at DESC);
\`\`\`
`;
    },
  },

  // =========================================================================
  // 6. api_spec.md
  // =========================================================================
  {
    filename: "api_spec.md",
    file_slug: "api_spec",
    title: "REST & Edge API Specifications",
    description: "Kontrak endpoint HTTP lengkap, skema payload JSON, parameter, dan kode status.",
    defaultContent: (meta) => {
      const appName = meta.appName || "AppPlanner Project";

      return `# REST & Edge API Specifications: ${appName}

## 1. Standar Desain API
- **Base URL:** \`https://app-domain.com/api\`
- **Protokol:** HTTPS / HTTP/2 & HTTP/3
- **Format Pertukaran:** JSON (\`Content-Type: application/json\`)
- **Format Respons Seragam:**
\`\`\`json
{
  "success": true,
  "data": {},
  "message": "Operasi berhasil",
  "timestamp": "2026-10-25T12:00:00Z"
}
\`\`\`

---

## 2. Katalog Endpoint Utama

### 2.1 Modul Produk & Menu
#### \`GET /api/products\`
- **Deskripsi:** Mengambil daftar produk aktif dengan filter kategori dan kata kunci.
- **Query Params:** \`category_id\` (optional), \`search\` (optional), \`page\` (default: 1), \`limit\` (default: 50).
- **Respons Sukses (200 OK):**
\`\`\`json
{
  "success": true,
  "total": 24,
  "data": [
    {
      "id": "7f09c852-19e4-4c8d-8a21-93bfb1234567",
      "name": "Siomay Dimsum Ayam",
      "sku": "DIM-001",
      "price": 20000,
      "stock_quantity": 45,
      "is_available": true
    }
  ]
}
\`\`\`

#### \`POST /api/products\`
- **Deskripsi:** Membuat produk baru (membutuhkan peran Admin / Manager).
- **Body JSON:**
\`\`\`json
{
  "name": "Hakau Udang Kristal",
  "category_id": "c3e98f01-...",
  "sku": "DIM-002",
  "price": 25000,
  "cost_price": 14000,
  "stock_quantity": 30,
  "min_stock_alert": 5
}
\`\`\`

---

### 2.2 Modul Transaksi & Kasir
#### \`POST /api/orders\`
- **Deskripsi:** Menyimpan transaksi baru, menghitung total, dan mengurangi stok otomatis.
- **Body JSON:**
\`\`\`json
{
  "table_number": "Meja 04",
  "customer_name": "Walk-in Guest",
  "payment_method": "cash",
  "items": [
    { "product_id": "7f09c852-...", "quantity": 2, "notes": "Kecap asin dipisah" },
    { "product_id": "8a12d911-...", "quantity": 1 }
  ]
}
\`\`\`
- **Respons Sukses (201 Created):**
\`\`\`json
{
  "success": true,
  "order": {
    "order_number": "ORD-20261025-0042",
    "subtotal": 65000,
    "tax_amount": 6500,
    "grand_total": 71500,
    "payment_status": "paid"
  }
}
\`\`\`

---

### 2.3 Modul Laporan & Analitik
#### \`GET /api/reports/sales/daily\`
- **Deskripsi:** Mendapatkan rekap omzet, total struk, dan laba kotor per tanggal.
- **Query Params:** \`date=YYYY-MM-DD\` (default hari ini).
- **Respons Sukses (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "date": "2026-10-25",
    "total_revenue": 3420000,
    "total_orders": 48,
    "gross_profit": 1850000,
    "top_products": [
      { "name": "Siomay Dimsum Ayam", "sold_qty": 68 },
      { "name": "Hakau Udang", "sold_qty": 42 }
    ]
  }
}
\`\`\`
`;
    },
  },

  // =========================================================================
  // 7. tasks.md
  // =========================================================================
  {
    filename: "tasks.md",
    file_slug: "tasks",
    title: "Actionable AI Execution Tasks & Milestones",
    description: "Daftar task berurutan dengan instruksi prompt AI coding siap pakai (Cursor/Claude/Antigravity).",
    defaultContent: (meta) => {
      const appName = meta.appName || "AppPlanner Project";
      const techStack = meta.techStack?.join(", ") || "Next.js 15, Neon Postgres, TailwindCSS";

      return `# Actionable AI Execution Tasks: ${appName}
> **Panduan Eksekusi AI Coding Agent:**
> Eksekusi task di bawah ini secara sekuensial (satu per satu). Salin blok *Prompt Eksekusi AI* ke AI coding tool Anda (Cursor, Claude Code, Antigravity, atau Windsurf) untuk hasil coding yang presisi dan bebas halusinasi.

---

## Ringkasan Proyek
- **Aplikasi:** ${appName}
- **Stack Inti:** ${techStack}
- **Basis Data:** ${meta.dbType || "Neon PostgreSQL Serverless"}

---

## Fase 1: Fondasi Skema Basis Data & Storage

### [ ] TASK-01: Migrasi DDL Tabel PostgreSQL Neon
- **Kategori:** Database Engineering
- **File Target:** \`scripts/migrate.js\`, \`src/lib/neon/db.ts\`
- **Deskripsi:** Buat skrip migrasi untuk mengeksekusi DDL tabel sesuai dokumen \`database_schema.md\`.
- **Prompt Eksekusi AI:**
\`\`\`markdown
Bertindaklah sebagai Senior Database Engineer. Buat file skrip migrasi Node.js di "scripts/migrate.js" menggunakan driver "@neondatabase/serverless".
Pastikan skrip membuat tabel berikut dengan aman (IF NOT EXISTS):
1. profiles
2. categories
3. products
4. orders
5. order_items
6. inventory_logs
7. audit_logs
Sertakan indeks performa dan foreign keys. Jalankan skrip ini menggunakan koneksi DATABASE_URL dari file .env.local.
\`\`\`
- **Kriteria Selesai:** Terminal menjalankan \`node scripts/migrate.js\` dan menampilkan pesan seluruh tabel berhasil dibuat.

### [ ] TASK-02: Client Database Helper & Connection Pool
- **Kategori:** Backend Infrastruktur
- **File Target:** \`src/lib/neon/db.ts\`
- **Deskripsi:** Inisialisasi pool kueri serverless yang aman dari SQL injection.
- **Prompt Eksekusi AI:**
\`\`\`markdown
Buat helper fungsi database di "src/lib/neon/db.ts" yang mengekspor query helper menggunakan @neondatabase/serverless.
Sediakan fungsi:
- runQuery<T>(sqlText, params): Menjalankan kueri berparameter
- getClient(): Mendapatkan client pooler
Pastikan mendukung fallback offline/error handling yang informatif.
\`\`\`
- **Kriteria Selesai:** Kueri sederhana \`SELECT 1\` mengembalikan hasil sukses.

---

## Fase 2: Backend API & Logika Transaksi

### [ ] TASK-03: REST Endpoint Produk & Kategori
- **Kategori:** Backend API
- **File Target:** \`src/app/api/products/route.ts\`, \`src/app/api/categories/route.ts\`
- **Deskripsi:** Buat handler API untuk GET, POST, PUT, DELETE data produk dan kategori.
- **Prompt Eksekusi AI:**
\`\`\`markdown
Implementasikan endpoint Next.js App Router di "src/app/api/products/route.ts":
- GET: Mengambil daftar produk (dukung filter category_id & search query)
- POST: Validasi dan insert produk baru
Format response harus: { success: boolean, data?: any, error?: string }.
\`\`\`
- **Kriteria Selesai:** Request HTTP GET ke \`/api/products\` merespons status 200 dengan JSON array.

### [ ] TASK-04: Transaksi Kasir & Pengurangan Stok Atomik
- **Kategori:** Backend Business Logic
- **File Target:** \`src/app/api/orders/route.ts\`
- **Deskripsi:** Endpoint pembuatan transaksi baru yang memotong stok produk secara atomik.
- **Prompt Eksekusi AI:**
\`\`\`markdown
Buat endpoint transaksi di "src/app/api/orders/route.ts":
1. Terima payload { customer_name, payment_method, items: [{ product_id, quantity }] }
2. Hitung subtotal, pajak, dan grand_total
3. Simpan ke tabel orders dan order_items
4. Potong stock_quantity pada tabel products dan catat ke inventory_logs
Gunakan database transaction agar jika salah satu item gagal, seluruh order dibatalkan (rollback).
\`\`\`
- **Kriteria Selesai:** Order berhasil tersimpan dan stok produk berkurang sesuai kuantitas yang dibeli.

---

## Fase 3: Antarmuka Pengguna & Komponen Interaktif

### [ ] TASK-05: Grid Katalog Produk & Keranjang Pesanan
- **Kategori:** Frontend UI
- **File Target:** \`src/components/terminal/OrderTerminal.tsx\`
- **Deskripsi:** Bangun tampilan POS visual sesuai spesifikasi \`wireframes.md\` dengan kartu produk dan panel keranjang.
- **Prompt Eksekusi AI:**
\`\`\`markdown
Buat komponen React "OrderTerminal" dengan TailwindCSS:
- Kolom Kiri: Filter kategori pill dan grid kartu produk (nama, harga, tombol tambah)
- Kolom Kanan: Sidebar pesanan (daftar item, tombol +/- kuantitas, subtotal, tombol bayar)
- Desain mengikuti dark theme dengan aksen emerald.
- Responsif: Pada layar mobile (< 768px), keranjang berupa bottom sheet atau tombol toggle.
\`\`\`
- **Kriteria Selesai:** Pengguna dapat mengklik produk, melihat item bertambah di keranjang, dan total harga terhitung akurat.

### [ ] TASK-06: Modal Pembayaran & Cetak Struk
- **Kategori:** Frontend Interaksi
- **File Target:** \`src/components/terminal/PaymentModal.tsx\`
- **Deskripsi:** Dialog pembayaran dengan kalkulator kembalian otomatis dan cetak struk browser.
- **Prompt Eksekusi AI:**
\`\`\`markdown
Buat modal pembayaran "PaymentModal":
- Pilihan metode: Tunai, QRIS, Debit
- Untuk tunai: input uang diterima, tombol cepat nominal (50k, 100k, uang pas), dan hitung kembalian otomatis
- Tombol 'Proses Pembayaran': Mengirim data ke API dan memicu window.print() untuk cetak struk belanja.
\`\`\`
- **Kriteria Selesai:** Transaksi tuntas dan struk siap cetak.
`;
    },
  },

  // =========================================================================
  // 8. design_sistem.md
  // =========================================================================
  {
    filename: "design_sistem.md",
    file_slug: "design_sistem",
    title: "Design System & Token Specifications",
    description: "Palet warna semantic, skala tipografi, radius konsisten, dan panduan komponen UI.",
    defaultContent: (meta) => {
      const appName = meta.appName || "AppPlanner Project";

      return `# Design System & UI Tokens: ${appName}

## 1. Palet Warna Semantik (Dark Neutral Theme)
- **Background Base:** \`#090d16\` (Deep Charcoal - 98% absorpsi silau)
- **Surface Elevated:** \`#0f172a\` (Slate 900 - Kontainer kartu & modal)
- **Surface Muted:** \`#1e293b\` (Slate 800 - Input background & hover state)
- **Border Default:** \`rgba(255, 255, 255, 0.08)\` (Subtle divider)
- **Primary Emerald:** \`#10b981\` (Tombol utama, status sukses, indikator aktif)
- **Warning Amber:** \`#f59e0b\` (Peringatan stok menipis, status pending)
- **Danger Rose:** \`#ef4444\` (Pembatalan, refund, penghapusan data)

---

## 2. Hierarki Tipografi
- **Display Heading:** \`text-2xl sm:text-3xl font-bold tracking-tight text-white\`
- **Section Title:** \`text-lg font-semibold text-zinc-100\`
- **Body Text:** \`text-xs sm:text-sm text-zinc-300 leading-relaxed\`
- **Caption & Helper:** \`text-[11px] text-zinc-400 font-mono\`
- **Monospace Financial:** \`font-mono font-bold text-emerald-400\` untuk seluruh angka mata uang dan ID transaksi.
`;
    },
  },

  // =========================================================================
  // 9. security.md
  // =========================================================================
  {
    filename: "security.md",
    file_slug: "security",
    title: "Security, Auth & Threat Model",
    description: "Model ancaman (STRIDE), otorisasi RBAC, sanitasi input, dan perlindungan data.",
    defaultContent: (meta) => {
      const appName = meta.appName || "AppPlanner Project";

      return `# Security & Threat Model: ${appName}

## 1. Prinsip Keamanan & Proteksi
1. **Zero Trust & Least Privilege:** Setiap endpoint memverifikasi hak akses pengguna secara ketat.
2. **Prepared Statements Mandat:** Seluruh kueri PostgreSQL menggunakan parameter binding via \`@neondatabase/serverless\` untuk memblokir 100% celah SQL Injection.
3. **Isolasi Lingkungan Kunci Rahasia:** API key LLM dan password database hanya berada di serverless environment variable.

---

## 2. Mitigasi Model Ancaman (STRIDE)
- **Spoofing Identity:** Verifikasi session token pada setiap request mutasi data.
- **Tampering Data:** Transaksi keuangan dikunci dalam database transaction atomik (\`BEGIN ... COMMIT\`).
- **Information Disclosure:** Nilai rahasia tidak pernah dikirimkan ke bundle JavaScript browser.
- **Denial of Service (DoS):** Perlindungan rate limiting edge dari Cloudflare.
`;
    },
  },

  // =========================================================================
  // 10. qa.md
  // =========================================================================
  {
    filename: "qa.md",
    file_slug: "qa",
    title: "Quality Assurance & Test Strategy",
    description: "Matriks pengujian otomatis, validasi skenario transaksi, dan checklist UAT.",
    defaultContent: (meta) => {
      const appName = meta.appName || "AppPlanner Project";

      return `# Quality Assurance & Test Strategy: ${appName}

## 1. Matriks Pengujian Inti
- **Unit Testing:** Validasi kalkulator harga, perhitungan pajak, dan diskon.
- **Integration Testing:** Uji alur pembuatan order dan pengurangan stok database secara simultan.
- **Cross-Device Testing:** Pengujian responsivitas pada viewport iPhone (390px), Tablet (768px), dan Desktop (1440px).

---

## 2. Checklist User Acceptance Testing (UAT)
- [ ] Pengguna dapat login dan diarahkan ke dashboard operasional.
- [ ] Menambah produk ke keranjang menghitung subtotal secara real-time.
- [ ] Pembayaran tunai menghitung nominal kembalian dengan benar.
- [ ] Mengubah stok produk langsung tercatat di tabel log inventori.
- [ ] Filter pencarian menu memberikan hasil instan tanpa reload halaman.
`;
    },
  },

  // =========================================================================
  // 11. deployment.md
  // =========================================================================
  {
    filename: "deployment.md",
    file_slug: "deployment",
    title: "Deployment & Infrastructure Guide",
    description: "Panduan go-live, konfigurasi Cloudflare Pages, migrasi database, dan SOP rollback.",
    defaultContent: (meta) => {
      const appName = meta.appName || "AppPlanner Project";

      return `# Deployment & Infrastructure Guide: ${appName}

## 1. Konfigurasi Lingkungan Produksi
- **Hosting:** Cloudflare Pages (Edge Serverless)
- **Database:** Neon PostgreSQL Serverless (Pooler Endpoint)
- **Storage:** Neon S3 Storage Bucket
- **Node Environment:** Node.js 20.x

---

## 2. Langkah Deployment Bertahap
1. **Validasi Build:** Jalankan \`npm run build\` di lokal untuk memastikan validitas tipe data TypeScript.
2. **Migrasi Database:** Eksekusi skrip migrasi \`node scripts/migrate.js\` ke Neon production database.
3. **Commit & Push:** Push perubahan ke branch \`main\` pada remote repository GitHub.
4. **Cloudflare Auto-Deploy:** Cloudflare Pages otomatis membangun dan merilis versi terbaru dalam < 2 menit.
`;
    },
  },

  // =========================================================================
  // 12. log.md
  // =========================================================================
  {
    filename: "log.md",
    file_slug: "log",
    title: "Changelog & Architecture Decision Records (ADR)",
    description: "Catatan riwayat keputusan arsitektur dan audit evolusi sistem.",
    defaultContent: (meta) => {
      const appName = meta.appName || "AppPlanner Project";

      return `# Changelog & Architecture Decision Records: ${appName}

## ADR-001: Pemilihan Neon Serverless PostgreSQL
- **Status:** Diterima & Aktif
- **Konteks:** Aplikasi membutuhkan database relasional handal yang tidak membebani biaya idle saat di luar jam operasional.
- **Keputusan:** Mengadopsi Neon PostgreSQL Serverless dengan HTTP Pooler.
- **Dampak Positif:** Nol biaya server saat idle, latensi kueri rendah, dan skalabilitas otomatis.

---

## ADR-002: Arsitektur Frontend Next.js 15 & Cloudflare Pages
- **Status:** Diterima & Aktif
- **Keputusan:** Menggunakan Next.js 15 App Router dideploy ke jaringan edge Cloudflare Pages.
- **Dampak Positif:** Waktu akses super cepat di seluruh wilayah tanpa perlu mengelola server VPS mandiri.
`;
    },
  },
];
