# Prompt Coach (Coding)

A Next.js web application that analyzes and improves AI coding prompts using Google Gemini.

## Features

- **Prompt Analysis**: Scores your prompt on clarity, context, constraints, and more.
- **Smart Rewriter**: Automatically rewrites your prompt to be production-ready and generates a minimal concise version.
- **Privacy First**: Secrets are redacted before processing. No prompts are stored unless explicitly saved.
- **Public Library**: Option to save anonymized runs to a public gallery.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (`gemini-1.5-flash`)
- **Database**: Supabase (PostgreSQL)

## Getting Started

### Prerequisites

- Node.js 18+
- A Google API Key (Gemini)
- A Supabase Project

### 1. Clone & Install

```bash
git clone <your-repo>
cd prompt-coach
pnpm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your-sb-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-sb-anon-key
GEMINI_API_KEY=your-gemini-key
```

### 3. Database Setup (Supabase)

1. Go to your Supabase Dashboard -> SQL Editor.
2. Run the content of `supabase/migrations/0000_init.sql`.
   - This creates the `prompt_runs` table.
   - Enables Row Level Security (RLS).
   - Sets up public read access for `is_public=true`.

### 4. Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Push code to GitHub.
2. Import project into Vercel.
3. Add the Environment Variables from step 2 to Vercel Project Settings.
4. Deploy!

## License

MIT
