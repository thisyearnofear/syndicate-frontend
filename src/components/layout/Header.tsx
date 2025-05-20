"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/inputs/button";
import Image from "next/image";
import { LensConnectButton } from "@/components/lens/LensConnectButton";

export function Header() {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 relative">
            <Image
              src="/logo-banner.png"
              alt="Syndicate"
              width={180}
              height={36}
              className="h-full w-auto"
              priority
            />
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/explore">
            <Button
              size="sm"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Browse Syndicates
            </Button>
          </Link>
          <Link href="/megapot">
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 hover:bg-white/10"
            >
              Megapot Jackpots
            </Button>
          </Link>

          <LensConnectButton
            size="sm"
            variant="default"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white"
          />
        </div>
      </div>
    </header>
  );
}
