import { createClient } from '@supabase/supabase-js';

// Hardcoded fallbacks ensure the client initializes even if env vars
// aren't available during SSR module evaluation
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  .replace(/\/rest\/v1\/?$/, '') || 'https://povavrrdylygsjhhamvb.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdmF2cnJkeWx5Z3NqaGhhbXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjMxNDAsImV4cCI6MjA5MzEzOTE0MH0.8KjvdkVwWvqT6zvrE9bGVjnksiVHkgpXYgDEHOOj8A4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
