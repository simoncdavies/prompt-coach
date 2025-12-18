"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { AnalyzerResult, PromptMetadata } from '@/lib/types'; // Assuming types structure
import { Badge } from './ui/Badge';

interface RecentRun {
    id: string;
    created_at: string;
    overall_score: number;
    metadata: PromptMetadata;
    prompt_original: string; // We'll truncate this
}

interface RecentRunsProps {
    onSelect: (id: string) => void;
}

export function RecentRuns({ onSelect }: RecentRunsProps) {
    const [runs, setRuns] = useState<RecentRun[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecent = () => {
        fetch('/api/recent')
            .then(res => res.json())
            .then(data => {
                if (data.runs) {
                    console.log("Recent runs fetched:", data.runs.length);
                    // Filter out any runs that don't have an ID to prevent click errors
                    setRuns(data.runs.filter((r: RecentRun) => r.id));
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchRecent();
        // Poll for updates every 30 seconds or we could use Supabase Realtime
        const interval = setInterval(fetchRecent, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && runs.length === 0) return null;
    if (runs.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Recent Prompts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {runs.map(run => (
                    <Card
                        key={run.id}
                        className="hover:shadow-md transition-all cursor-pointer border-slate-200 hover:border-blue-300 group"
                        onClick={() => onSelect(run.id)}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant={run.overall_score >= 8 ? 'success' : run.overall_score >= 5 ? 'warning' : 'destructive'}>
                                    Score: {run.overall_score}/10
                                </Badge>
                                <span className="text-xs text-slate-400">
                                    {new Date(run.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 line-clamp-3 font-mono text-xs mb-2">
                                {run.prompt_original}
                            </p>
                            <div className="flex justify-between items-center">
                                <Badge variant="outline" className="text-[10px]">{run.metadata.targetModel}</Badge>
                                <span className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">Click to view →</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

