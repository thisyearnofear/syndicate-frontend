"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/inputs/button";
import { ConnectKitButton } from "connectkit";
import { ThemeToggle } from "@/components/ui/inputs/ThemeToggle";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-gray-900/90 backdrop-blur-lg border-b border-gray-800/50 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="font-bold text-xl text-white">Syndicate</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Explore
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                About
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              <Link href="/create">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Create
                </Button>
              </Link>

              <ConnectKitButton.Custom>
                {({ isConnected, show, truncatedAddress, ensName }) => (
                  <Button
                    onClick={show}
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white"
                  >
                    {isConnected ? `${ensName || truncatedAddress}` : "Connect"}
                  </Button>
                )}
              </ConnectKitButton.Custom>
            </div>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-900 border-t border-gray-800"
          >
            <div className="container mx-auto px-6 py-4">
              <nav className="flex flex-col gap-4">
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/")
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="#"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Explore
                </Link>
                <Link
                  href="#"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>

                <div className="flex flex-col gap-3 mt-4">
                  <Link
                    href="/create"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      Create Syndicate
                    </Button>
                  </Link>

                  <ConnectKitButton.Custom>
                    {({ isConnected, show, truncatedAddress, ensName }) => (
                      <Button
                        onClick={() => {
                          if (show) show();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white"
                      >
                        {isConnected
                          ? `${ensName || truncatedAddress}`
                          : "Connect Wallet"}
                      </Button>
                    )}
                  </ConnectKitButton.Custom>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
