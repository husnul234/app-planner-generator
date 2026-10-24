# Actionable AI Execution Tasks: AppPlanner AI

> **Panduan Eksekusi AI Coding (NgodingPakeAI Style):**
> Eksekusi task di bawah ini secara sekuensial (satu per satu). Berikan prompt spesifik tiap task kepada coding agent Anda untuk mencegah context drift dan halusinasi skema.

---

## Ringkasan Eksekusi Proyek
- **Nama Aplikasi:** AppPlanner AI
- **Tech Stack:** Next.js 15, Neon Serverless Postgres, TailwindCSS, Cloudflare Pages
- **Database:** Neon PostgreSQL (@neondatabase/serverless)
- **Metode Eksekusi:** Jalankan `node scripts/cli.js next` atau salin prompt tiap task di bawah ke AI Agent.

---

## Fase 1: Fondasi Skema Database & Storage

### [x] TASK-01: Migrasi DDL Tabel PostgreSQL Neon
- **Kategori:** Database
- **File Target:** `scripts/migrate.js`, `src/lib/neon/db.ts`
- **Deskripsi:** Siapkan tabel utama `profiles`, `projects`, `project_documents`, `user_api_keys`, dan `invitations`.
- **Prompt Eksekusi AI:**
```markdown
Bertindaklah sebagai Database Engineer. Buat skrip migrasi DDL untuk aplikasi AppPlanner menggunakan driver @neondatabase/serverless.
Tabel yang wajib dibuat:
1. profiles (id, email, full_name, role, created_at)
2. projects (id, name, slug, status, created_at)
3. project_documents (id, project_id, filename, content, word_count)
4. user_api_keys (id, provider, api_key, key_nickname, is_active)
5. invitations (id, email, role, status)
Pastikan menambahkan indeks performa, foreign key yang konsisten, dan connection pooling HTTP.
```
- **Kriteria Selesai:** Eksekusi skrip migrasi sukses tanpa error sintaks SQL.

### [x] TASK-02: Konfigurasi Client Database & Object Storage
- **Kategori:** Infrastruktur & SDK
- **File Target:** `src/lib/neon/db.ts`, `src/lib/neon/storage.ts`
- **Deskripsi:** Inisialisasi pool koneksi Postgres serverless dan S3 client untuk upload aset dokumen blueprint.
- **Prompt Eksekusi AI:**
```markdown
Implementasikan helper database Neon dan Object Storage S3 di TypeScript.
Fungsi yang dibutuhkan:
- query(sql, params): Eksekusi kueri terisolasi SQL Injection
- uploadObject(key, buffer, contentType): Upload file ke Neon Object Storage
- getObjectUrl(key): Dapatkan URL publik/presigned
Gunakan environment variable DATABASE_URL dan AWS_S3_* yang aman.
```
- **Kriteria Selesai:** Script uji koneksi berhasil mengembalikan versi database dan ping S3.

---

## Fase 2: Autentikasi & Core Backend Endpoints

### [x] TASK-03: Sistem Autentikasi & RBAC
- **Kategori:** Backend & Auth
- **File Target:** `src/lib/neon/auth.ts`, `src/app/api/auth/route.ts`
- **Deskripsi:** Integrasikan autentikasi berbasis JWKS / Session dengan pemisahan role Admin & User.
- **Prompt Eksekusi AI:**
```markdown
Bangun sistem autentikasi untuk AppPlanner AI.
Kebutuhan:
- Validasi JWT / JWKS Neon Auth
- Middleware otorisasi role (admin vs user)
- Endpoint /api/auth untuk registrasi, login, dan verifikasi session pengguna
```
- **Kriteria Selesai:** Endpoint login mengembalikan token valid dan middleware menolak akses tidak terotorisasi.

### [x] TASK-04: REST API Generator 11 Dokumen Blueprint
- **Kategori:** Backend API
- **File Target:** `src/app/api/generate/route.ts`, `src/lib/generator/templates.ts`
- **Deskripsi:** Buat endpoint API `/api/generate` untuk mensintesis dokumen blueprint pre-development dan menyimpannya ke database dan S3.
- **Prompt Eksekusi AI:**
```markdown
Implementasikan endpoint POST /api/generate yang memproses parameter proyek, melakukan sintesis PRD dengan model Gemini BYOK pool, dan menyusun berkas blueprint lengkap secara terstruktur.
```
- **Kriteria Selesai:** Endpoint merespons HTTP 200 dengan payload JSON berisi daftar dokumen lengkap.

---

## Fase 3: Antarmuka Frontend & State Management

### [x] TASK-05: Setup Design System & Anti-Slop UI
- **Kategori:** Frontend UI
- **File Target:** `src/app/globals.css`, `tailwind.config.ts`, `src/components/layout/Shell.tsx`
- **Deskripsi:** Terapkan semantic tokens sesuai design_sistem.md (warna off-black #090d16, deep surface #0f172a, aksen emerald & cobalt).
- **Prompt Eksekusi AI:**
```markdown
Konfigurasikan tema TailwindCSS dan layout global untuk AppPlanner AI.
Patuhi aturan Anti-Slop Frontend:
- Tidak boleh menggunakan font generic Inter biasa, gunakan Geist atau font modern sans
- Navigasi single-line dengan tinggi 64px
- Warna latar belakang off-black (#090d16) dan elevated surface (#0f172a)
- Komponen Navbar dengan profil user dan switcher role
```
- **Kriteria Selesai:** Layout responsif di desktop (1440px) dan mobile (390px) tanpa overflow horizontal.

### [x] TASK-06: Implementasi Dual-Pane Workspace & Smart Editor
- **Kategori:** Frontend UI
- **File Target:** `src/components/dashboard/UserDashboard.tsx`
- **Deskripsi:** Bangun tampilan antarmuka dual-pane untuk review dokumen, inline markdown editing, download .md, dan ekspor arsip ZIP.
- **Prompt Eksekusi AI:**
```markdown
Buat komponen Workspace interaktif untuk AppPlanner AI.
Fitur yang harus ada:
- List dokumen di pane kiri dengan indikator badge
- Markdown editor & previewer di pane kanan
- Tombol aksi: Edit, Simpan, Tambah Dokumen, Salin Konten, Unduh .md, Unduh .zip, dan Bundle Prompt AI
```
- **Kriteria Selesai:** Dokumen dapat diedit, disimpan ke Postgres & S3, dan diunduh sebagai berkas ZIP.

---

## Fase 4: Adaptasi Fitur NgodingPakeAI

### [x] TASK-07: Generator Berkas tasks.md & CLI Task Runner
- **Kategori:** Feature Innovation
- **File Target:** `src/lib/generator/templates.ts`, `scripts/cli.js`
- **Deskripsi:** Adaptasi kemampuan task breakdown per fitur dari ngodingpakeai.com ke generator blueprint dan siapkan skrip CLI runner `node scripts/cli.js next`.
- **Prompt Eksekusi AI:**
```markdown
Tambahkan dokumen tasks.md ke BLUEPRINT_DOCUMENTS yang membagi spesifikasi menjadi task granular siap pakai AI coding agent. Buat skrip CLI scripts/cli.js untuk navigasi task di terminal.
```
- **Kriteria Selesai:** tasks.md tergenerate otomatis dan `node scripts/cli.js list` serta `next` berjalan mulus.

### [x] TASK-08: Input Suara Speech-to-Text (Microphone) di Wizard
- **Kategori:** Frontend UX
- **File Target:** `src/components/dashboard/UserDashboard.tsx`
- **Deskripsi:** Tambahkan tombol mic dengan Web Speech API agar pengguna bisa mendiktekan ide produk secara lisan dalam Bahasa Indonesia.
- **Prompt Eksekusi AI:**
```markdown
Tambahkan fitur Speech-to-Text menggunakan Web Speech API (webkitSpeechRecognition) pada input ide dan masalah di Wizard serta Quick Prompt.
Tampilkan animasi indikator recording aktif dan handle browser fallback dengan ramah.
```
- **Kriteria Selesai:** Suara pengguna tertranskripsi langsung ke form input teks.

### [x] TASK-09: Template Codebase Presets Siap Pakai
- **Kategori:** Frontend & Generator
- **File Target:** `src/lib/generator/templates.ts`, `src/components/dashboard/UserDashboard.tsx`
- **Deskripsi:** Sediakan 5 preset arsitektur siap pakai (SaaS, AI Agent Platform, E-Commerce, Internal CRM, Mobile API) dengan 1 klik terisi otomatis.
- **Prompt Eksekusi AI:**
```markdown
Sediakan pilihan starter templates di Step 1 Wizard perencanaan sehingga pengguna bisa memilih arsitektur populer dan langsung mengisikan parameter fitur secara otomatis.
```
- **Kriteria Selesai:** Memilih template otomatis mengisi form nama, kategori, fitur, dan tech stack.

### [x] TASK-10: Interactive AI Task Execution Hub di Workspace
- **Kategori:** Workspace UX
- **File Target:** `src/components/dashboard/UserDashboard.tsx`
- **Deskripsi:** Tambahkan tab/mode "AI Task Runner" di Workspace untuk melihat checklist task, checklist selesai, dan tombol "Salin Prompt Task Ini" per task.
- **Prompt Eksekusi AI:**
```markdown
Buat tampilan interaktif Task Runner di Workspace yang mem-parse tasks.md menjadi kartu task bertahap, lengkap dengan status checkbox, salin prompt khusus task, dan panduan perintah CLI.
```
- **Kriteria Selesai:** Pengguna dapat beralih antara Mode Dokumen dan Mode Task Runner langsung di Workspace.
