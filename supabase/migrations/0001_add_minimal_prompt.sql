alter table "public"."prompt_runs"
add column if not exists "prompt_rewritten_minimal" text not null default '';
