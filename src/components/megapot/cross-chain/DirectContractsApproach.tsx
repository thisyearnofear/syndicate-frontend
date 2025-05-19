"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Loader2, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { ChainId, CHAINS, getChainName } from "@/lib/cross-chain/config";

interface DirectContractsApproachProps {
  sourceChainId: ChainId;
  destinationChainId: ChainId;
}

/**
 * DirectContractsApproach component that demonstrates the Syndicate Smart Contracts approach
 * for cross-chain ticket purchases
 */
export function DirectContractsApproach({ 
  sourceChainId, 
  destinationChainId 
}: DirectContractsApproachProps) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState<string>("1");
  const [syndicateId, setSyndicateId] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Handle the contract interaction
  const handleContractInteraction = async () => {
    if (!isConnected) {
      setError(new Error("Please connect your wallet first"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate transaction for demo purposes
      setTimeout(() => {
        setIsLoading(false);
        setIsPending(true);
        
        // Simulate transaction confirmation
        setTimeout(() => {
          const mockHash = "0x" + Math.random().toString(16).slice(2) + "...";
          setTxHash(mockHash);
          setTxStatus("processing");
          setIsPending(false);
          
          // Simulate transaction completion
          setTimeout(() => {
            setTxStatus("executed");
          }, 2000);
        }, 1500);
      }, 1000);
    } catch (err) {
      console.error("Contract interaction error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      setIsPending(false);
    }
  };

  // Render transaction status
  const renderStatus = () => {
    if (txHash) {
      return (
        <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/20">
          <div className="flex items-center gap-2">
            {txStatus === "executed" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : txStatus === "failed" ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            )}
            <span className="text-sm font-medium">
              {txStatus === "executed"
                ? "Transaction completed successfully"
                : txStatus === "failed"
                ? "Transaction failed"
                : "Transaction in progress..."}
            </span>
          </div>
          {txHash && (
            <div className="mt-2 text-xs font-mono bg-black/40 p-2 rounded border border-white/10 break-all">
              {txHash}
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
        <h3 className="text-lg font-semibold mb-4">Syndicate Smart Contracts</h3>
        
        <p className="text-sm text-white/70 mb-4">
          This approach uses custom smart contracts on both chains. Users contribute to SyndicateTreasury 
          contracts on Lens Chain, which handle cross-chain operations via bridges to Base Chain for 
          ticket purchases.
        </p>
        
        <div className="grid grid-cols-1 gap-4 mt-6">
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
            <div className="mt-2 text-xs text-white/60">
              Enter the ID of the syndicate you want to join
            </div>
          </div>
          
          <div className="bg-black/30 p-3 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">Contribution Amount</span>
              <span className="text-sm font-medium text-cyan-400">
                GHO Token
              </span>
            </div>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount to contribute"
              min="0.01"
              step="0.01"
              disabled={isLoading || isPending}
              className="bg-black/50 border-white/20"
            />
            <div className="mt-2 text-xs text-white/60">
              Your contribution will be used to purchase tickets on {getChainName(destinationChainId)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center my-4">
          <div className="flex flex-col items-center">
            <ArrowRight className="h-5 w-5 text-white/50 rotate-90" />
            <span className="text-xs text-white/50 mt-1">Cross-Chain Bridge</span>
          </div>
        </div>
        
        <div className="bg-black/30 p-3 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/80">Result</span>
            <span className="text-sm font-medium text-cyan-400">
              {getChainName(destinationChainId)}
            </span>
          </div>
          <div className="p-3 bg-black/50 rounded-lg border border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/80">
                Tickets to purchase:
              </span>
              <span className="text-sm font-bold text-white">
                {Math.floor(parseFloat(amount))} tickets
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-white/60">
            Tickets will be registered to your syndicate
          </div>
        </div>
        
        <Button
          onClick={handleContractInteraction}
          disabled={!isConnected || isLoading || isPending}
          className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600"
        >
          {isLoading || isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isPending ? "Confirming..." : "Preparing..."}
            </>
          ) : (
            "Contribute & Purchase Tickets"
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
          <li>SyndicateRegistry: 0x399f080bB2868371D7a0024a28c92fc63C05536E (Lens)</li>
          <li>SyndicateFactory: 0x4996089d644d023F02Bf891E98a00b143201f133 (Lens)</li>
          <li>TicketRegistry: 0x86e2d8A3eAcfa89295a75116e9489f07CFBd198B (Base)</li>
          <li>CrossChainResolver: 0x07B73B99fbB0F82f981A5954A7f3Fd72Ce391c2F (Base)</li>
        </ul>
      </div>
    </div>
  );
}
