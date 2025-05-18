"use client";

import { Button } from "@/components/ui/inputs/button";
import { DialogTrigger } from "@/components/ui/overlay/dialog";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { ConnectKitButton } from "connectkit";
import { useState } from "react";
import { AccountSelector } from "./AccountSelector";

export function Login() {
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const { data: authenticatedUser, loading: authUserLoading } = useAuthenticatedUser();

  return (
    <div className="p-2 space-y-2 mb-2 w-full flex flex-col items-center">
      <ConnectKitButton.Custom>
        {({ isConnected: isWalletConnected, show, truncatedAddress, ensName, chain }) => {
          const connectKitDisplayName = ensName ?? truncatedAddress;

          if (!isWalletConnected) {
            return (
              <Button onClick={show} className="w-full px-6 py-3 rounded-full bg-[#00bcd4] text-white font-bold text-lg shadow hover:bg-[#0097a7] transition">
                🧑‍🤝‍🧑 Continue with Family Wallet
              </Button>
            );
          }

          if (isWalletConnected && !authenticatedUser) {
            return (
              <AccountSelector
                open={showAccountSelector}
                onOpenChange={setShowAccountSelector}
                trigger={
                  <DialogTrigger asChild>
                    <Button className="w-full px-6 py-3 rounded-full bg-[#43a047] text-white font-bold text-lg shadow hover:bg-[#388e3c] transition">
                      Sign in with Lens
                    </Button>
                  </DialogTrigger>
                }
              />
            );
          }

          if (isWalletConnected && authenticatedUser) {
            const displayIdentity = connectKitDisplayName ?? "...";
            return (
              <div className="flex flex-col items-center gap-2 w-full">
                <span className="text-muted-foreground truncate text-center" title={authenticatedUser.address}>
                  <span className="text-primary font-semibold">Welcome, {displayIdentity}!</span>
                </span>
                <span className="text-xs text-[#888]">You're connected and ready to join a Syndicate.</span>
              </div>
            );
          }

          return <p className="text-xs text-muted-foreground text-center">Checking wallet status...</p>;
        }}
      </ConnectKitButton.Custom>
    </div>
  );
}
