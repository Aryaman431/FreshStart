import { NextRequest, NextResponse } from 'next/server';
import { guardAdmin } from '../../auth-guard';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { clerkClient } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = guardAdmin(req);
  if (denied) return denied;

  const { id } = await params;
  const client = await clerkClient();

  const [clerkUser, resumeRes, versionsRes] = await Promise.all([
    client.users.getUser(id),
    supabaseAdmin.from('resumes').select('data, updated_at').eq('user_id', id).maybeSingle(),
    supabaseAdmin
      .from('resume_versions')
      .select('id, name, resume_data, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  return NextResponse.json({
    user: {
      id: clerkUser.id,
      name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || 'Anonymous',
      email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      imageUrl: clerkUser.imageUrl,
      joinedAt: new Date(clerkUser.createdAt).toISOString(),
      lastActive: new Date(clerkUser.lastActiveAt ?? clerkUser.createdAt).toISOString(),
    },
    resume: resumeRes.data ?? null,
    versions: (versionsRes.data ?? []).map(v => ({
      id: v.id,
      name: v.name,
      data: v.resume_data,
      createdAt: v.created_at,
    })),
  });
}
