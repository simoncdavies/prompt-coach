-- Attach prompt runs to authenticated users while preserving existing rows.
alter table "public"."prompt_runs"
add column if not exists "user_id" uuid references auth.users(id) on delete set null;

create index if not exists "prompt_runs_user_id_idx" on "public"."prompt_runs" ("user_id");
create index if not exists "prompt_runs_public_created_idx" on "public"."prompt_runs" ("is_public", "created_at" desc);

-- Track each enhancement invocation in its monthly cycle bucket.
create table if not exists "public"."prompt_enhancer_usage" (
  "id" bigserial primary key,
  "user_id" uuid not null references auth.users(id) on delete cascade,
  "cycle_start" timestamptz not null,
  "created_at" timestamptz not null default now()
);

create index if not exists "prompt_enhancer_usage_user_cycle_idx"
  on "public"."prompt_enhancer_usage" ("user_id", "cycle_start");

-- Per-user overrides for future paid plans/power users.
create table if not exists "public"."user_plans" (
  "user_id" uuid primary key references auth.users(id) on delete cascade,
  "plan_name" text not null default 'free',
  "monthly_limit" integer not null default 5 check ("monthly_limit" >= 0),
  "is_unlimited" boolean not null default false,
  "updated_at" timestamptz not null default now()
);

-- Audit attempts for visibility and funnel tracking.
create table if not exists "public"."prompt_enhancer_attempts" (
  "id" bigserial primary key,
  "user_id" uuid references auth.users(id) on delete set null,
  "allowed" boolean not null,
  "reason" text not null,
  "metadata" jsonb not null default '{}'::jsonb,
  "created_at" timestamptz not null default now()
);

create or replace function "public"."get_signup_cycle_bounds"(p_user_id uuid, p_now timestamptz default now())
returns table(cycle_start timestamptz, cycle_end timestamptz)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  signup_ts timestamptz;
  signup_day int;
  current_month_start date;
  prev_month_start date;
  next_month_start date;
  day_in_current_month int;
  day_in_prev_month int;
  day_in_next_month int;
  cycle_start_date date;
begin
  select created_at into signup_ts
  from auth.users
  where id = p_user_id;

  if signup_ts is null then
    raise exception 'User not found for cycle calculation';
  end if;

  signup_day := extract(day from timezone('UTC', signup_ts));
  current_month_start := date_trunc('month', timezone('UTC', p_now))::date;
  day_in_current_month := extract(day from (current_month_start + interval '1 month - 1 day'));

  cycle_start_date := current_month_start + (least(signup_day, day_in_current_month) - 1);

  if timezone('UTC', p_now)::date < cycle_start_date then
    prev_month_start := (current_month_start - interval '1 month')::date;
    day_in_prev_month := extract(day from (prev_month_start + interval '1 month - 1 day'));
    cycle_start_date := prev_month_start + (least(signup_day, day_in_prev_month) - 1);
  end if;

  next_month_start := (date_trunc('month', cycle_start_date) + interval '1 month')::date;
  day_in_next_month := extract(day from (next_month_start + interval '1 month - 1 day'));

  cycle_start := (cycle_start_date::text || ' 00:00:00+00')::timestamptz;
  cycle_end := ((next_month_start + (least(signup_day, day_in_next_month) - 1))::text || ' 00:00:00+00')::timestamptz;

  return next;
end;
$$;

create or replace function "public"."get_enhancer_quota_status"(p_user_id uuid, p_now timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  cycle_row record;
  plan_row record;
  usage_count int;
  limit_count int;
  is_unlimited boolean;
begin
  select * into cycle_row
  from public.get_signup_cycle_bounds(p_user_id, p_now);

  select monthly_limit, is_unlimited into plan_row
  from public.user_plans
  where user_id = p_user_id;

  limit_count := coalesce(plan_row.monthly_limit, 5);
  is_unlimited := coalesce(plan_row.is_unlimited, false);

  select count(*)::int into usage_count
  from public.prompt_enhancer_usage
  where user_id = p_user_id
    and cycle_start = cycle_row.cycle_start;

  return jsonb_build_object(
    'allowed', (is_unlimited or usage_count < limit_count),
    'is_unlimited', is_unlimited,
    'used', usage_count,
    'limit', limit_count,
    'remaining', case when is_unlimited then null else greatest(limit_count - usage_count, 0) end,
    'reset_at', cycle_row.cycle_end
  );
end;
$$;

create or replace function "public"."consume_enhancer_quota"(p_user_id uuid, p_metadata jsonb default '{}'::jsonb, p_now timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  cycle_row record;
  plan_row record;
  usage_count int;
  limit_count int;
  is_unlimited boolean;
  allowed boolean;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  select * into cycle_row
  from public.get_signup_cycle_bounds(p_user_id, p_now);

  select monthly_limit, is_unlimited into plan_row
  from public.user_plans
  where user_id = p_user_id;

  limit_count := coalesce(plan_row.monthly_limit, 5);
  is_unlimited := coalesce(plan_row.is_unlimited, false);

  select count(*)::int into usage_count
  from public.prompt_enhancer_usage
  where user_id = p_user_id
    and cycle_start = cycle_row.cycle_start;

  allowed := is_unlimited or usage_count < limit_count;

  if allowed then
    insert into public.prompt_enhancer_usage (user_id, cycle_start)
    values (p_user_id, cycle_row.cycle_start);
    usage_count := usage_count + 1;
  end if;

  insert into public.prompt_enhancer_attempts (user_id, allowed, reason, metadata)
  values (
    p_user_id,
    allowed,
    case when allowed then 'ok' else 'quota_exceeded' end,
    jsonb_build_object(
      'cycle_start', cycle_row.cycle_start,
      'cycle_end', cycle_row.cycle_end,
      'request', coalesce(p_metadata, '{}'::jsonb)
    )
  );

  return jsonb_build_object(
    'allowed', allowed,
    'is_unlimited', is_unlimited,
    'used', usage_count,
    'limit', limit_count,
    'remaining', case when is_unlimited then null else greatest(limit_count - usage_count, 0) end,
    'reset_at', cycle_row.cycle_end
  );
end;
$$;
