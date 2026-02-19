import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error(
    'Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL',
  );
}

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseKey) {
  throw new Error(
    'Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY',
  );
}

// Client for use in client-side contexts only.
export const supabase = createClient(supabaseUrl, supabaseKey);
