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
      <DropdownMenuTrigger asChild>
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
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 relative">
              <Image
                src="/lens-logo.svg"
                alt="Lens Profile"
                fill
                className="rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <DropdownMenuLabel className="p-0 font-bold">Lens User</DropdownMenuLabel>
              <span className="text-xs text-gray-500">
                {truncateAddress(address)}
              </span>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer" onClick={handleCopyAddress}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          <span>Copy Address</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <LinkIcon className="mr-2 h-4 w-4" />
          <span>Connected Publications</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => window.open('https://docs.lens.xyz/docs/overview', '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>Lens Docs</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect from Lens</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}