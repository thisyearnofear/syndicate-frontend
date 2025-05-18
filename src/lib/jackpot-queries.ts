"use client";

import { useQuery } from '@tanstack/react-query';
import {
  getJackpotAmount,
  getTimeRemaining,
  getTicketPrice,
  getTokenSymbol,
  getJackpotOdds,
  getFeeBps,
} from './jackpot-utils';

// Query keys for caching and invalidation
const queryKeys = {
  jackpotAmount: ['jackpotAmount'],
  timeRemaining: ['timeRemaining'],
  ticketPrice: ['ticketPrice'],
  tokenSymbol: ['tokenSymbol'],
  jackpotOdds: ['jackpotOdds'],
  feeBps: ['feeBps'],
};

// Default values for when the contract calls fail
const defaultValues = {
  jackpotAmount: 100000, // $100,000
  timeRemaining: 86400, // 24 hours
  ticketPrice: 1, // $1
  tokenSymbol: 'USDC',
  jackpotOdds: 142857, // 1 in 142,857
  feeBps: 3000, // 30%
};

// Common query options to reduce RPC load
const commonQueryOptions = {
  retry: 2,
  retryDelay: 1000,
  refetchOnWindowFocus: false,
};

/**
 * Hook to get the current jackpot amount
 */
export function useJackpotAmount() {
  return useQuery({
    queryKey: queryKeys.jackpotAmount,
    queryFn: getJackpotAmount,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // 1 minute
    placeholderData: defaultValues.jackpotAmount,
    ...commonQueryOptions,
  });
}

/**
 * Hook to get the time remaining until the next drawing
 */
export function useTimeRemaining() {
  return useQuery({
    queryKey: queryKeys.timeRemaining,
    queryFn: getTimeRemaining,
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 30, // 30 seconds
    placeholderData: defaultValues.timeRemaining,
    ...commonQueryOptions,
    refetchOnMount: true,
  });
}

/**
 * Hook to get the ticket price
 */
export function useTicketPrice() {
  return useQuery({
    queryKey: queryKeys.ticketPrice,
    queryFn: getTicketPrice,
    staleTime: 1000 * 60 * 10, // 10 minutes
    placeholderData: defaultValues.ticketPrice,
    ...commonQueryOptions,
  });
}

/**
 * Hook to get the token symbol
 */
export function useTokenSymbol() {
  return useQuery({
    queryKey: queryKeys.tokenSymbol,
    queryFn: getTokenSymbol,
    staleTime: Infinity, // This doesn't change
    gcTime: Infinity,
    placeholderData: defaultValues.tokenSymbol,
    ...commonQueryOptions,
  });
}

/**
 * Hook to get the jackpot odds for a single ticket
 */
export function useJackpotOdds() {
  return useQuery({
    queryKey: queryKeys.jackpotOdds,
    queryFn: getJackpotOdds,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    placeholderData: defaultValues.jackpotOdds,
    ...commonQueryOptions,
  });
}

/**
 * Hook to get the fee basis points
 */
export function useFeeBps() {
  return useQuery({
    queryKey: queryKeys.feeBps,
    queryFn: getFeeBps,
    staleTime: 1000 * 60 * 10, // 10 minutes
    placeholderData: defaultValues.feeBps,
    ...commonQueryOptions,
  });
}
