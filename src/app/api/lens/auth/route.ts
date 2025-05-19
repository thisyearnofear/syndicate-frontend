import { NextRequest, NextResponse } from "next/server";
import { getAddress } from "viem";

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
  console.log(
    `[Lens Auth] Content-Type: ${request.headers.get("content-type")}`
  );
  console.log(
    `[Lens Auth] Content-Length: ${request.headers.get("content-length")}`
  );

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
        `[Lens Auth] Extracted account: ${account}, signedBy: ${signedBy}, app: ${app}, role: ${role}`
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

    console.log(
      `[Lens Auth] Checksummed addresses - account: ${checksummedAccount}, signedBy: ${checksummedSignedBy}, app: ${checksummedApp}`
    );

    // Get environment variables (these are server-side only)
    const backendUrl = process.env.AUTH_BACKEND_URL || "http://localhost:8080";
    const sharedSecret = process.env.SHARED_SECRET;

    console.log(`[Lens Auth] Using backend URL: ${backendUrl}`);

    if (!sharedSecret) {
      console.error("[Lens Auth] Missing SHARED_SECRET environment variable");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Forward request to the backend with proper authorization
    console.log(
      `[Lens Auth] Forwarding request to backend at ${backendUrl}/authorize`
    );

    try {
      const response = await fetch(`${backendUrl}/authorize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sharedSecret}`,
        },
        body: JSON.stringify({
          account: checksummedAccount,
          signedBy: checksummedSignedBy,
          app: checksummedApp,
          role: role,
        }),
      });

      console.log(`[Lens Auth] Backend response status: ${response.status}`);

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
        console.log(`[Lens Auth] Backend response data:`, {
          allowed: data.allowed,
          sponsored: data.sponsored,
          hasSigningKey: !!data.signingKey, // Updated to use signingKey instead of appVerificationEndpoint
        });
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

      const jsonResponse = NextResponse.json({
        allowed: data.allowed,
        sponsored: data.sponsored,
        // Include signingKey for the new app verification approach
        ...(data.signingKey && { signingKey: data.signingKey }),
      });

      // Add CORS headers to the response
      jsonResponse.headers.set("Access-Control-Allow-Origin", "*");
      return jsonResponse;
    } catch (fetchError) {
      console.error("[Lens Auth] Error connecting to backend:", fetchError);
      const errorResponse = NextResponse.json(
        { error: "Error connecting to authorization service" },
        { status: 503 }
      );
      errorResponse.headers.set("Access-Control-Allow-Origin", "*");
      return errorResponse;
    }
  } catch (error) {
    console.error("[Lens Auth] Unhandled error in lens auth API route:", error);
    const errorResponse = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    return errorResponse;
  }
}
