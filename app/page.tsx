"use client";

import { useState } from 'react';
import { PromptEditor } from '@/components/PromptEditor';
import { ScoreCard } from '@/components/ScoreCard';
import { QuestionsList } from '@/components/QuestionsList';
import { RewriteBox } from '@/components/RewriteBox';
import { RecentRuns } from '@/components/RecentRuns';
import { RunAnalysisRequest, RunResponse } from '@/lib/types';
import { Code2, Github } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async (request: RunAnalysisRequest) => {
    setLoading(true);
    setError(null);
    setData(null);

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

      setData(json);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRun = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/run/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch run');
      setData(json);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Code2 className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Prompt Coach <span className="text-slate-400 font-normal">for Coding</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/google/generative-ai-js" target="_blank" className="text-slate-500 hover:text-slate-900 transition-colors">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

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
            initialPrompt={data?.prompt_original}
            initialMetadata={data?.metadata}
          />


          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
              Error: {error}
            </div>
          )}
        </section>

        {/* Results */}
        {data && (
          <section id="results" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 scroll-mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Analysis */}
              <div className="space-y-6">
                <ScoreCard result={data.analysis} />
                <QuestionsList questions={data.analysis.questions_to_ask} />
              </div>

              {/* Right Column: Rewrite */}
              <div className="lg:col-span-2">
                <RewriteBox result={data.rewrite} />
              </div>
            </div>
          </section>
        )}

        {/* Footer / Recent */}
        <div className="border-t border-slate-200 pt-10">
          <RecentRuns onSelect={handleSelectRun} />
        </div>
      </div>
    </main>
  );
}

