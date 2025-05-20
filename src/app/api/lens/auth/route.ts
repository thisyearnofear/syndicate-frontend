import { NextRequest, NextResponse } from "next/server";
import { getAddress } from "viem";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

// Use build-time constants injected by webpack DefinePlugin
const CSRF_COOKIE = process.env.CSRF_COOKIE_NAME || "csrf_token";
const CSRF_HEADER = process.env.CSRF_HEADER_NAME || "x-csrf-token";

// Cookie options defined at build time
const COOKIE_OPTIONS = {
  httpOnly: false, // Hardcoded at build time via DefinePlugin
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  // Get the origin from the request
  const origin = request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://syndicate-lens.vercel.app";

  console.log(`[Lens Auth OPTIONS] Request from origin: ${origin}`);

  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, x-csrf-token",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400", // 24 hours
      },
    }
  );
}

export async function POST(request: NextRequest) {
  console.log(
    `[Lens Auth] Received ${request.method} request from ${request.headers.get(
      "user-agent"
    )}`
  );

  // CSRF Protection has been completely disabled as a temporary solution
  // We'll rely on other security measures like the shared secret for now
  console.log("[Lens Auth] CSRF validation completely disabled");
  
  // Generate a placeholder token just for logging
  const csrfToken = nanoid();
  
  // For future implementation, we'll track this
  console.log("[Lens Auth] Using generated placeholder token for compatibility");

  try {
    // Safely parse JSON with error handling
    let account, signedBy, app, role;
    try {
      // Check if request body is empty first
      const clonedRequest = request.clone();
      const text = await clonedRequest.text();

      console.log(`[Lens Auth] Request body length: ${text.length}`);
      if (!text || text.trim() === "") {
        console.error("[Lens Auth] Empty request body received");
        return NextResponse.json(
          { error: "Empty request body" },
          { status: 400 }
        );
      }

      console.log(
        `[Lens Auth] Request body: ${text.substring(0, 100)}${
          text.length > 100 ? "..." : ""
        }`
      );

      // Parse the JSON from the original request
      const body = JSON.parse(text);
      account = body.account;
      signedBy = body.signedBy;
      app = body.app;
      role = body.role || "accountOwner"; // Default to accountOwner if not specified

      console.log(
        `[Lens Auth] Extracted account: ${account}, signedBy: ${signedBy}, app: ${
          app || "N/A"
        }`
      );
    } catch (error) {
      console.error("[Lens Auth] Error parsing JSON from request:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!account || !signedBy) {
      return NextResponse.json(
        { error: "Missing 'account' or 'signedBy' field" },
        { status: 400 }
      );
    }

    // Ensure addresses are checksummed
    const checksummedAccount = getAddress(account);
    const checksummedSignedBy = getAddress(signedBy);
    const checksummedApp = app ? getAddress(app) : undefined;

    // Get environment variables (these are server-side only)
    const backendUrl = process.env.AUTH_BACKEND_URL || "http://localhost:3003";
    const sharedSecret = process.env.SHARED_SECRET;

    if (!sharedSecret) {
      console.error("[Lens Auth] Missing SHARED_SECRET environment variable");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Forward request to the backend with proper authorization
    try {
      const response = await fetch(`${backendUrl}/authorize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sharedSecret}`,
          // Add CORS headers
          Origin:
            process.env.NEXT_PUBLIC_APP_URL ||
            "https://syndicate-lens.vercel.app",
        },
        body: JSON.stringify({
          account: checksummedAccount,
          signedBy: checksummedSignedBy,
          app: checksummedApp,
          role: role,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch((err) => {
          console.error(`[Lens Auth] Failed to parse error response: ${err}`);
          return {};
        });
        console.error(
          `[Lens Auth] Backend error: ${response.status}`,
          errorData
        );
        return NextResponse.json(
          { error: errorData.error || `Backend error: ${response.status}` },
          { status: response.status }
        );
      }

      // Safely parse the response JSON with error handling
      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error(
          "[Lens Auth] Error parsing JSON from backend response:",
          error
        );
        return NextResponse.json(
          { error: "Error processing backend response" },
          { status: 502 }
        );
      }

      // Get the origin from the request
      const origin = request.headers.get("origin") ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://syndicate-lens.vercel.app";

      console.log(`[Lens Auth] Responding to origin: ${origin}`);

      // Create response with proper CORS headers and set CSRF cookie
      const jsonResponse = NextResponse.json(
        {
          allowed: data.allowed,
          sponsored: data.sponsored,
          ...(data.signingKey && { signingKey: data.signingKey }),
        },
        {
          headers: {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers":
              "Content-Type, Authorization, x-csrf-token",
          },
        }
      );

      // CSRF cookies completely disabled
      console.log(`[Lens Auth] CSRF cookie setting skipped - validation disabled`);

      return jsonResponse;
    } catch (fetchError) {
      console.error("[Lens Auth] Error connecting to backend:", fetchError);
      // Get the origin from the request
      const origin = request.headers.get("origin") ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://syndicate-lens.vercel.app";

      const errorResponse = NextResponse.json(
        { error: "Error connecting to authorization service" },
        {
          status: 503,
          headers: {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
          },
        }
      );

      // Set CSRF cookie even in error response
      errorResponse.cookies.set(CSRF_COOKIE, csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return errorResponse;
    }
  } catch (error) {
    console.error("[Lens Auth] Unhandled error in lens auth API route:", error);
    // Get the origin from the request
    const origin = request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://syndicate-lens.vercel.app";

    const errorResponse = NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );

    // CSRF cookies completely disabled
    console.log(`[Lens Auth Error Response] CSRF cookie setting skipped - validation disabled`);

    return errorResponse;
  }
}
