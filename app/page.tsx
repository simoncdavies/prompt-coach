"use client";

import { useEffect, useState } from 'react';
import { PromptEditor } from '@/components/PromptEditor';
import { RecentRuns } from '@/components/RecentRuns';
import { HeaderSmall } from '@/components/HeaderSmall';
import { QuotaStatus, RunAnalysisRequest } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { LoadingModal } from '@/components/LoadingModal';
import { AuthModal } from '@/components/AuthModal';
import { ClientAuthUser, getAccessToken, getAuthHeaders, getCurrentUser, onAuthChange } from '@/lib/auth/client';
import { trackEvent } from '@/lib/analytics';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<RunAnalysisRequest | null>(null);
  const router = useRouter();

  const fetchQuota = async (authUser?: ClientAuthUser | null) => {
    const user = authUser ?? await getCurrentUser();
    if (!user) {
      setQuota(null);
      setIsSignedIn(false);
      return;
    }

    setIsSignedIn(true);
    const res = await fetch('/api/usage', {
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) {
      setQuota(null);
      return;
    }

    const json = await res.json();
    setQuota(json.quota ?? null);
  };

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      fetchQuota(user);
    });

    return unsubscribe;
  }, []);

  const runEnhancer = async (request: RunAnalysisRequest) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: await getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(request),
      });

      const json = await res.json();

      if (json.quota) {
        setQuota(json.quota);
      }

      if (!res.ok) {
        if (res.status === 401) {
          setPendingRequest(request);
          setShowAuthModal(true);
          throw new Error('Please sign in to enhance prompts.');
        }
        if (res.status === 429) {
          trackEvent('enhancer_quota_blocked', { limit: json?.quota?.limit ?? 5 });
          throw new Error(
            'You have reached 5/5 free enhancements this month. Upgrade: £10 for 200/month or £20 for 500/month.'
          );
        }
        throw new Error(json.error || 'Something went wrong');
      }

      trackEvent('enhancer_attempt_allowed', { targetModel: request.metadata.targetModel });

      if (json.runId) {
        router.push(`/prompt/${json.runId}`);
      } else {
        throw new Error("No run ID returned from API");
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setLoading(false);
    }
  };

  const handleRun = async (request: RunAnalysisRequest) => {
    const token = await getAccessToken();
    if (!token) {
      setPendingRequest(request);
      setShowAuthModal(true);
      setError('Enhancement requires an account. Login or register to continue.');
      trackEvent('enhancer_auth_gate_shown');
      return;
    }

    await runEnhancer(request);
  };

  const handleAuthSuccess = async () => {
    trackEvent('enhancer_auth_conversion');
    await fetchQuota();
    if (!pendingRequest) {
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      return;
    }

    const request = pendingRequest;
    setPendingRequest(null);
    await runEnhancer(request);
  };

  const quotaHelper = isSignedIn
    ? quota
      ? quota.is_unlimited
        ? 'Unlimited plan active.'
        : `Usage: ${quota.used}/${quota.limit} this cycle. ${quota.remaining} left.`
      : 'Checking quota...'
    : 'Enhancement requires login/register. Free tier: 5 per month.';

  const handleSelectRun = (id: string) => {
    router.push(`/prompt/${id}`);
  };


  return (
    <main className="min-h-screen bg-[#FCFFFC]">
      <HeaderSmall />
      {loading && <LoadingModal message="Analyzing your prompt..." />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Hero / Input */}
        <section className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-[#040F0F]">Refine your AI Coding Prompts</h2>
            <p className="text-[#2D3A3A]">Get better code from Claude, OpenAI, and Gemini by linting your prompt first.</p>
          </div>

          <PromptEditor
            onSubmit={handleRun}
            isLoading={loading}
            helperText={quotaHelper}
          />


          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
              Error: {error}
            </div>
          )}
        </section>

        {/* Footer / Recent */}
        <div id="recent-prompts" className="border-t border-[#2D3A3A]/20 pt-10">
          <RecentRuns onSelect={handleSelectRun} />
        </div>
      </div>

      <Footer />
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
    </main>
  );
}
