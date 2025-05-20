"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/inputs/magnetic-button";
import { JackpotHeroDisplay } from "@/components/megapot/JackpotHeroDisplay";
import { AnimatedBackground } from "@/components/ui/effects/animated-background";
import { CustomCursor } from "@/components/ui/effects/custom-cursor";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { base } from "viem/chains";
import { WagmiProvider } from "wagmi";
import { MegapotWrapper } from "@/components/megapot/MegapotWrapper";

// Private Alchemy RPC URL for Base chain
const ALCHEMY_BASE_RPC_URL =
  "https://base-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH";

// Create a client for React Query with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Configure Wagmi with Base chain using Alchemy RPC
const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(ALCHEMY_BASE_RPC_URL),
  },
});

export function EnhancedHeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  // Initialize animations - simplified to prevent GSAP errors
  useEffect(() => {
    if (
      !heroRef.current ||
      !titleRef.current ||
      !subtitleRef.current ||
      !buttonsRef.current
    )
      return;

    // Prepare the title for animation first, then animate
    const titleText = titleRef.current.innerText;
    titleRef.current.innerHTML = titleText
      .split("")
      .map((char) =>
        char === " "
          ? `<span class="char">&nbsp;</span>`
          : `<span class="char">${char}</span>`
      )
      .join("");

    // Create a timeline for the hero section animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Get the characters after DOM has been updated
    const chars = titleRef.current.querySelectorAll(".char");

    // Only proceed if elements exist
    if (chars.length > 0) {
      tl.fromTo(
        chars,
        {
          opacity: 0,
          y: 20,
          rotateX: -90,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.03,
          duration: 0.8,
        }
      );
    }

    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      "-=0.4"
    );

    // Check if button children exist before animating
    if (buttonsRef.current.children.length > 0) {
      tl.fromTo(
        buttonsRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 },
        "-=0.3"
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <AnimatedBackground
      variant="gradient"
      intensity="medium"
      colors={["#000000", "#0f172a", "#1e293b"]}
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-16 relative"
    >
      {/* Custom cursor */}
      <CustomCursor color="rgba(6, 182, 212, 0.6)" size={30} />

      {/* Animated orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500 rounded-full filter blur-[120px] opacity-20 z-0 animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500 rounded-full filter blur-[120px] opacity-20 z-0 animate-pulse" />

      <div ref={heroRef} className="container mx-auto max-w-6xl z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1
                ref={titleRef}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent"
                style={{ perspective: "1000px" }}
              >
                Win Together, Impact Together
              </h1>

              <p
                ref={subtitleRef}
                className="text-lg md:text-xl text-white/80 max-w-xl"
              >
                Join cause-driven lottery syndicates with 1000× better odds than
                playing solo. Pool your luck, share the rewards, and make an
                impact together.
              </p>
            </motion.div>

            <div className="mt-4 p-4 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 mb-6">
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center text-sm">
                <div className="text-green-300 font-medium whitespace-nowrap">
                  Value Proposition:
                </div>
                <ul className="list-disc pl-5 text-white/80 space-y-1">
                  <li>1-in-143 odds with 1,000 tickets vs 1-in-143,000 solo</li>
                  <li>
                    $1,000 per ticket from a $1M jackpot with 1,000 tickets
                  </li>
                  <li>Optional cause donations attract more participants</li>
                </ul>
              </div>
            </div>

            <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4">
              <ConnectKitButton.Custom>
                {({ isConnected, show, truncatedAddress, ensName }) => (
                  <MagneticButton
                    onClick={show}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-xl"
                    textEffect="slide"
                    scale={1.05}
                  >
                    <span className="magnetic-child flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                      </svg>
                      {isConnected
                        ? `${ensName || truncatedAddress}`
                        : "Connect Wallet"}
                    </span>
                  </MagneticButton>
                )}
              </ConnectKitButton.Custom>

              <div className="flex gap-3">
                <Link href="/create">
                  <MagneticButton
                    variant="outline"
                    className="border-purple-500/30 bg-white/5 hover:bg-white/10 text-white"
                    textEffect="slide"
                    borderEffect={true}
                    scale={1.05}
                  >
                    <span className="magnetic-child flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M12 5v14"></path>
                        <path d="M5 12h14"></path>
                      </svg>
                      Create Syndicate
                    </span>
                  </MagneticButton>
                </Link>

                <Link href="/syndicates">
                  <MagneticButton
                    variant="outline"
                    className="border-cyan-500/30 bg-white/5 hover:bg-white/10 text-white"
                    textEffect="slide"
                    borderEffect={true}
                    scale={1.05}
                  >
                    <span className="magnetic-child flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      Join a Syndicate
                    </span>
                  </MagneticButton>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md" key="jackpot-display">
            <QueryClientProvider client={queryClient}>
              <WagmiProvider config={wagmiConfig}>
                <MegapotWrapper>
                  <JackpotHeroDisplay />
                </MegapotWrapper>
              </WagmiProvider>
            </QueryClientProvider>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}
