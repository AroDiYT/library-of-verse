import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes require authentication
const protectedRoutes = ['/chapters', '/profile', '/admin'];
const adminRoutes = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie) {
      // No session cookie, redirect to auth
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    
    // For admin routes, we'd need to check if user is admin
    // For now, just check if session exists
    // The API routes will do the actual session validation
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|debug).*)',
  ],
};
