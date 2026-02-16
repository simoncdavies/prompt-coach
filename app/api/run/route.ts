import { NextRequest, NextResponse } from 'next/server';
import { RunAnalysisSchema, RunResponse } from '@/lib/types';
import { redactSecrets } from '@/lib/utils';
import { analyzePromptAI, rewritePromptAI } from '@/lib/ai/client';
import { supabaseServer } from '@/lib/supabase/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { consumeQuota } from '@/lib/server/quota';

export const maxDuration = 60; // Allow 60s for AI ops

export async function POST(req: NextRequest) {
    try {
        const authUser = await getUserFromRequest(req);
        if (!authUser) {
            return NextResponse.json(
                { error: 'Authentication required to use the enhancer.' },
                { status: 401 }
            );
        }

        const body = await req.json();

        // 1. Validation
        const parsed = RunAnalysisSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }
        const { prompt, metadata, save, isPublic } = parsed.data;

        const isFakeUser = authUser.id === 'fake-user-local';
        const quota = isFakeUser
            ? {
                allowed: true,
                is_unlimited: true,
                used: 0,
                limit: 5,
                remaining: null,
                reset_at: new Date().toISOString(),
            }
            : await consumeQuota(authUser.id, {
                route: '/api/run',
                save,
                isPublic,
                targetModel: metadata.targetModel,
                outputStyle: metadata.outputStyle,
                verbosity: metadata.verbosity,
            });

        if (!quota.allowed) {
            return NextResponse.json(
                {
                    error: 'Monthly enhancement limit reached (5 on free plan).',
                    quota,
                },
                { status: 429 }
            );
        }

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
            const { data, error } = await supabaseServer
                .from('prompt_runs')
                .insert({
                    user_id: isFakeUser ? null : authUser.id,
                    prompt_original: safePrompt,
                    analysis_json: analysis,
                    prompt_rewritten: rewrite.revised_prompt,
                    prompt_rewritten_minimal: rewrite.minimal_prompt,
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
            metadata: metadata,
            quota,
        };


        return NextResponse.json(response);

    } catch (error: unknown) {
        console.error("API Error:", error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
