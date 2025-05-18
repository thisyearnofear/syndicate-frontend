"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useBox } from '@decent.xyz/box-hooks';
import { Button } from '@/components/ui/inputs/button';
import { Card } from '@/components/ui/data-display/card';
import { Input } from '@/components/ui/inputs/input';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  DESTINATION_CHAIN_ID, 
  MEGAPOT_CONTRACT_ADDRESS, 
  SOURCE_CHAIN_ID,
  getChainName,
  getTokenAddress,
  getTokenDecimals,
  TokenType
} from '@/lib/cross-chain/config';
import { parseUnits } from 'viem';

/**
 * A test component for validating cross-chain transactions using Decent.xyz
 */
export function CrossChainTest() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const sourceTokenType = TokenType.GHO;
  const destinationTokenType = TokenType.USDC;
  
  // Initialize Decent.xyz Box hooks
  const { sendTransaction, estimateGas, getBoxAction } = useBox ? useBox() : { sendTransaction: null, estimateGas: null, getBoxAction: null };

  // Handle test transaction
  const handleTestTransaction = async () => {
    if (!isConnected) {
      console.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate simple test without actual transaction for now
      console.log("Would send cross-chain transaction with amount:", amount);
      console.log("From chain:", getChainName(SOURCE_CHAIN_ID));
      console.log("To chain:", getChainName(DESTINATION_CHAIN_ID));
      
      // Mock success
      setTimeout(() => {
        const mockHash = "0x" + Math.random().toString(16).slice(2, 10) + "...";
        setTxHash(mockHash);
        setTxStatus("processing");
        console.log("Transaction submitted:", mockHash);
      }, 1500);
      
    } catch (err) {
      console.error("Test transaction error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto border border-gray-700 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Cross-Chain Test</h3>
      
      <div className="space-y-4">
        <div>
            <p className="text-sm opacity-70 mb-2">
              This is a test component for cross-chain transactions using Decent.xyz.
              It will attempt to send a transaction from {getChainName(SOURCE_CHAIN_ID)} to {getChainName(DESTINATION_CHAIN_ID)}.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Test Amount (GHO)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0.01, parseFloat(e.target.value) || 0))}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                min="0.01"
                step="0.01"
                disabled={isLoading}
              />
            </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-md p-3 text-sm flex items-start">
            <div className="text-red-500 mr-2">!</div>
            <div>
              <p className="font-medium text-red-400">Transaction Error</p>
              <p className="opacity-70">{error.message}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleTestTransaction}
          disabled={!isConnected || isLoading}
          className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          {isLoading ? "Processing..." : !isConnected ? "Connect Wallet" : "Test Cross-Chain Transaction"}
        </button>

        {txHash && (
          <div className="text-xs text-center opacity-60">
            Transaction: {txHash} {" "}
            <div className="mt-1">
              Status: {txStatus || "Processing"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}