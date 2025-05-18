"use client";

import {
  Jackpot,
  MainnetJackpotName,
  TestnetJackpotName,
  JACKPOT,
} from "@coordinationlabs/megapot-ui-kit";
import { base, baseSepolia } from "viem/chains";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/data-display/card";

interface JackpotDisplayProps {
  testnetOnly?: boolean;
}

/**
 * JackpotDisplay component that displays the Megapot Jackpot component
 * Can be configured to show testnet only or both mainnet and testnet
 */
export function JackpotDisplay({ testnetOnly = false }: JackpotDisplayProps) {
  return (
    <div className="space-y-8">
      {!testnetOnly && (
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle>Base Mainnet Jackpot</CardTitle>
          </CardHeader>
          <CardContent>
            {JACKPOT[base.id]?.[MainnetJackpotName.USDC] && (
              <Jackpot
                contract={JACKPOT[base.id][MainnetJackpotName.USDC] as any}
              />
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle>Base Sepolia Testnet Jackpot</CardTitle>
        </CardHeader>
        <CardContent>
          {JACKPOT[baseSepolia.id]?.[TestnetJackpotName.MPUSDC] && (
            <Jackpot
              contract={
                JACKPOT[baseSepolia.id][TestnetJackpotName.MPUSDC] as any
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
