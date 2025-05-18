"use client";

import { ChainId, DEFAULT_SLIPPAGE, DECENT_API_KEY, getTokenAddress, TokenType } from "./config";

interface TransactionRequest {
  to: string;
  data: string;
  value: bigint;
  gas?: bigint;
}

interface DecentResponse {
  tx: TransactionRequest;
  tokenPayment?: {
    token: string;
    amount: bigint;
  };
}

interface CrossChainTxParams {
  sourceChainId: ChainId;
  destinationChainId: ChainId;
  senderAddress: string;
  contractAddress: string;
  functionSignature: string;
  args: any[];
  value?: bigint;
  slippage?: number;
  srcToken?: string;
  dstToken?: string;
}

/**
 * A minimal service for cross-chain transactions using Decent.xyz
 */
export class CrossChainService {
  private apiBaseUrl: string;
  
  constructor(apiKey = DECENT_API_KEY, apiBaseUrl = "https://box-v4.api.decent.xyz/api") {
    this.apiBaseUrl = apiBaseUrl;
  }
  
  /**
   * Prepares a cross-chain transaction through Decent.xyz
   */
  async prepareTransaction(params: CrossChainTxParams): Promise<DecentResponse> {
    const {
      sourceChainId,
      destinationChainId,
      senderAddress,
      contractAddress,
      functionSignature,
      args,
      value = 0n,
      slippage = DEFAULT_SLIPPAGE,
    } = params;
    
    // Get token addresses for source and destination chains if not provided
    const sourceTokenAddress = params.srcToken || getTokenAddress(sourceChainId, TokenType.USDC);
    const destTokenAddress = params.dstToken || getTokenAddress(destinationChainId, TokenType.USDC);
    
    // Create the request to Decent API
    const requestBody = {
      actionType: "EvmFunction",
      sender: senderAddress,
      srcToken: sourceTokenAddress,
      dstToken: destTokenAddress,
      srcChainId: sourceChainId.toString(),
      dstChainId: destinationChainId.toString(),
      slippage,
      actionConfig: {
        chainId: destinationChainId,
        contractAddress,
        cost: {
          amount: value,
          isNative: false,
          tokenAddress: destUsdcAddress,
        },
        signature: functionSignature,
        args,
      },
    };
    
    // Handle BigInt serialization in request
    const serializedBody = JSON.stringify(requestBody, (_, value) => 
      typeof value === "bigint" ? value.toString() : value
    );
    
    // Make request to Decent API
    try {
      const url = new URL(`${this.apiBaseUrl}/getBoxAction`);
      url.searchParams.set("arguments", serializedBody);
      
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "x-api-key": DECENT_API_KEY,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Decent API error: ${response.status}`);
      }
      
      const text = await response.text();
      
      // Parse response and handle BigInt deserialization
      const parsedResponse = JSON.parse(text, (_, value) => {
        if (typeof value === "string" && /^\d+$/.test(value)) {
          try {
            return BigInt(value);
          } catch {
            return value;
          }
        }
        return value;
      });
      
      return parsedResponse;
    } catch (error) {
      console.error("Error preparing cross-chain transaction:", error);
      throw error;
    }
  }
  
  /**
   * Check transaction status
   */
  async getTransactionStatus(sourceChainId: ChainId, txHash: string): Promise<{ status: string; data?: any }> {
    const url = new URL("https://api.decentscan.xyz/getStatus");
    url.searchParams.set("chainId", sourceChainId.toString());
    url.searchParams.set("txHash", txHash);
    
    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "x-api-key": DECENT_API_KEY,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Status API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        status: data.status,
        data,
      };
    } catch (error) {
      console.error("Error getting transaction status:", error);
      throw error;
    }
  }
}