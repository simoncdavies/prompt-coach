"use client";

import { useState } from 'react';
import { PromptEditor } from '@/components/PromptEditor';
import { RecentRuns } from '@/components/RecentRuns';
import { Header } from '@/components/Header';
import { RunAnalysisRequest } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRun = async (request: RunAnalysisRequest) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Something went wrong');
      }

      if (json.runId) {
        router.push(`/prompt/${json.runId}`);
      } else {
        throw new Error("No run ID returned from API");
      }

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSelectRun = (id: string) => {
    router.push(`/prompt/${id}`);
  };


  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Hero / Input */}
        <section className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Refine your AI Coding Prompts</h2>
            <p className="text-slate-600">Get better code from Claude, OpenAI, and Gemini by linting your prompt first.</p>
          </div>

          <PromptEditor
            onSubmit={handleRun}
            isLoading={loading}
          />


          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
              Error: {error}
            </div>
          )}
        </section>

        {/* Footer / Recent */}
        <div className="border-t border-slate-200 pt-10">
          <RecentRuns onSelect={handleSelectRun} />
        </div>
      </div>
    </main>
  );
}

