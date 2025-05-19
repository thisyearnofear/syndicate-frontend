"use client";

import React, { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/overlay/dropdown-menu';
import { Button } from '@/components/ui/inputs/button';
import { useLensAuthContext } from './LensAuthProvider';
import { useAccount } from 'wagmi';
import { 
  User, 
  Settings, 
  LogOut,
  ExternalLink, 
  Copy,
  Check,
  Link as LinkIcon
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface LensProfileDropdownProps {
  children?: React.ReactNode;
  className?: string;
}

export function LensProfileDropdown({ children, className }: LensProfileDropdownProps) {
  const { isAuthenticated, logout } = useLensAuthContext();
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  
  if (!isAuthenticated || !address) {
    return null;
  }
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleLogout = async () => {
    await logout();
    toast.success('Disconnected from Lens Protocol');
  };
  
  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children || (
          <Button 
            variant="outline" 
            size="sm" 
            className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
          >
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5">
                <Image
                  src="/lens-logo.svg"
                  alt="Lens Profile"
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              </div>
              <span>Lens Profile</span>
            </div>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 z-50">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 relative bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Image
                src="/lens-logo.svg"
                alt="Lens Profile"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <DropdownMenuLabel className="p-0 font-bold text-green-600 dark:text-green-400">Lens User</DropdownMenuLabel>
              <span className="text-xs text-gray-500 font-mono">
                {truncateAddress(address)}
              </span>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer" onClick={handleCopyAddress}>
          {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
          <span>Copy Address</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer" onClick={() => window.open('https://hey.xyz/u/' + address, '_blank')}>
          <User className="mr-2 h-4 w-4 text-indigo-500" />
          <span>View Lens Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer" onClick={() => window.open('https://hey.xyz/search', '_blank')}>
          <LinkIcon className="mr-2 h-4 w-4 text-blue-500" />
          <span>Explore Publications</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer" onClick={() => window.open('https://syndicate.id/profile', '_blank')}>
          <Settings className="mr-2 h-4 w-4 text-gray-500" />
          <span>Syndicate Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => window.open('https://docs.lens.xyz/docs/overview', '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4 text-teal-500" />
          <span>Lens Protocol Docs</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect from Lens</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}