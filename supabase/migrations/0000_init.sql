-- Create prompt_runs table
create table if not exists "public"."prompt_runs" (
  "id" uuid primary key default gen_random_uuid(),
  "created_at" timestamptz default now(),
  "prompt_original" text not null,
  "analysis_json" jsonb not null,
  "prompt_rewritten" text not null,
  "overall_score" integer not null,
  "metadata" jsonb default '{}'::jsonb,
  "is_public" boolean default false
);

-- Enable RLS
alter table "public"."prompt_runs" enable row level security;

-- Policy: Allow reading all runs for everyone
create policy "Enable read access for all runs"
on "public"."prompt_runs"
for select
to public
using (true);


-- Policy: Allow insert for everyone (anon)
create policy "Enable insert for everyone"
on "public"."prompt_runs"
for insert
to public
with check (true);
