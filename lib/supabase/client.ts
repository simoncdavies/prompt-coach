import { createClient } from '@supabase/supabase-js';

function requireEnv(
  name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Client for use in client-side contexts only.
export const supabase = createClient(supabaseUrl, supabaseKey);
