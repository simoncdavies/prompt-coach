"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeaderSmall } from "@/components/HeaderSmall";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { signInWithPassword, signUp } from "@/lib/auth/client";

function AuthPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = useMemo(() => params.get("returnTo") || "/", [params]);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      let result;
      if (mode === "register") {
        result = await signUp(email, password);
      } else {
        result = await signInWithPassword(email, password);
      }

      if (result.needsEmailConfirmation) {
        setMessage(`Account created for ${result.email}. Please check your email to confirm your account before logging in.`);
        setMode("login");
        setPassword("");
        return;
      }

      router.push(returnTo);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFFFC]">
      <HeaderSmall />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 space-y-4">
            <h1 className="text-xl font-semibold text-[#040F0F]">Account</h1>
            <p className="text-sm text-[#2D3A3A]">Login or register to use Prompt Coach enhancer features.</p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`px-3 py-2 text-sm rounded-md border ${mode === "login" ? "bg-[#2BA84A] text-white border-[#2BA84A]" : "border-[#2D3A3A]/20 text-[#2D3A3A]"}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`px-3 py-2 text-sm rounded-md border ${mode === "register" ? "bg-[#2BA84A] text-white border-[#2BA84A]" : "border-[#2D3A3A]/20 text-[#2D3A3A]"}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full rounded-md border border-[#2D3A3A]/30 p-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Password"
                className="w-full rounded-md border border-[#2D3A3A]/30 p-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-[#248232]">{message}</p>}

              <Button type="submit" className="w-full" isLoading={loading}>
                {mode === "login" ? "Login" : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#FCFFFC]" />}>
      <AuthPageContent />
    </Suspense>
  );
}
