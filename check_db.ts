
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

async function checkSchema() {
    console.log("Checking Supabase connection and schema...");

    // Try to fetch one row to see columns
    const { data, error } = await supabase
        .from('prompt_runs')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching rows:", error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log("Columns found in first row:", Object.keys(data[0]));
    } else {
        console.log("No rows found. Attempting a test insert...");
        const testInsert = await supabase
            .from('prompt_runs')
            .insert({
                prompt_original: 'test prompt',
                analysis_json: {},
                prompt_rewritten: 'test rewrite',
                overall_score: 5,
                is_public: false
            })
            .select();

        if (testInsert.error) {
            console.error("Insert failed:", testInsert.error.message);
        } else {
            console.log("Insert successful! Row data:", testInsert.data);
        }
    }
}

checkSchema();
