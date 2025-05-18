"use client";

import React from 'react';
import { Button } from '@/components/ui/inputs/button';
import { Loader2, LogIn, LogOut } from 'lucide-react';
import { useLensAuthContext } from './LensAuthProvider';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LensLoginButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LensLoginButton({ 
  className, 
  variant = 'default',
  size = 'default'
}: LensLoginButtonProps) {
  const { isConnected } = useAccount();
  const { isAuthenticated, isLoading, login, logout } = useLensAuthContext();

  const handleClick = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (isAuthenticated) {
      await logout();
    } else {
      await login();
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      disabled={isLoading || !isConnected}
      className={cn('font-medium', className)}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect Lens
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Connect Lens
        </>
      )}
    </Button>
  );
}