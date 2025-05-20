"use client";

import { SwapComponent } from "@/components/swap/SwapComponent";

export default function SwapTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">
        GHO/USDC Swap Test
      </h1>
      <SwapComponent />
    </div>
  );
}
