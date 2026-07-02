import { NextRequest, NextResponse } from 'next/server';
import { guardAdmin } from '../../auth-guard';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

/** PATCH /api/admin/subscriptions/[userId]  — upgrade or downgrade a user */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const denied = guardAdmin(req);
  if (denied) return denied;

  const { userId } = await params;
  const body = await req.json().catch(() => ({}));
  const { plan } = body as { plan?: string };

  if (!plan || !['free', 'pro'].includes(plan)) {
    return NextResponse.json({ error: 'plan must be "free" or "pro"' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .update({ plan, status: 'active', updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    console.error('[admin/subscriptions/PATCH]', error?.message);
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true, plan: data.plan, status: data.status });
}
