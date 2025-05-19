"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/inputs/button";
import Link from "next/link";

/**
 * GroupTicketPower component that visually demonstrates the power
 * of group ticket purchasing in syndicates
 */
export function GroupTicketPower() {
  return (
    <div className="bg-black/40 rounded-2xl p-8 md:p-12 border border-white/10 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            The Power of Group Tickets
          </h3>
          <p className="text-white/70 mb-6 text-sm">
            When you join a syndicate, you're not just buying a single ticket -
            you're joining forces with hundreds of others to purchase tickets in
            bulk, dramatically increasing your chances of winning. Your odds are
            calculated as: Jackpot / (.7 × Tickets bought). This means your chances
            of winning increase directly with the number of tickets your syndicate buys.
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center text-xl">
                👤
              </div>
              <div>
                <div className="text-white font-medium">Playing Solo</div>
                <div className="text-white/70 text-sm">
                  1 ticket = 1 in ~142,857 odds ($100k jackpot)
                </div>
                <div className="text-orange-300/90 text-sm">
                  Potential win: $100,000 (full jackpot)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-xl">
                👥
              </div>
              <div>
                <div className="text-white font-medium">
                  Joining a Syndicate
                </div>
                <div className="text-white/70 text-sm">
                  100 tickets = 1 in ~1,428 odds <span className="text-green-300">→ 100× better than solo!</span>
                </div>
                <div className="text-white/70 text-sm">
                  1000 tickets = 1 in ~142 odds <span className="text-green-300">→ 1000× better than solo!</span>
                </div>
                <div className="text-orange-300/90 text-sm">
                  Your share of a $100k win (1000 tickets): $1,000 per ticket
                </div>
                <div className="text-white/70 text-sm mt-1">
                  No upper limit on group ticket purchases
                </div>
              </div>
            </div>
          </div>

          <Link href="/explore">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white">
              Find a Syndicate
            </Button>
          </Link>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg" />

          <div className="relative p-6">
            {/* Visual representation of tickets */}
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 100 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.2,
                    delay: i * 0.005,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true }}
                  className="w-full aspect-square bg-gradient-to-br from-cyan-500/40 to-blue-600/40 rounded-sm"
                />
              ))}
            </div>

            <div className="mt-6 text-center">
              <div className="text-white font-medium">100 Tickets</div>
              <div className="text-white/70 text-sm">Purchased as a group</div>
              <div className="text-xs text-cyan-300/90 mt-1">100× better odds than playing alone</div>
            </div>

            <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Win Probability</span>
                <span className="text-cyan-400 font-bold">1 in ~1,428</span>
              </div>
              <div className="text-xs text-white/60 mt-1 text-center">
                For 100 tickets in a $100,000 jackpot = $1,000 per winning ticket
              </div>
              <div className="mt-2 w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "75%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
