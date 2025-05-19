"use client";

import React from "react";
import { motion } from "framer-motion";
import { GroupTicketPower } from "@/components/syndicate/GroupTicketPower";

const steps = [
  {
    number: "01",
    title: "Connect & Join",
    description:
      "Connect your wallet and join or create a Syndicate around a cause you care about.",
    icon: "🔗",
    color: "bg-cyan-500",
  },
  {
    number: "02",
    title: "Pool Resources",
    description:
      "Your contribution joins the pool, dramatically increasing everyone's chances of winning.",
    icon: "🤝",
    color: "bg-blue-500",
  },
  {
    number: "03",
    title: "Smart Contracts",
    description:
      "Winning allocations are encoded in smart contracts that execute automatically.",
    icon: "📜",
    color: "bg-cyan-500",
  },
  {
    number: "04",
    title: "Create Impact",
    description:
      "When your Syndicate wins, a portion goes to your cause and the rest to members.",
    icon: "🌱",
    color: "bg-blue-500",
  },
];

export function AdaptedHowItWorks() {
  return (
    <section className="py-16 bg-black/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            How Syndicate Works
          </h2>
          <p className="text-white/70 max-w-xl mx-auto text-sm">
            A simple process that creates powerful coordination for both winning
            and impact.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center text-2xl mb-6 relative z-10`}
                  >
                    {step.icon}
                  </div>

                  <div className="absolute top-8 text-5xl font-bold text-gray-800/20 -z-10">
                    {step.number}
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/70 text-center text-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-20 bg-black/40 rounded-2xl p-8 md:p-12 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Better Odds, Bigger Impact
              </h3>
              <p className="text-white/70 mb-6 text-sm">
                Why accept 1-in-143,000 odds alone when you can get 1-in-140 odds together? 
                By pooling resources with others who share your values, you dramatically 
                increase your chances of winning. A $1M jackpot means $1,000 per ticket in a 1,000-ticket 
                syndicate — with odds 1,000× better than playing solo. Plus, supporting causes 
                attracts more participants, further improving your odds.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">
                    1000×
                  </div>
                  <div className="text-sm text-white/70">
                    Better odds than playing solo
                  </div>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">
                    $1000+
                  </div>
                  <div className="text-sm text-white/70">
                    Potential win per ticket
                  </div>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-white/10 sm:col-span-2 lg:col-span-1">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">
                    20%
                  </div>
                  <div className="text-sm text-white/70">
                    Optional cause allocation
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-64 md:h-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="60"
                    fill="url(#gradient)"
                    fillOpacity="0.1"
                  />
                  <path
                    d="M100 40C122.091 40 140 57.9086 140 80C140 102.091 122.091 120 100 120C77.9086 120 60 102.091 60 80C60 57.9086 77.9086 40 100 40Z"
                    fill="url(#gradient)"
                    fillOpacity="0.2"
                  />
                  <path
                    d="M100 60C111.046 60 120 68.9543 120 80C120 91.0457 111.046 100 100 100C88.9543 100 80 91.0457 80 80C80 68.9543 88.9543 60 100 60Z"
                    fill="url(#gradient)"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="40"
                      y1="40"
                      x2="160"
                      y2="160"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#22D3EE" />
                      <stop offset="1" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Group Ticket Power Component */}
        <GroupTicketPower />

        <div className="mt-12 bg-black/40 rounded-2xl p-8 md:p-12 border border-white/10">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Powered by Megapot
            </h3>
            <p className="text-white/70 max-w-2xl mx-auto text-sm">
              Syndicate leverages Megapot's onchain lottery system to create
              transparent, fair, and impactful prize pools, now available on
              Lens Chain with GHO stablecoin as the native gas token.
            </p>
          </div>

          <div className="flex justify-center">
            <a
              href="/megapot"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            >
              View Current Jackpots
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
