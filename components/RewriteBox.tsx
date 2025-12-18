"use client";

import { useState } from 'react';
import { RewriterResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Copy, Check, FileText, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RewriteBox({ result }: { result: RewriterResult }) {
    const [activeTab, setActiveTab] = useState<'improved' | 'minimal'>('improved');
    const [copied, setCopied] = useState(false);

    const content = activeTab === 'improved' ? result.revised_prompt : result.minimal_prompt;

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="border-b border-[#2D3A3A]/15">
                <div className="flex items-center justify-between">
                    <CardTitle>Optimized Prompt</CardTitle>
                    <div className="flex space-x-1 bg-[#2D3A3A]/10 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('improved')}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                                activeTab === 'improved' ? "bg-[#FCFFFC] text-[#040F0F] shadow-sm" : "text-[#2D3A3A] hover:text-[#040F0F]"
                            )}
                        >
                            <FileText className="h-3 w-3" />
                            Improved
                        </button>
                        <button
                            onClick={() => setActiveTab('minimal')}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                                activeTab === 'minimal' ? "bg-[#FCFFFC] text-[#040F0F] shadow-sm" : "text-[#2D3A3A] hover:text-[#040F0F]"
                            )}
                        >
                            <Zap className="h-3 w-3" />
                            Minimal
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative group min-h-[400px]">
                <textarea
                    readOnly
                    className="w-full h-full p-6 resize-none outline-none font-mono text-sm bg-[#FCFFFC] text-[#040F0F]"
                    value={content}
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        {copied ? 'Copied' : 'Copy'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
