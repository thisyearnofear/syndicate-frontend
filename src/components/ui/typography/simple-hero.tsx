"use client";

import React from "react";
import { Button } from "@/components/ui/inputs/button";
import { ConnectKitButton } from "connectkit";

export function SimpleHero() {
  return (
    <div className="relative overflow-hidden bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-violet-950 opacity-90" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500 rounded-full filter blur-[100px] opacity-20" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500 rounded-full filter blur-[100px] opacity-20" />

      {/* Content */}
      <div className="relative container mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center z-10">
        <div className="mb-6">
          <div className="inline-block p-3 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 mb-6">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M24 4L30.7 17.8L46 19.5L34.5 29.6L37.5 44.2L24 37L10.5 44.2L13.5 29.6L2 19.5L17.3 17.8L24 4Z"
                fill="url(#paint0_linear)"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient
                  id="paint0_linear"
                  x1="24"
                  y1="4"
                  x2="24"
                  y2="44.2"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#60A5FA" />
                  <stop offset="1" stopColor="#A78BFA" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          Rally Your Cause, <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
            Raise Your Odds
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10">
          Syndicate leverages the Lens protocol on Megapot's onchain lottery
          system, creating a powerful SocialFi coordination layer for
          purpose-driven lottery participation.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
          <ConnectKitButton.Custom>
            {({ isConnected, show, truncatedAddress, ensName }) => (
              <Button
                onClick={show}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium rounded-xl"
              >
                {isConnected
                  ? `Connected: ${ensName || truncatedAddress}`
                  : "Connect Wallet"}
              </Button>
            )}
          </ConnectKitButton.Custom>

          <Button
            variant="outline"
            size="lg"
            className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl"
            onClick={() => (window.location.href = "/create")}
          >
            Create Syndicate
          </Button>
        </div>

        <div className="mt-16 flex items-center justify-center gap-8">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-white">1500+</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-white">$2.5M</div>
            <div className="text-sm text-gray-400">Total Volume</div>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-white">15x</div>
            <div className="text-sm text-gray-400">Better Odds</div>
          </div>
        </div>
      </div>
    </div>
  );
}
