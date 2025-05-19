"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/inputs/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/overlay/dropdown-menu';
import { useAccount, useSwitchChain } from 'wagmi';
import { toast } from 'sonner';
import { BaseIcon, EthereumIcon, LensIcon } from './ChainIcons';
import { Loader2 } from 'lucide-react';

// Chain information
interface ChainInfo {
  id: number;
  name: string;
  icon: React.ReactNode;
}

// Define supported chains
const SUPPORTED_CHAINS: ChainInfo[] = [
  { id: 13337, name: 'Lens', icon: <LensIcon className="w-5 h-5" /> },
  { id: 8453, name: 'Base', icon: <BaseIcon className="w-5 h-5" /> },
  // Fallback for testing
  { id: 80001, name: 'Mumbai', icon: <BaseIcon className="w-5 h-5" /> },
];

interface ChainSelectorProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  showName?: boolean;
}

export function ChainSelector({ 
  className = '', 
  size = 'sm',
  variant = 'outline',
  showName = true
}: ChainSelectorProps) {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null);
  
  // Set the selected chain based on the current chain
  useEffect(() => {
    if (chain?.id) {
      const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chain.id);
      setSelectedChain(chainInfo || null);
    } else {
      setSelectedChain(null);
    }
  }, [chain]);

  // Handle switching chain
  const handleChainSwitch = async (chain: ChainInfo) => {
    if (!switchChain) {
      toast.error("Cannot switch networks - wallet doesn't support it");
      return;
    }
    
    try {
      await switchChain({ chainId: chain.id });
      toast.success(`Switching to ${chain.name}`);
    } catch (err) {
      toast.error(`Failed to switch to ${chain.name}`);
      console.error('Chain switch error:', err);
    }
  };

  // Show error when chain switch fails
  useEffect(() => {
    if (error) {
      toast.error(`Chain switch failed: ${error.message}`);
    }
  }, [error]);

  // Fallback icon when no chain is selected or recognized
  const unknownChain = <EthereumIcon className="w-5 h-5 opacity-50" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`flex items-center gap-2 ${className}`}
          disabled={!isConnected || isPending || !switchChain}
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            selectedChain?.icon || unknownChain
          )}
          {showName && (
            <span>
              {isPending 
                ? 'Switching...' 
                : selectedChain?.name || 'Unknown Chain'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_CHAINS.map((chainInfo) => (
          <DropdownMenuItem
            key={chainInfo.id}
            onClick={() => handleChainSwitch(chainInfo)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {chainInfo.icon}
              <span>{chainInfo.name}</span>
              {chain?.id === chainInfo.id && (
                <span className="ml-2 text-green-500 text-xs">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}