"use client";

import { useState, useEffect } from 'react';
import { PromptMetadata, RunAnalysisRequest, TARGET_MODELS, OUTPUT_STYLES, VERBOSITY_LEVELS } from '@/lib/types';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Wand2 } from 'lucide-react';

interface PromptEditorProps {
    onSubmit: (data: RunAnalysisRequest) => void;
    isLoading: boolean;
    initialPrompt?: string;
    initialMetadata?: Partial<PromptMetadata>;
}

export function PromptEditor({ onSubmit, isLoading, initialPrompt = '', initialMetadata }: PromptEditorProps) {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [targetModel, setTargetModel] = useState<PromptMetadata['targetModel']>(initialMetadata?.targetModel || 'Gemini');
    const [outputStyle, setOutputStyle] = useState<PromptMetadata['outputStyle']>(initialMetadata?.outputStyle || 'plan + code + tests');
    const [verbosity, setVerbosity] = useState<PromptMetadata['verbosity']>(initialMetadata?.verbosity || 'normal');

    const [isPublic, setIsPublic] = useState(true);

    // Sync with external changes (e.g. from history)
    useEffect(() => {
        if (initialPrompt) setPrompt(initialPrompt);
        if (initialMetadata?.targetModel) setTargetModel(initialMetadata.targetModel);
        if (initialMetadata?.outputStyle) setOutputStyle(initialMetadata.outputStyle);
        if (initialMetadata?.verbosity) setVerbosity(initialMetadata.verbosity);
    }, [initialPrompt, initialMetadata]);


    // Validation
    const isValid = prompt.length >= 10;

    const handleSubmit = () => {
        if (!isValid) return;
        onSubmit({
            prompt,
            metadata: { targetModel, outputStyle, verbosity },
            save: true,
            isPublic: isPublic,
        });
    };

    return (
        <Card className="w-full">
            <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-slate-700">Enter your Prompt</label>
                        <span className="text-xs text-slate-400">{prompt.length} chars</span>
                    </div>
                    <textarea
                        className="w-full h-64 p-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none font-mono text-sm bg-white"
                        placeholder="Paste your coding prompt here..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                {/* Controls Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Target AI</label>
                        <select
                            className="w-full p-2 text-sm rounded-md border border-slate-200 bg-slate-50"
                            value={targetModel}
                            onChange={(e) => setTargetModel(e.target.value as any)}
                            disabled={isLoading}
                        >
                            {TARGET_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Output Style</label>
                        <select
                            className="w-full p-2 text-sm rounded-md border border-slate-200 bg-slate-50"
                            value={outputStyle}
                            onChange={(e) => setOutputStyle(e.target.value as any)}
                            disabled={isLoading}
                        >
                            {OUTPUT_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Verbosity</label>
                        <select
                            className="w-full p-2 text-sm rounded-md border border-slate-200 bg-slate-50"
                            value={verbosity}
                            onChange={(e) => setVerbosity(e.target.value as any)}
                            disabled={isLoading}
                        >
                            {VERBOSITY_LEVELS.map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                disabled={isLoading}
                            />
                            <span className="text-sm text-slate-700">Make Public (Anon)</span>
                        </label>
                    </div>

                    <Button onClick={handleSubmit} disabled={!isValid || isLoading} size="lg">
                        <Wand2 className="mr-2 h-4 w-4" />
                        Analyze Prompt
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
