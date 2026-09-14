import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  COOKIE_NAME,
  verifySessionToken,
  isAllowedAdminEmail,
} from '@/lib/token';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Skip internal assets, API routes, and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Identify target route category
  const isAuthPage =
    pathname === '/admin/login' ||
    pathname === '/login' ||
    pathname === '/admin/register' ||
    pathname === '/register';

  const isProtectedPage =
    pathname === '/admin' ||
    pathname === '/admin/dashboard' ||
    pathname.startsWith('/admin/dashboard/') ||
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname.startsWith('/admin/stores') ||
    pathname.startsWith('/admin/settings');

  // 3. Inspect and cryptographically verify session token
  const sessionCookie = request.cookies.get(COOKIE_NAME);
  const rawToken = sessionCookie?.value;

  let session = null;
  let isTamperedOrExpired = false;

  if (rawToken) {
    session = await verifySessionToken(rawToken);
    if (!session) {
      isTamperedOrExpired = true;
    }
  }

  // 4. Handle Auth Pages (/admin/login, /admin/register, etc.)
  if (isAuthPage) {
    // If user is already authenticated with valid admin credentials, redirect to dashboard
    if (session && isAllowedAdminEmail(session.email)) {
      const dashboardUrl = new URL('/admin/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // If an invalid or tampered cookie is present on login page, clear it immediately
    if (isTamperedOrExpired) {
      const response = NextResponse.next();
      response.cookies.set({
        name: COOKIE_NAME,
        value: '',
        path: '/',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }

    return NextResponse.next();
  }

  // 5. Handle Protected Pages (/admin/dashboard, etc.)
  if (isProtectedPage) {
    // Authenticated admin user: permit entry
    if (session && isAllowedAdminEmail(session.email)) {
      // If root /admin requested, direct to /admin/dashboard
      if (pathname === '/admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Invalid signature, tampered token, or expired token detected
    const loginUrl = new URL('/admin/login', request.url);
    const returnDestination = pathname + search;
    loginUrl.searchParams.set('redirect', returnDestination);

    if (isTamperedOrExpired) {
      loginUrl.searchParams.set('error', 'Session signature invalid or expired. Please sign in again.');
    }

    const response = NextResponse.redirect(loginUrl);
    // Erase the tampered/invalid cookie from client storage
    response.cookies.set({
      name: COOKIE_NAME,
      value: '',
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/register',
    '/dashboard/:path*',
  ],
};
