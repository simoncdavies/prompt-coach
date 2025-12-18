"use client";

import { useState, useEffect, use } from 'react';
import { ScoreCard } from '@/components/ScoreCard';
import { QuestionsList } from '@/components/QuestionsList';
import { RewriteBox } from '@/components/RewriteBox';
import { RecentRuns } from '@/components/RecentRuns';
import { Header } from '@/components/Header';
import { RunResponse } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function PromptView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [data, setData] = useState<RunResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchRun = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/run/${id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Failed to fetch run');
                setData(json);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to fetch run';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRun();
        }
    }, [id]);

    const handleSelectRun = (selectedId: string) => {
        router.push(`/prompt/${selectedId}`);
    };

    return (
        <main className="min-h-screen bg-[#FCFFFC] pb-20">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2BA84A]"></div>
                    </div>
                )}

                {error && (
                    <div className="max-w-4xl mx-auto p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                        Error: {error}
                    </div>
                )}

                {data && !loading && (
                    <section id="results" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="max-w-4xl mx-auto space-y-4">
                            <h2 className="text-2xl font-bold text-[#040F0F]">Analysis Results</h2>
                            <div className="p-6 rounded-xl bg-[#FCFFFC] border border-[#2D3A3A]/20 shadow-sm space-y-2">
                                <label className="text-xs font-semibold text-[#2D3A3A] uppercase tracking-wider">Original Prompt</label>
                                <p className="text-[#2D3A3A] font-mono text-sm whitespace-pre-wrap">{data.prompt_original}</p>
                            </div>
                        </div>

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
                <div className="border-t border-[#2D3A3A]/20 pt-10">
                    <RecentRuns onSelect={handleSelectRun} />
                </div>
            </div>
        </main>
    );
}
