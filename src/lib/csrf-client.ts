// Utility to get CSRF token from cookie and set it in request headers
import { CSRF_HEADER } from "./csrf";

export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function withCsrf(headers: HeadersInit = {}): HeadersInit {
  const token = getCsrfTokenFromCookie();
  if (token) {
    return { ...headers, [CSRF_HEADER]: token };
  }
  return headers;
}
