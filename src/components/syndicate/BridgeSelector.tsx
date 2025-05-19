"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/inputs/radio-group";
import { Label } from "@/components/ui/inputs/label";
import { BridgeType } from "@/lib/cross-chain/config";

interface BridgeSelectorProps {
  defaultBridge?: BridgeType;
  onChange?: (bridge: BridgeType) => void;
  disabled?: boolean;
}

export function BridgeSelector({
  defaultBridge = BridgeType.DECENT,
  onChange,
  disabled = false,
}: BridgeSelectorProps) {
  const [selectedBridge, setSelectedBridge] =
    useState<BridgeType>(defaultBridge);

  const handleChange = (value: string) => {
    const bridge = value as BridgeType;
    setSelectedBridge(bridge);
    if (onChange) {
      onChange(bridge);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-lg font-bold text-blue-800 mb-2">
        Select Bridge Provider
      </div>
      <RadioGroup
        value={selectedBridge}
        onValueChange={handleChange}
        disabled={disabled}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div className="flex items-center space-x-3 rounded-lg border-2 border-gray-300 p-5 cursor-not-allowed bg-gray-100">
          <RadioGroupItem
            value={BridgeType.DECENT}
            id="decent"
            disabled
            className="h-5 w-5"
          />
          <Label htmlFor="decent" className="flex flex-col">
            <span className="text-base font-bold text-gray-800">
              Decent.xyz
            </span>
            <span className="text-sm text-gray-800 mt-1">
              Fast cross-chain swaps with competitive rates
            </span>
            <span className="text-sm text-amber-800 mt-2 font-bold">
              Coming soon - Not yet available for Lens Chain
            </span>
          </Label>
        </div>

        <div className="flex items-center space-x-3 rounded-lg border-2 border-blue-300 p-5 cursor-pointer hover:bg-blue-50 bg-white">
          <RadioGroupItem
            value={BridgeType.ACROSS}
            id="across"
            className="h-5 w-5"
          />
          <Label htmlFor="across" className="flex flex-col cursor-pointer">
            <span className="text-base font-bold text-blue-800">
              Across Protocol
            </span>
            <span className="text-sm text-blue-800 mt-1">
              Intent-based bridging with high security
            </span>
            <span className="text-sm text-green-800 mt-2 font-bold">
              Available now
            </span>
          </Label>
        </div>
      </RadioGroup>

      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg mt-4">
        {selectedBridge === BridgeType.DECENT ? (
          <p className="text-sm font-medium text-gray-900">
            Decent.xyz provides fast cross-chain swaps with competitive rates,
            but does not currently support Lens Chain (ID 232). We'll enable
            this option as soon as Decent.xyz adds support.
          </p>
        ) : (
          <p className="text-sm font-medium text-blue-900">
            Across Protocol is an intent-based bridging solution that natively
            supports Lens Chain, offering high security and reliability. This is
            currently the recommended bridge for Syndicate.
          </p>
        )}
      </div>
    </div>
  );
}
