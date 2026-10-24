# Design System, Color Palette & UI/UX Guidelines: AppPlanner AI

Dokumen ini mendefinisikan sistem desain visual, palet warna, tipografi, struktur token Tailwind CSS, serta panduan antarmuka (UI/UX) untuk **AppPlanner AI (PlanCraft)**. Desain berorientasi pada kenyamanan developer (*developer-first*), bersih, minimalis, dan mendukung mode gelap secara elegan (*high-contrast dark mode native*).

---

## 1. Design Philosophy & Core Principles

1. **Information Density with Breathing Room:** Antarmuka harus padat informasi (mengingat audiensnya adalah developer dan vibecoder) namun tetap nyaman dibaca berjam-jam tanpa lelah mata.
2. **Instant Visual Feedback:** Setiap aksi AI (mulai dari analisis prompt, streaming per baris, hingga ekspor file) harus memiliki indikator status yang jelas (shimmer skeleton, pulsating badge, progress bars).
3. **High-Fidelity Code & Markdown Presentation:** Tampilan Markdown, diagram Mermaid, dan blok sintaks kode adalah warga kelas satu (*first-class citizens*).
4. **Keyboard-Friendly:** Menyediakan shortcut keyboard untuk navigasi antar dokumen (`Cmd/Ctrl + K` untuk command palette, `Cmd/Ctrl + Shift + C` untuk copy file, panah atas/bawah untuk pindah dokumen).

---

## 2. Color Palette & Semantic Tokens

Sistem warna menggunakan nuansa Slate modern berpadu dengan aksen Indigo/Electric Violet untuk merefleksikan kecerdasan AI dan ketepatan engineering.

### 2.1. Color Swatches Table

| Token Name | Hex Code | HSL Value | Peran & Penggunaan |
|---|---|---|---|
| **Background (Dark)** | `#090D16` | `222, 47%, 6%` | Latar belakang canvas utama aplikasi (Default Dark) |
| **Surface (Dark)** | `#0F172A` | `222, 47%, 11%` | Kartu (*Card*), sidebar, modal popup |
| **Surface Elevate** | `#1E293B` | `217, 33%, 17%` | Header table, input field background, hover state |
| **Border / Divider** | `#334155` | `215, 25%, 27%` | Border antar panel, garis pembatas editor |
| **Text Primary** | `#F8FAFC` | `210, 40%, 98%` | Heading, teks bacaan utama, markdown body |
| **Text Secondary** | `#94A3B8` | `215, 20%, 65%` | Subtitle, metadata, timestamp, deskripsi form |
| **Text Muted** | `#64748B` | `215, 16%, 47%` | Placeholder, disabled text, breadcrumb divider |
| **Primary Accent** | `#6366F1` | `239, 84%, 67%` | Tombol CTA utama (Indigo 500), active states |
| **Primary Hover** | `#4F46E5` | `243, 75%, 59%` | Hover state tombol utama (Indigo 600) |
| **Accent Glow** | `#8B5CF6` | `258, 90%, 66%` | AI Generating glow, badge AI, active file pill |
| **Success / Valid** | `#10B981` | `158, 64%, 52%` | Status "File Ready", checklist completed |
| **Warning / Alert** | `#F59E0B` | `38, 92%, 50%` | Review required, token limit warning |
| **Destructive / Err**| `#EF4444` | `0, 84%, 60%` | Delete project, API rate limit fail, cancel |

### 2.2. Tailwind CSS Configuration Snippet (`tailwind.config.ts`)

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
        },
        border: "hsl(var(--border))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        destructive: "hsl(var(--destructive))",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "Menlo", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
};
export default config;
```

---

## 3. Typography Hierarchy

| Elemen | Font Family | Size | Weight | Line Height | Tracking |
|---|---|---|---|---|---|
| **Display H1** | Geist Sans / Inter | 36px (2.25rem) | 800 (Bold) | 1.15 | -0.03em |
| **Page Title H2** | Geist Sans / Inter | 24px (1.5rem) | 700 (Bold) | 1.25 | -0.02em |
| **Section Header H3**| Geist Sans / Inter | 18px (1.125rem) | 600 (SemiBold) | 1.35 | -0.01em |
| **Body Primary** | Geist Sans / Inter | 15px (0.9375rem)| 400 (Regular) | 1.6 | Normal |
| **Body Secondary** | Geist Sans / Inter | 13px (0.8125rem)| 400 (Regular) | 1.5 | Normal |
| **Code / Monospace**| JetBrains Mono | 13px (0.8125rem)| 500 (Medium) | 1.6 | Normal |
| **File Tree Label** | JetBrains Mono | 13px (0.8125rem)| 500 (Medium) | 1.2 | Normal |

---

## 4. UI Components & Interaction Standards

Komponen dibangun di atas **Radix UI Primitives** dengan styling **Tailwind CSS** (mengikuti konvensi **Shadcn UI**):

### 4.1. Buttons & CTA
- **Primary Action (Generate / Export):**
  - Background: Indigo-600 (`#4F46E5`), Text: White, Shadow: `shadow-md shadow-indigo-500/20`.
  - Hover: Indigo-500 (`#6366F1`) dengan transisi halus `transition-all duration-200 active:scale-98`.
- **Secondary / Ghost Button (Switch File, Copy):**
  - Background: Transparent / Surface-Elevate, Border: Border (`#334155`), Text: Slate-200.
  - Hover: Slate-800 dengan subtle border highlight.
- **Icon Buttons:** Berukuran 32x32px dengan padding simetris untuk tombol copy, download, dan minimize sidebar.

### 4.2. Form & Question Cards (Hybrid Interview UX)
- **Question Card Container:**
  - Latar belakang: Surface (`#0F172A`) dengan border halus `#1E293B`.
  - Step Indicator: Pill berbentuk lingkaran bernomor (`1`, `2`, `3`) dengan background ungu saat aktif.
- **Multiple Choice Options:**
  - Kartu opsi dapat diklik (*selectable radio cards*).
  - State default: Border `#334155`, Hover: Border Indigo-400.
  - State selected: Border `#6366F1` tebal 1.5px dengan background tint `rgba(99, 102, 241, 0.08)` dan icon centang (*CheckCircle*).

### 4.3. Dual-Pane Workspace Layout (Opsi B Implementation)

```
+-----------------------------------------------------------------------------------------+
| [Logo] AppPlanner AI  | Proyek: E-Commerce Store | [Status: 11/11 Ready] | [Export ZIP v] |
+------------------------------------+----------------------------------------------------+
| FILE TREE EXPLORER                 | DOKUMEN VIEWER / EDITOR: PRD.md                    |
|                                    | [View Markdown] [Raw Source] | [Copy File] [Edit]  |
| > Specifications (11 files)        |----------------------------------------------------+
|   * map.md             [OK]        | # Product Requirements Document (PRD)              |
|   * PRD.md  <active>   [OK]        |                                                    |
|   * design_sistem.md   [OK]        | ## 1. Executive Summary                            |
|   * wireframes.md      [OK]        | Proyek ini dirancang untuk menyelesaikan...        |
|   * security.md        [OK]        |                                                    |
|   * architecture.md    [OK]        |                                                    |
|   * database_schema.md [OK]        | ```mermaid                                         |
|   * api_spec.md        [OK]        | erDiagram                                          |
|   * qa.md              [OK]        |   USER ||--o{ ORDER : places                       |
|   * deployment.md      [OK]        | ```                                                |
|   * CONTRIBUTING.md    [OK]        |                                                    |
+------------------------------------+----------------------------------------------------+
```

- **Sidebar File Explorer (Lebar: 260px - 300px):**
  - Menampilkan 11 item file dengan icon ekstensi `.md` (Lucide `FileCode2`).
  - Badge status real-time di kanan nama file:
    - `Waiting`: Ikon jam pasir abu-abu.
    - `Generating`: Spinner biru-ungu berputar dengan animasi pulse.
    - `Completed`: Centang hijau kecil.
- **Content Viewer (Flexible Width):**
  - Menggunakan plugin `@tailwindcss/typography` (`prose prose-invert max-w-none`).
  - Diagram Mermaid dirender otomatis menggunakan `mermaid.render()` dalam kontainer dengan zoom dan pan capability.
  - Blok kode sintaks dihiasi dengan header file baris atas dan tombol copy interaktif.

---

## 5. Micro-Interactions & Motion Design

1. **AI Generation Shimmer:**
   - Selama dokumen sedang digenerate, kontainer menampilkan garis laser gradient bergerak dari kiri ke kanan di bagian paling atas dokumen (`linear-gradient(90deg, transparent, #8B5CF6, transparent)`).
2. **File Switch Transition:**
   - Perpindahan konten antar dokumen dianimasikan dengan lembut menggunakan Framer Motion: fade-in 150ms dengan pergeseran vertikal subtil 4px (`initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}`).
3. **Copy-to-Clipboard Toast:**
   - Ketika tombol "Copy File" diklik, tombol berubah menjadi status "Copied!" dengan ikon centang selama 2 detik disertai notifikasi toast mengambang di pojok kanan bawah.
