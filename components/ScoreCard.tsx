import { useState } from 'react';
import { AnalyzerResult, IssueSchema } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { cn } from '@/lib/utils';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { z } from 'zod';

type Issue = z.infer<typeof IssueSchema>;

// Collapsible score item component
function ScoreItem({ label, score, issues }: { label: string; score: number; issues: Issue[] }) {
    const [isOpen, setIsOpen] = useState(false);

    // Score is 0-5
    const percentage = (score / 5) * 100;
    const hasIssues = issues.length > 0;

    const toggleOpen = () => {
        if (hasIssues) setIsOpen(!isOpen);
    };

    return (
        <div className="space-y-2 border-b border-slate-50 last:border-0 pb-2 last:pb-0">
            {/* Header / Score Bar */}
            <div
                className={cn("space-y-1 cursor-default", { "cursor-pointer hover:bg-slate-50 rounded-md p-1 -m-1 transition-colors": hasIssues })}
                onClick={toggleOpen}
            >
                <div className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700 capitalize">{label.replace(/_/g, ' ')}</span>
                        {hasIssues && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100">
                                <AlertCircle className="h-3 w-3 text-amber-600" />
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">{score}/5</span>
                        {hasIssues && (
                            <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
                        )}
                    </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className={cn("h-full transition-all duration-500 ease-out", {
                            'bg-red-500': score <= 2,
                            'bg-amber-500': score === 3,
                            'bg-green-500': score >= 4,
                        })}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Collapsible Issues Content */}
            {hasIssues && isOpen && (
                <div className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-md p-3 space-y-3 animate-in fade-in slide-in-from-top-1">
                    {issues.map((issue, idx) => (
                        <div key={idx} className="space-y-1">
                            {issue.evidence && (
                                <p className="text-xs text-slate-500 italic border-l-2 border-amber-300 pl-2 mb-1">
                                    "{issue.evidence}"
                                </p>
                            )}
                            <div className="flex gap-2">
                                <span className="text-amber-600 font-medium shrink-0">•</span>
                                <p>{issue.recommendation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function ScoreCard({ result }: { result: AnalyzerResult }) {
    const { overall_score, scores, issues } = result;

    // Color for overall score
    const overallColor = overall_score >= 8 ? 'text-green-600' : overall_score >= 5 ? 'text-amber-600' : 'text-red-600';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Analysis Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <div className={cn("text-4xl font-bold", overallColor)}>{overall_score}/10</div>
                    <p className="text-sm text-slate-500">Overall Quality</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                    {(Object.entries(scores) as [keyof typeof scores, number][]).map(([key, value]) => {
                        // Filter issues for this category
                        // Note: Category matching might need to be fuzzy or standardized.
                        // Assuming LLM outputs categories that loosely or exactly match score keys.
                        // We will check if issue.category (normalized) matches key (normalized).
                        const categoryIssues = issues.filter(i => {
                            const issueCat = i.category.toLowerCase().replace(/\s+/g, '_');
                            const scoreKey = key.toLowerCase();
                            return issueCat.includes(scoreKey) || scoreKey.includes(issueCat);
                        });

                        return (
                            <ScoreItem key={key} label={key} score={value} issues={categoryIssues} />
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
