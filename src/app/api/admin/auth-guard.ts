import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticatedFromRequest } from '@/lib/admin-session';

/** Returns null if authenticated, or a 403 response if not. */
export function guardAdmin(req: NextRequest): NextResponse | null {
  if (!isAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}
