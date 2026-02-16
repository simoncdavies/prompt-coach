-- Fix runtime error in cycle boundary function:
-- date_trunc does not accept DATE directly.
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

  -- Explicit cast avoids date_trunc(date) runtime error.
  next_month_start := (date_trunc('month', cycle_start_date::timestamp) + interval '1 month')::date;
  day_in_next_month := extract(day from (next_month_start + interval '1 month - 1 day'));

  cycle_start := (cycle_start_date::text || ' 00:00:00+00')::timestamptz;
  cycle_end := ((next_month_start + (least(signup_day, day_in_next_month) - 1))::text || ' 00:00:00+00')::timestamptz;

  return next;
end;
$$;
