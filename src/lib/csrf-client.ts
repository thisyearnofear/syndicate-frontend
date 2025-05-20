// Utility to get CSRF token from cookie and set it in request headers
import { CSRF_HEADER } from "./csrf";

export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  try {
    const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
    const token = match ? decodeURIComponent(match[1]) : null;

    // Log token presence for debugging (not the actual token value for security)
    console.log(`CSRF token ${token ? 'found' : 'not found'} in cookie`);

    return token;
  } catch (error) {
    console.error('Error retrieving CSRF token from cookie:', error);
    return null;
  }
}

export function withCsrf(headers: HeadersInit = {}): HeadersInit {
  const token = getCsrfTokenFromCookie();
  if (token) {
    return { ...headers, [CSRF_HEADER]: token };
  }
  return headers;
}
