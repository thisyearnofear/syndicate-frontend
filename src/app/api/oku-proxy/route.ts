import { NextRequest, NextResponse } from "next/server";

const OKU_API_BASE_URL = "https://api.oku.trade/api";

/**
 * Proxy route for Oku API requests to avoid CORS and DNS resolution issues in production
 */
export async function POST(request: NextRequest) {
  try {
    // Get the path from the query string (e.g., ?path=v1/pools/top)
    const url = new URL(request.url);
    const path = url.searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
    }

    console.log(`[Oku Proxy] Forwarding request to: ${OKU_API_BASE_URL}/${path}`);
    
    // Clone the request and forward it to Oku API
    const body = await request.json().catch(() => ({}));
    console.log(`[Oku Proxy] Request body:`, body);
    
    // Make the request to the Oku API
    const okuResponse = await fetch(`${OKU_API_BASE_URL}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // If the Oku API returns an error, forward it
    if (!okuResponse.ok) {
      console.error(`[Oku Proxy] Error from Oku API: ${okuResponse.status}`);
      const errorData = await okuResponse.json().catch(() => ({ error: "Unknown error" }));
      return NextResponse.json(errorData, { status: okuResponse.status });
    }

    // Forward the successful response
    const data = await okuResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Oku Proxy] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
