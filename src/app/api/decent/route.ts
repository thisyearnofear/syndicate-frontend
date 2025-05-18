import { NextRequest, NextResponse } from 'next/server';

// Using the public API key for now (less secure but works)
const DECENT_API_KEY = process.env.NEXT_PUBLIC_DECENT_API_KEY;
console.log('API Key available in route handler:', !!DECENT_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Validate that the API key exists
    if (!DECENT_API_KEY) {
      return NextResponse.json(
        { error: 'Decent API key not configured on server' },
        { status: 500 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { endpoint, params } = body;

    // Validate required parameters
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing required parameter: endpoint' },
        { status: 400 }
      );
    }

    // Construct the Decent API URL
    const baseUrl = 'https://box-v4.api.decent.xyz/api';
    const url = new URL(`${baseUrl}/${endpoint}`);

    // Add query parameters if provided
    if (params) {
      if (typeof params === 'object') {
        // Convert BigInt to string for JSON serialization
        const serializedParams = JSON.stringify(params, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        );
        console.log('Serialized params:', serializedParams);
        url.searchParams.set('arguments', serializedParams);
      } else if (typeof params === 'string') {
        console.log('String params:', params);
        url.searchParams.set('arguments', params);
      }
    }

    console.log('Calling Decent API:', url.toString());

    // Make the request to Decent API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': DECENT_API_KEY,
      },
    });

    // Get the response data
    const data = await response.text();

    // If the response is not OK, return an error
    if (!response.ok) {
      console.error('Decent API error:', data);
      return NextResponse.json(
        { error: `Decent API error: ${response.status}`, details: data },
        { status: response.status }
      );
    }

    // Return the successful response
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in Decent API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chainId = searchParams.get('chainId');
  const txHash = searchParams.get('txHash');

  if (!chainId || !txHash) {
    return NextResponse.json(
      { error: 'Missing required parameters: chainId and txHash' },
      { status: 400 }
    );
  }

  if (!DECENT_API_KEY) {
    return NextResponse.json(
      { error: 'Decent API key not configured on server' },
      { status: 500 }
    );
  }

  try {
    console.log(`Checking transaction status for chainId: ${chainId}, txHash: ${txHash}`);

    const statusUrl = `https://api.decentscan.xyz/getStatus?chainId=${chainId}&txHash=${txHash}`;
    console.log('Calling Decent status API:', statusUrl);

    const response = await fetch(
      statusUrl,
      {
        headers: {
          'x-api-key': DECENT_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Status API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
