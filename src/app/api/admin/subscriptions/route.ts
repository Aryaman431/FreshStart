import { NextRequest, NextResponse } from 'next/server';
import { guardAdmin } from '../auth-guard';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { clerkClient } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const query  = searchParams.get('q') ?? '';
  const filter = searchParams.get('filter') ?? 'all'; // all | free | pro | active
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit  = 25;
  const offset = (page - 1) * limit;

  // Fetch all subscriptions from Supabase (service role — bypasses RLS)
  let sbQuery = supabaseAdmin
    .from('subscriptions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filter === 'free')   sbQuery = sbQuery.eq('plan', 'free');
  if (filter === 'pro')    sbQuery = sbQuery.eq('plan', 'pro');
  if (filter === 'active') sbQuery = sbQuery.eq('status', 'active');

  const { data: allSubs, count: totalCount, error } = await sbQuery;

  if (error) {
    console.error('[admin/subscriptions] Supabase error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const subs = allSubs ?? [];

  // If text search — filter by user_id / email match in subs first, then clerk lookup
  let filteredSubs = subs;
  if (query) {
    const q = query.toLowerCase();
    filteredSubs = subs.filter(s =>
      s.user_id?.toLowerCase().includes(q) ||
      (s.email ?? '').toLowerCase().includes(q),
    );
  }

  // Paginate after local filter
  const total  = query ? filteredSubs.length : (totalCount ?? 0);
  const paged  = query ? filteredSubs.slice(offset, offset + limit) : filteredSubs.slice(offset, offset + limit);

  // Enrich with Clerk user info (name, imageUrl) in bulk
  const userIds = [...new Set(paged.map(s => s.user_id).filter(Boolean))];

  let clerkMap: Record<string, { name: string; email: string; imageUrl: string }> = {};
  if (userIds.length > 0) {
    try {
      const client = await clerkClient();
      const clerkUsers = await client.users.getUserList({ userId: userIds, limit: userIds.length });
      for (const u of clerkUsers.data) {
        clerkMap[u.id] = {
          name:     `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'Anonymous',
          email:    u.emailAddresses[0]?.emailAddress ?? '',
          imageUrl: u.imageUrl,
        };
      }
    } catch (clerkErr) {
      console.warn('[admin/subscriptions] Clerk lookup failed — showing user IDs only:', clerkErr);
    }
  }

  const enriched = paged.map(s => ({
    id:         s.id,
    user_id:    s.user_id,
    plan:       s.plan,
    status:     s.status,
    email:      clerkMap[s.user_id]?.email  || s.email || s.user_id,
    name:       clerkMap[s.user_id]?.name   || 'Unknown',
    imageUrl:   clerkMap[s.user_id]?.imageUrl || '',
    created_at: s.created_at,
    updated_at: s.updated_at,
  }));

  // Summary counts (always from full unfiltered table)
  const [freeCount, proCount, activeCount] = await Promise.all([
    supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan', 'free'),
    supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan', 'pro'),
    supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  return NextResponse.json({
    subscriptions: enriched,
    total,
    page,
    limit,
    summary: {
      total:    totalCount ?? 0,
      free:     freeCount.count  ?? 0,
      pro:      proCount.count   ?? 0,
      active:   activeCount.count ?? 0,
    },
  });
}
