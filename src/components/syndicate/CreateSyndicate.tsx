"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/inputs/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Slider } from "@/components/ui/inputs/slider";
import Link from "next/link";
import { CreateSyndicateIllustration } from "@/components/syndicate/CreateSyndicateIllustration";
import { useAccount } from "wagmi";
import { useSyndicateContracts } from "@/hooks/use-syndicate-contracts";
import { useRouter } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import { Loader2, Check, AlertCircle, XCircle } from "lucide-react";

// Cause selection component
function CauseSelector({
  selectedCause,
  onSelectCause,
}: {
  selectedCause: string;
  onSelectCause: (cause: string) => void;
}) {
  const causes = [
    {
      id: "ocean",
      name: "Ocean Cleanup",
      icon: "🌊",
      description:
        "Fund initiatives to clean our oceans and protect marine life",
      verified: false,
    },
    {
      id: "food",
      name: "Food Aid",
      icon: "🍲",
      description: "Support programs providing meals to those in need",
      verified: false,
    },
    {
      id: "education",
      name: "Education",
      icon: "📚",
      description:
        "Help provide educational resources to underserved communities",
      verified: false,
    },
    {
      id: "climate",
      name: "Green Pill",
      icon: "🌍",
      description:
        "Crypto+web3 for regenerative communities and environmental impact",
      verified: true,
    },
    {
      id: "health",
      name: "Healthcare",
      icon: "🏥",
      description: "Fund healthcare initiatives for vulnerable populations",
      verified: false,
    },
    {
      id: "custom",
      name: "Custom Cause",
      icon: "✨",
      description: "Create your own cause for your Syndicate",
      verified: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
      {causes.map((cause) => (
        <div
          key={cause.id}
          className={`border rounded-lg p-3 cursor-pointer transition-all ${
            selectedCause === cause.id
              ? "border-cyan-500 bg-cyan-500/10 text-white"
              : "border-white/10 bg-black/40 text-white/80 hover:border-white/20"
          }`}
          onClick={() => onSelectCause(cause.id)}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xl">{cause.icon}</div>
            <div className="font-medium">{cause.name}</div>
            {cause.verified && (
              <span className="text-xs px-1.5 py-0.5 bg-green-900/50 text-green-400 rounded-full border border-green-600 ml-auto">
                Verified
              </span>
            )}
          </div>
          <p className="text-xs text-white/70">{cause.description}</p>
        </div>
      ))}
    </div>
  );
}

// Add this function to parse and handle errors
const getErrorMessage = (error: any): string => {
  console.error("Error details:", error);

  // Check for user rejection messages
  if (
    error?.message?.includes("User rejected") ||
    error?.message?.includes("User denied") ||
    error?.message?.includes("user rejected") ||
    error?.message?.includes("MetaMask Tx Signature: User denied")
  ) {
    return "Transaction was canceled. Please try again when you're ready to approve the transaction.";
  }

  // Check for gas errors
  if (error?.message?.includes("insufficient funds")) {
    return "You don't have enough GHO tokens to complete this transaction. Please add GHO to your wallet.";
  }

  // Check for network errors
  if (
    error?.message?.includes("network") ||
    error?.message?.includes("disconnected")
  ) {
    return "Network error. Please check your connection and try again.";
  }

  // For any other errors, show a more generic message
  return error?.message || "Something went wrong. Please try again.";
};

export function CreateSyndicate() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [syndicateName, setSyndicateName] = useState("");
  const [syndicateDescription, setSyndicateDescription] = useState("");
  const [selectedCause, setSelectedCause] = useState("ocean");
  const [causeAllocation, setCauseAllocation] = useState(20);
  const [customCauseName, setCustomCauseName] = useState("");
  const [customCauseAddress, setCustomCauseAddress] = useState("");

  // Use the syndicate contracts hook
  const {
    createSyndicate,
    isCreatingSyndicate,
    createSyndicateError,
    userSyndicates,
    isLoadingSyndicates,
  } = useSyndicateContracts();

  // Get cause details based on selection
  const getCauseDetails = () => {
    if (selectedCause === "custom") {
      return {
        name: customCauseName,
        address: customCauseAddress,
      };
    }

    // Map predefined cause IDs to verified addresses
    // Only Green Pill is verified with a real address
    const causeAddresses: Record<string, string> = {
      climate: "0x0e5DaC01687592597d3e4307cdB7B3B616F2822E", // Green Pill - verified
      // Placeholder addresses for other causes - not verified
      ocean: "0x0000000000000000000000000000000000000000",
      food: "0x0000000000000000000000000000000000000000",
      education: "0x0000000000000000000000000000000000000000",
      health: "0x0000000000000000000000000000000000000000",
    };

    const causeNames: Record<string, string> = {
      ocean: "Ocean Cleanup",
      food: "Food Aid",
      education: "Education",
      climate: "Green Pill", // Changed from "Climate Action" to "Green Pill"
      health: "Healthcare",
    };

    const isVerified = selectedCause === "climate"; // Only Green Pill is verified

    return {
      name: causeNames[selectedCause] || selectedCause,
      address: causeAddresses[selectedCause] || "",
      isVerified,
    };
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      return;
    }

    try {
      const causeDetails = getCauseDetails();

      // Use the hook to create a syndicate
      const treasuryAddress = await createSyndicate(
        syndicateName,
        causeDetails.name,
        causeDetails.address,
        causeAllocation
      );

      if (treasuryAddress) {
        // Move to success step
        setStep(4);
      }
    } catch (error) {
      console.error("Error creating syndicate:", error);
      // Instead of just logging the error, use the parsed message
      // This will already be handled by the syndicate contract hook's error state
    }
  };

  // Navigate to dashboard after creation
  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-8">
        <CreateSyndicateIllustration />
        <h1 className="text-2xl font-bold mb-2">Create Your Syndicate</h1>
        <p className="text-white/70">
          Set up a new Syndicate to pool resources and make an impact together
        </p>
      </div>

      {!isConnected ? (
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to create a syndicate
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <ConnectKitButton.Custom>
              {({ show }) => (
                <Button
                  onClick={show}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  Connect Wallet
                </Button>
              )}
            </ConnectKitButton.Custom>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    s === step
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                      : s < step
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500"
                      : "bg-black/40 text-white/40 border border-white/10"
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
            <CardTitle>
              {step === 1 && "Basic Information"}
              {step === 2 && "Select a Cause"}
              {step === 3 && "Allocation Settings"}
              {step === 4 && "Syndicate Created!"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Give your Syndicate a name and description"}
              {step === 2 && "Choose a cause your Syndicate will support"}
              {step === 3 && "Decide how winnings will be allocated"}
              {step === 4 && "Your Syndicate is ready to grow"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Syndicate Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Ocean Guardians"
                    value={syndicateName}
                    onChange={(e) => setSyndicateName(e.target.value)}
                    className="mt-1 bg-black/40 border border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell others what your Syndicate is about..."
                    value={syndicateDescription}
                    onChange={(e) => setSyndicateDescription(e.target.value)}
                    rows={4}
                    className="mt-1 bg-black/40 border border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <CauseSelector
                  selectedCause={selectedCause}
                  onSelectCause={setSelectedCause}
                />

                {selectedCause === "climate" && (
                  <div className="p-3 bg-green-900/20 border border-green-600/30 rounded-md mt-4">
                    <h4 className="text-sm font-semibold text-green-400 flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                        <path d="m9 12 2 2 4-4"></path>
                      </svg>
                      Verified Cause
                    </h4>
                    <p className="text-xs text-white/70 mt-1.5">
                      Green Pill is a regenerative philanthropic organization
                      founded by Kevin Owocki (Gitcoin founder) that uses crypto
                      and web3 to solve real-world problems and build
                      sustainable communities.
                    </p>
                    <div className="mt-2 text-xs font-mono text-white/60">
                      Address: 0x0e5DaC01687592597d3e4307cdB7B3B616F2822E
                    </div>
                  </div>
                )}

                {selectedCause === "custom" && (
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="customCauseName">Custom Cause Name</Label>
                      <Input
                        id="customCauseName"
                        placeholder="Enter your custom cause"
                        value={customCauseName}
                        onChange={(e) => setCustomCauseName(e.target.value)}
                        className="mt-1 bg-black/40 border border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customCauseAddress">
                        Cause Address (Wallet or Contract)
                      </Label>
                      <Input
                        id="customCauseAddress"
                        placeholder="0x..."
                        value={customCauseAddress}
                        onChange={(e) => setCustomCauseAddress(e.target.value)}
                        className="mt-1 bg-black/40 border border-white/20 text-white placeholder:text-white/40"
                      />
                      <p className="text-xs text-white/60 mt-1">
                        This is the address that will receive the allocated
                        percentage of winnings
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Cause Allocation</Label>
                    <span className="font-medium text-cyan-400">
                      {causeAllocation}%
                    </span>
                  </div>
                  <Slider
                    value={[causeAllocation]}
                    onValueChange={(value) => setCauseAllocation(value[0])}
                    min={5}
                    max={50}
                    step={5}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-white/60">
                    <span>5%</span>
                    <span>50%</span>
                  </div>
                  <p className="text-sm text-white/70 mt-2">
                    {causeAllocation}% of winnings will go to your selected
                    cause, and {100 - causeAllocation}% will be distributed
                    among Syndicate members.
                  </p>
                </div>

                {createSyndicateError && (
                  <div className="p-4 bg-red-900/30 border border-red-700 rounded-md flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-red-300 mb-1">
                        Transaction Failed
                      </p>
                      <p className="text-red-200/90">
                        {getErrorMessage(createSyndicateError)}
                      </p>
                      {createSyndicateError?.message?.includes(
                        "User rejected"
                      ) && (
                        <p className="mt-2 text-xs text-red-300/80">
                          Creating a syndicate requires a one-time blockchain
                          transaction that creates your treasury contract.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-cyan-500">
                  <Check className="h-10 w-10 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{syndicateName}</h3>
                <p className="text-white/70 mb-4">
                  Your Syndicate has been created successfully!
                </p>

                {/* Cause info */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">
                      {selectedCause === "climate" && "🌍"}
                      {selectedCause === "ocean" && "🌊"}
                      {selectedCause === "food" && "🍲"}
                      {selectedCause === "education" && "📚"}
                      {selectedCause === "health" && "🏥"}
                      {selectedCause === "custom" && "✨"}
                    </span>
                    <span className="text-lg font-medium">
                      {selectedCause === "custom"
                        ? customCauseName
                        : getCauseDetails().name}
                    </span>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-cyan-900/40 text-cyan-400 text-xs">
                    {causeAllocation}%
                  </div>

                  {/* Add verified badge for Green Pill */}
                  {selectedCause === "climate" && (
                    <span className="text-xs px-1.5 py-0.5 bg-green-900/50 text-green-400 rounded-full border border-green-600">
                      Verified
                    </span>
                  )}
                </div>

                <div className="p-4 bg-black/30 border border-white/10 rounded-md text-left mb-6">
                  <p className="text-sm text-white/70">
                    <span className="font-medium text-white">Next Steps:</span>{" "}
                    Share your Syndicate with friends, build your team, and
                    start playing together. When your Syndicate wins,{" "}
                    {causeAllocation}% will go to your selected cause and{" "}
                    {100 - causeAllocation}% will be shared among members.
                  </p>
                </div>

                {/* Added: Options explanation */}
                <div className="p-4 bg-purple-900/20 border border-purple-600/30 rounded-md text-left mb-6">
                  <h4 className="font-medium text-white mb-2">
                    What would you like to do next?
                  </h4>
                  <ul className="text-sm text-white/70 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">→</span>
                      <span>
                        <strong>Explore Syndicates:</strong> Browse other
                        syndicates to join
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">→</span>
                      <span>
                        <strong>Go to Dashboard:</strong> Manage your newly
                        created syndicate
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">→</span>
                      <span>
                        <strong>Play in MegaPot:</strong> Purchase tickets and
                        join lottery pools with your syndicate
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter>
            {step < 4 ? (
              <div className="flex justify-between w-full">
                {step > 1 ? (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                    disabled={
                      (step === 1 && !syndicateName) ||
                      (step === 2 &&
                        selectedCause === "custom" &&
                        (!customCauseName || !customCauseAddress))
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isCreatingSyndicate}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  >
                    {isCreatingSyndicate ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Creating...
                      </>
                    ) : (
                      "Create Syndicate"
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/explore")}
                    className="flex-1 border-white/10 text-white hover:bg-white/5"
                  >
                    Explore Syndicates
                  </Button>
                  <Button
                    onClick={handleGoToDashboard}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  >
                    Go to Dashboard
                  </Button>
                </div>
                <Button
                  onClick={() => router.push("/megapot")}
                  variant="outline"
                  className="w-full border-purple-500/30 bg-purple-900/20 text-white hover:bg-purple-900/30"
                >
                  Play in MegaPot
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
