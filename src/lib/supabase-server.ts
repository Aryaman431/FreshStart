/**
 * src/lib/supabase-server.ts
 *
 * Compatibility re-export.
 * The canonical implementation lives at src/lib/supabase/server.ts.
 * This file keeps existing imports working without modification.
 */

export { createClerkSupabaseServerClient as createClerkSupabaseClient } from './supabase/server';
