import { NextRequest, NextResponse } from 'next/server';

// Across API base URL
const ACROSS_API_BASE_URL = 'https://across.to/api';
const ACROSS_INTEGRATOR_ID = process.env.NEXT_PUBLIC_ACROSS_INTEGRATOR_ID || '0xdead';
const USE_TESTNET = process.env.NODE_ENV !== 'production';

/**
 * API route for getting available routes from Across
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json(
      { error: 'Missing required parameter: endpoint' },
      { status: 400 }
    );
  }
  
  try {
    // Construct the Across API URL
    const url = new URL(`${ACROSS_API_BASE_URL}/${endpoint}`);
    
    // Add all query parameters except 'endpoint'
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        url.searchParams.set(key, value);
      }
    });
    
    // Add integrator ID if not present
    if (!url.searchParams.has('integratorId')) {
      url.searchParams.set('integratorId', ACROSS_INTEGRATOR_ID);
    }
    
    // Add testnet flag if not present
    if (!url.searchParams.has('useTestnet')) {
      url.searchParams.set('useTestnet', USE_TESTNET.toString());
    }
    
    console.log('Calling Across API:', url.toString());
    
    // Make the request to Across API
    const response = await fetch(url.toString());
    
    // Get the response data
    const data = await response.text();
    
    // If the response is not OK, return an error
    if (!response.ok) {
      console.error('Across API error:', data);
      return NextResponse.json(
        { error: `Across API error: ${response.status}`, details: data },
        { status: response.status }
      );
    }
    
    // Return the successful response
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error in Across API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * API route for posting data to Across API
 */
export async function POST(request: NextRequest) {
  try {
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
    
    // Construct the Across API URL
    const url = `${ACROSS_API_BASE_URL}/${endpoint}`;
    
    // Add integrator ID if not present
    const requestParams = { ...params };
    if (!requestParams.integratorId) {
      requestParams.integratorId = ACROSS_INTEGRATOR_ID;
    }
    
    // Add testnet flag if not present
    if (requestParams.useTestnet === undefined) {
      requestParams.useTestnet = USE_TESTNET;
    }
    
    console.log('Calling Across API:', url);
    console.log('Request params:', JSON.stringify(requestParams));
    
    // Make the request to Across API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestParams),
    });
    
    // Get the response data
    const data = await response.text();
    
    // If the response is not OK, return an error
    if (!response.ok) {
      console.error('Across API error:', data);
      return NextResponse.json(
        { error: `Across API error: ${response.status}`, details: data },
        { status: response.status }
      );
    }
    
    // Return the successful response
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error in Across API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
