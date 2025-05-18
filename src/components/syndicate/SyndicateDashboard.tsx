"use client";

import React from "react";
import { Button } from "@/components/ui/inputs/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/data-display/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import { Progress } from "@/components/ui/feedback/progress";
import Link from "next/link";

// Mock data for the dashboard
const syndicateData = {
  name: "Ocean Guardians",
  memberCount: 128,
  cause: {
    name: "Ocean Cleanup",
    icon: "🌊",
    allocation: 20,
  },
  stats: {
    totalContributions: 2.5, // ETH
    winningOdds: 15.8, // %
    potentialWinnings: 125, // ETH
    nextDraw: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  },
  members: [
    {
      id: 1,
      name: "Alex",
      address: "0x1a2...3b4c",
      avatar: "",
      contribution: 0.25,
    },
    {
      id: 2,
      name: "Taylor",
      address: "0x4d5...6e7f",
      avatar: "",
      contribution: 0.5,
    },
    {
      id: 3,
      name: "Jordan",
      address: "0x8g9...0h1i",
      avatar: "",
      contribution: 0.15,
    },
    {
      id: 4,
      name: "Casey",
      address: "0x2j3...4k5l",
      avatar: "",
      contribution: 0.3,
    },
    {
      id: 5,
      name: "Morgan",
      address: "0x6m7...8n9o",
      avatar: "",
      contribution: 0.2,
    },
  ],
  activity: [
    { id: 1, type: "join", user: "Riley", time: "2 hours ago" },
    {
      id: 2,
      type: "contribute",
      user: "Taylor",
      amount: 0.5,
      time: "5 hours ago",
    },
    { id: 3, type: "join", user: "Casey", time: "1 day ago" },
    {
      id: 4,
      type: "contribute",
      user: "Alex",
      amount: 0.25,
      time: "2 days ago",
    },
    { id: 5, type: "create", user: "Jordan", time: "3 days ago" },
  ],
};

// Simple icon for the dashboard
function DashboardIcon() {
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg border border-cyan-400/30">
      {syndicateData.cause.icon}
    </div>
  );
}

// Stats component
function SyndicateStats() {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground tracking-wide uppercase">
            Total Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold tracking-tight text-cyan-400 drop-shadow">
            {syndicateData.stats.totalContributions} ETH
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground tracking-wide uppercase">
            Winning Odds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-[#00bcd4] drop-shadow">
            {syndicateData.stats.winningOdds}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            vs. 0.01% solo
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground tracking-wide uppercase">
            Potential Winnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-green-400 drop-shadow">
            {syndicateData.stats.potentialWinnings} ETH
          </div>
          <div className="flex text-xs text-muted-foreground mt-1">
            <div className="mr-2">Cause: {syndicateData.cause.allocation}%</div>
            <div>Members: {100 - syndicateData.cause.allocation}%</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground tracking-wide uppercase">
            Next Draw
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatDate(syndicateData.stats.nextDraw)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {Math.floor(
              (syndicateData.stats.nextDraw.getTime() - Date.now()) /
                (1000 * 60 * 60)
            )}{" "}
            hours remaining
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Members component
function SyndicateMembers() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg tracking-tight">
          Top Contributors
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-cyan-500 text-cyan-400 hover:bg-cyan-900/10 transition"
        >
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {syndicateData.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-800 shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-cyan-500/40 shadow">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>
                  {member.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-white">{member.name}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {member.address}
                </div>
              </div>
            </div>
            <div className="text-base font-bold text-cyan-300">
              {member.contribution} ETH
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Activity component
function SyndicateActivity() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg tracking-tight">
          Recent Activity
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-cyan-500 text-cyan-400 hover:bg-cyan-900/10 transition"
        >
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {syndicateData.activity.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-800 shadow hover:shadow-lg transition"
          >
            <div className="h-10 w-10 rounded-full bg-cyan-900/30 flex items-center justify-center text-2xl text-cyan-400 shadow">
              {activity.type === "join"
                ? "👋"
                : activity.type === "contribute"
                ? "💰"
                : activity.type === "create"
                ? "🎉"
                : "📣"}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">
                {activity.user}{" "}
                {activity.type === "join" && (
                  <span className="text-cyan-300">joined the Syndicate</span>
                )}
                {activity.type === "contribute" && (
                  <span className="text-green-300">
                    contributed {activity.amount} ETH
                  </span>
                )}
                {activity.type === "create" && (
                  <span className="text-yellow-300">created the Syndicate</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SyndicateDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyan-900/40 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow group-hover:scale-105 transition">
              S
            </div>
            <span className="font-bold text-xl tracking-tight group-hover:text-cyan-400 transition">
              Syndicate
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/10 transition"
            >
              Dashboard
            </Button>
            <Avatar className="h-9 w-9 border-2 border-cyan-500 shadow">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Syndicate Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div className="flex items-center gap-5">
              <DashboardIcon />
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
                  {syndicateData.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-cyan-300">
                    {syndicateData.cause.name}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-gray-900/80 text-cyan-400 border-cyan-700 px-3 py-1 rounded-full font-semibold"
                  >
                    {syndicateData.memberCount} members
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/10 transition"
              >
                Invite
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold shadow"
              >
                Contribute
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-10">
            <SyndicateStats />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="bg-gray-900/80 mb-6 rounded-lg shadow border border-cyan-900/40">
              <TabsTrigger
                value="members"
                className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow font-semibold px-6 py-2 rounded-lg transition"
              >
                Members
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow font-semibold px-6 py-2 rounded-lg transition"
              >
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="mt-0">
              <SyndicateMembers />
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <SyndicateActivity />
            </TabsContent>
          </Tabs>

          {/* Progress */}
          <div className="mt-12 border-t border-cyan-900/40 pt-8">
            <h3 className="font-semibold text-base mb-4 text-cyan-300">
              Syndicate Progress
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <div className="text-xs text-gray-400">Member Growth</div>
                  <div className="text-xs font-semibold text-cyan-200">
                    {syndicateData.memberCount}/200
                  </div>
                </div>
                <Progress
                  value={(syndicateData.memberCount / 200) * 100}
                  className="h-2 bg-gray-800 rounded-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <div className="text-xs text-gray-400">Contribution Goal</div>
                  <div className="text-xs font-semibold text-cyan-200">
                    {syndicateData.stats.totalContributions}/5 ETH
                  </div>
                </div>
                <Progress
                  value={(syndicateData.stats.totalContributions / 5) * 100}
                  className="h-2 bg-gray-800 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-cyan-900/40 bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow">
                S
              </div>
              <span className="font-bold text-lg text-cyan-200">Syndicate</span>
            </div>

            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Syndicate | Better Odds, Bigger
              Impact
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
