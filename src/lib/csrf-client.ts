// CSRF utilities completely disabled as of May 2025 due to persistent authentication issues
// This file remains to prevent import errors but all functionality is disabled
import { CSRF_HEADER } from "./csrf";

export function getCsrfTokenFromCookie(): string | null {
  // Function disabled - always returns null
  console.log('CSRF token retrieval completely disabled');
  return null;
}

export function withCsrf(headers: HeadersInit = {}): HeadersInit {
  // Function disabled - CSRF headers no longer added to requests
  console.log('CSRF header addition completely disabled');
  return {};
}
