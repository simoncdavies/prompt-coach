import { NextRequest, NextResponse } from 'next/server';
import { RunAnalysisSchema, RunAnalysisRequest, RunResponse } from '@/lib/types';
import { redactSecrets } from '@/lib/utils';
import { analyzePromptAI, rewritePromptAI } from '@/lib/ai/client';
import { supabase } from '@/lib/supabase/client';

export const maxDuration = 60; // Allow 60s for AI ops

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Validation
        const parsed = RunAnalysisSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }
        const { prompt, metadata, save, isPublic } = parsed.data;

        // 2. Secret Redaction (Security)
        const safePrompt = redactSecrets(prompt);

        // See note: Rate limiting would go here. 
        // For MVP without Redis, we rely on Vercel/Platform protections.

        // 3. AI Analysis
        const analysis = await analyzePromptAI(safePrompt, metadata);

        // 4. AI Rewrite
        const rewrite = await rewritePromptAI(safePrompt, analysis, metadata);

        let runId: string | undefined;

        // 5. Database Persistence (Optional)
        if (save) {
            const { data, error } = await supabase
                .from('prompt_runs')
                .insert({
                    prompt_original: safePrompt,
                    analysis_json: analysis,
                    prompt_rewritten: rewrite.revised_prompt,
                    overall_score: analysis.overall_score,
                    metadata: metadata,
                    is_public: isPublic
                })
                .select('id')
                .single();

            if (error) {
                console.error("Supabase Save Error:", error);
                // We don't fail the request, just log it.
            } else {
                runId = data?.id;
            }
        }

        // 6. Response
        const response: RunResponse = {
            analysis,
            rewrite,
            runId
        };

        return NextResponse.json(response);

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
