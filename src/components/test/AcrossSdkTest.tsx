"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useAcrossApi } from "@/hooks/use-across-api"; // Using the new API hook
import { Button } from "@/components/ui/inputs/button";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { parseUnits } from "viem";
import {
  ChainId,
  USDC_ADDRESS_LENS,
  USDC_ADDRESS_BASE,
  GHO_ADDRESS_LENS,
  USDC_ADDRESS_BASE_SEPOLIA,
  USE_TESTNET,
  getTokenAddress,
  TokenType,
  getChainName,
} from "@/lib/cross-chain/config";

/**
 * A test component for validating cross-chain transactions using Across Protocol SDK
 */
export function AcrossSdkTest({
  sourceChainId = ChainId.LENS,
  destinationChainId = ChainId.BASE,
}: {
  sourceChainId?: ChainId;
  destinationChainId?: ChainId;
}) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState<string>("1");
  const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState<any>(null);

  // Initialize Across API hook
  const {
    isLoading,
    isPending,
    error,
    txHash,
    txStatus,
    swapApproval,
    getQuote,
    executeQuote,
    bridgeTokens,
  } = useAcrossApi({
    onSuccess: (hash) => {
      console.log("Transaction submitted successfully:", hash);
    },
    onError: (err) => {
      console.error("Transaction error:", err);
    },
    onStatusChange: (status, data) => {
      console.log("Transaction status changed:", status, data);
    },
  });

  // Set available routes on component mount
  useEffect(() => {
    if (isConnected) {
      // For the Across API approach, we don't need to fetch supported chains
      // We can just set the route directly since we know Lens and Base are supported
      setIsLoadingRoutes(false);

      // Get token addresses based on chain IDs and environment
      const sourceToken = getTokenAddress(sourceChainId, TokenType.GHO);
      const destToken = getTokenAddress(destinationChainId, TokenType.USDC);

      console.log(`Environment: ${USE_TESTNET ? "Testnet" : "Mainnet"}`);
      console.log(`Source token (GHO): ${sourceToken}`);
      console.log(`Destination token (USDC): ${destToken}`);

      setAvailableRoutes([
        {
          id: `${sourceChainId}-${destinationChainId}`,
          name: `${getChainName(sourceChainId)} to ${getChainName(
            destinationChainId
          )}`,
          originChainId: sourceChainId,
          destinationChainId: destinationChainId,
          inputToken: sourceToken,
          outputToken: destToken,
        },
      ]);

      // Update quote details when swap approval changes
      if (swapApproval) {
        setQuoteDetails({
          expectedOutputAmount: swapApproval.expectedOutputAmount,
          minOutputAmount: swapApproval.minOutputAmount,
          expectedFillTime: swapApproval.expectedFillTime,
          inputAmount: swapApproval.inputAmount,
        });
      }
    }
  }, [isConnected, sourceChainId, destinationChainId, swapApproval]);

  // Get a quote for the bridge transaction
  const handleGetQuote = async () => {
    if (!isConnected) {
      console.error("Wallet not connected");
      return;
    }

    try {
      console.log(
        `Getting quote for bridge transaction from chain ${sourceChainId} to ${destinationChainId}...`
      );

      // Get token addresses based on chain IDs and environment
      const sourceToken = getTokenAddress(sourceChainId, TokenType.GHO);
      const destToken = getTokenAddress(destinationChainId, TokenType.USDC);

      // Get a quote for the bridge transaction using the new API
      const quoteResult = await getQuote({
        sourceChainId: sourceChainId,
        destinationChainId: destinationChainId,
        sourceToken: sourceToken,
        destinationToken: destToken,
        amount: amount,
      });

      console.log("Swap approval result:", quoteResult);
      // Quote details are updated via the useEffect hook that watches swapApproval
    } catch (err) {
      console.error("Error getting quote:", err);
    }
  };

  // Handle bridge transaction
  const handleBridge = async () => {
    if (!isConnected) {
      console.error("Wallet not connected");
      return;
    }

    try {
      console.log(
        `Bridging ${amount} GHO from chain ${sourceChainId} to ${destinationChainId}...`
      );

      // Get token addresses based on chain IDs and environment
      const sourceToken = getTokenAddress(sourceChainId, TokenType.GHO);
      const destToken = getTokenAddress(destinationChainId, TokenType.USDC);

      // If we already have a swap approval, execute it
      if (swapApproval) {
        console.log("Executing existing swap approval:", swapApproval);
        const result = await executeQuote(swapApproval);
        console.log("Swap execution result:", result);
      } else {
        // Otherwise, get a quote and execute it
        console.log(
          "Getting new swap approval and executing bridge transaction"
        );
        const result = await bridgeTokens({
          sourceChainId: sourceChainId,
          destinationChainId: destinationChainId,
          sourceToken: sourceToken,
          destinationToken: destToken,
          amount: amount,
          slippageTolerance: 1, // 1% slippage tolerance
        });
        console.log("Bridge transaction result:", result);
      }
    } catch (err) {
      console.error("Bridge error:", err);
    }
  };

  // Render transaction status
  const renderStatus = () => {
    if (txHash || txStatus) {
      return (
        <div className="mt-6 p-5 bg-indigo-50 rounded-lg border-2 border-indigo-200">
          <h3 className="text-base font-bold mb-3 text-indigo-800">
            Transaction Status
          </h3>
          <div className="flex items-center gap-3">
            {txStatus === "executed" || txStatus === "completed" ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : txStatus === "failed" || txStatus === "error" ? (
              <AlertCircle className="h-6 w-6 text-red-600" />
            ) : (
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            )}
            <span className="text-base font-medium text-indigo-900">
              {txStatus === "executed" || txStatus === "completed"
                ? "Transaction completed successfully"
                : txStatus === "failed" || txStatus === "error"
                ? "Transaction failed"
                : txStatus === "preparing"
                ? "Preparing transaction..."
                : txStatus === "approving"
                ? "Approving token..."
                : txStatus === "approval_pending"
                ? "Approval transaction submitted, waiting for confirmation..."
                : txStatus === "approved"
                ? "Token approved, preparing swap..."
                : txStatus === "swapping"
                ? "Executing swap transaction..."
                : txStatus === "swap_pending"
                ? "Swap transaction submitted, waiting for confirmation..."
                : "Transaction in progress..."}
            </span>
          </div>
          {txHash && (
            <div className="mt-3 p-2 bg-white rounded border border-indigo-200">
              <div className="text-sm font-medium text-indigo-800">
                Transaction Hash:
              </div>
              <div className="font-mono text-sm bg-gray-50 p-2 rounded border border-gray-200 mt-1 break-all">
                {txHash}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Render quote details
  const renderQuoteDetails = () => {
    if (!quoteDetails && !swapApproval) return null;

    // Use swapApproval data if available, otherwise use quoteDetails
    const details = swapApproval || quoteDetails;

    return (
      <div className="mt-6 p-5 bg-yellow-50 rounded-lg border-2 border-yellow-200">
        <h3 className="text-base font-bold mb-3 text-yellow-800">
          Swap Approval Details
        </h3>
        <div className="space-y-3 bg-white p-4 rounded-lg border border-yellow-200">
          <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
            <span className="font-medium text-yellow-800">Input Amount:</span>
            <span className="font-bold text-yellow-900 text-lg">
              {details.inputAmount
                ? (Number(details.inputAmount) / 10 ** 18).toFixed(6)
                : "0"}{" "}
              GHO
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-green-50 rounded">
            <span className="font-medium text-green-800">Expected Output:</span>
            <span className="font-bold text-green-900 text-lg">
              {details.expectedOutputAmount
                ? (Number(details.expectedOutputAmount) / 10 ** 6).toFixed(6)
                : "0"}{" "}
              USDC
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
            <span className="font-medium text-blue-800">Min Output:</span>
            <span className="font-bold text-blue-900">
              {details.minOutputAmount
                ? (Number(details.minOutputAmount) / 10 ** 6).toFixed(6)
                : "0"}{" "}
              USDC
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
            <span className="font-medium text-purple-800">
              Expected Fill Time:
            </span>
            <span className="font-bold text-purple-900">
              {details.expectedFillTime || "~"} seconds
            </span>
          </div>

          {swapApproval?.approvalTxns &&
            swapApproval.approvalTxns.length > 0 && (
              <div className="p-2 bg-red-50 rounded">
                <span className="font-medium text-red-800">
                  Requires Approval:
                </span>
                <span className="font-bold text-red-900 ml-2">
                  Yes ({swapApproval.approvalTxns.length} transaction
                  {swapApproval.approvalTxns.length > 1 ? "s" : ""})
                </span>
              </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6 bg-white border-2 border-gray-300">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Across SDK Test</h2>

      <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base font-semibold text-blue-800">From</span>
          <span className="text-base font-medium text-blue-700">
            {getChainName(sourceChainId)}
          </span>
        </div>
        <Input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to bridge"
          disabled={isLoading || isPending}
          className="border-2 border-blue-300 text-lg font-medium"
        />
        <div className="mt-2 text-sm font-medium text-blue-700">Token: GHO</div>
      </div>

      <div className="flex justify-center my-3">
        <ArrowRight className="h-6 w-6 text-blue-500" />
      </div>

      <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base font-semibold text-green-800">To</span>
          <span className="text-base font-medium text-green-700">
            {getChainName(destinationChainId)}
          </span>
        </div>
        <div className="p-4 bg-white rounded-lg border-2 border-green-300">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-green-800">
              Estimated to receive:
            </span>
            <span className="text-lg font-bold text-green-700">
              {quoteDetails?.outputAmount || amount} USDC
            </span>
          </div>
        </div>
      </div>

      {isLoadingRoutes ? (
        <div className="flex justify-center my-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-base font-medium">
            Loading available routes...
          </span>
        </div>
      ) : availableRoutes.length > 0 ? (
        <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-base font-semibold text-purple-800 mb-2">
            Available Routes
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-purple-300">
            <div className="text-base font-medium text-purple-800">
              {availableRoutes.length} routes available between{" "}
              {getChainName(sourceChainId)} and{" "}
              {getChainName(destinationChainId)}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="p-4 bg-amber-100 text-amber-800 rounded-lg border-2 border-amber-300 font-medium">
            <div className="text-base">
              No routes available between {getChainName(sourceChainId)} to USDC
              on {getChainName(destinationChainId)}. This may be because one of
              these chains is not yet supported by Across Protocol.
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <Button
          onClick={handleGetQuote}
          disabled={
            !isConnected ||
            isLoading ||
            isPending ||
            !amount ||
            parseFloat(amount) <= 0
          }
          variant="outline"
          className="flex-1 py-6 text-lg font-semibold border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          {isLoading && !isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Getting Quote...
            </>
          ) : (
            "Get Quote"
          )}
        </Button>

        <Button
          onClick={handleBridge}
          disabled={
            !isConnected ||
            isLoading ||
            isPending ||
            !amount ||
            parseFloat(amount) <= 0
          }
          className="flex-1 py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
        >
          {isLoading || isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {isPending ? "Confirming..." : "Preparing..."}
            </>
          ) : (
            "Bridge GHO to USDC"
          )}
        </Button>
      </div>

      {renderQuoteDetails()}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg text-base font-medium border-2 border-red-300">
          <div className="font-bold">Error</div>
          <div>{error.message}</div>
        </div>
      )}

      {renderStatus()}

      <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
        <p className="text-sm font-medium text-gray-800">
          This is a test component for the Across Protocol API integration using
          the /swap/approval endpoint. It allows bridging GHO tokens from{" "}
          {getChainName(sourceChainId)} to USDC on{" "}
          {getChainName(destinationChainId)}.
        </p>
      </div>
    </Card>
  );
}
