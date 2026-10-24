# Implementation Plan & Phase Tracking: AppPlanner AI

Dokumen ini melacak rencana pengembangan bertahap (*implementation plan*) berdasarkan spesifikasi [PRD.md](file:///e:/3.%20PRODUK%20DIGITAL/05%20-%20Aplikasi%20dan%20Pengembangan/App/48.%20APP%20PLANNER/APP%20PLANER%20CODE/PRD.md) dan [map.md](file:///e:/3.%20PRODUK%20DIGITAL/05%20-%20Aplikasi%20dan%20Pengembangan/App/48.%20APP%20PLANNER/APP%20PLANER%20CODE/map.md), mencakup status checklist fitur, modul BYOK multiple API Gemini, dan alur integrasi layanan.

---

## 1. Roadmap & Phase Overview

| Fase | Nama Fase | Fokus Utama | Status |
|---|---|---|---|
| **Fase 1** | **Core MVP & Generator Engine** | Wizard 7-Tahap, Generator 11 Berkas Blueprint, Neon Postgres & S3, ZIP Export | **SELESAI (100%)** |
| **Fase 2** | **BYOK Multi-Key & Smart Editor** | Kolam Multi-Key Gemini, Model Fallback Chain, Inline Markdown Editor, Custom Docs | **SELESAI (100%)** |
| **Fase 3** | **Team Collaboration & RBAC** | Role Admin & User, Sistem Undangan Kolaborator, Simulasi Switcher Persona, Kuota Kredit | **SELESAI (100%)** |
| **Fase 4** | **Observability & AI Context Hub** | Live Telemetry 5 Layanan Neon, Export AI Context Master Bundle, Cloudflare Pages Ready | **SELESAI (100%)** |

---

## 2. Detailed Verification Checklist

### Fase 1: Core MVP & Blueprint Generator
- [x] **Setup Neon Services:** Provisioning Postgres, Object Storage, Auth, Functions, dan Realtime pada branch `production`.
- [x] **Database DDL:** Tabel `profiles`, `projects`, `project_documents`, `project_interviews`, `template_prompts`, `token_usage_logs`, dan `audit_logs`.
- [x] **Driver Database Serverless:** Menggunakan `@neondatabase/serverless` dengan HTTP connection pooling untuk kompatibilitas Cloudflare Pages / Workers.
- [x] **11 Dokumen Blueprint Terstandarisasi:**
  1. `PRD.md` (Product Requirements Document)
  2. `map.md` (Peta Navigasi & Information Architecture)
  3. `architecture.md` (System Architecture & Tech Stack)
  4. `wireframes.md` (Wireframes & UI Layout Specifications)
  5. `database_schema.md` (Database Schema & PostgreSQL DDL)
  6. `api_spec.md` (REST & Edge API Specifications)
  7. `design_sistem.md` (Design System & Token Specifications)
  8. `security.md` (Security, Auth & Threat Model)
  9. `qa.md` (Quality Assurance & Test Strategy)
  10. `deployment.md` (Deployment & Infrastructure Guide)
  11. `log.md` (Log Generator & Architecture Decision Records)
- [x] **Export Hub:** Download berkas individual `.md` dan kompilasi arsip `.zip` 11 berkas langsung dari browser menggunakan `JSZip`.

### Fase 2: BYOK (Bring Your Own Key) Multiple Gemini API Keys & Editor
- [x] **Tabel Kolam Kunci API:** DDL `public.user_api_keys` di Neon Postgres dengan field `provider`, `api_key`, `key_nickname`, `is_active`, `status`, dan `last_used_at`.
- [x] **Adaptasi Mesin Kolam Gemini (dari Modul Ajar Generator Fase 4B.1):**
  - Rantai model fallback: `gemini-2.5-flash` -> `gemini-2.0-flash` -> `gemini-1.5-flash` -> `gemini-1.5-pro`.
  - Rotasi otomatis antar key saat terjadi HTTP 429 (*Rate Limit / Quota Exceeded*) atau HTTP 503 (*Overloaded*).
  - Validasi langsung ke Google Generative Language API (`/v1beta/models`).
- [x] **Antarmuka Manajemen Kunci BYOK:** Menu/tab untuk menambah, memvalidasi, menyalakan/mematikan (*toggle active*), dan menghapus API Key secara aman (key ditampilkan tersensor, misal: `AIza...8a9F`).
- [x] **Inline Markdown Editor:** Kemampuan mengedit dokumen di Workspace dan menyimpannya kembali ke database Neon Postgres serta memperbarui file di bucket S3.
- [x] **Tambah Dokumen Kustom:** Kemampuan menambahkan dokumen markdown tambahan ke dalam proyek blueprint.

### Fase 3: Team Collaboration, RBAC & Projects CRUD
- [x] **Role-Based Access Control:** Role `admin` dan `user` dengan isolasi hak akses.
- [x] **Sistem Undangan Tim:** Form undangan kolaborator via email dengan penentuan role dan status pending/accepted di tabel `public.invitations`.
- [x] **Tabel Anggota Tim:** Manajemen hak akses tim, ubah role (`admin` <-> `user`), dan hapus pengguna.
- [x] **Role Switcher di Header:** Pengujian simulasi tampilan antarmuka secara instan sebagai Admin atau User.
- [x] **Full CRUD Proyek:**
  - Create via Wizard atau tombol cepat.
  - Read dengan pencarian teks dan filter status (`ready`, `draft`, `generating`).
  - Update informasi proyek (nama, deskripsi, status).
  - Delete proyek dengan modal konfirmasi dan pembersihan berkas di Neon Object Storage.

### Fase 4: Observability, Export Master Bundle & Frontend Polish
- [x] **Neon Infrastructure Telemetry:** Metrik live latensi dan status konektivitas untuk Postgres, Object Storage, Auth, Functions, dan Realtime.
- [x] **Export AI Context Master Bundle:** Tombol satu klik untuk menggabungkan seluruh intisari 11 dokumen blueprint ke dalam 1 prompt master (*single context prompt*) untuk Cursor / Claude / Antigravity.
- [x] **Frontend Taste Anti-Slop:** Kepatuhan terhadap aturan `.agents/skills/design-taste-frontend`:
  - Variance: 6, Motion: 4, Density: 5.
  - Palet off-black dan deep slate dengan aksen emerald & cobalt (zero AI-purple glow).
  - Navigasi single line desktop (tinggi 64px).
  - Nol karakter em-dash (`—` / `–`).
  - Kontras teks memenuhi standar WCAG AA.
- [x] **Kompilasi & Build:** `npm run build` sukses 100% dengan exit code 0.
- [x] **Git Tracking:** Terhubung dan ter-push ke GitHub `https://github.com/husnul234/app-planner-generator.git` pada branch `main`.

---

## 3. Verifikasi Menu Navigasi & Operasional (Live E2E Verification)

Berikut adalah status operasional 6 menu utama di antarmuka web desktop:

| Menu / Tab | Fitur Utama | Endpoint Terkait | Status E2E |
|---|---|---|---|
| **1. Workspace** | Dual-pane viewer 11 dokumen blueprint, inline markdown editor (auto-sync Postgres & S3), tambah custom doc, Salin konten, Unduh `.md`, Unduh `.zip`, dan tombol **Bundle Prompt AI** (FR-WORK-05). | `GET /api/projects/:id`, `PUT /api/projects/:id/documents`, `POST /api/projects/:id/documents` | **TERUJI (200 OK)** |
| **2. Projects CRUD** | Manajemen riwayat proyek, pencarian real-time, filter status (`ready`, `draft`, `generating`), modal edit metadata, modal konfirmasi hapus dengan cleanup file S3 bucket. | `GET /api/projects`, `PUT /api/projects/:id`, `DELETE /api/projects/:id` | **TERUJI (200 OK)** |
| **3. Wizard 7-Tahap** | Alur interaktif 7 langkah (Identitas, Masalah & Tagline, Fitur Inti, Target Audiens, Tech Stack, Desain Anti-slop, Model AI) yang men-trigger generator 11 berkas blueprint terpadu. | `POST /api/generate` | **TERUJI (200 OK)** |
| **4. BYOK Keys** | Manajemen kolam multi-key Google Gemini, validasi ke Google Generative Language API, rantai model fallback (`gemini-2.5-flash` s/d `gemini-1.5-pro`), rotasi HTTP 429/503, toggle aktif, dan tester inferensi prompt langsung di UI. | `GET /api/keys`, `POST /api/keys`, `PUT /api/keys`, `DELETE /api/keys` | **TERUJI (200 OK)** |
| **5. Team & Roles** | Role-Based Access Control (`admin` & `user`), tabel pengguna, form undang anggota via email, ubah role, batalkan undangan, dan switcher persona di navbar header. | `GET /api/team`, `POST /api/team`, `PUT /api/team`, `DELETE /api/team` | **TERUJI (200 OK)** |
| **6. Neon Infra** | Dashboard telemetri live latensi 5 layanan Neon: Serverless PostgreSQL (driver `@neondatabase/serverless`), Object Storage (S3 bucket `assets`), Auth JWKS, Functions, dan Realtime WebSocket Gateway. | `GET /api/neon/health` | **TERUJI (200 OK)** |

---

## 4. Pembaruan Lanjutan: Auth Page, Dashboard Separasi & Model Gemini 2026

Berdasarkan permintaan pengguna dan pembaruan kuota Google AI Studio terbaru:
1. **Model AI Gemini yang Didukung Saat Ini (Sesuai Dashboard Quota):**
   - `gemini-3.8-flash` (Prioritas Utama - Kapasitas RPM/TPM tertinggi)
   - `gemini-3.5-flash-lite` (Model Ringan Cepat)
   - `gemini-3-flash` (Text-out model)
   - `gemini-2.5-flash-lite` (Fast low-latency)
   - `gemini-2.5-flash` (Generasi stabil)
   - `gemini-2.0-flash` & `gemini-2.0-flash-lite`
   - `gemini-1.5-flash` & `gemini-1.5-pro` (Fallback legacy)
2. **Pembersihan Data Dummy:**
   - Seluruh data dummy di PostgreSQL (`projects`, `project_documents`, `invitations`, `user_api_keys`) dan bucket S3 telah dihapus bersih.
   - Initial state Workspace kini menampilkan **Empty State** bersih ("Belum Ada Proyek Blueprint") tanpa data hardcoded.
3. **Aktivasi AuthPage:**
   - Antarmuka autentikasi interaktif di `/` saat belum login, mendukung:
     - Form Masuk (Email & Password).
     - Form Daftar Akun Baru (Nama, Email, Password, Pilihan Peran: User atau Admin).
     - Tombol 1-Click Akses Cepat Simulasi: `Super Admin` (`admin@appplanner.ai`) dan `Indie Developer` (`user@appplanner.ai`).
     - Session persistence di `localStorage` dengan tombol Logout.
4. **Separasi Penuh Dashboard Admin & User:**
   - **Admin Dashboard:**
     - Pusat Kendali Ringkasan Sistem (Total Pengguna, Total Proyek, Total Kunci, Latensi).
     - Manajemen Anggota Tim & Role RBAC (Ubah role, hapus user, kirim undangan).
     - Audit & Tata Kelola Seluruh Proyek di platform.
     - Monitoring Kolam Kunci BYOK Global & Tester Inferensi.
     - Telemetri 5 Layanan Neon Serverless (Postgres, Storage, Auth, Functions, Realtime).
     - Fitur Simulasi Tampilan User (Preview as User).
   - **User Dashboard:**
     - Workspace Blueprint Dokumen Terpadu (Viewer, Inline Editor, Add Custom Doc, Bundle Prompt AI, Unduh .md & ZIP).
     - Proyek Saya (CRUD, Filter Status, Pencarian).
     - Wizard 7-Tahap Perencanaan Arsitektur.
     - Kunci BYOK Saya (Manajemen kunci pribadi, validasi live ke Google API, tester inferensi).
     - *User terisolasi dari akses telemetri infrastruktur dan pengelolaan role tim.*

