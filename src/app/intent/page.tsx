"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAccount, useBalance, useContractRead } from "wagmi";
import { useChainId } from "wagmi";
import { parseEther, formatEther } from "viem";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/data-display/card";
import { Label } from "@/components/ui/inputs/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/feedback/alert";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Intent Resolver ABI (partial)
const INTENT_RESOLVER_ABI = [
  {
    name: "submitIntent",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "tuple",
        name: "intent",
        components: [
          { name: "intentType", type: "uint8" },
          { name: "syndicateAddress", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "tokenAddress", type: "address" },
          { name: "sourceChainId", type: "uint32" },
          { name: "destinationChainId", type: "uint32" },
          { name: "ticketId", type: "uint256" },
          { name: "useOptimalRoute", type: "bool" },
          { name: "maxFeePercentage", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "metadata", type: "bytes" },
        ],
      },
    ],
    outputs: [{ type: "bytes32", name: "intentId" }],
  },
];

// GHO Token ABI (partial)
const GHO_TOKEN_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool", name: "" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256", name: "" }],
  },
];

// Intent types
const INTENT_TYPES = {
  JOIN_SYNDICATE: 1,
  BUY_TICKET: 2,
  CLAIM_WINNINGS: 3,
  WITHDRAW_FUNDS: 4,
};

// Chain IDs
const LENS_CHAIN_ID = 1337; // Replace with actual Lens Chain ID
const BASE_CHAIN_ID = 8453;

// Contract addresses (these would come from environment variables in a real app)
const INTENT_RESOLVER_ADDRESS = "0xIntentResolverAddress";
const GHO_TOKEN_ADDRESS = "0xGhoTokenAddress";

export default function IntentPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState("join");
  const [amount, setAmount] = useState("");
  const [syndicateAddress, setSyndicateAddress] = useState("");
  const [processingIntent, setProcessingIntent] = useState(false);
  const [intentStatus, setIntentStatus] = useState<{
    status: "success" | "error" | "pending" | null;
    message: string;
  }>({
    status: null,
    message: "",
  });

  // Get GHO balance
  const { data: ghoBalance, isLoading: isLoadingBalance } = useBalance({
    address,
    token: GHO_TOKEN_ADDRESS as `0x${string}`,
    chainId: LENS_CHAIN_ID,
  });

  // Check allowance
  const { data: allowanceData } = useContractRead({
    address: GHO_TOKEN_ADDRESS as `0x${string}`,
    abi: GHO_TOKEN_ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, INTENT_RESOLVER_ADDRESS as `0x${string}`],
    chainId: LENS_CHAIN_ID,
  }) as { data: bigint | undefined };

  useEffect(() => {
    // Reset form when tab changes
    setAmount("");
    setIntentStatus({ status: null, message: "" });
  }, [activeTab]);

  // Handle approval of tokens
  const handleApprove = async () => {
    if (!amount || !isConnected) return;

    try {
      setProcessingIntent(true);

      // Approve tokens (this would use the wagmi hooks in a real implementation)
      // For brevity, we're simulating this
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("GHO approval successful");
      setProcessingIntent(false);
    } catch (error) {
      console.error("Error approving tokens:", error);
      toast.error("Failed to approve GHO tokens");
      setProcessingIntent(false);
    }
  };

  // Handle submitting an intent
  const handleSubmitIntent = async () => {
    if (!amount || !isConnected || !syndicateAddress) {
      toast.error("Please fill in all fields");
      return;
    }

    if (chainId !== LENS_CHAIN_ID) {
      toast.error("Please switch to Lens Chain to submit an intent");
      return;
    }

    try {
      setProcessingIntent(true);
      setIntentStatus({
        status: "pending",
        message: "Processing your intent...",
      });

      // Determine intent type based on active tab
      const intentType =
        activeTab === "join"
          ? INTENT_TYPES.JOIN_SYNDICATE
          : INTENT_TYPES.BUY_TICKET;

      // Set deadline to 1 hour from now
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      // Set destination chain based on intent type
      const destinationChain =
        intentType === INTENT_TYPES.BUY_TICKET ? BASE_CHAIN_ID : LENS_CHAIN_ID;

      // Prepare intent data
      const intentData = {
        intentType,
        syndicateAddress,
        amount: parseEther(amount),
        tokenAddress: GHO_TOKEN_ADDRESS,
        sourceChainId: LENS_CHAIN_ID,
        destinationChainId: destinationChain,
        ticketId: 0, // Not relevant for these intent types
        useOptimalRoute: true,
        maxFeePercentage: 300, // 3% max fee
        deadline,
        metadata: "0x", // No metadata for now
      };

      // Submit intent (this would use the wagmi hooks in a real implementation)
      // For brevity, we're simulating this
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Simulate success
      setIntentStatus({
        status: "success",
        message:
          "Your intent has been submitted and is being processed. You will receive updates in the Activity tab.",
      });

      toast.success("Intent submitted successfully");

      // Reset form
      setAmount("");
    } catch (error) {
      console.error("Error submitting intent:", error);
      setIntentStatus({
        status: "error",
        message: "Failed to submit intent. Please try again.",
      });
      toast.error("Failed to submit intent");
    } finally {
      setProcessingIntent(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Intent-Based Syndicate Participation</CardTitle>
            <CardDescription>
              Please connect your wallet to continue
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Intent-Based Syndicate Participation</CardTitle>
          <CardDescription>
            Submit an intent to participate in a syndicate without worrying
            about complex cross-chain operations. The system will execute your
            intent in the most optimal way possible.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="join"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="join">Join Syndicate</TabsTrigger>
              <TabsTrigger value="ticket">Buy Lottery Ticket</TabsTrigger>
            </TabsList>

            <TabsContent value="join">
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="syndicate-address">Syndicate Address</Label>
                  <Input
                    id="syndicate-address"
                    placeholder="0x..."
                    value={syndicateAddress}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSyndicateAddress(e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">GHO Amount</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="amount"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAmount(e.target.value)
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        ghoBalance && setAmount(formatEther(ghoBalance.value))
                      }
                      disabled={!ghoBalance}
                    >
                      Max
                    </Button>
                  </div>
                  {ghoBalance && (
                    <p className="text-sm text-muted-foreground">
                      Balance: {formatEther(ghoBalance.value)} GHO
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    This intent will contribute GHO to the specified syndicate,
                    increasing your share of potential winnings.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ticket">
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="syndicate-address-ticket">
                    Syndicate Address
                  </Label>
                  <Input
                    id="syndicate-address-ticket"
                    placeholder="0x..."
                    value={syndicateAddress}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSyndicateAddress(e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount-ticket">GHO Amount</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="amount-ticket"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAmount(e.target.value)
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        ghoBalance && setAmount(formatEther(ghoBalance.value))
                      }
                      disabled={!ghoBalance}
                    >
                      Max
                    </Button>
                  </div>
                  {ghoBalance && (
                    <p className="text-sm text-muted-foreground">
                      Balance: {formatEther(ghoBalance.value)} GHO
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    This intent will initiate a cross-chain transaction to
                    purchase lottery tickets on Base Chain. The system will
                    handle all the complexity of bridging assets and buying
                    tickets.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {intentStatus.status && (
            <Alert
              className="mt-4"
              variant={
                intentStatus.status === "error" ? "destructive" : undefined
              }
            >
              <AlertTitle>
                {intentStatus.status === "success"
                  ? "Success!"
                  : intentStatus.status === "error"
                  ? "Error!"
                  : "Processing..."}
              </AlertTitle>
              <AlertDescription>{intentStatus.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-end space-x-4">
          {allowanceData && allowanceData < parseEther(amount || "0") && (
            <Button
              onClick={handleApprove}
              variant="outline"
              disabled={processingIntent || !amount}
            >
              {processingIntent ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Approve GHO
            </Button>
          )}

          <Button
            onClick={handleSubmitIntent}
            disabled={processingIntent || !amount || !syndicateAddress}
          >
            {processingIntent ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Submit Intent
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
