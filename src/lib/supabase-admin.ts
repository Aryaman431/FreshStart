import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  .replace(/\/rest\/v1\/?$/, '') || 'https://povavrrdylygsjhhamvb.supabase.co';

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Service-role client — server-side only, never expose to browser
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
