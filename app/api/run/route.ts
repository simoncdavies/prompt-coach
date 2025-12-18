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

        // 5. Database Persistence
        if (save) {
            console.log("Attempting to save run to Supabase...");
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
                .select('id'); // Removed .single() to avoid error if RLS hides the row

            if (error) {
                console.error("Supabase Save Error:", error.message, error.details);
            } else if (data && data.length > 0) {
                runId = data[0].id;
                console.log("Saved run with ID:", runId);
            } else {
                console.log("Run saved but ID not returned (likely RLS policy).");
            }
        }

        // 6. Response
        const response: RunResponse = {
            analysis,
            rewrite,
            runId,
            prompt_original: safePrompt,
            metadata: metadata
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
