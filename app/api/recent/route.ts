import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabaseServer
            .from('prompt_runs')
            .select('id, created_at, overall_score, metadata, prompt_original') // Minimal fields
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            throw error;
        }

        return NextResponse.json({ runs: data });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unexpected error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
