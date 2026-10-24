# Wireframe Blueprint & UI Architecture: AppPlanner AI (PlanCraft)

- **Document Version:** v1.0.0
- **Status:** Approved / Design Ready
- **Primary Viewports:** Desktop (1440px / 1280px Grid) & Mobile (390px / 375px Fluid)
- **UI Framework:** Next.js 15 (App Router), Tailwind CSS v3.4+, Shadcn UI (Radix Primitives)
- **Design Reference:** [design_sistem.md](file:///E:/3.%20PRODUK%20DIGITAL/05%20-%20Aplikasi%20dan%20Pengembangan/App/48.%20APP%20PLANNER/APP%20PLANER%20CODE/design_sistem.md) & [map.md](file:///E:/3.%20PRODUK%20DIGITAL/05%20-%20Aplikasi%20dan%20Pengembangan/App/48.%20APP%20PLANNER/APP%20PLANER%20CODE/map.md)

---

## 1. Responsive Layout Standards & Breakpoint Guidelines

Aplikasi menggunakan pendekatan **Responsive & Adaptive Layout**:
- **Desktop (>= 1024px, optimal 1280px - 1440px):** Multi-column grid, split-screen dual-pane workspace, persistent side navigation, dan dense data tables.
- **Tablet (768px - 1023px):** Collapsible sidebar (icon-only atau off-canvas drawer), single-column stacked forms, dan horizontal scrollable tables.
- **Mobile (320px - 767px, optimal 375px - 390px):** Single-column vertical flow, bottom sheet modal untuk selector file, floating action bar (FAB), and touch-friendly targets (min 44x44px).

| Token | Breakpoint | Karakteristik Layout Workspace & Dashboard |
|---|---|---|
| `sm` | 640px | Transisi dialog full-screen modal; bottom sheet drawer aktif. |
| `md` | 768px | Sidebar beralih ke overlay drawer; top navbar menyusutkan menu. |
| `lg` | 1024px | Dual-pane workspace aktif (File tree 280px + Viewer fluid). |
| `xl` | 1280px | Standard desktop view; 3-column stats cards; table full metadata. |
| `2xl`| 1400px | Max container width; auto-center margin. |

---

## 2. Global Shell & Navigation System

### 2.1. Desktop Shell (`/app/*` & `/admin/*`)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft AI   |  [Search / Command: Cmd+K]  |  [+ New Blueprint]    [Tokens: 42k] [Avatar v] |
+-----------------------+----------------------------------------------------------------------------+
| SIDEBAR NAV           | MAIN CONTENT AREA                                                          |
| > Workspaces          |                                                                            |
|   - All Blueprints    | Breadcrumbs: Projects / E-Commerce MVP                                     |
|   - Templates         |                                                                            |
|   - Archive           | (Page Content Loaded Here)                                                 |
|                       |                                                                            |
| > Account & Setup     |                                                                            |
|   - BYOK API Keys     |                                                                            |
|   - Usage & Quota     |                                                                            |
|   - Settings          |                                                                            |
|                       |                                                                            |
| [v Admin Console]     |                                                                            |
| (if role == admin)    |                                                                            |
+-----------------------+----------------------------------------------------------------------------+
```

### 2.2. Mobile Shell (`/app/*`)
```
+---------------------------------------------------+
| [=] PlanCraft AI              [+ New]  [Avatar v] |  <- Sticky Top Bar
+---------------------------------------------------+
| Breadcrumbs: Projects / E-Commerce MVP            |
|                                                   |
| (Page Content Dynamically Flowing Here)           |
|                                                   |
|                                                   |
+---------------------------------------------------+
| [Home]     [Projects]     [Templates]     [Stats] |  <- Sticky Bottom Navigation
+---------------------------------------------------+
```

---

## 3. Public / Guest Role Wireframes

---

### 3.1. Landing Page (`/`)

#### A. Desktop View (1440px)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft AI      Features      Templates      Pricing      Docs        [Sign In] [Get Started] |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|                                     THE PRE-DEV ENGINE FOR VIBECODERS                              |
|                          Stop Context Drift. Generate Complete Tech Blueprints.                     |
|                                                                                                    |
|    Turn your raw app idea into 10 production-ready architectural documents in under 90 seconds.    |
|               Sitemap - PRD - Database ERD - API Spec - Security RLS - CI/CD Pipeline              |
|                                                                                                    |
|                [ Enter Idea: "Uber for Pet Grooming with Real-time Tracking" ]  [Generate Free ->] |
|                                                                                                    |
|                      Supported AI Workflows: [Cursor]  [Antigravity]  [Claude Dev]  [Windsurf]     |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
| LIVE PREVIEW SHOWCASE INTERACTIVE DEMO                                                             |
| +-----------------------------------+------------------------------------------------------------+ |
| | > Blueprint File Explorer         | map.md & database_schema.md (Live Dual-Pane Preview)       | |
| |   [v] PRD.md                      |                                                            | |
| |   [v] database_schema.md          |  erDiagram                                                 | |
| |   [v] api_spec.md                 |    USER ||--o{ BOOKING : creates                           | |
| |   [v] security.md                 |    GROOMER ||--o{ BOOKING : accepts                        | |
| +-----------------------------------+------------------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
| HOW IT WORKS IN 3 STEPS                                                                            |
| [ 1. Describe & Select Stack ]   ->   [ 2. AI Clarification Wizard ]  ->  [ 3. Export ZIP & Rules ]|
| Quick prompt + tech preference.        3-5 Smart Q&A to seal edge cases.   Copy directly to AI tool.|
+----------------------------------------------------------------------------------------------------+
| METRICS THAT MATTER                                                                                |
|       < 90 Seconds                  11 Unified Files                     0 Schema Drift            |
|    Idea to 11-file Blueprint       100% Interlinked Docs              DB matches API specs 1:1     |
+----------------------------------------------------------------------------------------------------+
| FOOTER: (c) 2026 PlanCraft AI | Supabase Auth & DB | Next.js 15 | Privacy | Terms | GitHub         |
+----------------------------------------------------------------------------------------------------+
```

#### B. Mobile View (390px)
```
+---------------------------------------------------+
| [Logo] PlanCraft AI                           [=] |
+---------------------------------------------------+
|                                                   |
|          THE PRE-DEV ENGINE FOR VIBECODERS        |
|                                                   |
| Turn your raw idea into 11 production-ready tech  |
| blueprints in under 90 seconds.                   |
|                                                   |
| +-----------------------------------------------+ |
| | Describe your app idea...                     | |
| +-----------------------------------------------+ |
| | [>>> Start Generating Free Blueprint]         | |
| +-----------------------------------------------+ |
|                                                   |
| AI Ready: Cursor * Antigravity * Claude           |
|                                                   |
| ------------------------------------------------- |
| FEATURE HIGHLIGHTS                                |
|                                                   |
| [*] 11 Synchronized Markdown Files                |
| [*] Interactive Clarification Wizard              |
| [*] Supabase DDL & RLS Policies Pre-Configured    |
| [*] Instant ZIP & Cursor Context Export           |
|                                                   |
| ------------------------------------------------- |
| PROOF & SPEED                                     |
| [ <90s Avg ]      [ 11 Files ]      [ 0 Drift ]   |
|                                                   |
| ------------------------------------------------- |
| [Get Started for Free]     [Sign In With GitHub]  |
|                                                   |
| (c) 2026 PlanCraft AI                             |
+---------------------------------------------------+
```

---

### 3.2. Authentication Pages (`/auth/login` & `/auth/register`)

#### A. Desktop View (1440px - Centered Card Modal)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft AI                                                        [Back to Home] [Docs]   |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|                                  +---------------------------------------+                         |
|                                  | Sign in to PlanCraft AI               |                         |
|                                  | Continue to your blueprints & prompts |                         |
|                                  |                                       |                         |
|                                  | [ [GH] Continue with GitHub        ]  |                         |
|                                  | [ [G]  Continue with Google        ]  |                         |
|                                  |                                       |                         |
|                                  | -------------- OR ------------------- |                         |
|                                  |                                       |                         |
|                                  | Email Address                         |                         |
|                                  | [ alex@vibecoder.dev                ] |                         |
|                                  |                                       |                         |
|                                  | Password             [Forgot Password]|                         |
|                                  | [ ******************             (o) ] |                         |
|                                  |                                       |                         |
|                                  | [Sign In ->                         ] |                         |
|                                  |                                       |                         |
|                                  | Don't have an account? [Create one]   |                         |
|                                  +---------------------------------------+                         |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

#### B. Mobile View (390px - Full Screen Layout)
```
+---------------------------------------------------+
| [<- Back]                       [Logo] PlanCraft  |
+---------------------------------------------------+
|                                                   |
| Sign In to PlanCraft                              |
| Manage and export your pre-dev blueprints.        |
|                                                   |
| [ [GH] Continue with GitHub                    ]  |
| [ [G]  Continue with Google                    ]  |
|                                                   |
| ------------------- OR -------------------------- |
|                                                   |
| Email Address                                     |
| [ alex@vibecoder.dev                            ] |
|                                                   |
| Password                                          |
| [ ******************                        (o) ] |
|                                                   |
| [? Forgot your password?]                         |
|                                                   |
| [Sign In ->                                     ] |
|                                                   |
| New here? [Create free developer account]         |
+---------------------------------------------------+
```

---

### 3.3. Pricing & Quota Page (`/pricing`)

#### A. Desktop View (1440px - 3 Tier Cards)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft AI      Features      Templates      Pricing      Docs        [Dashboard] [Avatar]|
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|                              SIMPLE PRICING FOR SERIOUS BUILDERS                                   |
|                Generate complete blueprints. Bring your own key (BYOK) anytime.                    |
|                                                                                                    |
|   +-----------------------+   +-----------------------+   +------------------------------------+   |
|   | FREE STARTER          |   | PRO VIBECODER (Pop)   |   | TEAMS / ENTERPRISE                 |   |
|   | $0 / month            |   | $19 / month           |   | $79 / month                        |   |
|   | Ideal for prototyping |   | High-volume builders  |   | Multi-seat dev agency              |   |
|   |-----------------------|   |-----------------------|   |------------------------------------|   |
|   | * 3 Blueprints / mo   |   | * Unlimited Blueprint |   | * Unlimited Blueprints             |   |
|   | * All 10 Pre-Dev Docs |   | * Claude 3.5 & Gemini |   | * Custom Master Prompts            |   |
|   | * ZIP & AI Context    |   | * GitHub Direct Push  |   | * Team Shared Workspace            |   |
|   | * Standard Generation |   | * Fast-lane Streaming |   | * Priority LLM Queues              |   |
|   | * Community Support   |   | * BYOK Mode Included  |   | * Dedicated Admin Console          |   |
|   |                       |   |                       |   |                                    |   |
|   | [Get Started Free]    |   | [Upgrade to Pro ->]   |   | [Contact Sales]                    |   |
|   +-----------------------+   +-----------------------+   +------------------------------------+   |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

#### B. Mobile View (390px - Stacked Carousel/Cards)
```
+---------------------------------------------------+
| [=] PlanCraft AI                        [Sign In] |
+---------------------------------------------------+
| Simple, Transparent Plans                         |
|                                                   |
| +-----------------------------------------------+ |
| | PRO VIBECODER [Most Popular Badge]            | |
| | $19 / month                                   | |
| |-----------------------------------------------| |
| | [x] Unlimited Blueprint Generations           | |
| | [x] All 10 Coordinated MD Documents          | |
| | [x] GitHub Push & In-Browser Editor           | |
| | [x] Fast Streaming (Gemini / Claude)          | |
| | [x] BYOK Zero-Markup Option                   | |
| |                                               | |
| | [Get Pro Access Now ->]                       | |
| +-----------------------------------------------+ |
|                                                   |
| +-----------------------------------------------+ |
| | FREE STARTER - $0 / mo                        | |
| | 3 Blueprints/mo * Standard Speed              | |
| | [Start Free]                                  | |
| +-----------------------------------------------+ |
|                                                   |
| +-----------------------------------------------+ |
| | TEAM AGENCY - $79 / mo                        | |
| | Shared Workspace * Custom Templates           | |
| | [Talk to Us]                                  | |
| +-----------------------------------------------+ |
+---------------------------------------------------+
```

---

### 3.4. Documentation & Blueprint Template Gallery (`/docs`)

#### A. Desktop View (1440px)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft AI   |  [Search docs & templates...]             |  [Pricing]  [Open App ->]      |
+-----------------------+----------------------------------------------------------------------------+
| DOCS NAVIGATION       | TEMPLATE GALLERY & ARCHITECTURE PRESETS                                    |
| > Getting Started     | Pick a pre-engineered baseline or learn how to craft context prompts.      |
|   - Quickstart        |                                                                            |
|   - AI Prompt Flow    | Filter: [All]  [SaaS Web]  [Mobile App]  [AI Agent/RAG]  [E-Commerce]      |
|   - 11-File Structure |                                                                            |
|                       | +-------------------------+ +-------------------------+ +----------------+ |
| > Templates Library   | | SaaS Subscription MVP   | | AI Agent Tool Pipeline  | | E-Com Mobile   | |
|   - SaaS B2B          | | Next.js 15, Stripe,     | | FastAPI, LangChain,     | | Flutter, Supa- | |
|   - Mobile Flutter    | | Supabase Auth, Tailwind | | pgvector, Claude 3.5    | | base, Midtrans | |
|   - AI Wrapper / RAG  | | [11 Docs Pre-tested]    | | [11 Docs Pre-tested]    | | [11 Docs Ready]| |
|                       | | [Use This Template ->]  | | [Use This Template ->]  | | [Use Template] | |
| > AI Tools Integration| +-------------------------+ +-------------------------+ +----------------+ |
|   - Cursor Setup      |                                                                            |
|   - Antigravity Guide | HOW TO INJECT BLUEPRINTS INTO AI TOOLS:                                    |
|   - Windsurf Rules    | 1. Download the full ZIP archive.                                          |
|                       | 2. Extract into your project root: `/docs` or `.cursorrules`.              |
+-----------------------+----------------------------------------------------------------------------+
```

#### B. Mobile View (390px)
```
+---------------------------------------------------+
| [=] Docs & Templates                [Search Icon] |
+---------------------------------------------------+
| Presets & Starter Kits                            |
|                                                   |
| [Filter: All v]   [Tags: SaaS, AI, Mobile]        |
|                                                   |
| +-----------------------------------------------+ |
| | SaaS Subscription MVP                         | |
| | Stack: Next.js 15, Supabase, Stripe           | |
| | Includes: Complete RLS, API specs, DDL        | |
| | [Clone to Wizard ->]                          | |
| +-----------------------------------------------+ |
|                                                   |
| +-----------------------------------------------+ |
| | AI Agent / RAG Tool                           | |
| | Stack: FastAPI, pgvector, LangChain           | |
| | Includes: Vector schema, chunking spec        | |
| | [Clone to Wizard ->]                          | |
| +-----------------------------------------------+ |
|                                                   |
| [> Read AI Coding Tool Integration Guides]        |
+---------------------------------------------------+
```

---

## 4. User Role (Developer / Vibecoder) Wireframes

---

### 4.1. User Dashboard & Projects List (`/app` & `/app/projects`)

#### A. Desktop View (1440px)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft AI   |  [Cmd+K Search Projects...]              |  [+ New Blueprint]  [Alex Dev v]|
+-----------------------+----------------------------------------------------------------------------+
| SIDEBAR               | DASHBOARD OVERVIEW                                                         |
| [*] Blueprints (8)    | +--------------------+ +--------------------+ +--------------------------+ |
| [ ] Templates         | | TOTAL BLUEPRINTS   | | TOTAL FILES GEN    | | TOKENS SAVED / BYOK      | |
| [ ] BYOK Keys         | | 8 Projects Active  | | 80 Markdown Files  | | 240,500 Tokens (Free)    | |
| [ ] Settings          | +--------------------+ +--------------------+ +--------------------------+ |
|                       |                                                                            |
| STORAGE & QUOTA       | MY BLUEPRINTS                                    [Filter: All v]  [Search] |
| 8 of 10 Pro slots     | +------------------------------------------------------------------------+ |
| [========--] 80%      | | Project Name      | Target Stack      | Created     | Status  | Action | |
|                       | |-------------------+-------------------+-------------+---------+--------| |
| [Upgrade Plan]        | | PetGroomer Uber   | Next15/Supabase   | 2 hours ago | Ready   | [Open] | |
|                       | | PromptLocker SaaS | Remix/Prisma      | Yesterday   | Ready   | [Open] | |
|                       | | AI Invoice Parser | FastAPI/pgvector  | 3 days ago  | Ready   | [Open] | |
|                       | | FitTrack Mobile   | Flutter/Firebase  | 1 week ago  | Ready   | [Open] | |
|                       | +------------------------------------------------------------------------+ |
|                       | Showing 1 - 4 of 8 projects                            [< Prev]  [Next >]  |
+-----------------------+----------------------------------------------------------------------------+
```

#### B. Mobile View (390px)
```
+---------------------------------------------------+
| [=] PlanCraft AI              [+ New]  [Avatar v] |
+---------------------------------------------------+
| Dashboard Summary                                 |
| [ 8 Blueprints ]     [ 80 Files ]     [ 240k Tok] |
|                                                   |
| Recent Projects                    [Filter: All v]|
|                                                   |
| +-----------------------------------------------+ |
| | PetGroomer Uber                [Ready: 10/10] | |
| | Stack: Next.js 15, Supabase, Tailwind         | |
| | Updated: 2 hours ago                          | |
| | [Open Workspace ->]            [...] Options  | |
| +-----------------------------------------------+ |
|                                                   |
| +-----------------------------------------------+ |
| | PromptLocker SaaS              [Ready: 10/10] | |
| | Stack: Remix, Prisma, Stripe                  | |
| | Updated: Yesterday                            | |
| | [Open Workspace ->]            [...] Options  | |
| +-----------------------------------------------+ |
|                                                   |
| +-----------------------------------------------+ |
| | AI Invoice Parser              [Ready: 10/10] | |
| | Stack: FastAPI, PostgreSQL                    | |
| | Updated: 3 days ago                           | |
| | [Open Workspace ->]            [...] Options  | |
| +-----------------------------------------------+ |
|                                                   |
| [Load More Projects]                              |
+---------------------------------------------------+
| [Home]       [Projects]       [BYOK]      [Settings]|
+---------------------------------------------------+
```

---

### 4.2. Hybrid Wizard Generator (`/app/projects/new`)

Proses pembuatan blueprint melalui 4 tahapan berurutan (*Linear Guided Wizard*).

#### STEP 1: Initial Idea & Tech Stack Preference

##### Desktop View (1440px)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft AI   |  Wizard: Create New Blueprint                        [Save Draft]  [Close X]
+----------------------------------------------------------------------------------------------------+
|               (1) App Concept  ---- [2] AI Interview ---- [3] Review ---- [4] Generate             |
|                                                                                                    |
|                                     STEP 1: DEFINE YOUR APP IDEA                                   |
|                                                                                                    |
|  Project Name                                                                                      |
|  [ PetGroomer Uber - On-Demand Mobile Pet Service                                                ] |
|                                                                                                    |
|  Describe your app core concept & key problem solved:                                             |
|  +-----------------------------------------------------------------------------------------------+ |
|  | An Uber-like on-demand marketplace connecting busy pet owners with certified mobile groomers.  |
|  | Groomers arrive in a mobile van equipped with water and power. Includes GPS booking, in-app   |
|  | escrow payment, and dog medical allergy profiles.                                             |
|  +-----------------------------------------------------------------------------------------------+ |
|                                                                                                    |
|  Preset Templates: [SaaS Web] [Mobile App] [AI Wrapper] [Marketplace] [Internal Ops Tool]          |
|                                                                                                    |
|  Preferred Tech Stack (AI will auto-suggest if left blank):                                        |
|  Frontend:  [ Next.js 15 (App Router) v ]       Backend:   [ Supabase (Postgres & Auth) v ]        |
|  Styling:   [ Tailwind CSS + Shadcn UI v]       Payments:  [ Stripe / Midtrans v          ]        |
|                                                                                                    |
|                                                                [Cancel]    [Continue to AI Interview ->]
+----------------------------------------------------------------------------------------------------+
```

##### Mobile View (390px)
```
+---------------------------------------------------+
| [<- Back]     Step 1 of 4: Idea         [Close X] |
+---------------------------------------------------+
| Progress: [====------------] 25%                  |
|                                                   |
| Project Title                                     |
| [ PetGroomer Uber                               ] |
|                                                   |
| Core Concept Description                          |
| +-----------------------------------------------+ |
| | An Uber-like on-demand marketplace connecting | |
| | pet owners with mobile groomers. In-app       | |
| | payment & live tracking.                      | |
| +-----------------------------------------------+ |
|                                                   |
| Quick Presets:                                    |
| [Marketplace]  [Mobile App]  [SaaS]               |
|                                                   |
| Preferred Stack:                                  |
| Frontend: [ Next.js 15 v ]                        |
| Backend:  [ Supabase v   ]                        |
| Payment:  [ Stripe v     ]                        |
|                                                   |
| [Next: AI Clarification Q&A ->]                   |
+---------------------------------------------------+
```

---

#### STEP 2: AI Clarification Interview (Dynamic Q&A Cards)

AI mendeteksi ambiguitas teknis dari brief dan menghasilkan 3–5 pertanyaan interaktif.

##### Desktop View (1440px)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft AI   |  Wizard: AI Clarification Interview                  [Save Draft]  [Close X]
+----------------------------------------------------------------------------------------------------+
|               [ok] App Concept  ---- (2) AI Interview ---- [3] Review ---- [4] Generate            |
|                                                                                                    |
| AI ARCHITECT SAYS:                                                                                 |
| "Great concept! To ensure zero schema mismatches in database_schema.md and security.md,           |
| I need clarification on these 3 architectural decisions:"                                          |
|                                                                                                    |
| +------------------------------------------------------------------------------------------------+ |
| | Question 1 of 3: How should live location tracking between owner and groomer van behave?       | |
| |                                                                                                | |
| |   (o) [Option A] Real-time Supabase Realtime Channels / WebSockets (High accuracy, live map)   | |
| |   ( ) [Option B] Polling interval every 30 seconds via REST (Simpler, battery saving)          | |
| |   ( ) [Option C] Custom: [ Type custom architecture requirements...                          ] | |
| +------------------------------------------------------------------------------------------------+ |
|                                                                                                    |
| +------------------------------------------------------------------------------------------------+ |
| | Question 2 of 3: What is the payout and commission model for mobile groomers?                  | |
| |                                                                                                | |
| |   ( ) [Option A] Direct split (Stripe Connect marketplace with 15% platform commission)        | |
| |   (o) [Option B] Escrow wallet: Owner pays upfront, funds released upon QR code completion     | |
| |   ( ) [Option C] Custom: [ Type custom rules...                                              ] | |
| +------------------------------------------------------------------------------------------------+ |
|                                                                                                    |
| +------------------------------------------------------------------------------------------------+ |
| | Question 3 of 3: What level of Role-Based Access Control (RBAC) is required?                   | |
| |                                                                                                | |
| |   (o) 3 Roles: 'pet_owner', 'groomer_partner', 'platform_admin' (with dedicated RLS policies) | |
| |   ( ) 2 Roles: Single user account with polymorphic profiles                                   | |
| +------------------------------------------------------------------------------------------------+ |
|                                                                                                    |
|                                                              [<- Back]    [Review Final Scope ->]  |
+----------------------------------------------------------------------------------------------------+
```

##### Mobile View (390px)
```
+---------------------------------------------------+
| [<- Back]     Step 2 of 4: AI Q&A       [Close X] |
+---------------------------------------------------+
| Progress: [========--------] 50%                  |
|                                                   |
| AI Architect detected 3 questions:                |
|                                                   |
| Q1: Live GPS Tracking Method                      |
| +-----------------------------------------------+ |
| | (*) [A] Supabase Realtime Channels (High freq)| |
| | ( ) [B] 30s Polling via REST                  | |
| | ( ) [C] Custom input                          | |
| +-----------------------------------------------+ |
|                                                   |
| Q2: Payout Model                                  |
| +-----------------------------------------------+ |
| | ( ) [A] Stripe Connect Direct Split           | |
| | (*) [B] Escrow Wallet with Completion QR Code | |
| +-----------------------------------------------+ |
|                                                   |
| Q3: User Roles                                    |
| +-----------------------------------------------+ |
| | (*) [A] 3 Roles (Owner, Groomer, Admin)       | |
| | ( ) [B] Simple 2 Roles                        | |
| +-----------------------------------------------+ |
|                                                   |
| [Review Blueprint Scope ->]                       |
+---------------------------------------------------+
```

---

#### STEP 3: Blueprint Scope Review & Generation Confirmation

##### Desktop View (1440px)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft AI   |  Wizard: Confirm & Launch Generation                 [Save Draft]  [Close X]
+----------------------------------------------------------------------------------------------------+
|               [ok] App Concept  ---- [ok] AI Interview ---- (3) Review ---- [4] Generate           |
|                                                                                                    |
|                                  MASTER ARCHITECTURAL SPECIFICATION                                |
|                                                                                                    |
| +------------------------------------------------------------------------------------------------+ |
| | Project: PetGroomer Uber (On-Demand Mobile Pet Services)                                       | |
| | Target Frameworks: Next.js 15, Supabase (Postgres/Auth/Realtime), Tailwind CSS, Stripe Connect   | |
| | Core Rules: Escrow Payouts, Real-time GPS Tracking, 3-Tier Supabase RLS Policies               | |
| +------------------------------------------------------------------------------------------------+ |
|                                                                                                    |
| The engine will generate these 11 interconnected blueprints simultaneously:                       |
|                                                                                                    |
| [x] 1. map.md             - Feature Roadmap, Sitemap, Milestone Hierarchy                         |
| [x] 2. PRD.md             - Executive Summary, User Stories, Acceptance Criteria                  |
| [x] 3. design_sistem.md   - Theme Colors, Typography, Component Specs, Dual-Pane Rules            |
| [x] 4. wireframes.md      - Responsive ASCII Wireframes, Role-Based UI Flows, Screen Layouts      |
| [x] 5. security.md        - Supabase RLS Matrix, Sanitization, JWT Authentication                  |
| [x] 6. architecture.md    - High-Level Architecture, Component Diagram, Folder Tree              |
| [x] 7. database_schema.md - PostgreSQL DDL, Foreign Keys, Indexes, Mermaid ERD                    |
| [x] 8. api_spec.md        - RESTful/RPC Contracts, JSON Payloads, Status Codes                    |
| [x] 9. qa.md              - Test Matrix (Unit, E2E), Edge Cases, Security Checklist               |
| [x] 10. deployment.md     - Vercel/Supabase CI/CD, GitHub Actions, Env Configuration              |
| [x] 11. CONTRIBUTING.md   - Local Development Guide, Branching Model, Commit Standards           |
|                                                                                                    |
| AI Engine: [ Gemini 2.0 Flash (Fastest) v ]      Estimated Time: ~75 seconds                       |
|                                                                                                    |
|                                                          [<- Edit Q&A]    [>>> COMPILE BLUEPRINT]  |
+----------------------------------------------------------------------------------------------------+
```

##### Mobile View (390px)
```
+---------------------------------------------------+
| [<- Back]     Step 3 of 4: Review       [Close X] |
+---------------------------------------------------+
| Progress: [============----] 75%                  |
|                                                   |
| Master Blueprint Summary:                         |
| * Project: PetGroomer Uber                        |
| * Stack: Next.js 15 + Supabase + Stripe           |
| * Roles: Owner, Groomer, Admin (3 RLS tiers)      |
|                                                   |
| Generating 11 Linked Files:                       |
| [v] map.md               [v] PRD.md               |
| [v] design_sistem.md     [v] wireframes.md        |
| [v] security.md          [v] architecture.md      |
| [v] database_schema.md   [v] api_spec.md          |
| [v] qa.md                [v] deployment.md        |
| [v] CONTRIBUTING.md                               |
|                                                   |
| Engine: Gemini 2.0 Flash (~70s)                   |
|                                                   |
| [>>> COMPILE 11 BLUEPRINTS NOW]                   |
| [<- Change Answers]                               |
+---------------------------------------------------+
```

---

#### STEP 4: Real-time Streaming Generation Matrix

Progress live streaming via Server-Sent Events (SSE).

##### Desktop View (1440px)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft AI   |  Generating Blueprint: PetGroomer Uber             [Cancel Generation X]   |
+----------------------------------------------------------------------------------------------------+
|               [ok] App Concept  ---- [ok] AI Interview ---- [ok] Review ---- (4) Generating...      |
|                                                                                                    |
| TOTAL PROGRESS: [====================================--------------------] 65% (File 7 of 11)     |
| Current Task: Generating PostgreSQL DDL & ERD for database_schema.md...                            |
|                                                                                                    |
| +--------------------------------------+---------------------------------------------------------+ |
| | FILE PIPELINE STATUS                 | LIVE STREAMING LOG CHUNKS                               | |
| |                                      |                                                         | |
| | [ok] 1. map.md             (1.2s)    | > Synthesizing Master Context... Done.                  | |
| | [ok] 2. PRD.md             (3.4s)    | > Writing UI Screen Layouts in wireframes.md... Done.   | |
| | [ok] 3. design_sistem.md   (2.1s)    | > Writing security.md RLS policies... Done.             | |
| | [ok] 4. wireframes.md      (2.9s)    | > Writing architecture.md System Flow... Done.          | |
| | [ok] 5. security.md        (2.8s)    | > Injecting schema tokens into database_schema.md:      | |
| | [ok] 6. architecture.md    (4.1s)    |   CREATE TABLE public.bookings (                        | |
| | [>>] 7. database_schema.md (Streaming)|     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),      | |
| | [..] 8. api_spec.md        (Queued)  |     owner_id UUID REFERENCES auth.users(id),            | |
| | [..] 9. qa.md              (Queued)  |     groomer_id UUID REFERENCES auth.users(id),          | |
| | [..] 10. deployment.md     (Queued)  |     status booking_status DEFAULT 'pending',            | |
| | [..] 11. CONTRIBUTING.md   (Queued)  |     escrow_amount NUMERIC(10,2) NOT NULL                | |
| |                                      |   );                                                    | |
| +--------------------------------------+---------------------------------------------------------+ |
|                                                                                                    |
| [*] Keep this window open. Your files are automatically saved to Supabase upon completion.        |
+----------------------------------------------------------------------------------------------------+
```

##### Mobile View (390px)
```
+---------------------------------------------------+
| Generating PetGroomer Uber              [Cancel]  |
+---------------------------------------------------+
| Progress: [====================------] 65%        |
| File 7 of 11: database_schema.md                  |
|                                                   |
| Generation Queue:                                 |
| [ok] map.md (Roadmap)                             |
| [ok] PRD.md (Requirements)                        |
| [ok] design_sistem.md (UI Tokens)                 |
| [ok] wireframes.md (ASCII Layouts)                |
| [ok] security.md (Supabase RLS)                   |
| [ok] architecture.md (System Flow)                |
| [>>] database_schema.md (Streaming SQL DDL...)    |
| [..] api_spec.md (Next)                           |
| [..] qa.md                                        |
| [..] deployment.md                                |
| [..] CONTRIBUTING.md                              |
|                                                   |
| Live Output:                                      |
| +-----------------------------------------------+ |
| | CREATE TABLE public.bookings (                | |
| |   id UUID PRIMARY KEY DEFAULT uuid_gen_v4(),  | |
| |   owner_id UUID REFERENCES auth.users...      | |
| +-----------------------------------------------+ |
|                                                   |
| [Please wait ~25s remaining...]                   |
+---------------------------------------------------+
```

---

### 4.3. Project Workspace & Dual-Pane Viewer (`/app/projects/[id]`)

Halaman utama tempat pengguna membaca, menyalin, dan mendistribusikan blueprint.

#### A. Desktop View (1440px - Dual-Pane Split Layout)
```
+----------------------------------------------------------------------------------------------------+
| [<- Projects] | PetGroomer Uber  [Ready: 11/11] | [Search docs Cmd+K] | [Copy AI Prompt] [Export v]|
+------------------------------------+---------------------------------------------------------------+
| FILE EXPLORER (280px)              | DOKUMEN VIEWER: database_schema.md                            |
|                                    | [Preview Markdown] [Raw Editor] | [Copy File] [Full-Screen]   |
| > SPECIFICATIONS (11 files)        |---------------------------------------------------------------+
|   [file] map.md               [ok] | # Database Schema & PostgreSQL DDL                            |
|   [file] PRD.md               [ok] |                                                               |
|   [file] design_sistem.md     [ok] | ## 1. Entity Relationship Diagram (ERD)                       |
|   [file] wireframes.md        [ok] | ```mermaid                                                    |
|   [file] security.md          [ok] | erDiagram                                                     |
|   [file] architecture.md      [ok] |   USERS ||--o{ BOOKINGS : "places"                            |
| > [file] database_schema.md   [ok] |   GROOMERS ||--o{ BOOKINGS : "fulfills"                       |
|   [file] api_spec.md          [ok] |   BOOKINGS ||--|| PAYMENTS : "contains"                       |
|   [file] qa.md                [ok] | ```                                                           |
|   [file] deployment.md        [ok] |                                                               |
|   [file] CONTRIBUTING.md      [ok] | ## 2. DDL Tables & Triggers                                   |
|                                    | ```sql                                                         |
| ---------------------------------- | CREATE TABLE public.profiles (                                |
| EXPORT PRESETS                     |   id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,|
| [Download .ZIP Archive]            |   full_name TEXT NOT NULL,                                    |
| [Copy .cursorrules Context]        |   role user_role DEFAULT 'pet_owner',                         |
| [Push to GitHub Repo]              |   created_at TIMESTAMPTZ DEFAULT NOW()                        |
|                                    | );                                                            |
| SHORTCUTS                          | ```                                                           |
| Cmd+Shift+C: Copy active file      |                                                               |
| Up/Down: Navigate documents        |                                                               |
+------------------------------------+---------------------------------------------------------------+
```

#### B. Mobile View (390px - Single Pane with Bottom Sheet Drawer)
```
+---------------------------------------------------+
| [<-] PetGroomer Uber       [Files: 7/11 v] [Export]|
+---------------------------------------------------+
| Viewing: database_schema.md           [Copy Code] |
|                                                   |
| # Database Schema & PostgreSQL DDL                |
|                                                   |
| ## 1. Entity Relationship (ERD)                   |
| +-----------------------------------------------+ |
| | [Mermaid Diagram: Pinch to zoom]              | |
| | USERS -> BOOKINGS -> GROOMERS                 | |
| +-----------------------------------------------+ |
|                                                   |
| ## 2. DDL Tables                                  |
| ```sql                                            |
| CREATE TABLE public.profiles (                    |
|   id UUID PRIMARY KEY REFERENCES auth.users,      |
|   full_name TEXT NOT NULL,                        |
|   role user_role DEFAULT 'pet_owner'              |
| );                                                |
| ```                                               |
|                                                   |
+---------------------------------------------------+
| [Files (11)]   [Copy File]   [Raw/View]   [Share] |  <- Sticky Bottom Action Bar
+---------------------------------------------------+

[When user taps 'Files (11)', Bottom Sheet rises:]
+---------------------------------------------------+
| == Drag Handle ==             [Close Sheet X]     |
| SELECT BLUEPRINT DOCUMENT                         |
|                                                   |
| [*] map.md                      (Roadmap)    [ok] |
| [*] PRD.md                      (Specs)      [ok] |
| [*] design_sistem.md            (Tokens)     [ok] |
| [*] wireframes.md               (Layouts)    [ok] |
| [*] security.md                 (RLS)        [ok] |
| [*] architecture.md             (System)     [ok] |
| [>] database_schema.md <active> (Postgres)   [ok] |
| [*] api_spec.md                 (Endpoints)  [ok] |
| [*] qa.md                       (Testing)    [ok] |
| [*] deployment.md               (CI/CD)      [ok] |
| [*] CONTRIBUTING.md             (Guide)      [ok] |
|                                                   |
| [Download ZIP Archive]    [Copy Cursor Context]   |
+---------------------------------------------------+
```

---

### 4.4. Export & Distribution Modals

Tampilan modal saat pengguna mengklik tombol **Export**:

#### A. Export to ZIP Archive Modal
```
+-----------------------------------------------------------------+
| Export Blueprint Archive (.ZIP)                         [X]     |
|-----------------------------------------------------------------|
| Choose your preferred package structure:                       |
|                                                                 |
| (o) Root Project Format:                                        |
|     /docs/                                                      |
|       ├── map.md                                                |
|       ├── PRD.md                                                |
|       ├── wireframes.md                                         |
|       └── ... (all 11 files)                                    |
|     .cursorrules  (Master prompt injected)                      |
|                                                                 |
| ( ) Antigravity / Gemini CLI Format:                            |
|     /.gemini/                                                   |
|       ├── AGENTS.md                                             |
|       └── context/ (all 11 files)                               |
|                                                                 |
| [ ] Include Supabase migration seed file (`seed.sql`)           |
|                                                                 |
| [Cancel]                             [Download .ZIP (52 KB) ->] |
+-----------------------------------------------------------------+
```

#### B. Direct GitHub Push Modal
```
+-----------------------------------------------------------------+
| Push Blueprint to GitHub Repository                     [X]     |
|-----------------------------------------------------------------|
| Authenticated as: github.com/alex-vibecoder                     |
|                                                                 |
| Destination Repository:                                         |
| (o) Create New Repository: [ petgroomer-mvp                   ] |
|     Visibility: (*) Private   ( ) Public                        |
|                                                                 |
| ( ) Commit to Existing Repo: [ Select Repository...           v]|
|     Target Folder: [ docs/                                    ] |
|     Target Branch: [ main                                     ] |
|                                                                 |
| Commit Message:                                                 |
| [ "feat: add initial 11-file PlanCraft pre-dev blueprints"     ] |
|                                                                 |
| [Cancel]                             [Push to GitHub Branch ->] |
+-----------------------------------------------------------------+
```

---

### 4.5. User Settings, BYOK Keys & Quotas (`/app/settings`)

#### A. Desktop View (1440px)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft AI   |  Settings: Alex Dev                                 [Dashboard] [Avatar v] |
+-----------------------+----------------------------------------------------------------------------+
| SETTINGS TABS         | BRING YOUR OWN KEY (BYOK) & USAGE                                          |
| [ ] Profile & Account |                                                                            |
| [*] API Keys & Models | Free Plan Usage This Month:                                                |
| [ ] Billing & Invoices| [========================------------] 8 / 10 Blueprints Used              |
| [ ] Notifications     |                                                                            |
|                       | BYOK Zero-Markup Setting:                                                  |
|                       | Add your personal API keys to bypass monthly limits and access Opus models.|
|                       | Keys are encrypted using AES-256-GCM before storage.                       |
|                       |                                                                            |
|                       | Google Gemini API Key:                                                     |
|                       | [ AIzaSyD***********************************       ] [Test] [Remove]       |
|                       | Status: Valid (Gemini 2.0 Flash enabled)                                   |
|                       |                                                                            |
|                       | Anthropic Claude API Key:                                                  |
|                       | [ sk-ant-api03-*****************************       ] [Test] [Remove]       |
|                       | Status: Valid (Claude 3.5 Sonnet enabled)                                  |
|                       |                                                                            |
|                       | OpenAI API Key:                                                            |
|                       | [ Enter sk-...                                                     ] [Save]|
|                       |                                                                            |
|                       | Default Preferred Model for Generation:                                    |
|                       | [ Google Gemini 2.0 Flash (Recommended for speed <60s)                   v] |
|                       |                                                                            |
|                       |                                                [Discard Changes]  [Save]   |
+-----------------------+----------------------------------------------------------------------------+
```

#### B. Mobile View (390px)
```
+---------------------------------------------------+
| [<-] Settings: API & Quotas             [Avatar v]|
+---------------------------------------------------+
| Current Plan: Free Tier                           |
| Blueprints: 8 / 10 used                           |
| [====================----] 80%                    |
| [Upgrade to Unlimited Pro ->]                     |
|                                                   |
| ------------------------------------------------- |
| BYOK (Bring Your Own Key)                         |
| Keys encrypted with AES-256-GCM                   |
|                                                   |
| Gemini API Key:                                   |
| [ AIzaSyD*********************  ]                 |
| Status: [x] Active & Valid                        |
|                                                   |
| Claude API Key:                                   |
| [ sk-ant-api03-***************  ]                 |
| Status: [x] Active & Valid                        |
|                                                   |
| Preferred Generator Model:                        |
| [ Gemini 2.0 Flash v ]                            |
|                                                   |
| [Save API Key Preferences]                        |
+---------------------------------------------------+
| [Home]       [Projects]       [BYOK]      [Settings]|
+---------------------------------------------------+
```

---

## 5. Admin Role Wireframes

Akses khusus bagi pengguna dengan `role = 'admin'` untuk memantau performa platform, biaya token LLM, dan konfigurasi template.

---

### 5.1. Admin Dashboard & Metrics (`/admin/dashboard` & `/admin`)

#### A. Desktop View (1440px)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft ADMIN | [Admin Search Cmd+K] | [System Status: Normal] [Switch to User View] [Admin]
+-----------------------+----------------------------------------------------------------------------+
| ADMIN NAVIGATION      | PLATFORM HEALTH & LLM TOKEN ANALYTICS (Last 30 Days)                       |
| [*] Overview Metrics  |                                                                            |
| [ ] User Management   | +------------------+ +------------------+ +-----------------+ +----------+ |
| [ ] System Templates  | | TOTAL USERS      | | BLUEPRINTS GEN   | | TOKENS CONSUMED | | LLM COST | |
| [ ] LLM Logs & Audit  | | 4,218 (+18%)     | | 12,840 (+32%)    | | 184.2M Tokens   | | $328.40  | |
| [ ] Global Settings   | +------------------+ +------------------+ +-----------------+ +----------+ |
|                       |                                                                            |
| SYSTEM METRICS        | TOKEN CONSUMPTION BY MODEL                                                 |
| Supabase DB: 12%      | Gemini 2.0 Flash : [==============================--------] 72% ($94.10)   |
| API Avg TTFT: 1.4s    | Claude 3.5 Sonnet: [==========----------------------------] 22% ($210.50)  |
| Error Rate: 0.12%     | OpenAI GPT-4o    : [==------------------------------------] 6%  ($23.80)   |
|                       |                                                                            |
|                       | RECENT GENERATION SPIKES & ACTIVITY                                        |
|                       | +------------------------------------------------------------------------+ |
|                       | | User             | Project Name      | Model Used   | Tokens | Status  | |
|                       | |------------------+-------------------+--------------+--------+---------| |
|                       | | alex@vibe.dev    | PetGroomer Uber   | Gemini Flash | 18.4k  | Success | |
|                       | | budi@agency.id   | CRM Logistics B2B | Claude 3.5   | 24.1k  | Success | |
|                       | | sarah@indie.co   | MicroSaaS Billing | Gemini Flash | 17.9k  | Success | |
|                       | | dev@fintech.io   | Crypto Wallet P2P | GPT-4o       | 28.5k  | 429 Retry| |
|                       | +------------------------------------------------------------------------+ |
|                       | [Export CSV Report]                                       [View All Logs ->]
+-----------------------+----------------------------------------------------------------------------+
```

#### B. Mobile View (390px)
```
+---------------------------------------------------+
| [=] PlanCraft ADMIN                  [Admin Avatar|
+---------------------------------------------------+
| Platform 30-Day Metrics                           |
|                                                   |
| [Users: 4.2k]  [Blueprints: 12.8k]  [Cost: $328]  |
|                                                   |
| LLM Token Breakdown:                              |
| * Gemini Flash: 72% (Primary Workhorse)           |
| * Claude Sonnet: 22%                              |
| * GPT-4o: 6%                                      |
|                                                   |
| System Health:                                    |
| [ok] DB Connection: Normal (12% capacity)         |
| [ok] Avg First-Token Response: 1.4s               |
| [ok] Error Rate: 0.12%                            |
|                                                   |
| Recent Generations:                               |
| +-----------------------------------------------+ |
| | alex@vibe.dev - PetGroomer Uber               | |
| | Model: Gemini Flash * Tokens: 18.4k * [OK]    | |
| +-----------------------------------------------+ |
| +-----------------------------------------------+ |
| | budi@agency.id - CRM Logistics B2B            | |
| | Model: Claude 3.5 * Tokens: 24.1k * [OK]      | |
| +-----------------------------------------------+ |
|                                                   |
| [Go to Full Logs ->]                              |
+---------------------------------------------------+
| [Metrics]      [Users]      [Templates]     [Logs]|
+---------------------------------------------------+
```

---

### 5.2. User Management & Role Assignment (`/admin/users`)

#### A. Desktop View (1440px)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft ADMIN | [Search user email or ID...]        | [Filter: All Roles v]  [Export Users]
+-----------------------+----------------------------------------------------------------------------+
| ADMIN NAVIGATION      | USER MANAGEMENT & RBAC                                                     |
| [ ] Overview Metrics  | Manage permissions, view blueprint counts, and assign administrative roles.|
| [*] User Management   |                                                                            |
| [ ] System Templates  | Total Users: 4,218 | Active Today: 412                                     |
| [ ] LLM Logs & Audit  |                                                                            |
| [ ] Global Settings   | +------------------------------------------------------------------------+ |
|                       | | User Email         | Joined      | Role    | Projects | BYOK? | Action | |
|                       | |--------------------+-------------+---------+----------+-------+--------| |
|                       | | citra@plancraft.ai | Jan 2026    | admin   | 42       | Yes   | [Edit] | |
|                       | | alex@vibe.dev      | Feb 2026    | user    | 8        | Yes   | [Edit] | |
|                       | | budi@agency.id     | Mar 2026    | user    | 19       | No    | [Edit] | |
|                       | | spammer@bot.ru     | Today       | user    | 0        | No    | [Edit] | |
|                       | +------------------------------------------------------------------------+ |
|                       |                                                                            |
|                       | EDIT USER MODAL PREVIEW (citra@plancraft.ai):                              |
|                       | +--------------------------------------------------------------------+     |
|                       | | Change User Role:  (*) user   (o) admin                             |     |
|                       | | Account Status:    (*) Active ( ) Suspended                         |     |
|                       | | Monthly Quota:     [ Unlimited (Admin Override)                   ] |     |
|                       | | [Revoke All Sessions]                     [Cancel] [Save Changes]  |     |
|                       | +--------------------------------------------------------------------+     |
+-----------------------+----------------------------------------------------------------------------+
```

#### B. Mobile View (390px)
```
+---------------------------------------------------+
| [=] User Management                  [Search Icon]|
+---------------------------------------------------+
| Total Users: 4,218                                |
| Filter: [All Roles v]   [Sort: Recent v]          |
|                                                   |
| +-----------------------------------------------+ |
| | citra@plancraft.ai                [Role: admin] |
| | Blueprints: 42 * BYOK: Active                   |
| | Joined: Jan 2026                                |
| | [Change Role / Manage Permissions ->]           |
| +-----------------------------------------------+ |
|                                                   |
| +-----------------------------------------------+ |
| | alex@vibe.dev                      [Role: user] |
| | Blueprints: 8 * BYOK: Active                    |
| | Joined: Feb 2026                                |
| | [Change Role / Manage Permissions ->]           |
| +-----------------------------------------------+ |
|                                                   |
| +-----------------------------------------------+ |
| | spammer@bot.ru                     [Role: user] |
| | Blueprints: 0 * BYOK: No                        |
| | [Suspend User Account]                          |
| +-----------------------------------------------+ |
|                                                   |
| [< Prev]                   Page 1 of 85    [Next >]
+---------------------------------------------------+
| [Metrics]      [Users]      [Templates]     [Logs]|
+---------------------------------------------------+
```

---

### 5.3. Master System Prompt & Template Presets Manager (`/admin/templates`)

#### A. Desktop View (1440px)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft ADMIN | System Prompts & Blueprint Templates         [+ New Preset] [Deploy Active]
+-----------------------+----------------------------------------------------------------------------+
| ADMIN NAVIGATION      | SYSTEM PROMPT ORCHESTRATION                                                |
| [ ] Overview Metrics  | Configure the master system instruction used to generate each markdown doc |
| [ ] User Management   |                                                                            |
| [*] System Templates  | SELECT DOCUMENT GENERATOR:                                                 |
| [ ] LLM Logs & Audit  | [map.md] [PRD.md] [design_sistem.md] [security.md] >[database_schema.md]<  |
| [ ] Global Settings   | [api_spec.md] [qa.md] [deployment.md] [CONTRIBUTING.md]                    |
|                       |                                                                            |
| TEMPLATE PRESETS      | PROMPT CONFIGURATION: database_schema.md (v2.4)                            |
| * Default Web/Mobile  | Target AI Model: [ Google Gemini 2.0 Flash v ]    Temperature: [ 0.2 ]     |
| * AI Wrapper / RAG    |                                                                            |
| * Microservices       | Master System Prompt:                                                      |
|                       | +------------------------------------------------------------------------+ |
|                       | | You are a Principal PostgreSQL Architect. Given the master project     | |
|                       | | brief and interview clarification answers, output a production-ready   | |
|                       | | database blueprint with:                                                | |
|                       | | 1. Mermaid erDiagram showing primary entities & relations.             | |
|                       | | 2. PostgreSQL DDL statements with strict types (UUID, TIMESTAMPTZ).    | |
|                       | | 3. Foreign key constraints with ON DELETE rules.                       | |
|                       | | 4. Supabase Row Level Security (RLS) policies matching security.md.    | |
|                       | +------------------------------------------------------------------------+ |
|                       | Mandatory Variables: `{{project_name}}`, `{{brief}}`, `{{qa_context}}`     |
|                       |                                              [Test with Mock Idea]  [Save] |
+-----------------------+----------------------------------------------------------------------------+
```

#### B. Mobile View (390px)
```
+---------------------------------------------------+
| [=] Prompt Templates                     [Save]   |
+---------------------------------------------------+
| Active Doc Generator:                             |
| [ Select: database_schema.md                    v]|
|                                                   |
| Assigned Model:                                   |
| [ Gemini 2.0 Flash v ]    Temp: [0.2]             |
|                                                   |
| Prompt Instructions:                              |
| +-----------------------------------------------+ |
| | You are a Principal PostgreSQL Architect.     | |
| | Generate complete DDL, ERD in Mermaid, and    | |
| | Supabase RLS policies.                        | |
| | Must align with {{project_name}}.             | |
| +-----------------------------------------------+ |
|                                                   |
| Required Variables:                               |
| `{{project_name}}` `{{brief}}` `{{qa_context}}`   |
|                                                   |
| [Test Generation with Mock Idea ->]               |
+---------------------------------------------------+
| [Metrics]      [Users]      [Templates]     [Logs]|
+---------------------------------------------------+
```

---

### 5.4. LLM Generation Logs & Incident Audit (`/admin/logs`)

#### A. Desktop View (1440px)
```
+----------------------------------------------------------------------------------------------------+
| [Logo] PlanCraft ADMIN | [Live Tail: ON]  [Filter: Errors Only]  [Model: All v]   [Clear Display]  |
+-----------------------+----------------------------------------------------------------------------+
| ADMIN NAVIGATION      | REAL-TIME LLM STREAMING & ERROR LOGS                                       |
| [ ] Overview Metrics  | Monitor execution time, TTFT latency, rate limits, and failure recoveries. |
| [ ] User Management   |                                                                            |
| [ ] System Templates  | +------------------------------------------------------------------------+ |
| [*] LLM Logs & Audit  | | Timestamp | User / ID  | File Target | Model | TTFT | Status | Details   | |
| [ ] Global Settings   | |-----------+------------+-------------+-------+------+--------+-----------| |
|                       | | 09:12:04  | u_88f2a1   | database.md | Gem-F | 1.1s | 200 OK | 2,140 tok | |
|                       | | 09:12:01  | u_99c301   | api_spec.md | Cl-So | 2.4s | 200 OK | 3,820 tok | |
|                       | | 09:11:45  | u_44d189   | PRD.md      | GPT4o | 3.2s | 429 RL | Retry #1  | |
|                       | | 09:11:47  | u_44d189   | PRD.md      | Gem-F | 0.9s | 200 OK | Fallback  | |
|                       | | 09:10:12  | u_12b774   | map.md      | Gem-F | 0.8s | 200 OK | 1,420 tok | |
|                       | +------------------------------------------------------------------------+ |
|                       |                                                                            |
|                       | INSPECT LOG ENTRY (ID: log_44d189_PRD):                                    |
|                       | Error Message: OpenAI 429 Rate Limit Exceeded on org tier.                 |
|                       | Circuit Breaker Triggered: Automatically rerouted to Gemini 2.0 Flash.     |
|                       | Fallback Result: Generated successfully in 1,210ms. User uninterrupted.    |
+-----------------------+----------------------------------------------------------------------------+
```

#### B. Mobile View (390px)
```
+---------------------------------------------------+
| [=] LLM Audit Logs               [Live Tail: ON]  |
+---------------------------------------------------+
| Filter: [All Status v]   [Model: All v]           |
|                                                   |
| +-----------------------------------------------+ |
| | 09:12:04 - database_schema.md     [Status: OK]| |
| | User: u_88f2a1 * Model: Gemini Flash           | |
| | TTFT: 1.1s * Tokens: 2,140                    | |
| +-----------------------------------------------+ |
|                                                   |
| +-----------------------------------------------+ |
| | 09:11:45 - PRD.md             [Status: 429 ->]| |
| | User: u_44d189 * Model: OpenAI GPT-4o          | |
| | Error: Rate Limit -> Auto-Fallback to Gemini  | |
| | Fallback Result: Completed in 0.9s            | |
| +-----------------------------------------------+ |
|                                                   |
| +-----------------------------------------------+ |
| | 09:10:12 - map.md                 [Status: OK]| |
| | User: u_12b774 * Model: Gemini Flash           | |
| | TTFT: 0.8s * Tokens: 1,420                    | |
| +-----------------------------------------------+ |
|                                                   |
| [Download Raw Log JSON]                           |
+---------------------------------------------------+
| [Metrics]      [Users]      [Templates]     [Logs]|
+---------------------------------------------------+
```

---

## 6. Component Adaptation Matrix & Responsiveness Rules

Untuk memastikan implementasi UI/UX berjalan seragam antara desktop dan mobile:

| Komponen | Desktop (>= 1024px) | Tablet (768px - 1023px) | Mobile (320px - 767px) |
|---|---|---|---|
| **App Navigation** | Persistent left sidebar (240px) | Collapsible left drawer | Top bar + Sticky bottom navigation bar (4 items) |
| **Workspace Dual-Pane** | Split screen (Left: 280px tree, Right: fluid viewer) | Collapsible file tree toggle | Single column viewer + Bottom sheet file selector drawer |
| **Markdown Code Blocks** | Full width with copy button & line numbers | Scrollable horizontal overflow | Scrollable horizontal overflow with floating tap-to-copy button |
| **Mermaid ERD / Diagrams** | Inline interactive render with zoom/pan | Inline render with pan | Touch pinch-to-zoom card or modal zoom view |
| **Wizard Stepper** | Horizontal 4-step progress header with labels | Compact numbered pill stepper | Linear progress bar (%) + current step counter ("Step 2 of 4") |
| **Data Tables (Admin)** | Multi-column table with sorting & inline actions | Horizontally scrollable table | Stacked card list with primary badge & tap-to-open sheet |
| **Export Options** | Top-right split dropdown button | Split button menu | Sticky bottom action bar modal trigger |
