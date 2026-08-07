# 💀 Startup Graveyard AI

> **"He who does not learn from history is condemned to repeat it. He who learns from failure is destined to survive."**

Startup Graveyard AI is a case study library and AI-powered research platform that deconstructs startup failures. It turns documented collapses into structured, searchable intelligence — backed by retrieval-augmented AI — so founders and researchers can identify fatal risks before they manifest.

---

## 🧠 Intelligence Modules

- **Forensic Archive**: A library of failed ventures (22 documented cases and growing). Each entry documents funding history, timelines, root causes, and a structured failure analysis.
- **AI Pre-Mortem Engine**: An interactive multi-stage diagnostic. Submit your venture details to receive a risk report comparing your strategy against the archived failure patterns.
- **Graveyard Intelligence (AI Assistant)**: A streaming, contextual chat assistant that answers research questions about market hazards and execution errors using RAG over the case archive.
- **Insights Dashboard**: Analytics and charts surfacing failure patterns — reasons, industries, funding lost, and more.
- **Content Review Queue**: AI-generated case studies are fact-checked against web sources and pass through a human review queue before publication.

---

## 🛠️ Technical Architecture

### Core Stack
- **Framework**: Next.js 15 (App Router, TypeScript strict)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Database & Vector Store**: Supabase (PostgreSQL + pgvector, 1024-dim embeddings via `nvidia/nv-embedqa-e5-v5`)
- **AI Integration**: Vercel AI SDK v6 (`ai`, `@ai-sdk/openai`)

### AI Provider
The AI layer is built on the Vercel AI SDK and is configured for **NVIDIA NIM** by default (`https://integrate.api.nvidia.com/v1`), using **`meta/llama-3.1-70b-instruct`** for chat and generation (overridable via the `AI_DEFAULT_MODEL` env var). Because it goes through the provider-agnostic AI SDK, swapping in another OpenAI-compatible provider is a config change rather than a rewrite.

### Automation
`scripts/daily-autopsy.ts` generates new case study drafts on a schedule (GitHub Actions, daily at 05:00 UTC), verifies facts against live web search, scores them, and places them in the review queue for human approval.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 20+
- Supabase Account
- NVIDIA NIM API Key (from https://build.nvidia.com/)

### 1. Environment Configuration
Copy `.env.example` to `.env.local` and fill in your values:
```env
# Supabase (from your project dashboard: Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# AI Provider (from https://build.nvidia.com/)
NVIDIA_API_KEY=your-nvidia-api-key-here

# AI Model (optional, default: meta/llama-3.1-70b-instruct)
AI_DEFAULT_MODEL=meta/llama-3.1-70b-instruct

# Admin emails for the content review queue (comma-separated)
ADMIN_EMAILS=admin@example.com

# Site URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Initialization
Execute the migrations found in `supabase/migrations/` (001–010) and seed the database with the provided `supabase/seed.sql` to populate the initial graveyard archives.

### 3. Launch Development Server
```bash
npm install
npm run dev
```

---

## 🧪 Testing

```bash
npm test        # vitest unit tests
npm run lint    # eslint
npm run build   # production build
```

---

## 🤝 Contributing

We are looking for forensic data contributors and AI engineers. See `docs/PRD.md` for product details and `supabase/migrations/` for the schema.

*Built with 💀 by [patil-shubham-dev](https://github.com/patil-shubham-dev)*
