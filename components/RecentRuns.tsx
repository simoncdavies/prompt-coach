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

export function RecentRuns() {
    const [runs, setRuns] = useState<RecentRun[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/recent')
            .then(res => res.json())
            .then(data => {
                if (data.runs) setRuns(data.runs);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return null; // Or skeleton
    if (runs.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Recent Public Runs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {runs.map(run => (
                    <Card key={run.id} className="hover:shadow-md transition-shadow cursor-default">
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
                            <p className="text-sm text-slate-600 line-clamp-3 font-mono text-xs">
                                {run.prompt_original}
                            </p>
                            <div className="mt-2 flex gap-2">
                                <Badge variant="outline" className="text-[10px]">{run.metadata.targetModel}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
