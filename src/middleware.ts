import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('dashboard_token')?.value;

  const { pathname } = req.nextUrl;

  // Allow public routes
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Unauthenticated users → redirect to login
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (!token && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If we have a token, try to decode it (basic check, not verification)
  if (token && pathname.startsWith('/admin')) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'owner') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
