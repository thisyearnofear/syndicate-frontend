import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Across API base URL
const ACROSS_API_BASE_URL = 'https://app.across.to/api';

/**
 * API route for proxying requests to the Across API
 * This helps avoid CORS issues and allows us to add custom headers
 */
export async function GET(request: NextRequest) {
  try {
    // Get the endpoint and parameters from the request
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'swap/approval';
    
    // Build the URL for the Across API
    const url = `${ACROSS_API_BASE_URL}/${endpoint}`;
    
    // Convert searchParams to a plain object for axios
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        params[key] = value;
      }
    });
    
    console.log(`Proxying request to ${url} with params:`, params);
    
    // Make the request to the Across API
    const response = await axios.get(url, { params });
    
    // Return the response from the Across API
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error proxying request to Across API:', error);
    
    // Return a more detailed error response
    return NextResponse.json(
      { 
        error: error.message,
        details: error.response?.data || 'No additional details',
        status: error.response?.status || 500
      },
      { status: error.response?.status || 500 }
    );
  }
}
