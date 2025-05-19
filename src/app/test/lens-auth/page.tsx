"use client";

import React from "react";
import { LensLoginButton } from "@/components/lens";
import { useLensAuthContext } from "@/components/lens/LensAuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function LensAuthTestPage() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending: isConnectLoading } = useConnect();
  const { disconnect } = useDisconnect();
  const { isAuthenticated, isLoading, authorizeResponse } =
    useLensAuthContext();

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

      <h1 className="text-3xl font-bold mb-8 text-center">
        Lens Protocol Authentication Test
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Connection</CardTitle>
            <CardDescription>
              Connect your wallet to interact with Lens Protocol
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div>
                <div className="mb-4 p-3 bg-slate-800 rounded-md overflow-hidden">
                  <p className="text-sm font-mono break-all">
                    Address: {address}
                  </p>
                </div>
                <Button
                  onClick={() => disconnect()}
                  variant="destructive"
                  className="w-full"
                >
                  Disconnect Wallet
                </Button>
              </div>
            ) : (
              <div>
                {connectors.map((connector) => (
                  <Button
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    disabled={!connector.ready || isConnectLoading}
                    className="w-full mb-2"
                  >
                    Connect with {connector.name}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lens Authentication</CardTitle>
            <CardDescription>
              Connect to Lens Protocol using your wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm mb-2">
                Status:{" "}
                <span
                  className={
                    isAuthenticated ? "text-green-500" : "text-yellow-500"
                  }
                >
                  {isLoading
                    ? "Connecting..."
                    : isAuthenticated
                    ? "Authenticated"
                    : "Not Authenticated"}
                </span>
              </p>

              {isConnected && <LensLoginButton className="w-full mb-4" />}

              {isAuthenticated && authorizeResponse && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">
                    Authorization Details:
                  </p>
                  <div className="p-3 bg-slate-800 rounded-md overflow-auto">
                    <pre className="text-xs font-mono">
                      {JSON.stringify(
                        {
                          allowed: authorizeResponse.allowed,
                          sponsored: authorizeResponse.sponsored,
                          hasSigningKey: !!authorizeResponse.signingKey,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
