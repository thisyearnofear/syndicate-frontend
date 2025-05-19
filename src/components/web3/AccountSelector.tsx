"use client";

import { useState } from "react";
import { authorize } from "@/lib/api";
import { useAccount, useWalletClient } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { Button } from "@/components/ui/inputs/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/data-display/avatar";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { useRouter } from "next/navigation";

// Define a simple Account interface to match what we need
interface Account {
  address: string;
  owner?: string;
  metadata?: {
    picture?: string;
  };
  username?: {
    localName?: string;
  };
}

interface AccountSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAccount?: Account | null;
  onSuccess?: (account?: Account) => void;
  trigger?: React.ReactNode;
}

export function AccountSelector({
  open,
  onOpenChange,
  currentAccount = null,
  onSuccess,
  trigger,
}: AccountSelectorProps) {
  const { data: walletClient } = useWalletClient();
  const router = useRouter();
  const wallet = useAccount();
  const [loading, setLoading] = useState(false);

  // Mock data for available accounts
  const mockAccounts = {
    items: [
      {
        account: {
          address: "0x1234...5678",
          owner: wallet.address,
          metadata: {
            picture: "/placeholder-avatar.png",
          },
          username: {
            localName: "user1",
          },
        },
      },
    ],
  };

  const handleSelectAccount = async (account: Account) => {
    if (!walletClient) return;
    try {
      setLoading(true);

      // Simplified authentication flow - just log the attempt
      console.log("Would authenticate with account:", account.address);

      // Mock backend authorize call
      const backendResult = await authorize(
        account.address,
        walletClient.account.address
      );

      if (!backendResult.allowed) {
        alert(
          "Backend did not allow this account: " +
            (backendResult.reason || "Not allowed")
        );
        return;
      }

      onOpenChange(false);

      if (onSuccess) {
        onSuccess(account);
      }

      router.refresh();
    } catch (error) {
      console.error("Authentication failed:", error);
      alert("Authentication failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Select Lens Account</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[600px] pr-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            {loading && (
              <div className="text-sm text-muted-foreground col-span-3">
                Loading accounts...
              </div>
            )}
            {mockAccounts.items.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-3">
                No Lens profiles found for this wallet.
              </p>
            )}
            {mockAccounts.items.length > 0 &&
              mockAccounts.items.map((acc) => {
                const isCurrentAccount = currentAccount
                  ? acc.account.address === currentAccount.address
                  : false;

                return (
                  <Button
                    key={acc.account.address}
                    variant="outline"
                    disabled={loading || isCurrentAccount}
                    onClick={() => handleSelectAccount(acc.account)}
                    className="flex flex-col items-center h-auto py-3 px-2"
                  >
                    <Avatar className="w-10 h-10 mb-2">
                      <AvatarImage src={acc.account.metadata?.picture} />
                      <AvatarFallback>
                        {acc.account.username?.localName?.charAt(0) ||
                          acc.account.address.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-center truncate w-full text-xs">
                      {acc.account.username?.localName || acc.account.address}
                      {isCurrentAccount && (
                        <span className="block text-xs text-muted-foreground">
                          (current)
                        </span>
                      )}
                    </span>
                  </Button>
                );
              })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
