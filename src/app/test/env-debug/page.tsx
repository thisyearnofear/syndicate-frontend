"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/inputs/button';
import Link from 'next/link';
import { ArrowLeftIcon, RefreshCwIcon } from 'lucide-react';

export default function EnvDebugPage() {
  const [envVars, setEnvVars] = useState<{[key: string]: string | undefined}>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to safely check if an environment variable is defined
  const checkEnvVar = (name: string): [string, string, boolean] => {
    // The value will always be a string or undefined in the browser
    const value = process.env[`NEXT_PUBLIC_${name}`];
    const status = value ? "✅ Available" : "❌ Missing";
    const isDefined = !!value;
    
    // Return masked value for sensitive values
    if (name.includes('SECRET') || name.includes('KEY')) {
      return [name, status, isDefined];
    }
    
    return [name, value || "Not defined", isDefined];
  };

  const fetchEnvVars = async () => {
    setIsLoading(true);
    try {
      // Client-side environment variables
      const vars: {[key: string]: string | undefined} = {};
      
      // Check common Lens-related variables
      const environmentVars = [
        'AUTH_BACKEND_URL',
        'AUTH_BACKEND_SECRET',
        'NEXT_PUBLIC_AUTH_BACKEND_URL',
        'NEXT_PUBLIC_AUTH_BACKEND_SECRET',
        'SHARED_SECRET',
        'NEXT_PUBLIC_APP_ADDRESS',
        'NEXT_PUBLIC_ENVIRONMENT',
        'NEXT_PUBLIC_APP_URL',
        'NEXT_PUBLIC_DECENT_API_KEY',
        'NEXT_PUBLIC_LENS_CHAIN_RPC_URL',
        'NEXT_PUBLIC_BASE_CHAIN_RPC_URL'
      ];

      // Process each environment variable
      environmentVars.forEach(varName => {
        const publicVarName = varName.startsWith('NEXT_PUBLIC_') 
          ? varName 
          : `NEXT_PUBLIC_${varName}`;
        vars[varName] = process.env[publicVarName];
      });

      // Check API route for private variables (only presence check)
      const response = await fetch('/api/env-check');
      if (response.ok) {
        const data = await response.json();
        Object.keys(data).forEach(key => {
          vars[key] = data[key] ? "✅ Available on server" : "❌ Missing on server";
        });
      }

      setEnvVars(vars);
    } catch (error) {
      console.error('Error fetching environment variables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvVars();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center">Environment Variables Debug</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Client-Side Environment</CardTitle>
          <CardDescription>
            Variables available in the browser (must have NEXT_PUBLIC_ prefix)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button 
              onClick={fetchEnvVars} 
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border px-4 py-2 text-left">Variable Name</th>
                  <th className="border px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(envVars).map(([key, value]) => (
                  <tr key={key} className="border-b">
                    <td className="border px-4 py-2 font-mono text-sm">{key}</td>
                    <td className={`border px-4 py-2 ${value?.includes('✅') ? 'text-green-500' : value?.includes('❌') ? 'text-red-500' : ''}`}>
                      {value || 'Not defined'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-md mb-8">
        <h2 className="text-lg font-semibold mb-2">Important Notes</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <span className="font-medium">NEXT_PUBLIC_</span> variables are exposed to the browser 
            and should <span className="font-bold">never</span> contain secrets
          </li>
          <li>
            Server-side variables (without NEXT_PUBLIC_ prefix) are not visible here
            but can be checked for existence via the API
          </li>
          <li>
            For security, actual values of secrets are not shown, only whether they exist
          </li>
          <li>
            After changing environment variables, you need to restart the Next.js server
          </li>
        </ul>
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>This tool is for debugging purposes only and should not be deployed to production.</p>
      </div>
    </div>
  );
}