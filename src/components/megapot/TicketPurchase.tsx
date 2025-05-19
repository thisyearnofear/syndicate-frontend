"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useMegapotTickets } from "@/hooks/use-megapot-tickets";
import { Button } from "@/components/ui/inputs/button";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import { Loader2, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_REFERRER_ADDRESS, TokenType } from "@/lib/cross-chain/config";

interface TicketPurchaseProps {
  syndicateId?: string;
  syndicateName?: string;
  initialTicketCount?: number;
  ticketPriceInUSDC?: number;
  causeName?: string;
  causePercentage?: number;
  onPurchaseComplete?: (txHash: string) => void;
  className?: string;
}

export function TicketPurchase({
  syndicateId,
  syndicateName = "Your Syndicate",
  initialTicketCount = 1,
  ticketPriceInUSDC = 1, // Default $1 per ticket
  causeName = "Featured Cause",
  causePercentage = 20,
  onPurchaseComplete,
  className = "",
}: TicketPurchaseProps) {
  const { address, isConnected } = useAccount();
  const [ticketCount, setTicketCount] = useState(initialTicketCount);
  const [isConfirming, setIsConfirming] = useState(false);

  // Initialize ticket purchase hook
  const { purchaseTickets, isLoading, isPending, error, txHash, txStatus } =
    useMegapotTickets({
      onSuccess: (hash) => {
        toast.success("Transaction submitted!", {
          description: `Your tickets will be purchased soon.`,
          action: {
            label: "View",
            onClick: () =>
              window.open(`https://basescan.io/tx/${hash}`, "_blank"),
          },
        });

        if (onPurchaseComplete) {
          onPurchaseComplete(hash);
        }
      },
      onError: (err) => {
        toast.error("Transaction failed", {
          description: err.message,
        });
      },
      onStatusChange: (status) => {
        if (status === "Executed") {
          toast.success("Tickets purchased successfully!", {
            description: `${ticketCount} ticket${
              ticketCount !== 1 ? "s" : ""
            } purchased for ${syndicateName}.`,
          });
        } else if (status === "Failed") {
          toast.error("Transaction execution failed");
        }
      },
    });

  // Calculate total cost
  const totalCost = ticketCount * ticketPriceInUSDC;
  const sourceTokenType = TokenType.GHO;

  // Format the display of different states
  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (isLoading || isPending) return "Processing...";
    if (txHash && txStatus === "polling") return "Confirming...";
    if (txHash && txStatus === "Executed") return "Purchase Complete!";
    if (isConfirming) return "Confirm Purchase";
    return `Buy ${ticketCount} Ticket${ticketCount !== 1 ? "s" : ""}`;
  };

  // Handle ticket purchase
  const handlePurchase = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (isConfirming) {
      try {
        await purchaseTickets({
          ticketCount,
          ticketPrice: ticketPriceInUSDC,
          syndicateId,
          referrerAddress: DEFAULT_REFERRER_ADDRESS,
        });
        setIsConfirming(false);
      } catch (err) {
        console.error("Purchase error:", err);
      }
    } else {
      setIsConfirming(true);
    }
  };

  // Reset confirming state if user changes ticket count
  useEffect(() => {
    setIsConfirming(false);
  }, [ticketCount]);

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-xl font-bold mb-4">Purchase Tickets</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Tickets
          </label>
          <div className="flex items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
              disabled={isLoading || isPending || ticketCount <= 1}
              className="h-9 px-2"
            >
              -
            </Button>
            <Input
              type="number"
              value={ticketCount}
              onChange={(e) =>
                setTicketCount(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="mx-2 text-center w-20 h-9"
              min="1"
              disabled={isLoading || isPending}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTicketCount(ticketCount + 1)}
              disabled={isLoading || isPending}
              className="h-9 px-2"
            >
              +
            </Button>
          </div>
        </div>

        <div className="bg-black/20 p-3 rounded-md">
          <div className="flex justify-between mb-1">
            <span className="text-white/70">Ticket Price:</span>
            <span>${ticketPriceInUSDC.toFixed(2)} GHO</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-white/70">Tickets:</span>
            <span>{ticketCount}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-white/10 pt-2 mt-2">
            <span>Total Cost:</span>
            <span>${totalCost.toFixed(2)} GHO</span>
          </div>
        </div>

        {isConfirming && (
          <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-md p-3 text-sm">
            <p className="font-medium text-cyan-400 mb-1">
              Confirm Your Purchase
            </p>
            <p className="mb-2">
              You are buying {ticketCount} ticket{ticketCount !== 1 ? "s" : ""}{" "}
              for ${totalCost.toFixed(2)} GHO.
            </p>
            <p className="mb-1">
              <strong>{causePercentage}%</strong> of any winnings will go to{" "}
              <strong>{causeName}</strong>.
            </p>
            <p className="text-xs text-white/60">
              This is a cross-chain transaction from Lens Chain (GHO) to Base
              (USDC). Tickets will be purchased on the Base network.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-md p-3 text-sm flex items-start">
            <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-400">Transaction Error</p>
              <p className="text-white/70">{error.message}</p>
            </div>
          </div>
        )}

        <Button
          onClick={handlePurchase}
          disabled={Boolean(
            isLoading || isPending || (txHash && txStatus === "Executed")
          )}
          className="w-full"
          variant={
            Boolean(txHash && txStatus === "Executed") ? "outline" : "default"
          }
        >
          {isLoading || isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : txHash && txStatus === "Executed" ? (
            <CheckCircle className="mr-2 h-4 w-4" />
          ) : isConfirming ? (
            <ArrowRight className="mr-2 h-4 w-4" />
          ) : null}
          {getButtonText()}
        </Button>

        {txHash && (
          <div className="text-xs text-center text-white/60">
            Transaction: {txHash.slice(0, 6)}...{txHash.slice(-4)}{" "}
            <a
              href={`https://basescan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              View on Explorer
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}
