'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, Suspense, useMemo, useState } from 'react';
import { Footer } from '@/components/Footer';
import { HeaderSmall } from '@/components/HeaderSmall';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  type AuthActionResult,
  signInWithPassword,
  signUp,
} from '@/lib/auth/client';

function AuthPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = useMemo(() => params.get('returnTo') || '/', [params]);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result: AuthActionResult =
        mode === 'register'
          ? await signUp(email, password)
          : await signInWithPassword(email, password);

      if (result.needsEmailConfirmation) {
        setMessage(
          `Account created for ${result.email}. Check your inbox to confirm your email, then sign in.`,
        );
        setMode('login');
        setPassword('');
        return;
      }

      router.push(returnTo);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
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
            <h1 className="text-xl font-semibold text-[#040F0F]">
              Sign in to Prompt Coach
            </h1>
            <p className="text-sm text-[#2D3A3A]">
              Create an account or sign in to improve, save, and revisit
              prompts.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`px-3 py-2 text-sm rounded-md border ${mode === 'login' ? 'bg-[#2BA84A] text-white border-[#2BA84A]' : 'border-[#2D3A3A]/20 text-[#2D3A3A]'}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`px-3 py-2 text-sm rounded-md border ${mode === 'register' ? 'bg-[#2BA84A] text-white border-[#2BA84A]' : 'border-[#2D3A3A]/20 text-[#2D3A3A]'}`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="Email address"
                className="w-full rounded-md border border-[#2D3A3A]/30 p-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Password (6+ characters)"
                className="w-full rounded-md border border-[#2D3A3A]/30 p-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-[#248232]">{message}</p>}

              <Button type="submit" className="w-full" isLoading={loading}>
                {mode === 'login' ? 'Sign in' : 'Create account'}
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
