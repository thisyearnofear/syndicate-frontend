"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/data-display/card";

const features = [
  {
    icon: "🌊",
    title: "Pool Resources",
    description:
      "Combine your lottery entries with others to dramatically increase your collective chances of winning.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: "🤝",
    title: "Support Causes",
    description:
      "Automatically allocate a portion of winnings to charitable causes you care about through smart contracts.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: "🔗",
    title: "Lens Integration",
    description:
      "Leverage the Lens protocol's social graph to find like-minded individuals and grow your Syndicate.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: "📊",
    title: "Transparent Allocation",
    description:
      "Smart contracts ensure winnings are distributed fairly between causes and participants.",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: "🚀",
    title: "Grow Your Odds",
    description:
      "The more members in your Syndicate, the higher your chances of winning compared to playing alone.",
    color: "from-rose-500 to-red-500",
  },
  {
    icon: "🔒",
    title: "Secure & Trustless",
    description:
      "Built on blockchain technology for complete transparency and security in every transaction.",
    color: "from-indigo-500 to-blue-500",
  },
];

export function SimpleFeatures() {
  return (
    <div className="bg-gray-950 py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose Syndicate?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our platform combines the power of collective participation with
            programmable philanthropy to create a win-win for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index}>
              <Card className="bg-gray-900 border-gray-800 overflow-hidden h-full">
                <CardContent className="p-6 h-full flex flex-col">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 flex-grow">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
