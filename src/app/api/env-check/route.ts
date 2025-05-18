import { NextRequest, NextResponse } from 'next/server';

/**
 * API route that safely checks if certain environment variables exist
 * without exposing their actual values (for security)
 */
export async function GET(request: NextRequest) {
  // List of server-side environment variables to check
  const privateEnvVars = [
    'AUTH_BACKEND_URL',
    'SHARED_SECRET',
    'PRIVATE_KEY'
  ];

  // Create an object with environment variables presence (true/false)
  // without exposing the actual values
  const result: Record<string, boolean> = {};
  
  privateEnvVars.forEach(varName => {
    result[varName] = typeof process.env[varName] === 'string' && 
                     process.env[varName]!.length > 0;
  });

  return NextResponse.json(result);
}