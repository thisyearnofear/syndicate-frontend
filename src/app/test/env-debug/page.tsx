"use client";

import { useEffect, useState } from "react";

export default function EnvDebugPage() {
  const [windowEnv, setWindowEnv] = useState<Record<string, any>>({});
  const [processEnv, setProcessEnv] = useState<Record<string, any>>({});

  useEffect(() => {
    // Capture window.__ENV if it exists
    if (typeof window !== "undefined") {
      const envFromWindow = (window as any).__ENV || {};
      setWindowEnv(envFromWindow);
    }

    // Direct process.env access
    const env: Record<string, any> = {};
    // List all expected environment variables
    const envVars = [
      "NEXT_PUBLIC_APP_URL",
      "NEXT_PUBLIC_ENVIRONMENT",
      "NEXT_PUBLIC_LENS_MAINNET_RPC_URL",
      "NEXT_PUBLIC_LENS_TESTNET_RPC_URL",
      "NEXT_PUBLIC_BASE_CHAIN_RPC_URL",
      "NEXT_PUBLIC_APP_ADDRESS",
      "NEXT_PUBLIC_DECENT_API_KEY",
    ];

    envVars.forEach((key) => {
      env[key] = process.env[key] || "not set";
    });

    setProcessEnv(env);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Environment Debug</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">
            Runtime process.env Values
          </h2>
          <pre className="text-sm bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-x-auto">
            {JSON.stringify(processEnv, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Window.__ENV Values</h2>
          <pre className="text-sm bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-x-auto">
            {JSON.stringify(windowEnv, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Direct Runtime Check</h2>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(processEnv).map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col sm:flex-row sm:items-center"
            >
              <span className="font-mono text-sm sm:w-96">{key}:</span>
              <span className="ml-2 text-sm font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">
                {typeof value === "string" ? value : JSON.stringify(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <p>
          Visit{" "}
          <a href="/api/env-check" className="text-blue-500 underline">
            /api/env-check
          </a>{" "}
          to see server-side environment variables.
        </p>
      </div>
    </div>
  );
}
