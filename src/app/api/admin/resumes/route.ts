import { NextRequest, NextResponse } from 'next/server';
import { guardAdmin } from '../auth-guard';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { clerkClient } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;

  // 1. Fetch all resumes from Supabase
  const { data: resumeRows, error: resumeErr } = await supabaseAdmin
    .from('resumes')
    .select('user_id, data, updated_at')
    .order('updated_at', { ascending: false });

  if (resumeErr) {
    return NextResponse.json({ error: resumeErr.message }, { status: 500 });
  }

  if (!resumeRows || resumeRows.length === 0) {
    return NextResponse.json({ resumes: [] });
  }

  const userIds = resumeRows.map(r => r.user_id);

  // 2. Fetch version counts per user
  const { data: versionRows } = await supabaseAdmin
    .from('resume_versions')
    .select('user_id')
    .in('user_id', userIds);

  const versionCountMap: Record<string, number> = {};
  for (const v of versionRows ?? []) {
    versionCountMap[v.user_id] = (versionCountMap[v.user_id] ?? 0) + 1;
  }

  // 3. Fetch Clerk user info for each user_id
  const client = await clerkClient();

  // Clerk getUserList can filter by externalId but not by internal id in bulk.
  // Fetch in batches of 100 using the id filter approach.
  const clerkUsers = await Promise.allSettled(
    userIds.map(id => client.users.getUser(id))
  );

  const userMap: Record<string, { name: string; email: string; imageUrl: string }> = {};
  clerkUsers.forEach((result, i) => {
    const uid = userIds[i];
    if (result.status === 'fulfilled') {
      const u = result.value;
      userMap[uid] = {
        name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'Anonymous',
        email: u.emailAddresses[0]?.emailAddress ?? '',
        imageUrl: u.imageUrl,
      };
    } else {
      userMap[uid] = { name: 'Unknown User', email: uid, imageUrl: '' };
    }
  });

  // 4. Assemble response
  const resumes = resumeRows.map(r => ({
    userId: r.user_id,
    userName: userMap[r.user_id]?.name ?? 'Unknown',
    userEmail: userMap[r.user_id]?.email ?? '',
    userImage: userMap[r.user_id]?.imageUrl ?? '',
    updatedAt: r.updated_at,
    versionCount: versionCountMap[r.user_id] ?? 0,
    resumeData: r.data,
  }));

  return NextResponse.json({ resumes });
}
