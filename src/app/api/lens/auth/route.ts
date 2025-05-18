import { NextRequest, NextResponse } from 'next/server';
import { getAddress } from 'viem';

export async function POST(request: NextRequest) {
  try {
    // Safely parse JSON with error handling
    let account, signedBy;
    try {
      const body = await request.json();
      account = body.account;
      signedBy = body.signedBy;
    } catch (error) {
      console.error('Error parsing JSON from request:', error);
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

    // Get environment variables (these are server-side only)
    const backendUrl = process.env.AUTH_BACKEND_URL || 'http://localhost:3003';
    const sharedSecret = process.env.SHARED_SECRET;

    if (!sharedSecret) {
      console.error('Missing SHARED_SECRET environment variable');
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Forward request to the backend with proper authorization
    const response = await fetch(`${backendUrl}/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sharedSecret}`
      },
      body: JSON.stringify({
        account: checksummedAccount,
        signedBy: checksummedSignedBy
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
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
      console.error('Error parsing JSON from backend response:', error);
      return NextResponse.json(
        { error: 'Error processing backend response' },
        { status: 502 }
      );
    }
    
    return NextResponse.json({
      allowed: data.allowed,
      sponsored: data.sponsored,
      // Only include signingKey if needed, typically should be handled server-side
      ...(data.signingKey && { signingKey: data.signingKey })
    });
  } catch (error) {
    console.error('Error in lens auth API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}