"use client";

import { getSwapApproval, executeSwapApproval } from "./across-api-service";
import {
  ChainId,
  TokenType,
  getTokenAddress,
  getTokenDecimals,
  getNativeTokenType,
  getNativeTokenName,
  USE_TESTNET,
} from "./config";

/**
 * Service for handling multi-step bridging between chains
 * This service orchestrates the process of:
 * 1. Bridging from Lens Chain to Ethereum
 * 2. Swapping tokens on Ethereum
 * 3. Bridging from Ethereum to Base
 */

/**
 * Step 1: Bridge GHO from Lens Chain to Ethereum
 */
export const bridgeFromLensToEthereum = async (params: {
  amount: string;
  depositor: string;
  walletClient: any;
  onProgress?: (progress: any) => void;
}) => {
  const { amount, depositor, walletClient, onProgress } = params;

  try {
    if (onProgress) onProgress({ status: 'preparing', message: 'Preparing Lens to Ethereum bridge...' });

    // Get token addresses - use the native token type for Lens Chain
    const lensNativeTokenType = getNativeTokenType(ChainId.LENS);
    const sourceToken = getTokenAddress(ChainId.LENS, lensNativeTokenType);
    const destToken = getTokenAddress(ChainId.ETHEREUM, TokenType.GHO);

    console.log(`Using ${getNativeTokenName(ChainId.LENS)} as source token on Lens Chain`);
    console.log(`Source token address: ${sourceToken}`);
    console.log(`Destination token address: ${destToken}`);

    // Get a quote for the bridge transaction
    const swapApproval = await getSwapApproval({
      originChainId: USE_TESTNET ? ChainId.LENS_TESTNET : ChainId.LENS,
      destinationChainId: USE_TESTNET ? ChainId.ETHEREUM_SEPOLIA : ChainId.ETHEREUM,
      inputToken: sourceToken,
      outputToken: destToken,
      amount: amount,
      depositor: depositor,
    });

    if (onProgress) onProgress({
      status: 'quote_received',
      message: 'Bridge quote received',
      data: swapApproval
    });

    // Execute the bridge transaction
    const result = await executeSwapApproval({
      walletClient,
      swapApproval,
      onProgress,
    });

    return {
      success: true,
      hash: result.hash,
      expectedOutputAmount: result.expectedOutputAmount,
      expectedFillTime: result.expectedFillTime,
    };
  } catch (error) {
    console.error('Error bridging from Lens to Ethereum:', error);
    throw error;
  }
};

/**
 * Step 2: Swap GHO to USDC on Ethereum
 */
export const swapGhoToUsdcOnEthereum = async (params: {
  amount: string;
  depositor: string;
  walletClient: any;
  onProgress?: (progress: any) => void;
}) => {
  const { amount, depositor, walletClient, onProgress } = params;

  try {
    if (onProgress) onProgress({ status: 'preparing', message: 'Preparing GHO to USDC swap on Ethereum...' });

    // Get token addresses
    const sourceToken = getTokenAddress(ChainId.ETHEREUM, TokenType.GHO);
    const destToken = getTokenAddress(ChainId.ETHEREUM, TokenType.USDC);

    // For this step, we would typically use a DEX like Uniswap
    // For now, we'll simulate the swap with a delay
    if (onProgress) onProgress({ status: 'simulating', message: 'Simulating swap on Ethereum...' });

    // Simulate a successful swap
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate a mock transaction hash
    const mockHash = "0x" + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);

    if (onProgress) onProgress({
      status: 'swap_completed',
      message: 'Swap completed on Ethereum',
      hash: mockHash
    });

    return {
      success: true,
      hash: mockHash,
      outputAmount: (Number(amount) * 0.95).toString(), // Simulate 5% slippage
    };
  } catch (error) {
    console.error('Error swapping GHO to USDC on Ethereum:', error);
    throw error;
  }
};

/**
 * Step 3: Bridge USDC from Ethereum to Base
 */
export const bridgeFromEthereumToBase = async (params: {
  amount: string;
  depositor: string;
  walletClient: any;
  onProgress?: (progress: any) => void;
}) => {
  const { amount, depositor, walletClient, onProgress } = params;

  try {
    if (onProgress) onProgress({ status: 'preparing', message: 'Preparing Ethereum to Base bridge...' });

    // Get token addresses
    const sourceToken = getTokenAddress(ChainId.ETHEREUM, TokenType.USDC);
    const destToken = getTokenAddress(ChainId.BASE, TokenType.USDC);

    // Get a quote for the bridge transaction
    const swapApproval = await getSwapApproval({
      originChainId: USE_TESTNET ? ChainId.ETHEREUM_SEPOLIA : ChainId.ETHEREUM,
      destinationChainId: USE_TESTNET ? ChainId.BASE_SEPOLIA : ChainId.BASE,
      inputToken: sourceToken,
      outputToken: destToken,
      amount: amount,
      depositor: depositor,
    });

    if (onProgress) onProgress({
      status: 'quote_received',
      message: 'Bridge quote received',
      data: swapApproval
    });

    // Execute the bridge transaction
    const result = await executeSwapApproval({
      walletClient,
      swapApproval,
      onProgress,
    });

    return {
      success: true,
      hash: result.hash,
      expectedOutputAmount: result.expectedOutputAmount,
      expectedFillTime: result.expectedFillTime,
    };
  } catch (error) {
    console.error('Error bridging from Ethereum to Base:', error);
    throw error;
  }
};

/**
 * Execute the complete multi-step bridging process
 */
export const executeMultiStepBridge = async (params: {
  amount: string;
  depositor: string;
  walletClient: any;
  onProgress?: (progress: any) => void;
}) => {
  const { amount, depositor, walletClient, onProgress } = params;

  try {
    // Step 1: Bridge GHO from Lens Chain to Ethereum
    if (onProgress) onProgress({
      step: 1,
      status: 'starting',
      message: 'Starting Step 1: Bridge GHO from Lens to Ethereum'
    });

    const step1Result = await bridgeFromLensToEthereum({
      amount,
      depositor,
      walletClient,
      onProgress: (progress) => {
        if (onProgress) onProgress({ step: 1, ...progress });
      },
    });

    if (onProgress) onProgress({
      step: 1,
      status: 'completed',
      message: 'Step 1 completed',
      result: step1Result
    });

    // Step 2: Swap GHO to USDC on Ethereum
    if (onProgress) onProgress({
      step: 2,
      status: 'starting',
      message: 'Starting Step 2: Swap GHO to USDC on Ethereum'
    });

    const step2Result = await swapGhoToUsdcOnEthereum({
      amount: step1Result.expectedOutputAmount,
      depositor,
      walletClient,
      onProgress: (progress) => {
        if (onProgress) onProgress({ step: 2, ...progress });
      },
    });

    if (onProgress) onProgress({
      step: 2,
      status: 'completed',
      message: 'Step 2 completed',
      result: step2Result
    });

    // Step 3: Bridge USDC from Ethereum to Base
    if (onProgress) onProgress({
      step: 3,
      status: 'starting',
      message: 'Starting Step 3: Bridge USDC from Ethereum to Base'
    });

    const step3Result = await bridgeFromEthereumToBase({
      amount: step2Result.outputAmount,
      depositor,
      walletClient,
      onProgress: (progress) => {
        if (onProgress) onProgress({ step: 3, ...progress });
      },
    });

    if (onProgress) onProgress({
      step: 3,
      status: 'completed',
      message: 'Step 3 completed',
      result: step3Result
    });

    // Return the final result
    return {
      success: true,
      steps: {
        lensToEthereum: step1Result,
        ethereumSwap: step2Result,
        ethereumToBase: step3Result,
      },
      finalOutputAmount: step3Result.expectedOutputAmount,
    };
  } catch (error) {
    console.error('Error executing multi-step bridge:', error);
    throw error;
  }
};
