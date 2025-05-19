"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/inputs/button";

export function Footer() {
  return (
    <footer className="py-8 border-t border-white/10 bg-black/60 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 relative">
                <Image 
                  src="/logo-banner.png" 
                  alt="Syndicate" 
                  width={160}
                  height={32}
                  className="h-full w-auto" 
                />
              </div>
            </div>
            <p className="text-sm text-white/70 max-w-xs">
              SocialFi-powered, programmable philanthropy. Pool your luck, pledge your impact, and win together on Lens.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/explore" className="text-sm text-white/70 hover:text-white transition-colors">
                  Browse Syndicates
                </Link>
              </li>
              <li>
                <Link href="/megapot" className="text-sm text-white/70 hover:text-white transition-colors">
                  Megapot Jackpots
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-sm text-white/70 hover:text-white transition-colors">
                  Create a Syndicate
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-white/70 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://docs.lens.xyz" target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-white transition-colors">
                  Lens Protocol
                </a>
              </li>
              <li>
                <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-white transition-colors">
                  Base Chain
                </a>
              </li>
              <li>
                <a href="https://across.to" target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-white transition-colors">
                  Across Protocol
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Join Us</h4>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10">
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
                  Discord
                </a>
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  Twitter
                </a>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-white/70 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Syndicate | Win Together, Impact Together
          </div>
          <div className="flex space-x-4">
            <Link href="/privacy" className="text-sm text-white/70 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-white/70 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}