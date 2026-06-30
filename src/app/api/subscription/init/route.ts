/**
 * POST /api/subscription/init
 * Auto-creates a free subscription record for new users on first sign-in.
 *
 * Uses supabaseAdmin (service role) — the route is already protected by
 * Clerk auth(). Service role bypasses RLS so inserts never fail due to a
 * missing or misconfigured Clerk JWT template.
 */

import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateSubscription } from '@/lib/subscription';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress ?? null;

    // Use service-role client (no RLS). Route is Clerk-protected above.
    const subscription = await getOrCreateSubscription(userId, email);

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[POST /api/subscription/init] Error:', message);
    return NextResponse.json(
      { error: 'Failed to initialize subscription', detail: message },
      { status: 500 },
    );
  }
}
