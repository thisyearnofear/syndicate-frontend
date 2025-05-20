"use client";

import {
  HttpTransport,
  RpcRequestError,
  createTransport,
  http,
  type HttpTransportConfig,
  type Transport,
} from "viem";

/**
 * Creates a custom HTTP transport for Alchemy API
 * This transport properly formats requests for Alchemy's API
 * and handles authentication
 */
export function alchemyHttp(
  url: string,
  config: HttpTransportConfig = {}
): HttpTransport {
  // Extract the API key from the URL if present
  const apiKey = extractAlchemyApiKey(url);
  const baseUrl = normalizeAlchemyUrl(url);
  
  // Create a standard HTTP transport as the base
  const transport = http(baseUrl, {
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

  // Return a modified transport that properly formats Alchemy requests
  return createTransport({
    key: "alchemy",
    name: "Alchemy JSON-RPC",
    request: async ({ method, params }) => {
      try {
        // Format the request body according to Alchemy's requirements
        const body = {
          jsonrpc: "2.0",
          id: generateRequestId(),
          method,
          params: Array.isArray(params) ? params : params ? [params] : [],
        };

        // Use the standard transport but with our custom body format
        return await transport.request({
          method,
          params,
          body: JSON.stringify(body),
        });
      } catch (error) {
        // Enhance error messages for Alchemy-specific errors
        if (error instanceof RpcRequestError) {
          const message = error.message || "";
          if (message.includes("API key")) {
            throw new Error(
              `Alchemy API key error: ${message}. Please check your API key.`
            );
          } else if (message.includes("rate limit")) {
            throw new Error(
              `Alchemy rate limit exceeded: ${message}. Consider upgrading your plan.`
            );
          }
        }
        throw error;
      }
    },
    type: "http",
  });
}

/**
 * Creates a fallback transport that tries Alchemy first, then falls back to public RPC
 */
export function alchemyFallback(
  alchemyUrl: string,
  publicUrl: string,
  config: HttpTransportConfig = {}
): Transport {
  const alchemyTransport = alchemyHttp(alchemyUrl, config);
  const publicTransport = http(publicUrl, config);

  return createTransport({
    key: "alchemyFallback",
    name: "Alchemy with Public Fallback",
    request: async ({ method, params }) => {
      try {
        // Try Alchemy first
        return await alchemyTransport.request({ method, params });
      } catch (error) {
        console.warn(
          `Alchemy request failed, falling back to public RPC: ${error}`
        );
        // Fall back to public RPC
        return await publicTransport.request({ method, params });
      }
    },
    type: "http",
  });
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
