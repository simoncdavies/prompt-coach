import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('prompt_runs')
            .select('id, created_at, overall_score, metadata, prompt_original') // Minimal fields
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            throw error;
        }

        return NextResponse.json({ runs: data });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
