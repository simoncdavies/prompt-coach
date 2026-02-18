# Prompt Coach

Prompt Coach is a Next.js app that analyzes and rewrites coding prompts using Google Gemini, with auth and storage backed by Supabase.

## Features

- Prompt scoring across clarity, context, constraints, output format, and safety.
- Prompt rewrite output in two forms: detailed and minimal.
- Secret redaction before AI processing.
- Auth-gated prompt enhancement with monthly quota tracking.
- Recent public runs and signed-in history/search views.

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS 4
- Lint/Format: Biome
- AI: Google GenAI SDK (`@google/genai`) using `gemini-3-flash-preview`
- Database/Auth: Supabase

## Prerequisites

- Node.js 18+
- pnpm
- Supabase project
- Gemini API key

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-measurement-id
```

### 3. Run Supabase migrations

Apply all SQL files in `supabase/migrations` in order:

1. `supabase/migrations/0000_init.sql`
2. `supabase/migrations/0001_add_minimal_prompt.sql`
3. `supabase/migrations/0002_lock_down_insert.sql`
4. `supabase/migrations/0003_auth_and_quota.sql`
5. `supabase/migrations/0004_secure_quota_tables.sql`
6. `supabase/migrations/0005_fix_signup_cycle_function.sql`

### 4. Start the app

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

- `pnpm dev` start local dev server
- `pnpm build` build for production
- `pnpm start` run production build
- `pnpm lint` run Biome checks
- `pnpm format` format with Biome (`--write`)
- `pnpm format:check` run formatter without writing
- `pnpm test` run Vitest
- `pnpm test:coverage` run tests with coverage

## Behavior Notes

- Prompt enhancement (`POST /api/run`) requires authentication.
- The app tracks monthly usage quota per user.
- Public runs are queryable for recent/public browsing.

## License

MIT
