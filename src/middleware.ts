import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  COOKIE_NAME,
  verifySessionToken,
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

  // 2. Inspect and cryptographically verify session token
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

  // Helper to clear invalid session cookies on redirect
  const clearCookieResponse = (url: URL) => {
    const res = NextResponse.redirect(url);
    res.cookies.set({
      name: COOKIE_NAME,
      value: '',
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  };

  // 3. Public / Guest Routes (/login, /register)
  if (pathname === '/login' || pathname === '/register') {
    if (session) {
      if (session.isSuspended) {
        return NextResponse.redirect(new URL('/suspended', request.url));
      }
      if (session.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isTamperedOrExpired) {
      const res = NextResponse.next();
      res.cookies.set({
        name: COOKIE_NAME,
        value: '',
        path: '/',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return res;
    }

    return NextResponse.next();
  }

  // 4. Admin Login Route (/admin/login, /admin/register)
  if (pathname === '/admin/login' || pathname === '/admin/register') {
    if (session) {
      if (session.isSuspended) {
        return NextResponse.redirect(new URL('/suspended', request.url));
      }
      if (session.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isTamperedOrExpired) {
      const res = NextResponse.next();
      res.cookies.set({
        name: COOKIE_NAME,
        value: '',
        path: '/',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return res;
    }

    return NextResponse.next();
  }

  // 4b. Suspended Screen Route (/suspended)
  // Exempt this page from standard dashboard redirection rules to eliminate cyclic redirect loops
  if (pathname === '/suspended') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // 5. Customer Routes (/dashboard, /dashboard/:path*)
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname + search);
      if (isTamperedOrExpired) {
        loginUrl.searchParams.set('error', 'Session expired. Please sign in again.');
        return clearCookieResponse(loginUrl);
      }
      return NextResponse.redirect(loginUrl);
    }

    // Strict Lockout Boundary: Suspended users are locked out from dashboard, settings, stores, and billing
    if (session.isSuspended) {
      return NextResponse.redirect(new URL('/suspended', request.url));
    }

    // Accessible by both admin and user roles
    return NextResponse.next();
  }

  // 6. Super Admin Perimeter (/admin, /admin/dashboard, /admin/:path*)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!session) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      adminLoginUrl.searchParams.set('redirect', pathname + search);
      if (isTamperedOrExpired) {
        adminLoginUrl.searchParams.set('error', 'Session signature expired. Please sign in again.');
        return clearCookieResponse(adminLoginUrl);
      }
      return NextResponse.redirect(adminLoginUrl);
    }

    // Strict boundary: standard users cannot enter super-admin perimeter
    if (session.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect bare /admin to /admin/dashboard
    if (pathname === '/admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/dashboard',
    '/suspended',
  ],
};
