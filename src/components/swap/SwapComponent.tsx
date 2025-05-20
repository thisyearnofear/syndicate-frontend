import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { type Address } from "viem";
import { Card } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Loader2, ArrowDown, AlertCircle, Settings } from "lucide-react";
import { toast } from "sonner";
import { formatAddress, getExplorerLink } from "@/lib/utils";
import { ChainId } from "@/lib/cross-chain/config";
import { parseUnits, formatUnits } from "viem";
import { UNISWAP_V3_ROUTER_ABI } from "@/lib/abis/uniswap-v3-router";
import { ERC20_ABI } from "@/lib/abis/erc20";
// Import the package properly without assuming specific exports
import * as oku from "@gfxlabs/oku";

// Constants
const OKU_API_ENDPOINT = process.env.NEXT_PUBLIC_OKU_API_ENDPOINT || "https://api.oku.trade/api";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Lens chain
const WGHO_ADDRESS = "0x6bDc36E20D267Ff0dd6097799f82e78907105e2F"; // Wrapped GHO on Lens chain
const ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap V3 Router
const LENS_CHAIN_ID = 232;

// Use the API directly without client class
const getTopPoolsByTvl = async (tokenA: string, tokenB: string) => {
  try {
    const response = await fetch(`${OKU_API_ENDPOINT}/v1/pools/top`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token0: tokenA,
        token1: tokenB,
        chain_id: LENS_CHAIN_ID,
        count: 5
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching top pools:', error);
    throw error;
  }
};

const getQuote = async (tokenIn: string, tokenOut: string, amount: string, poolId: string, slippageTolerance: number) => {
  try {
    const response = await fetch(`${OKU_API_ENDPOINT}/v1/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenIn,
        tokenOut,
        amount,
        poolId,
        slippage: slippageTolerance / 100, // Convert from percentage to decimal
        chain_id: LENS_CHAIN_ID
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching quote:', error);
    throw error;
  }
};

export function SwapComponent() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [amount, setAmount] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Use a more generic type since PoolOverview isn't available
  const [bestPool, setBestPool] = useState<any | null>(null);
  const [estimatedOutput, setEstimatedOutput] = useState<string>("0");
  const [slippage, setSlippage] = useState<number>(0.5);
  const [approvalNeeded, setApprovalNeeded] = useState<boolean>(false);
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | undefined>(
    undefined
  );
  const [swapHash, setSwapHash] = useState<`0x${string}` | undefined>(undefined);

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS as Address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address as Address, ROUTER_ADDRESS as Address] : undefined,
  });

  const amountToApprove = amount ? parseUnits(amount, 6) : 0n;

  const { writeContract: approve, isPending: isApproving, data: approvalData } = useWriteContract();

  useEffect(() => {
    if (approvalData) {
      console.log("Approval transaction submitted with hash:", approvalData);
      setApprovalHash(approvalData);
    }
  }, [approvalData]);

  const { isLoading: isApprovalLoading, status: approvalStatus } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  useEffect(() => {
    if (approvalStatus === "success" && approvalHash) {
      console.log("Approval transaction confirmed");
      setApprovalNeeded(false);
    } else if (approvalStatus === "error" && approvalHash) {
      setError("Approval transaction failed. Please try again.");
      setApprovalHash(undefined);
    }
  }, [approvalStatus, approvalHash]);

  const swapAmount = amount ? parseUnits(amount, 6) : 0n;
  const minOutput = estimatedOutput
    ? (parseUnits(estimatedOutput, 18) * BigInt(Math.floor(1000 - slippage * 10))) / BigInt(1000)
    : 0n;

  const swapParams =
    bestPool && address
      ? {
          tokenIn: USDC_ADDRESS as Address,
          tokenOut: WGHO_ADDRESS as Address,
          fee: bestPool.feeTier,
          recipient: address as Address,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 1200),
          amountIn: swapAmount,
          amountOutMinimum: minOutput,
          sqrtPriceLimitX96: 0n,
        }
      : undefined;

  const { writeContract: swap, isPending: isSwapping, data: swapData } = useWriteContract();

  useEffect(() => {
    if (swapData) {
      console.log("Swap transaction submitted with hash:", swapData);
      setSwapHash(swapData);
    }
  }, [swapData]);

  const { isLoading: isSwapLoading, status: swapStatus } = useWaitForTransactionReceipt({
    hash: swapHash,
  });

  const [txStatus, setTxStatus] = useState<'none' | 'pending' | 'mining' | 'success' | 'error'>('none');

  useEffect(() => {
    if (isApproving || isSwapping) {
      setTxStatus('pending');
    } else if (isApprovalLoading || isSwapLoading) {
      setTxStatus('mining');
    } else if (approvalStatus === 'success' || swapStatus === 'success') {
      setTxStatus('success');
    } else if (approvalStatus === 'error' || swapStatus === 'error') {
      setTxStatus('error');
    }
  }, [isApproving, isSwapping, isApprovalLoading, isSwapLoading, approvalStatus, swapStatus]);

  useEffect(() => {
    if (swapStatus === "success" && swapHash) {
      console.log("Swap transaction confirmed successfully");
      toast.success("Swap completed successfully!");
    } else if (swapStatus === "error" && swapHash) {
      console.error("Swap transaction failed");
      setError("Swap transaction failed. Please try again.");
    }
  }, [swapStatus, swapHash]);

  const findBestPool = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Finding best pool for USDC/GHO swap using Oku API...");
      
      try {
        const pools = await getTopPoolsByTvl(
          USDC_ADDRESS,
          WGHO_ADDRESS
        );
        
        console.log("Oku pools response:", pools);
        
        if (!pools || pools.length === 0) {
          throw new Error("No pools found for USDC/GHO pair");
        }

        const pool = pools[0];
        setBestPool(pool);
        console.log("Best pool found:", pool);
        
        if (amount) {
          const amountIn = parseUnits(amount, 6); // USDC has 6 decimals
          estimateOutput(amountIn);
        }
        
      } catch (apiErr) {
        console.error("Oku API request failed:", apiErr);
        setError("Failed to find liquidity pool. Please try again later.");
        toast.error("Could not find a suitable liquidity pool");
      }
    } catch (err: any) {
      console.error("Error finding best pool:", err);
      setError(err.message || "Failed to find best pool");
    } finally {
      setIsLoading(false);
    }
  }, [amount]);

  const getSwapQuote = useCallback(
    async (amountIn: bigint) => {
      try {
        console.log(`Getting quote for ${formatUnits(amountIn, 6)} USDC to GHO via Oku API`);
        
        if (!bestPool) {
          throw new Error("No pool selected");
        }
        
        const quote = await getQuote(
          USDC_ADDRESS,
          WGHO_ADDRESS,
          amountIn.toString(),
          bestPool.id || bestPool.poolId, // Handle different property names
          slippage
        );
        
        console.log("Received quote from Oku API:", quote);
        
        if (quote && quote.amountOut) {
          return BigInt(quote.amountOut);
        } else {
          throw new Error("Invalid quote response");
        }
      } catch (err) {
        console.error("Error getting quote from Oku:", err);
        setError("Failed to get price quote. Please try again.");
        return BigInt(0);
      }
    },
    [bestPool, slippage]
  );

  const estimateOutput = useCallback(
    async (amountIn: bigint) => {
      if (!bestPool) {
        console.warn("Cannot estimate output: No pool selected");
        return;
      }

      try {
        const amountOut = await getSwapQuote(amountIn);
        if (amountOut === BigInt(0)) {
          setEstimatedOutput("0");
          return;
        }
        
        const formattedOutput = formatUnits(amountOut, 18); // GHO has 18 decimals
        setEstimatedOutput(parseFloat(formattedOutput).toFixed(6));
        console.log(`Estimated output: ${formattedOutput} GHO`);
      } catch (err) {
        console.error("Error estimating output:", err);
        setEstimatedOutput("0");
        setError("Could not estimate swap output");
      }
    },
    [bestPool, getSwapQuote]
  );

  useEffect(() => {
    if (allowance !== undefined && allowance !== null && swapAmount > 0n) {
      const allowanceBigInt = BigInt(allowance.toString());
      const needsApproval = allowanceBigInt < swapAmount;
      setApprovalNeeded(needsApproval);
      console.log(`Approval needed: ${needsApproval} (allowance: ${allowanceBigInt}, swap amount: ${swapAmount})`);
    }
  }, [allowance, swapAmount]);

  useEffect(() => {
    const updateQuote = async () => {
      if (bestPool && amount) {
        try {
          const amountIn = parseUnits(amount, 6); // USDC has 6 decimals
          await estimateOutput(amountIn);
        } catch (err) {
          console.error("Error updating quote:", err);
          setEstimatedOutput("0");
        }
      } else {
        setEstimatedOutput("0");
      }
    };

    updateQuote();
  }, [bestPool, amount, estimateOutput]);

  useEffect(() => {
    findBestPool();
  }, [findBestPool]);

  const handleSwap = async () => {
    if (!isConnected || !bestPool || !address) return;

    try {
      setIsLoading(true);
      setError(null);

      if (approvalNeeded) {
        try {
          console.log(`Approving USDC spending: ${formatUnits(swapAmount, 6)} USDC`);
          await approve({
            address: USDC_ADDRESS as Address,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [ROUTER_ADDRESS as Address, swapAmount],
          });
          
          console.log("Approval transaction submitted, waiting for confirmation...");
          return;
        } catch (err: any) {
          console.error("Approval error:", err);
          setError(err.message || "Failed to approve USDC");
          setIsLoading(false);
          return;
        }
      }

      if (swapParams) {
        try {
          console.log("Executing swap with params:", swapParams);
          
          const quoteData = await getQuote(
            USDC_ADDRESS,
            WGHO_ADDRESS,
            swapAmount.toString(),
            bestPool.id || bestPool.poolId, // Handle different property names
            slippage
          );
          
          if (!quoteData) {
            throw new Error("Failed to get swap quote");
          }
          
          console.log("Quote data received:", quoteData);
          
          await swap({
            address: ROUTER_ADDRESS as Address,
            abi: UNISWAP_V3_ROUTER_ABI,
            functionName: "exactInputSingle",
            args: [swapParams],
          });

          console.log("Swap transaction submitted, waiting for confirmation...");
        } catch (err: any) {
          console.error("Swap error:", err);
          setError(err.message || "Failed to execute swap");
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      console.error("Transaction error:", err);
      setError(err.message || "Failed to execute transaction");
      setIsLoading(false);
    }
  };

  const isPending =
    isApproving || isSwapping || isApprovalLoading || isSwapLoading;
  
  const currentTxHash = approvalHash || swapHash;
  
  const getStatusMessage = () => {
    if (isApproving) return "Submitting approval transaction...";
    if (isApprovalLoading) return "Confirming approval on blockchain...";
    if (isSwapping) return "Submitting swap transaction...";
    if (isSwapLoading) return "Confirming swap on blockchain...";
    if (approvalStatus === "success" && currentTxHash === approvalHash) return "Approval confirmed! Ready to swap.";
    if (swapStatus === "success") return "Swap completed successfully!";
    if (approvalStatus === "error" || swapStatus === "error") return "Transaction failed. Please try again.";
    return "";
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card className="bg-black/40 border-white/20 p-6">
        <div className="space-y-4">
          <div className="bg-black/60 p-4 rounded-lg border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">From</span>
              <span className="text-sm font-medium text-cyan-400">USDC</span>
            </div>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              min="0.000001"
              step="0.000001"
              className="bg-transparent border-none text-white text-2xl placeholder:text-white/50"
            />
            <div className="mt-1 text-xs text-white/60">
              On Lens Chain: {USDC_ADDRESS && formatAddress(USDC_ADDRESS)}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-cyan-900/30 p-2 rounded-full">
              <ArrowDown className="h-6 w-6 text-cyan-400" />
            </div>
          </div>

          <div className="bg-black/60 p-4 rounded-lg border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                To (estimated)
              </span>
              <span className="text-sm font-medium text-cyan-400">GHO</span>
            </div>
            <div className="text-2xl text-white font-medium">
              {estimatedOutput}
            </div>
            <div className="mt-1 text-xs text-white/60">
              On Lens Chain: {WGHO_ADDRESS && formatAddress(WGHO_ADDRESS)}
            </div>
          </div>

          {bestPool && (
            <div className="bg-black/40 p-3 rounded-lg border border-white/20">
              <h4 className="text-sm font-medium text-white mb-2">Pool Info</h4>
              <div className="space-y-1 text-sm text-white/80">
                <div className="flex justify-between">
                  <span>Fee Tier:</span>
                  <span className="text-cyan-400">
                    {(bestPool.fee || bestPool.feeTier) / 10000}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Liquidity:</span>
                  <span className="text-cyan-400">
                    {bestPool.tvlUSD ? 
                      `$${bestPool.tvlUSD.toLocaleString()}` : 
                      bestPool.liquidity ? 
                        `${formatUnits(BigInt(bestPool.liquidity.toString()), 18)}` : 
                        "Loading..."}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-white/60" />
              <span className="text-sm text-white/60">Slippage Tolerance</span>
            </div>
            <Input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(Number(e.target.value))}
              className="w-20 h-8 text-sm bg-transparent"
              min="0.1"
              max="5"
              step="0.1"
            />
          </div>

          <Button
            onClick={handleSwap}
            disabled={!isConnected || isLoading || !bestPool || isPending}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium py-3 rounded-lg"
          >
            {isLoading || isPending ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                <span>
                  {isApproving || isApprovalLoading
                    ? "Approving..."
                    : isSwapping || isSwapLoading
                    ? "Swapping..."
                    : "Preparing..."}
                </span>
              </div>
            ) : !isConnected ? (
              "Connect Wallet"
            ) : !bestPool ? (
              "Finding Best Pool..."
            ) : approvalNeeded ? (
              "Approve USDC"
            ) : (
              "Swap USDC to GHO"
            )}
          </Button>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-sm text-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {currentTxHash && (
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-cyan-400">Transaction Hash:</span>
              </div>
              <a
                href={getExplorerLink(currentTxHash, ChainId.LENS)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline break-all"
              >
                {currentTxHash}
              </a>
              {txStatus !== 'none' && (
                <div className="mt-2 text-sm">
                  <span className={`${txStatus === 'success' ? 'text-green-400' : txStatus === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {getStatusMessage()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
