import { supabaseServer } from "@/lib/supabase/server";

export interface QuotaStatus {
  allowed: boolean;
  is_unlimited: boolean;
  used: number;
  limit: number;
  remaining: number | null;
  reset_at: string;
}

function normalizeQuotaPayload(payload: unknown): QuotaStatus {
  const data = (payload ?? {}) as Record<string, unknown>;
  return {
    allowed: Boolean(data.allowed),
    is_unlimited: Boolean(data.is_unlimited),
    used: Number(data.used ?? 0),
    limit: Number(data.limit ?? 5),
    remaining: data.remaining == null ? null : Number(data.remaining),
    reset_at: String(data.reset_at ?? ""),
  };
}

function formatUtcMidnight(date: Date): string {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())).toISOString();
}

function getCycleBoundsFromSignup(signupIso: string, now = new Date()): { cycleStart: string; cycleEnd: string } {
  const signup = new Date(signupIso);
  const signupDay = signup.getUTCDate();

  const daysInCurrentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  let cycleStartDay = Math.min(signupDay, daysInCurrentMonth);
  let cycleStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), cycleStartDay));

  if (now < cycleStart) {
    const prevMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const daysInPrevMonth = new Date(Date.UTC(prevMonthStart.getUTCFullYear(), prevMonthStart.getUTCMonth() + 1, 0)).getUTCDate();
    cycleStartDay = Math.min(signupDay, daysInPrevMonth);
    cycleStart = new Date(Date.UTC(prevMonthStart.getUTCFullYear(), prevMonthStart.getUTCMonth(), cycleStartDay));
  }

  const nextMonthStart = new Date(Date.UTC(cycleStart.getUTCFullYear(), cycleStart.getUTCMonth() + 1, 1));
  const daysInNextMonth = new Date(Date.UTC(nextMonthStart.getUTCFullYear(), nextMonthStart.getUTCMonth() + 1, 0)).getUTCDate();
  const cycleEndDay = Math.min(signupDay, daysInNextMonth);
  const cycleEnd = new Date(Date.UTC(nextMonthStart.getUTCFullYear(), nextMonthStart.getUTCMonth(), cycleEndDay));

  return {
    cycleStart: formatUtcMidnight(cycleStart),
    cycleEnd: formatUtcMidnight(cycleEnd),
  };
}

async function getQuotaStatusFallback(userId: string): Promise<QuotaStatus> {
  const { data: userData, error: userError } = await supabaseServer.auth.admin.getUserById(userId);
  if (userError || !userData.user) {
    throw new Error(userError?.message ?? "Unable to load auth user for quota");
  }

  const { cycleStart, cycleEnd } = getCycleBoundsFromSignup(userData.user.created_at);

  const { data: planData } = await supabaseServer
    .from("user_plans")
    .select("monthly_limit, is_unlimited")
    .eq("user_id", userId)
    .maybeSingle();

  const limit = Number(planData?.monthly_limit ?? 5);
  const isUnlimited = Boolean(planData?.is_unlimited ?? false);

  const { count, error: countError } = await supabaseServer
    .from("prompt_enhancer_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("cycle_start", cycleStart);

  if (countError) {
    throw new Error(countError.message);
  }

  const used = Number(count ?? 0);
  return {
    allowed: isUnlimited || used < limit,
    is_unlimited: isUnlimited,
    used,
    limit,
    remaining: isUnlimited ? null : Math.max(limit - used, 0),
    reset_at: cycleEnd,
  };
}

export async function getQuotaStatus(userId: string): Promise<QuotaStatus> {
  const { data, error } = await supabaseServer.rpc("get_enhancer_quota_status", {
    p_user_id: userId,
  });

  if (error) {
    return getQuotaStatusFallback(userId);
  }

  return normalizeQuotaPayload(data);
}

export async function consumeQuota(userId: string, metadata: Record<string, unknown>): Promise<QuotaStatus> {
  const { data, error } = await supabaseServer.rpc("consume_enhancer_quota", {
    p_user_id: userId,
    p_metadata: metadata,
  });

  if (error) {
    const status = await getQuotaStatusFallback(userId);
    const allowed = status.allowed;

    if (allowed) {
      const { cycleStart } = getCycleBoundsFromSignup(
        (await supabaseServer.auth.admin.getUserById(userId)).data.user?.created_at ?? new Date().toISOString()
      );
      const { error: insertError } = await supabaseServer
        .from("prompt_enhancer_usage")
        .insert({ user_id: userId, cycle_start: cycleStart });
      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    await supabaseServer.from("prompt_enhancer_attempts").insert({
      user_id: userId,
      allowed,
      reason: allowed ? "ok_fallback" : "quota_exceeded_fallback",
      metadata,
    });

    return getQuotaStatusFallback(userId);
  }

  return normalizeQuotaPayload(data);
}
