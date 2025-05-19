"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/inputs/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { useLensAuthContext } from '@/components/lens/LensAuthProvider';
import { Loader2, User, UserCircle, Award, Settings, Ticket, Wallet, ArrowLeft, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ChainSelector } from '@/components/web3/ChainSelector';

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const { isAuthenticated, isLoading, login, logout, authorizeResponse } = useLensAuthContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [profileStats, setProfileStats] = useState({
    syndicates: 0,
    ticketsPurchased: 0,
    causesSupported: 0,
    totalWinnings: '0.00',
    totalImpact: '0.00',
  });

  // Handle authentication
  const handleAuth = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isAuthenticated) {
      try {
        await login();
      } catch (error) {
        console.error('Authentication error:', error);
        toast.error('Failed to authenticate with Lens');
      }
    }
  };

  // Load profile stats
  const loadProfileStats = async () => {
    setIsLoadingStats(true);
    try {
      // Simulated API call to get profile stats
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data - replace with real API call
      setProfileStats({
        syndicates: 3,
        ticketsPurchased: 12,
        causesSupported: 2,
        totalWinnings: '1,250.00',
        totalImpact: '250.00',
      });
    } catch (error) {
      console.error('Failed to load profile stats:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Load profile data on mount
  useEffect(() => {
    if (isAuthenticated && address) {
      loadProfileStats();
    }
  }, [isAuthenticated, address]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isConnected) {
      router.push('/');
    }
  }, [isLoading, isConnected, router]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[70vh] flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <CardHeader className="text-center">
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>Please connect your wallet to view your profile</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button className="w-full" onClick={() => router.push('/')}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Manage your account and syndicates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <div className="h-24 w-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                  {isAuthenticated ? (
                    <Image 
                      src="/lens-logo.svg" 
                      alt="Lens Profile" 
                      width={60} 
                      height={60} 
                      className="rounded-full" 
                    />
                  ) : (
                    <UserCircle className="h-14 w-14 text-white" />
                  )}
                </div>
                <h2 className="text-xl font-bold mb-1">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'}</h2>
                <div className="text-sm text-gray-500 mb-4">
                  {isAuthenticated ? 'Lens Verified' : 'Not Connected to Lens'}
                </div>
                
                {isAuthenticated ? (
                  <Button variant="outline" onClick={() => logout()} className="mb-2">
                    Disconnect from Lens
                  </Button>
                ) : (
                  <Button 
                    onClick={handleAuth} 
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white mb-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>Connect to Lens</>
                    )}
                  </Button>
                )}
                
                <div className="mt-2 w-full">
                  <ChainSelector className="w-full" showName={true} size="default" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md flex justify-between">
                  <span className="text-sm font-medium">Syndicates Joined</span>
                  <span className="font-bold">{profileStats.syndicates}</span>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md flex justify-between">
                  <span className="text-sm font-medium">Tickets Purchased</span>
                  <span className="font-bold">{profileStats.ticketsPurchased}</span>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md flex justify-between">
                  <span className="text-sm font-medium">Causes Supported</span>
                  <span className="font-bold">{profileStats.causesSupported}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="syndicates">Syndicates</TabsTrigger>
                  <TabsTrigger value="tickets">Tickets</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <TabsContent value="profile" className="mt-0">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Profile Overview</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadProfileStats}
                      disabled={isLoadingStats}
                    >
                      {isLoadingStats ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg p-4 text-white">
                      <div className="flex items-center mb-2">
                        <Wallet className="h-5 w-5 mr-2" />
                        <h4 className="font-medium">Total Winnings</h4>
                      </div>
                      <p className="text-2xl font-bold">${profileStats.totalWinnings}</p>
                      <p className="text-xs opacity-80 mt-2">Across all syndicates</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 text-white">
                      <div className="flex items-center mb-2">
                        <Award className="h-5 w-5 mr-2" />
                        <h4 className="font-medium">Total Impact</h4>
                      </div>
                      <p className="text-2xl font-bold">${profileStats.totalImpact}</p>
                      <p className="text-xs opacity-80 mt-2">Contributed to causes</p>
                    </div>
                  </div>
                  
                  {!isAuthenticated && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mt-4">
                      <h4 className="font-medium flex items-center mb-2">
                        <User className="h-5 w-5 mr-2 text-yellow-500" />
                        Connect to Lens Protocol
                      </h4>
                      <p className="text-sm mb-3">
                        Connect your wallet to Lens Protocol to access enhanced features, including social features and on-chain reputation.
                      </p>
                      <Button 
                        onClick={handleAuth} 
                        disabled={isLoading}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isLoading ? 'Connecting...' : 'Connect to Lens'}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="syndicates" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">My Syndicates</h3>
                  
                  {profileStats.syndicates > 0 ? (
                    <div className="space-y-4">
                      {/* Sample syndicate card - repeat for each syndicate */}
                      <div className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Ocean Cleanup Syndicate</h4>
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded">Active</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">20% to Ocean Cleanup Foundation</p>
                        <div className="flex justify-between text-sm">
                          <span>Members: 12</span>
                          <span>Tickets: 5</span>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Climate Action Syndicate</h4>
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded">Active</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">25% to Climate Action Fund</p>
                        <div className="flex justify-between text-sm">
                          <span>Members: 8</span>
                          <span>Tickets: 3</span>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Food Security Syndicate</h4>
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 px-2 py-1 rounded">Pending</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">15% to World Food Program</p>
                        <div className="flex justify-between text-sm">
                          <span>Members: 4</span>
                          <span>Tickets: 0</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You haven't joined any syndicates yet</p>
                      <Link href="/explore">
                        <Button>Browse Syndicates</Button>
                      </Link>
                    </div>
                  )}
                  
                  <div className="mt-6 text-center">
                    <Link href="/create">
                      <Button variant="outline">Create New Syndicate</Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tickets" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">My Tickets</h3>
                  
                  {profileStats.ticketsPurchased > 0 ? (
                    <div className="space-y-4">
                      <div className="overflow-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-4">Ticket ID</th>
                              <th className="text-left py-2 px-4">Syndicate</th>
                              <th className="text-left py-2 px-4">Draw Date</th>
                              <th className="text-left py-2 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="py-3 px-4 font-mono text-sm">#1342</td>
                              <td className="py-3 px-4">Ocean Cleanup</td>
                              <td className="py-3 px-4">Jun 1, 2023</td>
                              <td className="py-3 px-4"><span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded">Active</span></td>
                            </tr>
                            <tr className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="py-3 px-4 font-mono text-sm">#1289</td>
                              <td className="py-3 px-4">Climate Action</td>
                              <td className="py-3 px-4">May 15, 2023</td>
                              <td className="py-3 px-4"><span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded">Active</span></td>
                            </tr>
                            <tr className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="py-3 px-4 font-mono text-sm">#1104</td>
                              <td className="py-3 px-4">Ocean Cleanup</td>
                              <td className="py-3 px-4">Apr 22, 2023</td>
                              <td className="py-3 px-4"><span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-1 rounded">Lost</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You haven't purchased any tickets yet</p>
                      <Link href="/megapot">
                        <Button>Purchase Tickets</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Account Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Chain Configuration
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">Select which blockchain you want to connect to</p>
                      <ChainSelector className="w-full" showName={true} size="default" />
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-2">Lens Protocol Connection</h4>
                      {isAuthenticated ? (
                        <div className="flex flex-col space-y-3">
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                            <div className="flex items-center">
                              <div className="w-5 h-5 mr-2">
                                <Image
                                  src="/lens-logo.svg"
                                  alt="Lens Protocol"
                                  width={20}
                                  height={20}
                                  className="rounded-full"
                                />
                              </div>
                              <span className="text-sm font-medium text-green-800 dark:text-green-400">Connected to Lens Protocol</span>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => logout()}
                          >
                            Disconnect from Lens
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-500">Connect your wallet to Lens Protocol to access advanced features</p>
                          <Button 
                            onClick={handleAuth} 
                            disabled={isLoading} 
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isLoading ? 'Connecting...' : 'Connect to Lens'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}