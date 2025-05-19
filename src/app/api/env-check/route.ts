import { NextRequest, NextResponse } from "next/server";

/**
 * API route that safely checks if certain environment variables exist
 * without exposing their actual values (for security)
 */
export async function GET(request: NextRequest) {
  // For security, only check existence of sensitive variables, don't return values
  const sensitiveVars = ["AUTH_BACKEND_SECRET", "SHARED_SECRET", "PRIVATE_KEY"];
  const sensitiveCheck = sensitiveVars.reduce((acc, key) => {
    acc[key] = !!process.env[key];
    return acc;
  }, {} as Record<string, boolean>);

  // For public variables, return safe parts of the values
  const publicVars = [
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_ENVIRONMENT",
    "NEXT_PUBLIC_APP_ADDRESS",
    "NEXT_PUBLIC_LENS_MAINNET_RPC_URL",
    "NEXT_PUBLIC_LENS_TESTNET_RPC_URL",
    "NEXT_PUBLIC_BASE_CHAIN_RPC_URL",
    "NEXT_PUBLIC_DECENT_API_KEY",
    "NODE_ENV",
  ];

  const publicValues = publicVars.reduce((acc, key) => {
    const value = process.env[key];

    // For API keys, mask the actual value but show if it exists
    if (key.includes("KEY") || key.includes("SECRET")) {
      acc[key] = value ? "[HIDDEN]" : null;
    } else {
      acc[key] = value || null;
    }

    return acc;
  }, {} as Record<string, string | null>);

  return NextResponse.json({
    ...sensitiveCheck,
    ...publicValues,
    serverTime: new Date().toISOString(),
    nodePlatform: process.platform,
    nodeVersion: process.version,
  });
}
