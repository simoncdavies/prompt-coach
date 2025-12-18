import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for use in API routes (server-side context but using anon key is typical for client-facing apps, 
// though for the API route we might want service role if we were doing admin stuff. 
// Here user is anon so anon key is fine).
export const supabase = createClient(supabaseUrl, supabaseKey);
