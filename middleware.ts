import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// Use build-time constants for CSRF configuration
const CSRF_COOKIE = process.env.CSRF_COOKIE_NAME || 'csrf_token';
const CSRF_HEADER = process.env.CSRF_HEADER_NAME || 'x-csrf-token';

// This middleware runs on every request
export function middleware(request: NextRequest) {
  // CSRF protection completely disabled for now due to persistent authentication issues
  // If you want to re-enable CSRF protection in the future, uncomment the block below
  /*
  if (request.nextUrl.pathname.startsWith('/api/lens/auth')) {
    const response = NextResponse.next();
    let csrfToken = request.cookies.get(CSRF_COOKIE)?.value;

    // If no CSRF token in cookie or it's a fresh session, generate one
    if (!csrfToken) {
      csrfToken = nanoid();
      
      // Set the CSRF token in the response cookie using build-time constants
      response.cookies.set(CSRF_COOKIE, csrfToken, {
        httpOnly: false, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      
      console.log(`[Middleware] Set new CSRF token in cookie: ${csrfToken.substring(0, 5)}...`);
    } else {
      console.log(`[Middleware] Using existing CSRF token: ${csrfToken.substring(0, 5)}...`);
    }

    return response;
  }
  */
  
  // Log that CSRF protection is disabled
  if (request.nextUrl.pathname.startsWith('/api/lens/auth')) {
    console.log('[Middleware] CSRF protection is DISABLED for Lens authentication');
  }
  
  // For all routes, just continue without CSRF validation
  return NextResponse.next();
}

// Configure the middleware to run only for specified paths
export const config = {
  matcher: [
    // Lens auth paths have been removed to completely disable CSRF for them
    // '/api/lens/:path*',  // Commented out to disable CSRF for Lens
    
    // You can add other API routes that need CSRF protection here
    // but note that CSRF logic is currently completely disabled
  ],
};
