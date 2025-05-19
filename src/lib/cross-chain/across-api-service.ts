"use client";

import axios from 'axios';
import { parseUnits } from 'viem';
import {
  ChainId,
  ACROSS_INTEGRATOR_ID,
  GHO_ADDRESS_LENS,
  USDC_ADDRESS_BASE,
  GHO_DECIMALS,
  USDC_DECIMALS
} from "./config";

// Use our proxy API to avoid CORS issues
const USE_PROXY = true;
const ACROSS_API_BASE_URL = USE_PROXY ? '/api/across-proxy' : 'https://app.across.to/api';

// Check if we're in testnet mode
const isTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === 'true' || process.env.NODE_ENV !== 'production';

// Map of chain IDs for testnet
const TESTNET_CHAIN_MAP: Record<number, number> = {
  232: 37111, // Map Lens Mainnet to Lens Testnet
  8453: 84532, // Map Base Mainnet to Base Sepolia
};

// Function to get the correct chain ID based on environment
function getChainId(chainId: number): number {
  if (isTestnet && chainId in TESTNET_CHAIN_MAP) {
    return TESTNET_CHAIN_MAP[chainId];
  }
  return chainId;
}

/**
 * Interface for the swap approval API response
 */
interface SwapApprovalResponse {
  checks: {
    allowance: {
      token: string;
      spender: string;
      actual: string;
      expected: string;
    };
    balance: {
      token: string;
      actual: string;
      expected: string;
    };
  };
  steps: {
    bridge: {
      inputAmount: string;
      outputAmount: string;
      tokenIn: {
        decimals: number;
        symbol: string;
        address: string;
        name: string;
        chainId: number;
      };
      tokenOut: {
        decimals: number;
        symbol: string;
        address: string;
        name: string;
        chainId: number;
      };
      fees: {
        totalRelay: {
          pct: string;
          total: string;
        };
        relayerCapital: {
          pct: string;
          total: string;
        };
        relayerGas: {
          pct: string;
          total: string;
        };
        lp: {
          pct: string;
          total: string;
        };
      };
    };
  };
  refundToken: {
    decimals: number;
    symbol: string;
    address: string;
    name: string;
    chainId: number;
  };
  inputAmount: string;
  expectedOutputAmount: string;
  minOutputAmount: string;
  expectedFillTime: number;
  swapTx: {
    simulationSuccess: boolean;
    chainId: number;
    to: string;
    data: string;
    value?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  };
  approvalTxns?: {
    chainId: number;
    to: string;
    data: string;
  }[];
}

/**
 * Get a swap approval quote from the Across API
 */
export const getSwapApproval = async (params: {
  originChainId: ChainId;
  destinationChainId: ChainId;
  inputToken: string;
  outputToken: string;
  amount: string;
  depositor: string;
  recipient?: string;
  slippageTolerance?: number;
  integratorId?: string;
}): Promise<SwapApprovalResponse> => {
  try {
    // Determine the appropriate decimals based on the input token
    const decimals = params.inputToken.toLowerCase() === GHO_ADDRESS_LENS.toLowerCase()
      ? GHO_DECIMALS
      : USDC_DECIMALS;

    // Parse the amount to the smallest unit
    const amountInSmallestUnit = parseUnits(params.amount, decimals).toString();

    // Get the correct chain IDs based on environment
    const originChainId = getChainId(params.originChainId);
    const destinationChainId = getChainId(params.destinationChainId);

    console.log(`Using chain IDs: origin=${originChainId}, destination=${destinationChainId}`);
    console.log(`Using tokens: input=${params.inputToken}, output=${params.outputToken}`);

    // Prepare the API request parameters
    const requestParams = {
      tradeType: 'minOutput',
      amount: amountInSmallestUnit,
      inputToken: params.inputToken,
      outputToken: params.outputToken,
      originChainId: originChainId,
      destinationChainId: destinationChainId,
      depositor: params.depositor,
      recipient: params.recipient || params.depositor,
      integratorId: params.integratorId || ACROSS_INTEGRATOR_ID,
      slippageTolerance: params.slippageTolerance || 1, // Default to 1%
      refundOnOrigin: true
    };

    // Make the API request
    const response = await axios.get<SwapApprovalResponse>(
      ACROSS_API_BASE_URL,
      {
        params: USE_PROXY
          ? { endpoint: 'swap/approval', ...requestParams }
          : requestParams
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error getting swap approval:', error);
    throw error;
  }
};

/**
 * Execute a swap approval transaction
 * This function handles both approval and swap transactions
 */
export const executeSwapApproval = async (params: {
  walletClient: any;
  swapApproval: SwapApprovalResponse;
  onProgress?: (progress: any) => void;
}) => {
  const { walletClient, swapApproval, onProgress } = params;

  try {
    // First, check if we need to execute approval transactions
    if (swapApproval.approvalTxns && swapApproval.approvalTxns.length > 0) {
      if (onProgress) onProgress({ status: 'approval', message: 'Approving token...' });

      // Execute each approval transaction
      for (const approvalTx of swapApproval.approvalTxns) {
        // Use the correct chain ID based on environment
        const chainId = getChainId(approvalTx.chainId);
        console.log(`Executing approval transaction on chain ${chainId}`);

        const hash = await walletClient.sendTransaction({
          to: approvalTx.to,
          data: approvalTx.data,
          chain: { id: chainId }
        });

        if (onProgress) onProgress({
          status: 'approval_submitted',
          message: 'Approval transaction submitted',
          hash
        });

        // Wait for the transaction to be mined
        await walletClient.waitForTransactionReceipt({ hash });

        if (onProgress) onProgress({
          status: 'approval_confirmed',
          message: 'Approval transaction confirmed',
          hash
        });
      }
    }

    // Now execute the swap transaction
    if (onProgress) onProgress({ status: 'swap', message: 'Executing swap...' });

    const swapTx = swapApproval.swapTx;

    // Use the correct chain ID based on environment
    const chainId = getChainId(swapTx.chainId);
    console.log(`Executing swap transaction on chain ${chainId}`);

    const hash = await walletClient.sendTransaction({
      to: swapTx.to,
      data: swapTx.data,
      value: swapTx.value ? BigInt(swapTx.value) : undefined,
      maxFeePerGas: swapTx.maxFeePerGas ? BigInt(swapTx.maxFeePerGas) : undefined,
      maxPriorityFeePerGas: swapTx.maxPriorityFeePerGas ? BigInt(swapTx.maxPriorityFeePerGas) : undefined,
      chain: { id: chainId }
    });

    if (onProgress) onProgress({
      status: 'swap_submitted',
      message: 'Swap transaction submitted',
      hash
    });

    return {
      hash,
      expectedFillTime: swapApproval.expectedFillTime,
      expectedOutputAmount: swapApproval.expectedOutputAmount,
      minOutputAmount: swapApproval.minOutputAmount
    };
  } catch (error) {
    console.error('Error executing swap approval:', error);
    throw error;
  }
};
