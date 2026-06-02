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
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit  = 20;
  const offset = (page - 1) * limit;

  const client = await clerkClient();
  const clerkRes = query
    ? await client.users.getUserList({ query, limit, offset })
    : await client.users.getUserList({ limit, offset, orderBy: '-created_at' });

  const userIds = clerkRes.data.map(u => u.id);

  // Check which users have a resume
  const { data: resumeRows } = await supabaseAdmin
    .from('resumes')
    .select('user_id')
    .in('user_id', userIds);

  const resumeSet = new Set((resumeRows ?? []).map(r => r.user_id));

  const users = clerkRes.data.map(u => ({
    id: u.id,
    name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'Anonymous',
    email: u.emailAddresses[0]?.emailAddress ?? '',
    imageUrl: u.imageUrl,
    joinedAt: new Date(u.createdAt).toISOString(),
    hasResume: resumeSet.has(u.id),
    resumeCount: resumeSet.has(u.id) ? 1 : 0,
  }));

  return NextResponse.json({ users, total: clerkRes.totalCount });
}
