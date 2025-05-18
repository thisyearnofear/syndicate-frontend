"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/inputs/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { ArrowLeftIcon, RefreshCwIcon } from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { getPublicClient, getLensClient } from '@/lib/lens/client';
import { lensAuthService } from '@/lib/lens/auth-service';

export default function LensDebugPage() {
  const { isConnected, address } = useAccount();
  const [results, setResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [testToRun, setTestToRun] = useState<string | null>(null);

  const runTest = async (test: string) => {
    setIsLoading(true);
    setTestToRun(test);
    setResults(prev => ({ ...prev, [test]: { status: 'running' } }));
    
    try {
      let result;
      
      switch (test) {
        case 'publicClient':
          result = getPublicClient();
          break;
        case 'lensClient':
          result = await getLensClient();
          break;
        case 'auth':
          if (!address) throw new Error('Wallet not connected');
          result = await lensAuthService.authorize(address, address);
          break;
        case 'backendHealth':
          const baseUrl = process.env.NEXT_PUBLIC_AUTH_BACKEND_URL || 'http://localhost:3003';
          const response = await fetch(`${baseUrl}/`, { 
            method: 'GET',
            mode: 'cors'
          });
          result = await response.json();
          break;
        default:
          throw new Error('Unknown test');
      }
      
      setResults(prev => ({ 
        ...prev, 
        [test]: { 
          status: 'success', 
          data: result,
          time: new Date().toISOString()
        } 
      }));
    } catch (error) {
      console.error(`Test ${test} failed:`, error);
      setResults(prev => ({ 
        ...prev, 
        [test]: { 
          status: 'error', 
          error: error instanceof Error ? error.message : String(error),
          time: new Date().toISOString()
        } 
      }));
    } finally {
      setIsLoading(false);
      setTestToRun(null);
    }
  };

  const formatResult = (result: any) => {
    if (!result) return 'No result';
    
    try {
      // For success cases
      if (result.status === 'success') {
        return (
          <div>
            <div className="text-green-500 text-sm mb-2">
              ✓ Success at {result.time}
            </div>
            <pre className="bg-slate-800 p-3 rounded-md overflow-auto text-xs max-h-60">
              {JSON.stringify(result.data, (key, value) => {
                // Handle sensitive information or circular references
                if (key === 'signingKey') return '[REDACTED]';
                if (typeof value === 'function') return '[Function]';
                return value;
              }, 2)}
            </pre>
          </div>
        );
      }
      
      // For error cases
      if (result.status === 'error') {
        return (
          <div>
            <div className="text-red-500 text-sm mb-2">
              ✗ Failed at {result.time}
            </div>
            <pre className="bg-slate-800 p-3 rounded-md overflow-auto text-xs max-h-60 text-red-400">
              {result.error}
            </pre>
          </div>
        );
      }
      
      // For running state
      if (result.status === 'running') {
        return <div className="text-yellow-500">Running test...</div>;
      }
      
      return <div>Unknown status</div>;
    } catch (e) {
      return <div className="text-red-500">Error formatting result</div>;
    }
  };

  // Structured test definitions
  const tests = [
    { 
      id: 'publicClient', 
      title: 'Get Public Client', 
      description: 'Retrieves the Lens public client instance' 
    },
    { 
      id: 'lensClient', 
      title: 'Get Lens Client', 
      description: 'Attempts to resume a Lens session or gets a public client' 
    },
    { 
      id: 'backendHealth', 
      title: 'Backend Health Check', 
      description: 'Checks if the backend is online and accessible' 
    },
    { 
      id: 'auth', 
      title: 'Authorize with Backend', 
      description: 'Attempts to authorize with the backend service',
      requiresWallet: true
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Lens Protocol Debug Utility</h1>
        <p className="text-center text-muted-foreground">
          Run tests to diagnose Lens Protocol integration issues
        </p>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Status</CardTitle>
            <CardDescription>Current wallet connection status</CardDescription>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="p-3 bg-green-900/20 text-green-400 rounded-md">
                <p className="font-medium mb-1">✓ Wallet Connected</p>
                <p className="text-sm font-mono break-all">{address}</p>
              </div>
            ) : (
              <div className="p-3 bg-yellow-900/20 text-yellow-400 rounded-md">
                <p>⚠ Wallet Not Connected</p>
                <p className="text-sm mt-1">Connect your wallet to run all tests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <h2 className="text-xl font-semibold mb-2">Available Tests</h2>
        
        {tests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <CardTitle>{test.title}</CardTitle>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <Button 
                  onClick={() => runTest(test.id)}
                  disabled={isLoading || (test.requiresWallet && !isConnected)}
                  className="w-full"
                >
                  {isLoading && testToRun === test.id ? (
                    <>
                      <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                      Running Test...
                    </>
                  ) : (
                    <>Run Test</>
                  )}
                </Button>
                
                {results[test.id] && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Result:</h3>
                    {formatResult(results[test.id])}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Debug information will be shown in your browser console</p>
      </div>
    </div>
  );
}