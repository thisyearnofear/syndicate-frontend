"use client";

import React, { useState } from "react";
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
    },
    {
      id: "food",
      name: "Food Aid",
      icon: "🍲",
      description: "Support programs providing meals to those in need",
    },
    {
      id: "education",
      name: "Education",
      icon: "📚",
      description:
        "Help provide educational resources to underserved communities",
    },
    {
      id: "climate",
      name: "Climate Action",
      icon: "🌍",
      description: "Support projects fighting climate change and its impacts",
    },
    {
      id: "health",
      name: "Healthcare",
      icon: "🏥",
      description: "Fund healthcare initiatives for vulnerable populations",
    },
    {
      id: "custom",
      name: "Custom Cause",
      icon: "✨",
      description: "Create your own cause for your Syndicate",
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
          </div>
          <p className="text-xs text-[#666]">{cause.description}</p>
        </div>
      ))}
    </div>
  );
}

export function CreateSyndicate() {
  const [step, setStep] = useState(1);
  const [syndicateName, setSyndicateName] = useState("");
  const [syndicateDescription, setSyndicateDescription] = useState("");
  const [selectedCause, setSelectedCause] = useState("ocean");
  const [causeAllocation, setCauseAllocation] = useState(20);
  const [customCauseName, setCustomCauseName] = useState("");

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    // This would be where we'd submit the syndicate creation
    console.log({
      name: syndicateName,
      description: syndicateDescription,
      cause: selectedCause === "custom" ? customCauseName : selectedCause,
      allocation: causeAllocation,
    });

    // For now, just go to the final step
    setStep(4);
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

              {selectedCause === "custom" && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="customCause">Custom Cause Name</Label>
                  <Input
                    id="customCause"
                    placeholder="Enter your custom cause"
                    value={customCauseName}
                    onChange={(e) => setCustomCauseName(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Cause Allocation</Label>
                  <span className="font-medium text-[#00bcd4]">
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
                <div className="flex justify-between text-xs text-[#757575]">
                  <span>5%</span>
                  <span>50%</span>
                </div>
                <p className="text-sm text-[#666] mt-2">
                  {causeAllocation}% of winnings will go to your selected cause,
                  and {100 - causeAllocation}% will be distributed among
                  Syndicate members.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-[#e0f7fa] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{syndicateName}</h3>
              <p className="text-[#666] mb-4">
                Your Syndicate has been created successfully!
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="text-xl">
                  {selectedCause === "ocean"
                    ? "🌊"
                    : selectedCause === "food"
                    ? "🍲"
                    : selectedCause === "education"
                    ? "📚"
                    : selectedCause === "climate"
                    ? "🌍"
                    : selectedCause === "health"
                    ? "🏥"
                    : "✨"}
                </div>
                <div className="font-medium">
                  {selectedCause === "custom"
                    ? customCauseName
                    : selectedCause === "ocean"
                    ? "Ocean Cleanup"
                    : selectedCause === "food"
                    ? "Food Aid"
                    : selectedCause === "education"
                    ? "Education"
                    : selectedCause === "climate"
                    ? "Climate Action"
                    : "Healthcare"}
                </div>
                <div className="text-sm text-[#00bcd4] font-medium">
                  {causeAllocation}%
                </div>
              </div>
              <p className="text-sm text-[#666]">
                Share your Syndicate with others to increase your collective
                chances of winning!
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {step > 1 && step < 4 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {step === 1 && (
            <Button variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
          )}
          {step < 3 && (
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white"
              onClick={handleNext}
              disabled={
                (step === 1 && !syndicateName) ||
                (step === 2 && selectedCause === "custom" && !customCauseName)
              }
            >
              Next
            </Button>
          )}
          {step === 3 && (
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white"
              onClick={handleSubmit}
            >
              Create Syndicate
            </Button>
          )}
          {step === 4 && (
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.history.back()}
              >
                Back to Home
              </Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white flex-1">
                Invite Members
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
