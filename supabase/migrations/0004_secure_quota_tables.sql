-- Lock down internal quota and plan tables.
alter table public.prompt_enhancer_usage enable row level security;
alter table public.user_plans enable row level security;
alter table public.prompt_enhancer_attempts enable row level security;

-- Restrict helper functions to service role only.
revoke all on function public.get_signup_cycle_bounds(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.get_enhancer_quota_status(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.consume_enhancer_quota(uuid, jsonb, timestamptz) from public, anon, authenticated;

grant execute on function public.get_signup_cycle_bounds(uuid, timestamptz) to service_role;
grant execute on function public.get_enhancer_quota_status(uuid, timestamptz) to service_role;
grant execute on function public.consume_enhancer_quota(uuid, jsonb, timestamptz) to service_role;
