"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/inputs/button";

export function NavMenu() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="flex items-center gap-4 z-20 relative">
      <nav className="hidden md:flex items-center gap-6 mr-4">
        <Link
          href="/"
          className={`text-sm font-medium transition-colors ${
            isActive("/")
              ? "text-[#00bcd4]"
              : "text-[#666] hover:text-[#00bcd4]"
          }`}
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className={`text-sm font-medium transition-colors ${
            isActive("/dashboard")
              ? "text-[#00bcd4]"
              : "text-[#666] hover:text-[#00bcd4]"
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/test/cross-chain"
          className={`text-sm font-medium transition-colors ${
            isActive("/test/cross-chain")
              ? "text-[#00bcd4]"
              : "text-[#666] hover:text-[#00bcd4]"
          }`}
        >
          Cross-Chain Test
        </Link>
      </nav>

      <div className="flex items-center gap-2 relative">
        <Link href="/create">
          <Button variant="outline" size="sm" className="hidden md:inline-flex">
            Create Syndicate
          </Button>
        </Link>

        <Link href="/megapot">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:inline-flex"
          >
            Megapot Jackpots
          </Button>
        </Link>
      </div>
    </div>
  );
}
