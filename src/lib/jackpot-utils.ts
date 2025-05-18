"use client";

import { JACKPOT, MainnetJackpotName } from '@coordinationlabs/megapot-ui-kit';
import { base } from 'viem/chains';
import { formatUnits } from 'viem';
import client from './viem-client';
import { BaseJackpotAbi, ERC20Abi } from './abi';
import { CONTRACT_ADDRESS, ERC20_TOKEN_ADDRESS } from './constants';

/**
 * Get the current jackpot amount in wei
 * @returns The current jackpot amount in wei as a bigint
 */
export async function getJackpotAmountWei(): Promise<bigint | undefined> {
  try {
    const lpPoolTotalWei = (await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: BaseJackpotAbi,
      functionName: 'lpPoolTotal',
    })) as bigint;

    const userPoolTotalWei = (await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: BaseJackpotAbi,
      functionName: 'userPoolTotal',
    })) as bigint;

    const jackpotAmount = lpPoolTotalWei > userPoolTotalWei
      ? lpPoolTotalWei
      : userPoolTotalWei;

    return jackpotAmount;
  } catch (error) {
    console.error("Error getting jackpot amount:", error);
    return undefined;
  }
}

/**
 * Get the token decimals
 * @returns The number of decimals for the token
 */
export async function getTokenDecimals(): Promise<number | undefined> {
  try {
    const decimals = await client.readContract({
      address: ERC20_TOKEN_ADDRESS,
      abi: ERC20Abi,
      functionName: 'decimals',
    });
    return Number(decimals);
  } catch (error) {
    console.error("Error getting token decimals:", error);
    return undefined;
  }
}

/**
 * Get the token symbol
 * @returns The symbol of the token
 */
export async function getTokenSymbol(): Promise<string | undefined> {
  try {
    const symbol = await client.readContract({
      address: ERC20_TOKEN_ADDRESS,
      abi: ERC20Abi,
      functionName: 'symbol',
    });
    return symbol as string;
  } catch (error) {
    console.error("Error getting token symbol:", error);
    return undefined;
  }
}

// Cache for token decimals to avoid repeated calls
let cachedTokenDecimals: number | undefined;

/**
 * Get the current jackpot amount
 * @returns The current jackpot amount in USD
 */
export async function getJackpotAmount(): Promise<number | undefined> {
  try {
    const jackpotAmountWei = await getJackpotAmountWei();

    // Use cached decimals if available, otherwise fetch
    if (!cachedTokenDecimals) {
      cachedTokenDecimals = await getTokenDecimals();
    }

    // Default to 6 decimals for USDC if we can't get the actual value
    const decimals = cachedTokenDecimals ?? 6;

    if (jackpotAmountWei === undefined) {
      return undefined;
    }

    return parseFloat(formatUnits(jackpotAmountWei, decimals));
  } catch (error) {
    console.error("Error formatting jackpot amount:", error);
    return undefined;
  }
}

/**
 * Get the time remaining until the next drawing
 * @returns Time remaining in seconds
 */
export async function getTimeRemaining(): Promise<number | undefined> {
  try {
    const lastJackpotEndTime = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: BaseJackpotAbi,
      functionName: 'lastJackpotEndTime',
    });

    const roundDuration = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: BaseJackpotAbi,
      functionName: 'roundDurationInSeconds',
    });

    const nextJackpotStartTime = Number(lastJackpotEndTime) + Number(roundDuration);
    const timeRemaining = nextJackpotStartTime - (Date.now() / 1000);

    return timeRemaining > 0 ? timeRemaining : 0;
  } catch (error) {
    console.error("Error getting time remaining:", error);
    return undefined;
  }
}

/**
 * Get the ticket price in wei
 * @returns Ticket price in wei
 */
export async function getTicketPriceWei(): Promise<bigint | undefined> {
  try {
    const ticketPriceWei = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: BaseJackpotAbi,
      functionName: 'ticketPrice',
    });

    return ticketPriceWei as bigint;
  } catch (error) {
    console.error("Error getting ticket price:", error);
    return undefined;
  }
}

/**
 * Get the ticket price
 * @returns Ticket price in USD
 */
export async function getTicketPrice(): Promise<number | undefined> {
  try {
    const ticketPriceWei = await getTicketPriceWei();

    // Use cached decimals if available, otherwise fetch
    if (!cachedTokenDecimals) {
      cachedTokenDecimals = await getTokenDecimals();
    }

    // Default to 6 decimals for USDC if we can't get the actual value
    const decimals = cachedTokenDecimals ?? 6;

    if (ticketPriceWei === undefined) {
      return undefined;
    }

    return parseFloat(formatUnits(ticketPriceWei, decimals));
  } catch (error) {
    console.error("Error formatting ticket price:", error);
    return undefined;
  }
}

/**
 * Get the fee basis points
 * @returns Fee in basis points (e.g., 3000 = 30%)
 */
export async function getFeeBps(): Promise<number | undefined> {
  try {
    const feeBps = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: BaseJackpotAbi,
      functionName: 'feeBps',
    });

    return Number(feeBps);
  } catch (error) {
    console.error("Error getting fee bps:", error);
    return undefined;
  }
}

/**
 * Calculate the odds of winning with a single ticket
 * @returns Odds as a number (e.g., 142857 means 1 in 142,857)
 */
export async function getJackpotOdds(): Promise<number | undefined> {
  try {
    const jackpotAmount = await getJackpotAmount();
    const feeBps = await getFeeBps();

    if (jackpotAmount === undefined || feeBps === undefined) {
      return undefined;
    }

    // Calculate effective fee percentage (e.g., 3000 bps = 30%)
    const feePercentage = feeBps / 10000;

    // Using the formula: odds = jackpot / ((1 - fee) * tickets bought)
    // For a single ticket, this is just jackpot / (1 - fee)
    return Math.round(jackpotAmount / (1 - feePercentage));
  } catch (error) {
    console.error("Error calculating jackpot odds:", error);
    return undefined;
  }
}

/**
 * Calculate the odds of winning with multiple tickets
 * @param jackpotAmount Jackpot amount in USD
 * @param ticketCount Number of tickets
 * @returns Odds as a number
 */
export function calculateOdds(jackpotAmount: number, ticketCount: number): number {
  if (ticketCount <= 0) return 0;
  // Using the formula: odds = jackpot / (.7 * tickets bought)
  return Math.round(jackpotAmount / (0.7 * ticketCount));
}

/**
 * Format time in seconds to HH:MM:SS
 * @param totalSeconds Time in seconds
 * @returns Formatted time string
 */
export function formatTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00:00';

  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Get the contract address for the current jackpot
 * @returns Contract address or undefined if not available
 */
export function getJackpotContract() {
  if (JACKPOT[base.id] && JACKPOT[base.id][MainnetJackpotName.USDC]) {
    return JACKPOT[base.id][MainnetJackpotName.USDC];
  }
  return undefined;
}
