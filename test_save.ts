
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    const lines = env.split('\n');
    for (const line of lines) {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            process.env[key] = value;
        }
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSave() {
    console.log("Testing save with is_public: false...");
    const { data, error } = await supabase
        .from('prompt_runs')
        .insert({
            prompt_original: 'private test ' + new Date().toISOString(),
            analysis_json: { test: true },
            prompt_rewritten: 'private rewrite',
            overall_score: 10,
            metadata: { targetModel: 'Gemini', outputStyle: 'diff', verbosity: 'normal' },
            is_public: false
        })
        .select();

    if (error) {
        console.error("Save failed:", error.message, error.details);
    } else {
        console.log("Save successful! ID:", data[0]?.id);

        console.log("Verifying if it shows up in general select...");
        const { data: fetchAll, error: fetchError } = await supabase
            .from('prompt_runs')
            .select('id, is_public')
            .eq('id', data[0].id);

        if (fetchError) {
            console.error("Fetch failed:", fetchError.message);
        } else {
            console.log("Fetch result:", fetchAll);
        }
    }
}

testSave();
