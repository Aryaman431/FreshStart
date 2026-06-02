import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin-session';

export async function GET(req: NextRequest) {
  const loginUrl = new URL('/admin-login', req.url);
  const res = NextResponse.redirect(loginUrl);
  res.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
