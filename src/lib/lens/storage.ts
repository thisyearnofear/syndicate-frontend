import { IStorageProvider } from "@lens-protocol/client";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

const MAX_AGE = 30 * 24 * 60 * 60;
const SECURE = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  maxAge: MAX_AGE,
  secure: SECURE, // Only use HTTPS in production
  httpOnly: true, // Prevent JavaScript access
  sameSite: 'strict' as const, // Restrict to same site
  path: '/', // Available on all paths
};

export const cookieStorage: IStorageProvider = {
  async getItem(key: string) {
    const { cookies } = await import("next/headers");
    const value = await getCookie(key, { cookies });

    return value ?? null;
  },
  setItem(key: string, value: string) {
    setCookie(key, value, COOKIE_OPTIONS);
  },

  removeItem(key: string) {
    deleteCookie(key, { 
      ...COOKIE_OPTIONS,
      maxAge: 0 
    });
  },
};

// WARNING: Only use client-side cookies for non-sensitive data.
// Never store authentication tokens or secrets in client-accessible cookies.
export const clientCookieStorage: IStorageProvider = {
  async getItem(key: string) {
    const value = await getCookie(key);

    return value ?? null;
  },
  setItem(key: string, value: string) {
    setCookie(key, value, {
      ...COOKIE_OPTIONS,
      // httpOnly must be false for client-side access
      httpOnly: false
    });
  },

  removeItem(key: string) {
    deleteCookie(key, { 
      ...COOKIE_OPTIONS,
      httpOnly: false,
      maxAge: 0 
    });
  },
};
