import { NextRequest, NextResponse } from "next/server";
import { getAddress } from "viem";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin":
          process.env.NEXT_PUBLIC_APP_URL ||
          "https://syndicate-lens.vercel.app",
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

  // CSRF Protection
  const cookieStore = await cookies();
  let csrfToken = cookieStore.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);

  // If no CSRF token in cookie, generate one
  if (!csrfToken) {
    csrfToken = nanoid();
  }

  // In production, validate CSRF token
  if (process.env.NODE_ENV === "production") {
    if (!headerToken || headerToken !== csrfToken) {
      console.error("[Lens Auth] CSRF token validation failed");
      const response = NextResponse.json(
        { error: "Invalid CSRF token" },
        {
          status: 403,
          headers: {
            "Access-Control-Allow-Origin":
              process.env.NEXT_PUBLIC_APP_URL ||
              "https://syndicate-lens.vercel.app",
            "Access-Control-Allow-Credentials": "true",
          },
        }
      );

      // Set new CSRF token in response
      response.cookies.set(CSRF_COOKIE, csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return response;
    }
  }

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

      // Create response with proper CORS headers and set CSRF cookie
      const jsonResponse = NextResponse.json(
        {
          allowed: data.allowed,
          sponsored: data.sponsored,
          ...(data.signingKey && { signingKey: data.signingKey }),
        },
        {
          headers: {
            "Access-Control-Allow-Origin":
              process.env.NEXT_PUBLIC_APP_URL ||
              "https://syndicate-lens.vercel.app",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers":
              "Content-Type, Authorization, x-csrf-token",
          },
        }
      );

      // Set CSRF cookie in response
      jsonResponse.cookies.set(CSRF_COOKIE, csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return jsonResponse;
    } catch (fetchError) {
      console.error("[Lens Auth] Error connecting to backend:", fetchError);
      const errorResponse = NextResponse.json(
        { error: "Error connecting to authorization service" },
        {
          status: 503,
          headers: {
            "Access-Control-Allow-Origin":
              process.env.NEXT_PUBLIC_APP_URL ||
              "https://syndicate-lens.vercel.app",
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
    const errorResponse = NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin":
            process.env.NEXT_PUBLIC_APP_URL ||
            "https://syndicate-lens.vercel.app",
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
}
