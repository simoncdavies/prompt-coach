'use client';

import { X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AnalyticsEvent, trackEvent } from '@/lib/analytics';
import {
  type AuthActionResult,
  signInWithPassword,
  signUp,
} from '@/lib/auth/client';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export function AuthModal({
  open,
  onClose,
  onSuccess,
  title = 'Sign in required',
  description = 'Sign in to improve and save prompts.',
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    trackEvent(AnalyticsEvent.AuthModalShown, {
      source: 'auth_modal',
    });
  }, [open]);

  if (!open) {
    return null;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const modeAtSubmit = mode;
    trackEvent(
      modeAtSubmit === 'register'
        ? AnalyticsEvent.AuthCreateAccountSubmit
        : AnalyticsEvent.AuthSignInSubmit,
      { source: 'auth_modal' },
    );
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const result: AuthActionResult =
        modeAtSubmit === 'register'
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

      trackEvent(
        modeAtSubmit === 'register'
          ? AnalyticsEvent.AuthCreateAccountSuccess
          : AnalyticsEvent.AuthSignInSuccess,
        { source: 'auth_modal' },
      );
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      trackEvent(
        modeAtSubmit === 'register'
          ? AnalyticsEvent.AuthCreateAccountFailed
          : AnalyticsEvent.AuthSignInFailed,
        {
          source: 'auth_modal',
          error: message,
        },
      );
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-[#2D3A3A] hover:bg-[#2D3A3A]/10"
          aria-label="Close authentication dialog"
        >
          <X className="h-4 w-4" />
        </button>
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#040F0F]">{title}</h2>
            <p className="text-sm text-[#2D3A3A]">{description}</p>
          </div>

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

            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
