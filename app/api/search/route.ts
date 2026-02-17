import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/server/auth";

const PAGE_SIZE = 20;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
    const onlyMine = searchParams.get("onlyMine") === "true";
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabaseServer
      .from("prompt_runs")
      .select("id, created_at, overall_score, metadata, prompt_original, is_public, user_id", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (onlyMine) {
      query = query.eq("user_id", user.id);
    } else {
      query = query.or(`is_public.eq.true,user_id.eq.${user.id}`);
    }

    const { data, error, count } = await query;
    if (error) {
      throw error;
    }

    return NextResponse.json({
      runs: data ?? [],
      page,
      pageSize: PAGE_SIZE,
      total: count ?? 0,
      hasMore: (count ?? 0) > page * PAGE_SIZE,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
