# Core API Endpoints & Data Contracts: AppPlanner AI

Dokumen ini mendefinisikan spesifikasi antarmuka pemrograman aplikasi (API), kontrak payload JSON, format Server-Sent Events (SSE) untuk streaming, serta kode respon HTTP untuk **AppPlanner AI**.

---

## 1. General API Conventions

- **Base URL:** `/api/v1`
- **Content-Type:** `application/json` (Kecuali endpoint streaming: `text/event-stream` dan download: `application/zip`)
- **Authentication:** Bearer Token via Header `Authorization: Bearer <supabase_jwt_token>` atau via secure session cookie.
- **Error Response Standard:** Mengikuti format terstruktur standar:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Deskripsi kesalahan yang mudah dipahami.",
    "details": [
      {
        "field": "raw_idea",
        "issue": "Minimal panjang karakter adalah 10 huruf."
      }
    ]
  }
}
```

---

## 2. API Endpoints Overview

| Method | Endpoint | Hak Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/v1/interview/clarify` | `user`, `admin` | Menganalisis ide awal & mengembalikan 3-5 pertanyaan klarifikasi. |
| `POST` | `/api/v1/projects` | `user`, `admin` | Membuat instance proyek baru sebelum proses generate. |
| `GET` | `/api/v1/projects` | `user`, `admin` | Mengambil daftar proyek milik user (dengan paginasi). |
| `GET` | `/api/v1/projects/:id` | `user`, `admin` | Mengambil detail proyek beserta status 11 dokumennya. |
| `POST` | `/api/v1/projects/:id/generate` | `user`, `admin` | **SSE Streaming**: Menghasilkan 11 file dokumen secara live. |
| `GET` | `/api/v1/projects/:id/docs/:slug`| `user`, `admin` | Mengambil konten markdown spesifik dari 1 file. |
| `PUT` | `/api/v1/projects/:id/docs/:slug`| `user`, `admin` | Memperbarui teks markdown hasil editan pengguna. |
| `POST` | `/api/v1/projects/:id/export/zip`| `user`, `admin` | Mengunduh arsip ZIP berisi seluruh 11 file markdown. |
| `GET` | `/api/v1/admin/analytics/tokens` | `admin` | Mengambil statistik konsumsi token dan estimasi biaya LLM. |
| `PUT` | `/api/v1/admin/templates/:type` | `admin` | Memperbarui system prompt generator dokumen tertentu. |

---

## 3. Endpoint Specifications

### 3.1. Hybrid Interview Clarification
Menganalisis brief awal developer dan memproduksi opsi pertanyaan cerdas untuk melengkapi konteks arsitektur.

- **URL:** `POST /api/v1/interview/clarify`
- **Request Body:**
```json
{
  "name": "FoodDelivery SaaS",
  "raw_idea": "Aplikasi pesan antar makanan untuk restoran lokal dengan pelacakan kurir real-time dan pembayaran QRIS.",
  "tech_stack_preference": ["Next.js", "Supabase", "Tailwind CSS"]
}
```
- **Response `200 OK`:**
```json
{
  "project_title_suggested": "FoodDelivery SaaS (Local Eats)",
  "questions": [
    {
      "id": "q1",
      "question": "Bagaimana model bisnis dan struktur multi-tenancy restoran?",
      "options": [
        "(Recommended) Multi-tenant: Setiap restoran memiliki dashboard dan katalog menu terisolasi",
        "Single-vendor: Hanya untuk satu brand restoran besar",
        "Marketplace terbuka: Siapa saja bisa mendaftar menjadi merchant"
      ],
      "allow_custom_text": true
    },
    {
      "id": "q2",
      "question": "Bagaimana mekanisme pelacakan posisi kurir secara real-time?",
      "options": [
        "(Recommended) Supabase Realtime Channels / WebSockets",
        "Polling interval berkala (setiap 10 detik)",
        "Pihak ketiga (Firebase / Ably)"
      ],
      "allow_custom_text": false
    },
    {
      "id": "q3",
      "question": "Gateway pembayaran utama yang akan diintegrasikan?",
      "options": [
        "(Recommended) Midtrans Snap (QRIS, VA, E-Wallet)",
        "Xendit Checkout",
        "Stripe Payment Intent"
      ],
      "allow_custom_text": true
    }
  ]
}
```

---

### 3.2. Project Initialization
- **URL:** `POST /api/v1/projects`
- **Request Body:**
```json
{
  "name": "FoodDelivery SaaS",
  "raw_idea": "Aplikasi pesan antar makanan...",
  "tech_stack": ["Next.js", "Supabase", "Tailwind CSS"],
  "interview_answers": [
    { "question_id": "q1", "selected_answer": "Multi-tenant: Setiap restoran..." },
    { "question_id": "q2", "selected_answer": "Supabase Realtime Channels" },
    { "question_id": "q3", "selected_answer": "Midtrans Snap" }
  ]
}
```
- **Response `201 Created`:**
```json
{
  "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "name": "FoodDelivery SaaS",
  "slug": "fooddelivery-saas",
  "status": "clarifying",
  "created_at": "2026-10-24T08:00:00Z"
}
```

---

### 3.3. Streaming Generation (SSE Protocol)
Endpoint paling vital yang mengalirkan progres dan konten markdown secara bertahap langsung ke browser client.

- **URL:** `POST /api/v1/projects/:id/generate`
- **Headers:** `Accept: text/event-stream`
- **SSE Event Stream Data Samples:**

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

event: start
data: {"project_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", "total_files": 11}

event: file_start
data: {"filename": "PRD.md", "file_slug": "prd", "index": 1}

event: chunk
data: {"file_slug": "prd", "text": "# Product Requirements Document\n\n## 1. Executive Summary\n"}

event: chunk
data: {"file_slug": "prd", "text": "Aplikasi ini memfasilitasi pesan antar makanan multi-tenant..."}

event: file_complete
data: {"filename": "PRD.md", "file_slug": "prd", "word_count": 1420, "tokens_used": 1850}

event: file_start
data: {"filename": "database_schema.md", "file_slug": "database_schema", "index": 2}

...

event: all_complete
data: {"project_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", "status": "ready", "total_tokens": 16400}
```

---

### 3.4. Fetch Project Workspace Data
Mengambil pohon dokumen proyek untuk dirender pada panel kiri (File Tree) dan dokumen pertama untuk panel kanan.

- **URL:** `GET /api/v1/projects/:id`
- **Response `200 OK`:**
```json
{
  "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "name": "FoodDelivery SaaS",
  "status": "ready",
  "total_tokens_used": 16400,
  "documents": [
    {
      "id": "11111111-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "filename": "map.md",
      "file_slug": "map",
      "status": "completed",
      "word_count": 950,
      "updated_at": "2026-10-24T08:02:10Z"
    },
    {
      "id": "22222222-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "filename": "PRD.md",
      "file_slug": "prd",
      "status": "completed",
      "word_count": 1420,
      "updated_at": "2026-10-24T08:02:40Z"
    }
  ]
}
```

---

### 3.5. Update Document (In-Browser Editing)
Memungkinkan developer mengedit atau memperbaiki teks dokumen markdown langsung di antarmuka web.

- **URL:** `PUT /api/v1/projects/:id/docs/:slug`
- **Request Body:**
```json
{
  "content": "# Updated PRD Content...\n\nRevisi alur pembayaran..."
}
```
- **Response `200 OK`:**
```json
{
  "message": "Document updated successfully",
  "file_slug": "prd",
  "version": 2,
  "word_count": 1455,
  "updated_at": "2026-10-24T08:15:00Z"
}
```

---

### 3.6. Export ZIP Archive (Server-Side Fallback)
Mengunduh bundel seluruh dokumen dalam format `.zip`.

- **URL:** `POST /api/v1/projects/:id/export/zip`
- **Response:**
  - Status: `200 OK`
  - Header: `Content-Type: application/zip`
  - Header: `Content-Disposition: attachment; filename="fooddelivery-saas-blueprint.zip"`
  - Body: Raw binary bytes data file ZIP.

---

### 3.7. Admin Analytics: Token Usage & Cost
Endpoint khusus administrator untuk memonitor biaya pemakaian LLM.

- **URL:** `GET /api/v1/admin/analytics/tokens?range=last_30_days`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response `200 OK`:**
```json
{
  "period": "last_30_days",
  "total_projects_generated": 142,
  "total_prompt_tokens": 1820000,
  "total_completion_tokens": 2450000,
  "estimated_total_cost_usd": 3.48,
  "most_expensive_doc_type": "database_schema.md",
  "top_users": [
    {
      "user_id": "usr_789abc",
      "email": "alex@vibecoder.io",
      "projects_count": 14,
      "tokens_consumed": 210000
    }
  ]
}
```
