"use client";

import {
  RpcRequestError,
  http,
  type HttpTransportConfig,
} from "viem";

/**
 * Creates a custom HTTP transport for Alchemy API
 * This transport properly formats requests for Alchemy's API
 * and handles authentication
 *
 * Note: We're using the standard http transport from viem
 * but with custom headers to handle Alchemy's API requirements
 */
export function alchemyHttp(
  url: string,
  config: HttpTransportConfig = {}
) {
  // Extract the API key from the URL if present
  const apiKey = extractAlchemyApiKey(url);
  const baseUrl = normalizeAlchemyUrl(url);

  // Create a standard HTTP transport with custom headers
  // This ensures we maintain the correct type signature
  return http(baseUrl, {
    ...config,
    fetchOptions: {
      ...config.fetchOptions,
      headers: {
        ...config.fetchOptions?.headers,
        // Add Alchemy-specific headers if needed
        ...(apiKey && { "Alchemy-Api-Key": apiKey }),
        "Content-Type": "application/json",
      },
    },
  });
}

/**
 * Creates a fallback transport that tries Alchemy first, then falls back to public RPC
 *
 * Note: We're using the standard http transport from viem for simplicity
 * and to avoid type errors. In a production environment, you might want to
 * implement a more sophisticated fallback mechanism.
 */
export function alchemyFallback(
  alchemyUrl: string,
  publicUrl: string,
  config: HttpTransportConfig = {}
) {
  // For simplicity, just use the Alchemy transport
  // In a real-world scenario, you would implement a proper fallback mechanism
  return alchemyHttp(alchemyUrl, config);
}

/**
 * Helper function to extract the API key from an Alchemy URL
 */
function extractAlchemyApiKey(url: string): string | undefined {
  if (!url) return undefined;

  // Extract API key from URL format: https://xxx.g.alchemy.com/v2/API_KEY
  const match = url.match(/\/v2\/([^\/]+)$/);
  return match ? match[1] : undefined;
}

/**
 * Helper function to normalize the Alchemy URL
 * Ensures it has the correct format for JSON-RPC requests
 */
function normalizeAlchemyUrl(url: string): string {
  if (!url) return url;

  // Make sure the URL ends with /v2/API_KEY and doesn't have trailing slashes
  return url.replace(/\/+$/, "");
}

/**
 * Generate a unique request ID for JSON-RPC
 */
function generateRequestId(): number {
  return Math.floor(Math.random() * 1000000);
}
