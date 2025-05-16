// CSRF protection constants for frontend usage
// The backend sets a httpOnly, sameSite cookie named 'csrf_token'.
// For state-changing requests, send the value in the 'x-csrf-token' header.

export const CSRF_COOKIE = 'csrf_token';
export const CSRF_HEADER = 'x-csrf-token';
