"use client";

import { motion } from 'framer-motion';
import { useJackpotAmount } from '@/lib/jackpot-queries';

export function CurrentJackpot() {
  const { data: jackpotAmount = 100000, isLoading } = useJackpotAmount();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h2 className="text-lg font-medium text-cyan-400 uppercase tracking-wider mb-2">
        Current Jackpot
      </h2>
      <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
        {isLoading ? 'Loading...' : `$${jackpotAmount.toLocaleString()}`}
      </p>
    </motion.div>
  );
}
