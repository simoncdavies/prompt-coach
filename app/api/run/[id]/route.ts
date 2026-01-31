import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { RunResponse } from '@/lib/types';

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await props.params;
        console.log("Fetching run with ID:", id);

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
