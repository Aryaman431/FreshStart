import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isAdminAuthenticatedFromRequest } from '@/lib/admin-session';

// ── Route matchers ────────────────────────────────────────────────────────────
const isPublicRoute      = createRouteMatcher(['/', '/login(.*)', '/sign-in(.*)', '/sign-up(.*)', '/pricing']);
const isAdminLoginRoute  = createRouteMatcher(['/admin-login', '/admin-login/(.*)']);
const isAdminPortalRoute = createRouteMatcher(['/admin', '/admin/(.*)', '/api/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // ── Admin portal: completely separate from Clerk ──────────────────────────
  if (isAdminPortalRoute(req)) {
    // Logout route — always allow (it clears the cookie)
    if (pathname === '/admin/logout') return NextResponse.next();

    const authenticated = isAdminAuthenticatedFromRequest(req);
    if (!authenticated) {
      const loginUrl = new URL('/admin-login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Admin login page: redirect to /admin if already authenticated ─────────
  if (isAdminLoginRoute(req)) {
    if (isAdminAuthenticatedFromRequest(req)) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // ── All other routes: Clerk handles auth ─────────────────────────────────
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
