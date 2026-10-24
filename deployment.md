# DevOps, Environment Variables & CI/CD Strategy: AppPlanner AI

Dokumen ini mendefinisikan infrastruktur hosting, tata kelola variabel lingkungan (*environment variables*), alur integrasi dan pengiriman berkesinambungan (*CI/CD*), pemantauan (*observability*), serta prosedur pemulihan bencana (*disaster recovery*) untuk **AppPlanner AI**.

---

## 1. Hosting Architecture & Topology

Infrastruktur dirancang *cloud-native* tanpa server fisik yang perlu dirawat manual (*fully managed serverless*):

```mermaid
flowchart TD
    User["End User / Browser"]
    DNS["Cloudflare DNS (WAF, SSL, Bot Protection)"]
    Vercel["Vercel Edge & Serverless Platform\n- Next.js 15 App Router Hosting\n- Edge Middleware\n- Serverless Functions (Route Handlers)"]
    Supa["Supabase Cloud (AWS ap-southeast-1 / us-east-1)\n- PostgreSQL 15 Database (RLS)\n- GoTrue Auth Service\n- S3-compatible Storage"]
    LLM["LLM Providers (Google Cloud Vertex AI / Anthropic API)"]
    Monitoring["Observability Stack\n- Sentry (Error Tracking)\n- Helicone (LLM Tracing & Caching)"]

    User -->|HTTPS| DNS
    DNS --> Vercel
    Vercel -->|Database Queries & Auth Check| Supa
    Vercel -->|Streaming API Call| LLM
    Vercel -.->|Telemetry| Monitoring
```

---

## 2. Environment Variables Specification

Daftar seluruh environment variables yang dibutuhkan untuk menjalankan aplikasi di lingkungan lokal (*development*), pementasan (*staging*), dan produksi (*production*).

### File: `.env.example`
```bash
# ==============================================================================
# 1. APPLICATION & APP URL
# ==============================================================================
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="AppPlanner AI"

# ==============================================================================
# 2. SUPABASE INFRASTRUCTURE (PUBLIC & PRIVATE)
# ==============================================================================
# URL project Supabase Anda
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"

# Supabase Anon Key (Aman diekspos ke browser untuk otentikasi publik)
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Supabase Service Role Key (SANGAT RAHASIA - HANYA DI SERVER RUNTIME)
# PERINGATAN: Jangan pernah menambahkan prefix NEXT_PUBLIC_ pada variabel ini!
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SECRET_SERVICE_ROLE..."

# ==============================================================================
# 3. LLM API KEYS (SERVER RUNTIME ONLY)
# ==============================================================================
# Google Gemini API Key (Model utama untuk throughput cepat)
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Anthropic API Key (Model arsitektur presisi tinggi)
ANTHROPIC_API_KEY="sk-ant-api03-YourAnthropicApiKeyHere"

# OpenAI API Key (Opsional / Cadangan failover)
OPENAI_API_KEY="sk-proj-YourOpenAIApiKeyHere"

# ==============================================================================
# 4. RATE LIMITING & SECURITY (REDIS)
# ==============================================================================
# Upstash Redis untuk proteksi rate limit edge middleware
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="YourUpstashRedisToken"

# Secret Key untuk enkripsi BYOK (AES-256-GCM 32-byte hex string)
ENCRYPTION_MASTER_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# ==============================================================================
# 5. OBSERVABILITY & ERROR TRACKING
# ==============================================================================
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn@ingest.sentry.io/1234567"
HELICONE_API_KEY="sk-helicone-YourKeyHere"
```

---

## 3. CI/CD Pipeline (GitHub Actions Workflow)

Pipeline otomatis dijalankan pada setiap *Pull Request* dan *push* ke branch `main`:

```mermaid
flowchart LR
    Push["Git Push / PR"] --> Lint["1. Lint & Prettier"]
    Lint --> TypeCheck["2. TypeScript Typecheck"]
    TypeCheck --> UnitTests["3. Vitest Unit & Integration"]
    UnitTests --> RLSCheck["4. Supabase DB RLS Test"]
    RLSCheck --> Build["5. Next.js Production Build"]
    Build --> DeployPreview["Deploy Preview (jika PR)"]
    Build --> DeployProd["Deploy Production (jika main)"]
```

### GitHub Actions Workflow Configuration (`.github/workflows/deploy.yml`)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Type Checking
        run: npx tsc --noEmit

      - name: Run Unit & Integration Tests
        run: npm run test:coverage
        env:
          NEXT_PUBLIC_SUPABASE_URL: "https://mock.supabase.co"
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "mock-anon-key"

      - name: Build Next.js Application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  deploy:
    needs: validate-and-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 4. Database Migrations & Versioning Strategy

- Semua perubahan skema database dikelola melalui **Supabase CLI**:
  - `npx supabase migration new <migration_name>` untuk membuat file SQL baru di folder `supabase/migrations/`.
  - Migrasi diuji secara otomatis pada branch staging menggunakan `npx supabase db push`.
- Database production tidak boleh diubah secara manual lewat UI Supabase Table Editor tanpa script migration yang tercatat di repositori Git.

---

## 5. Observability, Logging & Error Tracking

1. **Error Tracking (Sentry):**
   - Menangkap unhandled exceptions di browser client dan runtime serverless Next.js.
   - Dilengkapi *source maps* otomatis untuk debugging baris kode asli.
2. **LLM Observability (Helicone / Langfuse):**
   - Melacak setiap panggilan LLM: latensi streaming, jumlah prompt token, completion token, estimasi biaya dolar, serta log prompt input/output untuk analisis anomali.
3. **Uptime & Healthcheck:**
   - Endpoint `/api/health` dipantau oleh BetterStack / UptimeRobot setiap 60 detik untuk memastikan ketersediaan API dan koneksi database Supabase.

---

## 6. Disaster Recovery & Backup Plan

- **Point-in-Time Recovery (PITR):** Supabase Pro menyediakan pencadangan basis data setiap detik hingga 7 hari ke belakang.
- **Daily Automated Logical Backups:** Snapshot database harian diekspor otomatis dan disimpan di S3 bucket terenkripsi di region geografis terpisah.
- **Recovery Time Objective (RTO):** < 30 menit untuk pemulihan instans database penuh.
- **Recovery Point Objective (RPO):** < 5 menit kehilangan data dalam skenario bencana server fatal.
