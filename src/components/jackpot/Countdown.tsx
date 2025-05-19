"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTimeRemaining } from "@/lib/jackpot-queries";
import { formatTime } from "@/lib/jackpot-utils";

export function Countdown() {
  const timeRemainingQuery = useTimeRemaining();
  const timeRemaining = timeRemainingQuery?.data ?? 86400;
  const isLoading = timeRemainingQuery?.isLoading ?? false;
  const [displayTime, setDisplayTime] = useState("--:--:--");
  const startTimeRef = useRef<number>(Date.now());
  const initialTimeRef = useRef<number | null>(null);

  // Update the formatted time every second
  useEffect(() => {
    if (timeRemaining === undefined) return;
    
    // Store initial time value when it first loads
    const validTimeRemaining = typeof timeRemaining === "number" && !isNaN(timeRemaining) && timeRemaining > 0
      ? timeRemaining
      : 86400; // 24 hours fallback
    
    // Reset reference time when new data comes in
    startTimeRef.current = Date.now();
    initialTimeRef.current = validTimeRemaining;
    
    setDisplayTime(formatTime(validTimeRemaining));
    
    // Update time every second
    const timer = setInterval(() => {
      if (initialTimeRef.current === null) return;
      
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      const currentTime = Math.max(0, initialTimeRef.current - elapsedSeconds);
      setDisplayTime(formatTime(currentTime));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="text-center"
    >
      <h2 className="text-sm font-medium text-white/70 mb-1">
        Next Drawing In
      </h2>
      <div className="relative h-8">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.p
              key={displayTime}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-bold text-white absolute inset-0 flex items-center justify-center"
            >
              {displayTime}
            </motion.p>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
