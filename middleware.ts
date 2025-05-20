import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// Use build-time constants for CSRF configuration
const CSRF_COOKIE = process.env.CSRF_COOKIE_NAME || 'csrf_token';
const CSRF_HEADER = process.env.CSRF_HEADER_NAME || 'x-csrf-token';

// This middleware runs on every request
export function middleware(request: NextRequest) {
  // Only apply CSRF protection to API routes that need it
  if (request.nextUrl.pathname.startsWith('/api/lens/auth')) {
    const response = NextResponse.next();
    let csrfToken = request.cookies.get(CSRF_COOKIE)?.value;

    // If no CSRF token in cookie or it's a fresh session, generate one
    if (!csrfToken) {
      csrfToken = nanoid();
      
      // Set the CSRF token in the response cookie using build-time constants
      response.cookies.set(CSRF_COOKIE, csrfToken, {
        httpOnly: false, // Hardcoded at build time via DefinePlugin
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // TypeScript requires this to be a literal
        path: '/',
      });
      
      console.log(`[Middleware] Set new CSRF token in cookie: ${csrfToken.substring(0, 5)}...`);
    } else {
      console.log(`[Middleware] Using existing CSRF token: ${csrfToken.substring(0, 5)}...`);
    }

    return response;
  }
  
  // For non-protected routes, just continue
  return NextResponse.next();
}

// Configure the middleware to run only for specified paths
export const config = {
  matcher: [
    '/api/lens/:path*',
    // Add other API routes that need CSRF protection here
  ],
};
