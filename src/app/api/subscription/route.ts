/**
 * GET /api/subscription
 * Returns the current user's subscription plan and daily usage.
 *
 * Uses supabaseAdmin (service role) — the route is already protected by
 * Clerk auth(). Service role bypasses RLS so we never get blocked by a
 * missing or misconfigured Clerk JWT template.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getOrCreateSubscription,
  canUseATS,
  canTailorResume,
} from '@/lib/subscription';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service-role client (supabaseAdmin) — bypasses RLS, always works.
    // Route is already Clerk-protected above; service role is safe here.
    const [subscription, atsUsage, tailorUsage] = await Promise.all([
      getOrCreateSubscription(userId),
      canUseATS(userId),
      canTailorResume(userId),
    ]);

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      usage: {
        ats: atsUsage,
        tailor: tailorUsage,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[GET /api/subscription] Error:', message);
    return NextResponse.json(
      { error: 'Failed to fetch subscription', detail: message },
      { status: 500 },
    );
  }
}
