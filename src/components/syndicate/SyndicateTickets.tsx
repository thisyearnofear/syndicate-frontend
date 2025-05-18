"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useCrossChain } from "@/hooks/use-cross-chain";
import { Button } from "@/components/ui/inputs/button";
import { Card } from "@/components/ui/layouts/card";
import { Loader2, ArrowLeft, CheckCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { 
  BASE_CHAIN_ID,
  DECENT_API_KEY,
  DEFAULT_CAUSE_PERCENTAGE,
  LENS_CHAIN_ID,
  MEGAPOT_CONTRACT_ADDRESS,
  SYNDICATE_TREASURY_ADDRESS,
  USDC_ADDRESS_BASE,
  USDC_ADDRESS_LENS 
} from "@/lib/cross-chain/constants";

interface Ticket {
  id: string;
  purchaseDate: Date;
  drawDate: Date | null;
  isWinner: boolean;
  winAmount?: number;
  claimed: boolean;
}

interface SyndicateTicketsProps {
  syndicateId: string;
  syndicateAddress: string;
  causeAddress: string;
  causePercentage?: number;
  tickets?: Ticket[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onClaimComplete?: (txHash: string) => void;
  className?: string;
}

export function SyndicateTickets({
  syndicateId,
  syndicateAddress,
  causeAddress,
  causePercentage = DEFAULT_CAUSE_PERCENTAGE,
  tickets = [],
  isLoading: isLoadingTickets = false,
  onRefresh,
  onClaimComplete,
  className = "",
}: SyndicateTicketsProps) {
  const { address, isConnected } = useAccount();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isClaimingWinnings, setIsClaimingWinnings] = useState(false);

  // Find winning tickets that haven't been claimed
  const winningTickets = tickets.filter(ticket => ticket.isWinner && !ticket.claimed);
  const hasWinningTickets = winningTickets.length > 0;
  
  // Initialize cross-chain hook for bridging winnings
  const { 
    isLoading, 
    isPending, 
    error, 
    txHash, 
    txStatus, 
    bridgeWinnings
  } = useCrossChain({
    apiKey: DECENT_API_KEY,
    onSuccess: (hash) => {
      toast.success("Claim initiated successfully!", {
        description: `Your winnings will be transferred from Base to Lens Chain.`,
        action: {
          label: "View on Explorer",
          onClick: () => window.open(`https://basescan.io/tx/${hash}`, "_blank"),
        },
      });
      
      if (onClaimComplete) {
        onClaimComplete(hash);
      }
    },
    onError: (err) => {
      toast.error("Claim transaction failed", {
        description: err.message,
      });
      setIsClaimingWinnings(false);
    },
    onStatusChange: (status, data) => {
      if (status === "executed") {
        toast.success("Winnings claimed successfully!", {
          description: `The winnings have been distributed to the cause (${causePercentage}%) and syndicate participants (${100-causePercentage}%).`,
        });
        setIsClaimingWinnings(false);
        setSelectedTicket(null);
        if (onRefresh) onRefresh();
      } else if (status === "failed") {
        toast.error("Transaction execution failed", {
          description: data?.message || "Please try again later.",
        });
        setIsClaimingWinnings(false);
      }
    },
  });

  // Handle claiming winnings
  const handleClaimWinnings = async (ticket: Ticket) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!ticket.isWinner || ticket.claimed || !ticket.winAmount) {
      return;
    }

    setSelectedTicket(ticket);
    setIsClaimingWinnings(true);

    try {
      await bridgeWinnings({
        sourceChainId: BASE_CHAIN_ID,
        destinationChainId: LENS_CHAIN_ID,
        usdcAddressSource: USDC_ADDRESS_BASE,
        usdcAddressDestination: USDC_ADDRESS_LENS,
        totalAmount: ticket.winAmount,
        syndicateTreasuryAddress: SYNDICATE_TREASURY_ADDRESS,
        syndicateAddress: syndicateAddress,
        causeAddress: causeAddress,
        causePercentage: causePercentage,
        pollStatus: true,
      });
    } catch (err) {
      console.error("Claim error:", err);
      setIsClaimingWinnings(false);
    }
  };

  // Reset claiming state if user navigates away
  useEffect(() => {
    return () => {
      setIsClaimingWinnings(false);
      setSelectedTicket(null);
    };
  }, []);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Syndicate Tickets</h3>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoadingTickets}
          >
            {isLoadingTickets ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {isLoadingTickets ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-cyan-500 animate-spin mb-2" />
          <p className="text-white/70">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8 text-white/70">
          <p>No tickets purchased yet.</p>
          <p className="text-sm mt-2">Contribute to the syndicate to buy tickets.</p>
        </div>
      ) : isClaimingWinnings && selectedTicket ? (
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => {
              setIsClaimingWinnings(false);
              setSelectedTicket(null);
            }}
            disabled={isLoading || isPending}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to tickets
          </Button>

          <div className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border border-emerald-500/30 rounded-md p-4">
            <h4 className="text-lg font-bold text-emerald-400 mb-2">Claim Winning Ticket</h4>
            <p className="mb-2">Ticket #{selectedTicket.id} has won:</p>
            <p className="text-2xl font-bold mb-3">${selectedTicket.winAmount?.toFixed(2)} USDC</p>
            
            <div className="bg-black/20 p-3 rounded-md text-sm mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-white/70">To Cause ({causePercentage}%):</span>
                <span>${((selectedTicket.winAmount || 0) * causePercentage / 100).toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-white/70">To Participants ({100-causePercentage}%):</span>
                <span>${((selectedTicket.winAmount || 0) * (100-causePercentage) / 100).toFixed(2)} USDC</span>
              </div>
            </div>

            <p className="text-xs text-white/60 mb-4">
              This is a cross-chain transaction from Base to Lens Chain. The winnings will be distributed according to the syndicate's rules.
            </p>

            <Button
              onClick={() => handleClaimWinnings(selectedTicket)}
              disabled={isLoading || isPending || (txHash && txStatus === "executed")}
              className="w-full"
              variant={txHash && txStatus === "executed" ? "outline" : "default"}
            >
              {isLoading || isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : txHash && txStatus === "executed" ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : null}
              {isLoading || isPending
                ? "Processing..."
                : txHash && txStatus === "polling"
                ? "Confirming..."
                : txHash && txStatus === "executed"
                ? "Claim Complete!"
                : "Claim Winnings"}
            </Button>

            {error && (
              <div className="mt-4 bg-red-900/30 border border-red-500/30 rounded-md p-3 text-sm">
                <p className="font-medium text-red-400">Transaction Error</p>
                <p className="text-white/70">{error.message}</p>
              </div>
            )}

            {txHash && (
              <div className="mt-4 text-xs text-center text-white/60">
                Transaction: {txHash.slice(0, 6)}...{txHash.slice(-4)} {" "}
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
        </div>
      ) : (
        <div className="space-y-4">
          {hasWinningTickets && (
            <div className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border border-emerald-500/30 rounded-md p-4 mb-4">
              <h4 className="text-lg font-bold text-emerald-400 mb-2">🎉 Winning Tickets!</h4>
              <p className="mb-3">You have {winningTickets.length} winning ticket{winningTickets.length !== 1 ? 's' : ''}. Claim your winnings now.</p>
              <Button
                onClick={() => handleClaimWinnings(winningTickets[0])}
                className="w-full"
              >
                Claim Winnings
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-3 font-medium text-white/70">Ticket #</th>
                  <th className="text-left py-2 px-3 font-medium text-white/70">Purchased</th>
                  <th className="text-left py-2 px-3 font-medium text-white/70">Draw Date</th>
                  <th className="text-right py-2 px-3 font-medium text-white/70">Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-3">{ticket.id}</td>
                    <td className="py-3 px-3">{ticket.purchaseDate.toLocaleDateString()}</td>
                    <td className="py-3 px-3">
                      {ticket.drawDate 
                        ? ticket.drawDate.toLocaleDateString()
                        : "Pending"}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {ticket.isWinner && !ticket.claimed ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-400">
                          Won ${ticket.winAmount?.toFixed(2)}
                        </span>
                      ) : ticket.isWinner && ticket.claimed ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-400">
                          Claimed
                        </span>
                      ) : ticket.drawDate && new Date() > ticket.drawDate ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-white/70">
                          No win
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}