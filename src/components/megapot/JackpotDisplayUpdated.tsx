"use client";

import {
  Jackpot,
  MainnetJackpotName,
  JACKPOT,
} from "@coordinationlabs/megapot-ui-kit";
import { base } from "viem/chains";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/data-display/card";

/**
 * JackpotDisplay component that displays the Megapot Jackpot component
 * with focus on syndicate participation
 */
export function JackpotDisplayUpdated() {
  return (
    <div className="space-y-8">
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle>Current Jackpot</CardTitle>
        </CardHeader>
        <CardContent>
          {JACKPOT[base.id] && JACKPOT[base.id][MainnetJackpotName.USDC] && (
            <Jackpot
              contract={JACKPOT[base.id][MainnetJackpotName.USDC] as any}
            />
          )}

          <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-center mb-2">
              <span className="text-sm font-medium text-cyan-400">
                Join a Syndicate
              </span>
            </div>
            <div className="text-sm text-white/80 text-center">
              Pool resources with others to buy 100+ tickets as a group
            </div>
            <div className="text-xs text-white/60 mt-2 text-center">
              Odds = Jackpot / (.7 × Tickets bought)
            </div>
            <div className="text-xs text-white/60 mt-1 text-center">
              Example: With 1000 tickets in a $100,000 jackpot, odds are 1 in
              ~142
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
