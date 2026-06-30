/**
 * POST /api/usage/ats
 * Checks if the user can run an ATS check, increments if allowed.
 *
 * Reads (canUseATS) use the Clerk-JWT client so RLS applies.
 * Writes (incrementUsageManual) use the admin client for atomicity.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/supabase-server';
import { canUseATS, incrementUsageManual } from '@/lib/subscription';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clerk-authenticated client for the limit read
    const client = await createClerkSupabaseClient();
    const result = await canUseATS(userId, client);

    if (!result.allowed) {
      return NextResponse.json(
        {
          allowed: false,
          used: result.used,
          limit: result.limit,
          remaining: 0,
          error: 'Daily ATS check limit reached. Upgrade to Pro for unlimited access.',
        },
        { status: 429 },
      );
    }

    // Admin client for the atomic increment (bypasses RLS intentionally)
    await incrementUsageManual(userId, 'ats_checks');

    return NextResponse.json({
      allowed: true,
      used: result.used + 1,
      limit: result.limit,
      remaining: result.remaining !== null ? result.remaining - 1 : null,
    });
  } catch (error) {
    console.error('[POST /api/usage/ats]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
