import { NextRequest, NextResponse } from 'next/server';
import { guardAdmin } from '../auth-guard';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { clerkClient } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;

  const client = await clerkClient();

  const [totalUsers, resumesRes, versionsRes] = await Promise.all([
    client.users.getCount(),
    supabaseAdmin.from('resumes').select('user_id', { count: 'exact', head: true }),
    supabaseAdmin.from('resume_versions').select('id', { count: 'exact', head: true }),
  ]);

  return NextResponse.json({
    totalUsers: Number(totalUsers),
    totalResumes: resumesRes.count ?? 0,
    totalVersions: versionsRes.count ?? 0,
  });
}
