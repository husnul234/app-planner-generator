# QA Strategy, Edge Cases & Acceptance Criteria: AppPlanner AI

Dokumen ini memuat rencana penjaminan mutu (*Quality Assurance*), strategi piramida pengujian, skenario uji fungsional, penanganan kasus ekstrem (*edge cases*), serta daftar periksa (*acceptance criteria checklist*) untuk **AppPlanner AI**.

---

## 1. Testing Strategy & Pyramid

Strategi pengujian mengadopsi piramida pengujian modern:

```
        / \
       /   \     E2E Tests (Playwright) - 15%
      /     \    Alur kritis: Registrasi -> Wawancara -> Stream -> Download ZIP
     /-------\
    /         \   Integration Tests (Vitest + MSW + Supabase Local) - 35%
   /           \  Validasi RLS, Endpoint API Contracts, Zod Schemas
  /-------------\
 /               \ Unit Tests (Vitest + React Testing Library) - 50%
/                 \ Logika Parser Markdown, Utility JSZip, UI Components
-------------------
```

### 1.1. Testing Tooling
- **Unit & Integration:** Vitest, `@testing-library/react`, Mock Service Worker (`msw`) untuk simulasi API LLM.
- **End-to-End (E2E):** Playwright dengan konfigurasi multi-browser (Chromium, Firefox, WebKit).
- **Security & Linting:** ESLint, Prettier, TypeScript strict check, Supabase CLI test suite untuk validasi RLS.

---

## 2. Core Functional Test Scenarios & Acceptance Criteria

### 2.1. Feature Epic: Hybrid Clarification Interview
- **Scenario TC-HYB-01: Inisiasi wawancara dengan prompt yang valid**
  - **Given:** User terotentikasi membuka halaman `/app/projects/new`.
  - **When:** User memasukkan nama proyek "TokoOnline" dan deskripsi "Aplikasi e-commerce baju distro dengan integrasi kurir JNE".
  - **Then:** Sistem menampilkan state loading selama < 3 detik, lalu menyajikan 3–5 kartu pertanyaan klarifikasi yang relevan dengan model e-commerce.
- **Scenario TC-HYB-02: Validasi input deskripsi terlalu singkat**
  - **Given:** User berada pada form inisiasi ide.
  - **When:** User hanya mengetik "buat app" (< 10 karakter).
  - **Then:** Tombol submit non-aktif, muncul pesan error validasi: "Deskripsi ide minimal 10 karakter".

### 2.2. Feature Epic: 11-File Streaming Generation Pipeline
- **Scenario TC-GEN-01: Streaming 11 dokumen sukses berurutan**
  - **Given:** User menyetujui ringkasan jawaban wawancara dan menekan "Mulai Buat Blueprint".
  - **When:** SSE stream terhubung ke endpoint `/api/v1/projects/:id/generate`.
  - **Then:**
    1. Status dokumen pertama berganti menjadi `streaming`.
    2. Teks markdown muncul secara real-time di layar tanpa glitch.
    3. Setelah file 1 selesai (`completed`), file 2 (`PRD.md`) otomatis mulai diproses hingga file ke-11 (`CONTRIBUTING.md`).
    4. Indikator progress bar bergerak mulus dari 0% hingga 100%.
- **Scenario TC-GEN-02: Konsistensi skema antar dokumen**
  - **Given:** Blueprint selesai digenerate.
  - **When:** Dilakukan verifikasi teks pada `database_schema.md` dan `api_spec.md`.
  - **Then:** Nama tabel, primary key, dan nama kolom pada skema SQL harus identik dengan field pada skema JSON di `api_spec.md`.

### 2.3. Feature Epic: Dual-Pane Workspace & ZIP Export (Opsi B)
- **Scenario TC-EXP-01: Ekspor bundel arsip ZIP**
  - **Given:** User berada di halaman `/app/projects/:id` dengan 11 dokumen berstatus `completed`.
  - **When:** User mengklik tombol "Export ZIP".
  - **Then:** Browser langsung memicu unduhan file `.zip` bernama `<project-slug>-blueprint.zip` yang di dalamnya memuat persis 11 file markdown dengan konten utuh.
- **Scenario TC-EXP-02: Render Diagram Mermaid**
  - **Given:** Dokumen `architecture.md` atau `database_schema.md` terbuka di viewer.
  - **When:** Konten memuat blok kode ` ```mermaid ... ``` `.
  - **Then:** Elemen dirender menjadi diagram grafik interaktif SVG, bukan teks mentah.

### 2.4. Feature Epic: Role-Based Access Control (RBAC)
- **Scenario TC-SEC-01: Isolasi data antar user non-admin**
  - **Given:** User A memiliki Project ID `AAA`.
  - **When:** User B (bukan admin) mencoba mengakses `/app/projects/AAA` atau memanggil `GET /api/v1/projects/AAA`.
  - **Then:** Server mengembalikan kode `404 Not Found` atau `403 Forbidden`, dan database RLS menolak query.
- **Scenario TC-SEC-02: Proteksi rute admin**
  - **Given:** User dengan role `user` mencoba membuka URL `/admin/dashboard`.
  - **When:** Halaman dimuat.
  - **Then:** Middleware mencegat request dan me-redirect user ke `/app` dengan toast peringatan "Akses ditolak".

---

## 3. Edge Cases Matrix & Failure Modes

| Kode | Kasus Ekstrem (Edge Case) | Dampak Potensial | Strategi Mitigasi & Ekspektasi Sistem |
|---|---|---|---|
| **EC-01** | Koneksi internet terputus di tengah streaming (SSE disconnect pada file ke-5) | Dokumen terpotong atau status stuck di `streaming` | Client mendeteksi `onerror` pada `EventSource`, mencoba *auto-reconnect* hingga 3x. Jika gagal, sediakan tombol "Resume Generation" dari file terakhir yang belum selesai. |
| **EC-02** | LLM API mengembalikan error `429 Rate Limit Exceeded` | Proses generasi gagal tiba-tiba | Backend menerapkan *exponential backoff retry* (1s, 2s, 4s). Jika masih gagal, lakukan failover otomatis ke model cadangan (misal dari Gemini ke Claude). |
| **EC-03** | Prompt input user mengandung instruksi Jailbreak / Injection | AI memuntahkan data sensitif atau instruksi sistem bocor | Sanitizer memvalidasi input di boundary API, mengapit prompt dalam tag isolasi XML khusus, dan menggunakan Zod structured output. |
| **EC-04** | User mengklik tombol "Generate" berkali-kali secara cepat (*spam click*) | Duplikasi request, lonjakan biaya token, race condition | Tombol langsung di-disable dan diberi status loading pada klik pertama. API Route dilindungi oleh Redis-based debounce / rate limiter. |
| **EC-05** | Diagram Mermaid yang dihasilkan AI memiliki sintaks error | Layar viewer crash / *White Screen of Death* | Komponen `MermaidRenderer` dibungkus dengan React Error Boundary. Jika parser gagal, tampilkan fallback "Raw Mermaid Code" beserta tombol copy tanpa membuat UI crash. |
| **EC-06** | Karakter nama proyek mengandung simbol aneh (`/ \ ? * : " < > |`) | Gagal saat membuat nama file di dalam arsip ZIP | Sanitasi string menggunakan fungsi slugify: hanya karakter alfanumerik dan tanda hubung (`-`) yang diizinkan untuk nama file. |

---

## 4. Pre-Release QA Acceptance Checklist

Sebelum aplikasi dideploy ke lingkungan produksi (*Production*), seluruh checklist berikut wajib diverifikasi (100% Pass):

- [ ] **Otentikasi:** Sign-up, Sign-in, OAuth GitHub, Forgot Password berfungsi normal.
- [ ] **Role Guard:** Akun role `user` tidak dapat membaca data di tabel `template_prompts` atau mengakses `/admin/*`.
- [ ] **Hybrid Wizard:** Alur dari input prompt -> klarifikasi pertanyaan -> konfirmasi -> streaming berjalan lancar tanpa error konsol.
- [ ] **Kelengkapan Dokumen:** Seluruh 11 file markdown (`map.md` s/d `CONTRIBUTING.md`) terisi lengkap dan tidak kosong.
- [ ] **Validitas Markdown:** Sintaks heading, list, tabel, blok kode, dan diagram Mermaid dapat dirender dengan benar di viewer.
- [ ] **In-Browser Editor:** Mengedit teks markdown dan menekan simpan berhasil memperbarui data di Supabase.
- [ ] **Ekspor ZIP:** File ZIP hasil unduhan dapat diekstrak di Windows, macOS, dan Linux tanpa karakter rusak.
- [ ] **Token Logging:** Setiap generasi proyek mencatat jumlah token dan estimasi biaya ke tabel `token_usage_logs`.
- [ ] **Mobile Responsiveness:** Navigasi dan antarmuka dapat diakses secara fungsional di layar smartphone dan tablet.
