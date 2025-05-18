"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import {
  useJackpotAmount,
  useTimeRemaining,
  useTokenSymbol,
} from "@/lib/jackpot-queries";
import { formatTime } from "@/lib/jackpot-utils";
import { MagneticButton } from "@/components/ui/inputs/magnetic-button";
import Link from "next/link";

/**
 * JackpotHeroDisplay component that displays the current Megapot jackpot
 * in a hero-friendly format, emphasizing syndicate participation
 */
export function JackpotHeroDisplay() {
  // Use React Query hooks to fetch data with fallback values
  const { data: jackpotAmount = 100000, isLoading: isLoadingJackpot } =
    useJackpotAmount();
  const { data: timeRemaining = 86400 } = useTimeRemaining();
  const { data: tokenSymbol = "USDC" } = useTokenSymbol();

  // State for formatted time
  const [formattedTime, setFormattedTime] = useState("00:00:00");

  // Refs for animations
  const jackpotAmountRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ticketIconRef = useRef<HTMLDivElement>(null);

  // Update the formatted time every second
  useEffect(() => {
    // Always use a valid time value
    const validTimeRemaining =
      typeof timeRemaining === "number" &&
      !isNaN(timeRemaining) &&
      timeRemaining > 0
        ? timeRemaining
        : 86400; // 24 hours fallback
    
    // Track when we started the timer
    const startTime = Date.now();
    const initialTime = validTimeRemaining;

    setFormattedTime(formatTime(validTimeRemaining));

    const timer = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const currentTime = Math.max(0, initialTime - elapsedSeconds);
      setFormattedTime(formatTime(currentTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Animate jackpot amount when it changes
  useEffect(() => {
    if (jackpotAmountRef.current && !isLoadingJackpot) {
      gsap.fromTo(
        jackpotAmountRef.current,
        { scale: 0.95, opacity: 0.8 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)",
        }
      );
    }
  }, [jackpotAmount, isLoadingJackpot]);

  // Animate ticket icon
  useEffect(() => {
    if (ticketIconRef.current) {
      // Create a floating animation
      gsap.to(ticketIconRef.current, {
        y: "-=8",
        duration: 1.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // Add a subtle rotation
      gsap.to(ticketIconRef.current, {
        rotate: 5,
        duration: 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }
  }, []);

  // Add hover effect to the card
  useEffect(() => {
    if (cardRef.current) {
      const handleMouseMove = (e: MouseEvent) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate rotation based on mouse position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        // Apply subtle rotation and lighting effect
        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          boxShadow: `
            0 5px 15px rgba(0, 0, 0, 0.3),
            ${(x - centerX) / 10}px ${
            (y - centerY) / 10
          }px 15px rgba(255, 255, 255, 0.05)
          `,
          duration: 0.5,
          ease: "power2.out",
        });
      };

      const handleMouseLeave = () => {
        if (!cardRef.current) return;

        // Reset rotation and shadow
        gsap.to(cardRef.current, {
          rotateX: 0,
          rotateY: 0,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          duration: 0.5,
          ease: "power2.out",
        });
      };

      cardRef.current.addEventListener("mousemove", handleMouseMove);
      cardRef.current.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        if (cardRef.current) {
          cardRef.current.removeEventListener("mousemove", handleMouseMove);
          cardRef.current.removeEventListener("mouseleave", handleMouseLeave);
        }
      };
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-md mx-auto"
    >
      <div
        ref={cardRef}
        className="bg-black/30 backdrop-filter backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6 shadow-xl transform-gpu"
        style={{ perspective: "1000px" }}
      >
        <div className="text-center mb-3">
          <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-wider">
            Current Jackpot
          </span>
        </div>

        {/* Display jackpot amount */}
        <div
          ref={jackpotAmountRef}
          className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent my-3"
        >
          {isLoadingJackpot
            ? "Loading..."
            : jackpotAmount !== undefined
            ? `${jackpotAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ${tokenSymbol || "USDC"}`
            : "Error loading jackpot"}
        </div>

        {/* Display countdown */}
        <div ref={countdownRef} className="flex justify-center my-3">
          <div className="text-center">
            <div className="text-xl font-semibold text-white">
              {formattedTime}
            </div>
            <div className="text-xs text-white/60 mt-1">Until next drawing</div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center mt-5 p-4 bg-gradient-to-br from-white/5 to-white/10 rounded-xl border border-white/10">
          <div ref={ticketIconRef} className="text-3xl mb-2">
            🎟️
          </div>
          <div className="text-sm text-white/90 text-center">
            <span className="font-bold text-cyan-400">Join a syndicate</span> to
            buy 100+ tickets as a group
          </div>
          <div className="text-xs text-white/70 mt-2 text-center">
            Odds = Jackpot / (.7 × Tickets bought)
          </div>
          <div className="text-xs text-white/70 mt-1 text-center">
            Example: With 1000 tickets in a $
            {jackpotAmount?.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            }) || "100,000"}{" "}
            jackpot, odds are 1 in ~
            {Math.round((jackpotAmount || 100000) / (0.7 * 1000))}
          </div>

          <Link href="/syndicates" className="w-full mt-4">
            <MagneticButton
              variant="outline"
              className="w-full border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-white"
              textEffect="slide"
              borderEffect={true}
              scale={1.05}
            >
              <span className="magnetic-child">Browse Syndicates</span>
            </MagneticButton>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
