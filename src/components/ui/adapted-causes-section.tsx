"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/data-display/card";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/data-display/avatar";
import Link from "next/link";

const causes = [
  {
    id: 1,
    name: "Ocean Cleanup",
    icon: "🌊",
    description:
      "Fund initiatives to clean our oceans and protect marine life from pollution and plastic waste.",
    members: 128,
    allocation: "20%",
    color: "bg-cyan-500",
    gradient: "from-cyan-500 to-blue-600",
    image:
      "https://images.unsplash.com/photo-1518399681705-1c1a55e5e883?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 2,
    name: "Food Aid",
    icon: "🍲",
    description:
      "Support programs providing meals to those in need and addressing food insecurity worldwide.",
    members: 95,
    allocation: "25%",
    color: "bg-cyan-500",
    gradient: "from-cyan-500 to-blue-600",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 3,
    name: "Education",
    icon: "📚",
    description:
      "Help provide educational resources to underserved communities and support learning initiatives.",
    members: 156,
    allocation: "15%",
    color: "bg-cyan-500",
    gradient: "from-cyan-500 to-blue-600",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  },
];

export function AdaptedCausesSection() {
  return (
    <div className="py-24 bg-black/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-black/40 text-cyan-400 hover:bg-black/60 border border-white/10">
            Featured Syndicates
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join a Cause-Driven Syndicate
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-sm">
            These Syndicates are already making an impact. Join one that aligns
            with your values or create your own.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {causes.map((cause, index) => (
            <motion.div
              key={cause.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-black/40 border-white/10 overflow-hidden h-full">
                <div className="h-48 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
                  <img
                    src={cause.image}
                    alt={cause.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cause.gradient} flex items-center justify-center text-xl`}
                    >
                      {cause.icon}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-black/80 backdrop-blur-sm text-white border-white/10">
                      {cause.members} members
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {cause.name}
                  </h3>
                  <p className="text-white/70 mb-4 text-sm">{cause.description}</p>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-sm text-white/70">Allocation:</div>
                    <Badge
                      className={`bg-gradient-to-r ${cause.gradient} text-white`}
                    >
                      {cause.allocation}
                    </Badge>
                  </div>

                  <div className="flex -space-x-2 overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Avatar
                        key={i}
                        className="border-2 border-black/40 w-8 h-8"
                      >
                        <AvatarFallback className="bg-black/60 text-white/70 text-xs">
                          {String.fromCharCode(65 + i)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-black/40 bg-black/60 text-white/70 text-xs">
                      +{cause.members - 5}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Link href={`/dashboard?id=${cause.id}`} className="w-full">
                    <Button
                      className={`w-full bg-gradient-to-r ${cause.gradient} hover:opacity-90 text-white`}
                    >
                      Join Syndicate
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/create">
            <Button
              variant="outline"
              size="lg"
              className="border-white/10 text-white/80 hover:bg-black/40"
            >
              Create Your Own Syndicate
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
