/**
 * lib/supabase/server.ts
 *
 * Canonical Clerk + Supabase JWT integration helper.
 *
 * HOW IT WORKS
 * ─────────────
 * 1. Clerk issues a short-lived JWT signed with your Clerk private key.
 * 2. We pass that JWT as the Authorization header on every Supabase request.
 * 3. Supabase verifies it against your Clerk JWKS endpoint
 *    (configured in Supabase Dashboard → Auth → JWT Settings).
 * 4. Inside Supabase, auth.uid() returns the Clerk user ID (the `sub` claim),
 *    so RLS policies like  auth.uid() = user_id  work automatically.
 *
 * USAGE (Route Handler / Server Action)
 * ─────────────────────────────────────
 *   import { createClerkSupabaseServerClient } from '@/lib/supabase/server';
 *
 *   const supabase = await createClerkSupabaseServerClient();
 *   const { data } = await supabase.from('subscriptions').select('*');
 *
 * SERVICE ROLE
 * ─────────────
 * For admin-only operations that must bypass RLS, keep using
 * @/lib/supabase-admin  (service role key, server-side only).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// ── Resolve URL once (strip trailing /rest/v1 if present) ────────────────────
const supabaseUrl =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
    .replace(/\/rest\/v1\/?$/, '') ||
  'https://povavrrdylygsjhhamvb.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdmF2cnJkeWx5Z3NqaGhhbXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjMxNDAsImV4cCI6MjA5MzEzOTE0MH0.8KjvdkVwWvqT6zvrE9bGVjnksiVHkgpXYgDEHOOj8A4';

/**
 * Returns a per-request Supabase client that carries the signed-in user's
 * Clerk JWT.  Every query runs under that user's RLS identity.
 *
 * - Uses the ANON key (not the service role key).
 * - Disables Supabase's own session management — Clerk owns the session.
 * - If called without a signed-in user (token = null), requests proceed as
 *   anonymous; RLS will reject them if policies require authentication.
 */
export async function createClerkSupabaseServerClient(): Promise<SupabaseClient> {
  const { getToken } = await auth();

  const token = await getToken({ template: 'supabase' });

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
