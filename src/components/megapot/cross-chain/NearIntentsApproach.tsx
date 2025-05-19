"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Loader2, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { ChainId, CHAINS, getChainName } from "@/lib/cross-chain/config";

interface NearIntentsApproachProps {
  sourceChainId: ChainId;
  destinationChainId: ChainId;
}

/**
 * NearIntentsApproach component that demonstrates the NEAR Intents approach
 * for cross-chain ticket purchases
 */
export function NearIntentsApproach({ 
  sourceChainId, 
  destinationChainId 
}: NearIntentsApproachProps) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState<string>("1");
  const [syndicateId, setSyndicateId] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [intentId, setIntentId] = useState<string | null>(null);
  const [intentStatus, setIntentStatus] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Handle the intent submission
  const handleSubmitIntent = async () => {
    if (!isConnected) {
      setError(new Error("Please connect your wallet first"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate intent submission for demo purposes
      setTimeout(() => {
        setIsLoading(false);
        setIsPending(true);
        
        // Simulate intent confirmation
        setTimeout(() => {
          const mockIntentId = "0x" + Math.random().toString(16).slice(2);
          setIntentId(mockIntentId);
          setIntentStatus("submitted");
          setIsPending(false);
          
          // Simulate intent processing
          setTimeout(() => {
            setIntentStatus("processing");
            
            // Simulate intent completion
            setTimeout(() => {
              setIntentStatus("executed");
            }, 2000);
          }, 1500);
        }, 1000);
      }, 800);
    } catch (err) {
      console.error("Intent submission error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      setIsPending(false);
    }
  };

  // Render intent status
  const renderStatus = () => {
    if (intentId) {
      return (
        <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/20">
          <div className="flex items-center gap-2">
            {intentStatus === "executed" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : intentStatus === "failed" ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            )}
            <span className="text-sm font-medium">
              {intentStatus === "executed"
                ? "Intent executed successfully"
                : intentStatus === "failed"
                ? "Intent execution failed"
                : intentStatus === "processing"
                ? "Intent is being processed..."
                : "Intent submitted successfully"}
            </span>
          </div>
          {intentId && (
            <div className="mt-2 text-xs font-mono bg-black/40 p-2 rounded border border-white/10 break-all">
              Intent ID: {intentId}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-semibold mb-4">NEAR Intents</h3>
        
        <p className="text-sm text-white/70 mb-4">
          This advanced approach is inspired by NEAR's intent-based architecture. Users submit an "intent" 
          (e.g., "join syndicate with 10 GHO"), and resolver contracts determine the optimal execution path 
          across chains, providing the best user experience with a single transaction.
        </p>
        
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg border border-purple-500/20 mb-6">
          <h4 className="text-sm font-semibold text-purple-300 mb-2">What are Intents?</h4>
          <p className="text-xs text-white/70">
            Intents are declarations of what you want to accomplish, without specifying the exact execution path.
            The system handles all the complexity of cross-chain operations for you in a single transaction.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mt-6">
          <div className="bg-black/30 p-3 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">Intent Type</span>
              <span className="text-sm font-medium text-cyan-400">
                BUY_TICKET (2)
              </span>
            </div>
            <div className="p-3 bg-black/50 rounded-lg border border-white/20">
              <div className="text-xs text-white/80">
                "I want to buy lottery tickets for my syndicate using GHO tokens"
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 p-3 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">Syndicate ID</span>
              <span className="text-sm font-medium text-cyan-400">
                {getChainName(sourceChainId)}
              </span>
            </div>
            <Input
              type="text"
              value={syndicateId}
              onChange={(e) => setSyndicateId(e.target.value)}
              placeholder="Syndicate ID"
              disabled={isLoading || isPending}
              className="bg-black/50 border-white/20"
            />
          </div>
          
          <div className="bg-black/30 p-3 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">Amount</span>
              <span className="text-sm font-medium text-cyan-400">
                GHO Token
              </span>
            </div>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount in GHO"
              min="0.01"
              step="0.01"
              disabled={isLoading || isPending}
              className="bg-black/50 border-white/20"
            />
          </div>
        </div>
        
        <Button
          onClick={handleSubmitIntent}
          disabled={!isConnected || isLoading || isPending}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600"
        >
          {isLoading || isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isPending ? "Confirming..." : "Preparing..."}
            </>
          ) : (
            "Submit Intent"
          )}
        </Button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-900/30 text-red-300 rounded-lg text-sm border border-red-500/30">
            {error.message}
          </div>
        )}
        
        {renderStatus()}
      </div>
      
      <div className="text-xs text-white/50 p-3 bg-black/20 rounded-lg border border-white/10">
        <p className="font-medium mb-1">Implementation Details:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>SyndicateIntentResolver: 0x21F6514fdabaD6aB9cB227ddE69A1c34C9cF9014 (Lens)</li>
          <li>BaseChainIntentResolver: 0xecF8095577EA91cFd1aBe6f59Aaad597622a9Fd3 (Base)</li>
          <li>Across SpokePool: 0xe7cb3e167e7475dE1331Cf6E0CEb187654619E12 (Lens)</li>
          <li>Off-chain relayer monitors and facilitates cross-chain operations</li>
        </ul>
      </div>
    </div>
  );
}
