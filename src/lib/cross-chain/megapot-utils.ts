"use client";

import { parseUnits } from "viem";
import { CrossChainService } from "./cross-chain-service";
import { ChainId, DEFAULT_REFERRER_ADDRESS, MEGAPOT_CONTRACT_ADDRESS, SOURCE_CHAIN_ID, DESTINATION_CHAIN_ID, SYNDICATE_REGISTRY_ADDRESS, getTokenDecimals, getTokenAddress, TokenType } from "./config";

/**
 * Interface for ticket purchase parameters
 */
interface PurchaseTicketsParams {
  senderAddress: string;
  ticketCount: number;
  ticketPrice: number;
  syndicateId?: string;
  referrerAddress?: string;
  sourceChainId?: ChainId;
  destinationChainId?: ChainId;
}

/**
 * Utility functions for interacting with Megapot across chains
 */
export class MegapotUtils {
  private crossChainService: CrossChainService;
  
  constructor(apiKey?: string) {
    this.crossChainService = new CrossChainService(apiKey);
  }
  
  /**
   * Returns the cross-chain service instance
   */
  getCrossChainService(): CrossChainService {
    return this.crossChainService;
  }
  
  /**
   * Prepares a transaction to purchase tickets on Megapot
   */
  async preparePurchaseTickets(params: PurchaseTicketsParams) {
    const {
      senderAddress,
      ticketCount,
      ticketPrice,
      syndicateId,
      referrerAddress = DEFAULT_REFERRER_ADDRESS,
      sourceChainId = SOURCE_CHAIN_ID,
      destinationChainId = DESTINATION_CHAIN_ID,
    } = params;
    
    // Calculate total cost with proper decimals
    const totalCost = ticketCount * ticketPrice;
    const sourceTokenType = TokenType.GHO;
    const destinationTokenType = TokenType.USDC;
    const sourceDecimals = getTokenDecimals(sourceTokenType);
    const totalCostInWei = parseUnits(totalCost.toString(), sourceDecimals);
    
    // Get token addresses for source and destination chains
    const sourceTokenAddress = getTokenAddress(sourceChainId, sourceTokenType);
    const destTokenAddress = getTokenAddress(destinationChainId, destinationTokenType);
    
    // Prepare purchase function arguments
    // purchaseTickets(address referrer, uint256 value, address recipient)
    const purchaseArgs = [
      referrerAddress, 
      totalCostInWei,
      SYNDICATE_REGISTRY_ADDRESS, // The recipient is our registry that tracks tickets
    ];
    
    // Optional metadata to include with the transaction (e.g., syndicateId)
    // This can be used by the registry to associate tickets with syndicates
    const metadata = syndicateId ? { syndicateId } : {};
    
    // Prepare the cross-chain transaction
    return this.crossChainService.prepareTransaction({
      sourceChainId,
      destinationChainId,
      senderAddress,
      contractAddress: MEGAPOT_CONTRACT_ADDRESS,
      functionSignature: "function purchaseTickets(address referrer, uint256 value, address recipient)",
      args: purchaseArgs,
      value: totalCostInWei,
      srcToken: sourceTokenAddress,
      dstToken: destTokenAddress,
    });
  }
  
  /**
   * Calculates the odds of winning based on ticket count and jackpot amount
   */
  calculateOdds(jackpotAmount: number, ticketCount: number): number {
    if (ticketCount <= 0) return 0;
    // Using the formula: odds = jackpot / (.7 * tickets bought)
    // .7 represents the typical payout percentage
    return Math.round(jackpotAmount / (0.7 * ticketCount));
  }
  
  /**
   * Formats the time remaining until the next drawing
   */
  formatTimeRemaining(secondsRemaining: number): string {
    if (secondsRemaining <= 0) return "00:00:00";
    
    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = Math.floor(secondsRemaining % 60);
    
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  
  /**
   * Check if a ticket is a winner and get the winning amount
   */
  async checkWinningTicket(ticketId: string, chainId = DESTINATION_CHAIN_ID) {
    // This is a placeholder - in a real implementation, this would query a contract or API
    // to determine if a ticket has won and the winning amount
    return {
      isWinner: false,
      amount: 0,
    };
  }
}

// Export singleton instance for easy import
export const megapotUtils = new MegapotUtils();