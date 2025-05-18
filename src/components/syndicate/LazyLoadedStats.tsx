"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/data-display/card";
import { OptimizedImage } from "@/components/ui/utils/optimized-image";
import { Skeleton } from "@/components/ui/data-display/skeleton";

interface StatsProps {
  totalPools?: number;
  totalParticipants?: number;
  totalRaised?: number;
  isLoading?: boolean;
}

/**
 * A component that displays statistics about Syndicate pools
 * This component is designed to be lazy-loaded
 */
export default function LazyLoadedStats({
  totalPools = 0,
  totalParticipants = 0,
  totalRaised = 0,
  isLoading = false,
}: StatsProps) {
  // Use memoization for expensive calculations
  const formattedRaised = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(totalRaised);
  }, [totalRaised]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Pools",
      value: totalPools.toLocaleString(),
      icon: "/icons/syndicate-icon.svg",
    },
    {
      title: "Participants",
      value: totalParticipants.toLocaleString(),
      icon: "/icons/syndicate-icon.svg",
    },
    {
      title: "Total Raised",
      value: formattedRaised,
      icon: "/icons/syndicate-icon.svg",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <OptimizedImage
              src={stat.icon}
              alt={stat.title}
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
