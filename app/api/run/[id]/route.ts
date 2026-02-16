import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { RunResponse } from '@/lib/types';
import { getUserFromRequest } from '@/lib/server/auth';

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await props.params;
        const authUser = await getUserFromRequest(req);

        if (!id || id === 'undefined') {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { data, error } = await supabaseServer
            .from('prompt_runs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return NextResponse.json({ error: 'Run not found' }, { status: 404 });
        }

        const isOwner = authUser?.id && data.user_id === authUser.id;

        if (!isOwner) {
            if (!data.is_public) {
                return NextResponse.json({ error: 'Run not found' }, { status: 404 });
            }

            const { data: recentRows, error: recentError } = await supabaseServer
                .from('prompt_runs')
                .select('id')
                .eq('is_public', true)
                .order('created_at', { ascending: false })
                .limit(20);

            if (recentError) {
                throw recentError;
            }

            const isInRecent = (recentRows ?? []).some((row) => row.id === id);
            if (!isInRecent) {
                return NextResponse.json({ error: 'Run not found' }, { status: 404 });
            }
        }

        const response: RunResponse = {
            analysis: data.analysis_json,
            rewrite: {
                revised_prompt: data.prompt_rewritten,
                minimal_prompt: data.prompt_rewritten_minimal,
            },
            runId: data.id,
            prompt_original: data.prompt_original,
            metadata: data.metadata
        };


        return NextResponse.json(response);

    } catch (error: unknown) {
        console.error("Fetch Run Error:", error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
