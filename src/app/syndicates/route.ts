import { NextResponse } from "next/server";

// This handles server-side requests to /syndicates, including prefetching
export function GET() {
  // Redirect to /explore
  return NextResponse.redirect(
    new URL(
      "/explore",
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    )
  );
}
