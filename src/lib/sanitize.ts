// Utility for sanitizing user-generated HTML to prevent XSS attacks
// Usage: import { sanitize } from './sanitize';
import DOMPurify from 'dompurify';

export function sanitize(dirty: string): string {
  return DOMPurify.sanitize(dirty);
}
