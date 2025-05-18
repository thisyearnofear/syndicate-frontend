"use client";

import { calculateOdds } from "@/lib/jackpot-utils";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useJackpotAmount } from "@/lib/jackpot-queries";

export function OddsCalculator() {
  const { data: jackpotAmount = 100000 } = useJackpotAmount();
  const [ticketCount, setTicketCount] = useState<number>(100);
  const [odds, setOdds] = useState<number>(0);

  useEffect(() => {
    setOdds(calculateOdds(jackpotAmount as number, ticketCount));
  }, [jackpotAmount, ticketCount]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-center mt-4"
    >
      <h2 className="text-sm font-medium text-white/70 mb-2">
        Syndicate Odds Calculator
      </h2>

      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          onClick={() => setTicketCount(Math.max(10, ticketCount - 10))}
          className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/60"
        >
          -
        </button>

        <div className="relative">
          <input
            type="number"
            value={ticketCount}
            onChange={(e) =>
              setTicketCount(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-20 bg-black/40 border border-white/20 rounded-md text-center text-white py-1 px-2"
            min="1"
          />
          <span className="text-xs text-white/60 absolute -bottom-5 left-0 right-0">
            Tickets
          </span>
        </div>

        <button
          onClick={() => setTicketCount(ticketCount + 10)}
          className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/60"
        >
          +
        </button>
      </div>

      <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/10">
        <p className="text-sm text-white/70">With {ticketCount} tickets:</p>
        <p className="text-xl font-bold text-cyan-400">
          1 in {odds.toLocaleString()} odds
        </p>
      </div>
    </motion.div>
  );
}
