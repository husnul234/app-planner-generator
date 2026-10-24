# Local Setup & Development Guidelines: AppPlanner AI

Terima kasih telah berkontribusi pada pengembangan **AppPlanner AI (PlanCraft)**! Dokumen ini memandu langkah-langkah pengaturan lingkungan pengembangan lokal (*local development*), konvensi kode, alur Git, dan proses pengajuan *Pull Request*.

---

## 1. Prerequisites (Kebutuhan Sistem)

Sebelum memulai, pastikan perangkat lokal Anda telah terpasang:
- **Node.js:** Versi `20.x` (LTS) atau lebih baru (`node -v`)
- **Package Manager:** `npm` (v10+), `pnpm`, atau `bun`
- **Git:** Versi terbaru (`git --version`)
- **Docker Desktop:** Diperlukan jika Anda ingin menjalankan Supabase secara lokal di mesin Anda.
- **Supabase CLI:** Pasang via npm: `npm install -g supabase`

---

## 2. Quickstart: Local Environment Setup

Ikuti 6 langkah mudah berikut untuk menjalankan aplikasi di komputer Anda:

### Langkah 1: Clone Repositori
```bash
git clone https://github.com/your-org/app-planner-ai.git
cd app-planner-ai
```

### Langkah 2: Install Dependensi
```bash
npm install
```

### Langkah 3: Konfigurasi Environment Variables
Salin template konfigurasi `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Buka `.env.local` dan isi minimal variabel berikut:
- `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` (dari project Supabase Anda).
- `SUPABASE_SERVICE_ROLE_KEY` (untuk operasi server-side admin).
- `GOOGLE_GENERATIVE_AI_API_KEY` (dari Google AI Studio untuk model Gemini).

### Langkah 4: Setup Supabase Database & Migrations
Jika menggunakan **Supabase Cloud**, tautkan proyek Anda:
```bash
npx supabase link --project-ref your-project-id
npx supabase db push
```

Jika menggunakan **Supabase Local (Docker)**:
```bash
npx supabase start
npx supabase db reset # Menjalankan seluruh migration dan seed data
```

### Langkah 5: Jalankan Development Server
```bash
npm run dev
```
Buka browser Anda dan navigasikan ke: [http://localhost:3000](http://localhost:3000).

---

## 3. Available NPM Scripts

| Script | Deskripsi Perintah |
|---|---|
| `npm run dev` | Menjalankan Next.js development server dengan Hot Reload. |
| `npm run build` | Melakukan kompilasi produksi aplikasi Next.js. |
| `npm run start` | Menjalankan server aplikasi hasil kompilasi produksi. |
| `npm run lint` | Menjalankan ESLint untuk memeriksa kualitas kode. |
| `npm run format` | Memformat kode secara otomatis menggunakan Prettier. |
| `npm run test` | Menjalankan unit & integration tests dengan Vitest. |
| `npm run test:e2e` | Menjalankan pengujian end-to-end dengan Playwright. |
| `npm run db:types` | Menghasilkan TypeScript types dari database Supabase (`src/types/database.types.ts`). |

---

## 4. Git Branching Model & Workflow

Kami menerapkan standar **GitHub Flow**:
- Branch `main` selalu berada dalam kondisi stabil dan siap dideploy ke produksi.
- Semua pekerjaan baru wajib dibuat di branch terpisah yang dicabangkan dari `main`.

### Penamaan Branch:
- `feat/nama-fitur`: Penambahan fungsionalitas baru (misal: `feat/mermaid-zoom-controls`).
- `fix/nama-bug`: Perbaikan cacat kode (misal: `fix/sse-reconnection-glitch`).
- `docs/pembaruan-dokumen`: Perubahan dokumentasi (misal: `docs/update-api-spec`).
- `refactor/nama-modul`: Penataan ulang kode tanpa mengubah fungsionalitas luar.

---

## 5. Commit Message Conventions (Conventional Commits)

Format pesan commit mengikuti standar [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope opsional>): <deskripsi singkat dalam bahasa imperatif>

[penjelasan opsional yang lebih detail]

[referensi issue opsional, misal: Fixes #42]
```

### Daftar Tipe Commit:
- `feat`: Fitur baru untuk pengguna (contoh: `feat(workspace): add dual-pane file explorer`).
- `fix`: Memperbaiki bug (contoh: `fix(auth): prevent unauthorized access to /admin/templates`).
- `docs`: Menambah atau merevisi dokumentasi (contoh: `docs(prd): clarify token limits`).
- `style`: Format kode, spasi, titik koma (tanpa perubahan logika kode).
- `refactor`: Restrukturisasi kode (contoh: `refactor(pipeline): extract prompt builders into separate modules`).
- `test`: Menambah atau memperbaiki automated tests.
- `chore`: Pembaruan build script, dependensi package, atau konfigurasi CI.

---

## 6. Code Style & TypeScript Standards

1. **Strict TypeScript:** Jangan pernah menggunakan tipe data `any`. Gunakan `unknown` jika tipe belum pasti, lalu lakukan type narrowing.
2. **Server vs. Client Components:** Pertahankan komponen sebagai *Server Component* secara default. Hanya tambahkan direktif `'use client'` jika komponen membutuhkan hook state (`useState`, `useEffect`), event listeners browser, atau interaksi DOM langsung.
3. **Immutability:** Hindari mutasi objek/array secara langsung. Gunakan operator spread (`...`) atau fungsi pure.
4. **Clean Code UI:** Gunakan utilitas `cn()` (`clsx` + `tailwind-merge`) untuk penggabungan kelas kondisional Tailwind CSS.

---

## 7. Pull Request (PR) Checklist

Sebelum menekan tombol *Create Pull Request*, pastikan Anda telah menyelesaikan hal berikut:

- [ ] Kode lulus linting tanpa warning (`npm run lint`).
- [ ] TypeScript compile check sukses tanpa error (`npx tsc --noEmit`).
- [ ] Seluruh unit dan integration test berhasil lolos (`npm run test`).
- [ ] Tidak menyertakan file sensitif (`.env.local`, API keys, service role credentials) ke dalam git.
- [ ] Deskripsi PR menjelaskan secara gamblang: *Apa yang diubah? Mengapa diubah? Bagaimana cara mengujinya?*
- [ ] Melampirkan tangkapan layar (*screenshot*) atau rekaman GIF jika ada perubahan pada antarmuka pengguna (UI).
