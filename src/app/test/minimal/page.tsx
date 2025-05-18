"use client";

import React, { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseUnits } from "viem";
import {
  ChainId,
  getChainName,
  getTokenDecimals,
  TokenType,
  MEGAPOT_CONTRACT_ADDRESS,
  SYNDICATE_REGISTRY_ADDRESS,
  DEFAULT_REFERRER_ADDRESS,
  GHO_ADDRESS_LENS,
  USDC_ADDRESS_BASE,
} from "@/lib/cross-chain/config";
import { toast } from "sonner";

// Define mainnet chain IDs
const SOURCE_CHAIN_ID = ChainId.LENS; // Lens Mainnet (13337)
const DESTINATION_CHAIN_ID = ChainId.BASE; // Base Mainnet (8453)

// Direct integration with Decent.xyz
export default function MinimalTestPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [amount, setAmount] = useState<number>(1);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Log configuration for debugging
  useEffect(() => {
    console.log("Source Chain ID:", SOURCE_CHAIN_ID);
    console.log("Destination Chain ID:", DESTINATION_CHAIN_ID);
    console.log(
      "Source Chain Name:",
      getChainName(SOURCE_CHAIN_ID) || "Lens Mainnet"
    );
    console.log(
      "Destination Chain Name:",
      getChainName(DESTINATION_CHAIN_ID) || "Base Mainnet"
    );
    console.log("GHO Address:", GHO_ADDRESS_LENS);
    console.log("USDC Address:", USDC_ADDRESS_BASE);
    console.log(
      "DECENT_API_KEY available:",
      !!process.env.NEXT_PUBLIC_DECENT_API_KEY
    );
    console.log("Connected address:", address);
    console.log("Wallet client available:", !!walletClient);
    console.log("Public client available:", !!publicClient);
  }, [address, walletClient, publicClient]);

  const handleTest = async () => {
    if (!isConnected || !walletClient || !publicClient) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus("Preparing transaction...");

    try {
      // Calculate amount in wei (GHO has 18 decimals)
      const amountInWei = parseUnits(
        amount.toString(),
        getTokenDecimals(TokenType.GHO)
      );

      // Log transaction parameters
      console.log("Transaction parameters:", {
        sourceChainId: SOURCE_CHAIN_ID,
        destinationChainId: DESTINATION_CHAIN_ID,
        sourceToken: GHO_ADDRESS_LENS,
        destinationToken: USDC_ADDRESS_BASE,
        amount: amount,
        amountInWei: amountInWei.toString(),
        megapotContractAddress: MEGAPOT_CONTRACT_ADDRESS,
        syndicateRegistryAddress: address || SYNDICATE_REGISTRY_ADDRESS,
      });

      // Prepare the Decent.xyz API request
      const boxActionArgs = {
        actionType: "EvmFunction",
        sender: address,
        srcToken: GHO_ADDRESS_LENS,
        dstToken: USDC_ADDRESS_BASE,
        srcChainId: SOURCE_CHAIN_ID.toString(),
        dstChainId: DESTINATION_CHAIN_ID,
        slippage: 1, // 1% slippage
        actionConfig: {
          chainId: DESTINATION_CHAIN_ID,
          contractAddress: MEGAPOT_CONTRACT_ADDRESS, // Make sure this is the correct address
          cost: {
            amount: amountInWei,
            isNative: false,
            tokenAddress: USDC_ADDRESS_BASE,
          },
          signature:
            "function purchaseTickets(address referrer, uint256 value, address recipient)",
          args: [
            DEFAULT_REFERRER_ADDRESS,
            amountInWei,
            address || SYNDICATE_REGISTRY_ADDRESS,
          ],
        },
      };

      // Make API call to our secure backend route
      setStatus("Calling Decent.xyz API via backend...");

      // Convert BigInt to string for JSON serialization
      const serializedArgs = JSON.stringify(boxActionArgs, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      );

      console.log("Sending request to backend:", serializedArgs);

      // Convert BigInt values to strings for JSON serialization
      const serializedBoxActionArgs = JSON.parse(
        JSON.stringify(boxActionArgs, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );

      // Call our secure backend API route
      const response = await fetch("/api/decent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "getBoxAction",
          params: serializedBoxActionArgs,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(`API error: ${errorData.error || response.status}`);
      }

      const responseData = await response.json();
      console.log("API response:", responseData);

      // Parse the response data
      const { tx, tokenPayment } = JSON.parse(
        responseData.data,
        (key, value) => {
          if (typeof value === "string" && /^\d+$/.test(value)) {
            try {
              return BigInt(value);
            } catch {
              return value;
            }
          }
          return value;
        }
      );

      console.log("Transaction prepared:", tx);
      console.log("Token payment:", tokenPayment);

      setIsPending(true);
      setStatus("Estimating gas...");

      // Estimate gas for the transaction
      const gas = await publicClient.estimateGas({
        account: address,
        ...tx,
      });

      console.log("Gas estimated:", gas);

      setStatus("Sending transaction...");

      // Send the transaction
      const hash = await walletClient.sendTransaction({
        ...tx,
        gas,
      });

      setTxHash(hash);
      setStatus("Transaction submitted!");
      console.log(`Transaction submitted: ${hash}`);
      console.log(
        `Sending ${amount} GHO from ${
          getChainName(SOURCE_CHAIN_ID) || "Lens Mainnet"
        } to ${getChainName(DESTINATION_CHAIN_ID) || "Base Mainnet"}`
      );

      // Poll for transaction status
      pollTransactionStatus(hash);
    } catch (err) {
      console.error("Transaction error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus(
        "Transaction failed: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsLoading(false);
      setIsPending(false);
    }
  };

  // Simple polling function for transaction status using our backend API
  const pollTransactionStatus = async (hash: string) => {
    try {
      const pollInterval = setInterval(async () => {
        try {
          // Call our secure backend API route for status
          const response = await fetch(
            `/api/decent?chainId=${SOURCE_CHAIN_ID}&txHash=${hash}`
          );

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Status API error:", errorData);
            return;
          }

          const data = await response.json();
          console.log("Transaction status:", data.status);

          if (data.status === "Executed") {
            setStatus("Transaction successful!");
            clearInterval(pollInterval);
          } else if (data.status === "Failed") {
            setStatus("Transaction failed!");
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error("Error polling status:", err);
        }
      }, 10000); // Poll every 10 seconds

      // Clear interval after 5 minutes (30 * 10000ms) to prevent infinite polling
      setTimeout(() => clearInterval(pollInterval), 30 * 10000);
    } catch (err) {
      console.error("Error setting up polling:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        Cross-Chain Test (Lens Mainnet → Base Mainnet)
      </h1>

      <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700">
        <div className="mb-4">
          <p className="text-sm opacity-70 mb-4">
            Testing direct Decent.xyz integration from Lens Mainnet to Base
            Mainnet
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Amount (GHO)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) =>
                setAmount(Math.max(0.01, parseFloat(e.target.value) || 0))
              }
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              min="0.01"
              step="0.01"
              disabled={isLoading || isPending}
            />
          </div>

          <button
            onClick={handleTest}
            disabled={!isConnected || isLoading || isPending}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
          >
            {isLoading
              ? "Processing..."
              : isPending
              ? "Waiting for confirmation..."
              : "Test Cross-Chain Transaction"}
          </button>

          {!isConnected && (
            <p className="mt-2 text-sm text-yellow-400">
              Please connect your wallet first
            </p>
          )}
        </div>

        {status && (
          <div className="mt-4 p-3 bg-gray-700 rounded border border-gray-600">
            <p className="text-sm font-medium">Status: {status}</p>
            {txHash && (
              <p className="text-xs mt-1 opacity-70">
                Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-md">
            <p className="text-sm font-medium text-red-400">Error:</p>
            <p className="text-xs mt-1 opacity-70">{error.message}</p>
          </div>
        )}

        <div className="mt-6 text-xs opacity-50">
          <p>Connected address: {isConnected ? address : "Not connected"}</p>
          <p>Source chain: Lens Mainnet (ID: {SOURCE_CHAIN_ID})</p>
          <p>Destination chain: Base Mainnet (ID: {DESTINATION_CHAIN_ID})</p>
          <p>
            GHO Address: {GHO_ADDRESS_LENS.slice(0, 6)}...
            {GHO_ADDRESS_LENS.slice(-4)}
          </p>
          <p>
            USDC Address: {USDC_ADDRESS_BASE.slice(0, 6)}...
            {USDC_ADDRESS_BASE.slice(-4)}
          </p>
        </div>
      </div>
    </div>
  );
}
