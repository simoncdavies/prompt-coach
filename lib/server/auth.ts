import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export interface AuthUser {
  id: string;
  email?: string;
  created_at?: string;
}

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) {
    return null;
  }

  const [scheme, token] = auth.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export async function getUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  const token = getBearerToken(req);
  if (!token) {
    return null;
  }

  const { data, error } = await supabaseServer.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email,
    created_at: data.user.created_at,
  };
}
