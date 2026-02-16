"use client";

import { supabase } from "@/lib/supabase/client";

export interface ClientAuthUser {
  id: string;
  email: string | null;
}

export interface AuthActionResult {
  signedIn: boolean;
  needsEmailConfirmation: boolean;
  email?: string | null;
}

export async function getCurrentUser(): Promise<ClientAuthUser | null> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
  };
}

export function onAuthChange(callback: (user: ClientAuthUser | null) => void): () => void {
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user;
    callback(
      user
        ? {
            id: user.id,
            email: user.email ?? null,
          }
        : null
    );
  });

  supabase.auth.getSession().then(({ data }) => {
    const user = data.session?.user;
    callback(
      user
        ? {
            id: user.id,
            email: user.email ?? null,
          }
        : null
    );
  });

  return () => listener.subscription.unsubscribe();
}

export async function signInWithPassword(email: string, password: string): Promise<AuthActionResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }

  return {
    signedIn: Boolean(data.session),
    needsEmailConfirmation: false,
    email: data.user?.email ?? email,
  };
}

export async function signUp(email: string, password: string): Promise<AuthActionResult> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    throw error;
  }

  return {
    signedIn: Boolean(data.session),
    needsEmailConfirmation: !data.session,
    email: data.user?.email ?? email,
  };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function getAuthHeaders(extra: HeadersInit = {}): Promise<Headers> {
  const headers = new Headers(extra);
  const token = await getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = await getAuthHeaders(init.headers ?? {});
  return fetch(input, { ...init, headers });
}
