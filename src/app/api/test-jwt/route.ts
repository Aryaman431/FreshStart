/**
 * GET /api/test-jwt
 *
 * Diagnostic endpoint — verifies the Clerk → Supabase JWT bridge is working.
 *
 * Returns:
 *  - obtained:      whether a JWT was successfully fetched from Clerk
 *  - payload:       decoded JWT claims (NOT the raw token string)
 *  - claims:        presence check for sub, aud, role, email
 *  - supabaseProbe: result of a lightweight authenticated Supabase query
 *
 * Remove or protect this endpoint before going to production.
 *
 * NEVER RETURNS THE RAW TOKEN — only the decoded payload is safe to log.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseServerClient } from '@/lib/supabase/server';

/** Decode a JWT payload without verifying the signature (diagnostic only). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Base64url → Base64 → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function GET() {
  // ── 1. Get Clerk auth context ─────────────────────────────────────────────
  const { userId, getToken } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Not authenticated. Sign in before calling this endpoint.' },
      { status: 401 },
    );
  }

  // ── 2. Obtain the Clerk JWT for Supabase ─────────────────────────────────
  let token: string | null = null;
  let tokenError: string | null = null;

  try {
    token = await getToken({ template: 'supabase' });
  } catch (err) {
    tokenError =
      err instanceof Error ? err.message : 'Unknown error obtaining token';
  }

  const obtained = token !== null;

  if (!obtained) {
    const msg =
      tokenError ??
      'getToken returned null. Ensure the "supabase" JWT template exists in your Clerk Dashboard ' +
        '(Clerk → JWT Templates → New template → Supabase).';
    console.error('[test-jwt] JWT not obtained:', msg);
    return NextResponse.json({ obtained: false, error: msg }, { status: 500 });
  }

  // ── 3. Decode payload (never return raw token) ───────────────────────────
  const payload = decodeJwtPayload(token!);

  if (!payload) {
    console.error('[test-jwt] Failed to decode JWT payload');
    return NextResponse.json(
      { obtained: true, error: 'Could not decode JWT payload' },
      { status: 500 },
    );
  }

  // ── 4. Check required claims ─────────────────────────────────────────────
  const claims = {
    sub:   { present: 'sub'   in payload, value: payload['sub']   ?? null },
    aud:   { present: 'aud'   in payload, value: payload['aud']   ?? null },
    role:  { present: 'role'  in payload, value: payload['role']  ?? null },
    email: { present: 'email' in payload, value: payload['email'] ?? null },
  };

  const missingClaims = Object.entries(claims)
    .filter(([, v]) => !v.present)
    .map(([k]) => k);

  if (missingClaims.length > 0) {
    console.error(
      '[test-jwt] JWT is missing required claims:',
      missingClaims.join(', '),
      '\nFull payload:',
      payload,
      '\nFix: In Clerk Dashboard → JWT Templates → supabase, ensure the template includes:',
      '{ "role": "authenticated", "email": "{{user.primary_email_address}}" }',
    );
  }

  // ── 5. Probe Supabase with the Clerk JWT ─────────────────────────────────
  let supabaseProbe: {
    success: boolean;
    authUidMatchesClerk: boolean | null;
    error: string | null;
  } = { success: false, authUidMatchesClerk: null, error: null };

  try {
    const supabase = await createClerkSupabaseServerClient();

    // auth.uid() inside Supabase should equal the Clerk userId (sub claim).
    // We call a lightweight RPC that simply returns auth.uid().
    // If the function doesn't exist yet, the select fallback is used.
    const { data, error } = await supabase.rpc('get_auth_uid').maybeSingle();

    if (error) {
      // RPC may not exist — fall back to a simple authenticated query
      const { error: fallbackError } = await supabase
        .from('subscriptions')
        .select('user_id')
        .limit(1);

      supabaseProbe = {
        success: !fallbackError,
        authUidMatchesClerk: null, // can't verify without the RPC
        error: fallbackError?.message ?? null,
      };
    } else {
      const uidFromSupabase = data as string | null;
      supabaseProbe = {
        success: true,
        authUidMatchesClerk: uidFromSupabase === userId,
        error: null,
      };
    }
  } catch (err) {
    supabaseProbe = {
      success: false,
      authUidMatchesClerk: null,
      error: err instanceof Error ? err.message : 'Unexpected error',
    };
  }

  // ── 6. Return diagnostic result ───────────────────────────────────────────
  return NextResponse.json({
    obtained,
    clerkUserId: userId,
    payload: {
      // Safe to return — no raw token, only decoded claims
      sub:   payload['sub']   ?? null,
      aud:   payload['aud']   ?? null,
      role:  payload['role']  ?? null,
      email: payload['email'] ?? null,
      iss:   payload['iss']   ?? null,
      exp:   payload['exp']   ?? null,
      iat:   payload['iat']   ?? null,
    },
    claims,
    missingClaims,
    allClaimsPresent: missingClaims.length === 0,
    supabaseProbe,
    note: 'Remove or restrict this endpoint before going to production.',
  });
}
