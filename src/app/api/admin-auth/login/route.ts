import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken, ADMIN_COOKIE } from '@/lib/admin-session';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required.' }, { status: 400 });
    }

    const token = createAdminToken(username.trim(), password);
    if (!token) {
      // Constant-time-ish delay to slow brute force
      await new Promise(r => setTimeout(r, 500));
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
