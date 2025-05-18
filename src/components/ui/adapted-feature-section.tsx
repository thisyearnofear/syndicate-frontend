"use client";

import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    icon: "🌊",
    title: "Pool Resources",
    description:
      "Combine your lottery entries with others to dramatically increase your collective chances of winning.",
    color: "from-cyan-500/20 to-blue-600/20",
  },
  {
    icon: "🤝",
    title: "Support Causes",
    description:
      "Optionally allocate a portion of winnings to charitable causes you care about, helping attract more participants to your syndicate.",
    color: "from-cyan-500/20 to-blue-600/20",
  },
  {
    icon: "🔗",
    title: "Lens Integration",
    description:
      "Leverage Lens protocol's social graph with 650K profiles and 28M connections to find like-minded individuals for your Syndicate.",
    color: "from-cyan-500/20 to-blue-600/20",
  },
  {
    icon: "🎰",
    title: "Megapot Jackpots",
    description:
      "Access Megapot's onchain lottery system with transparent prize pools and verifiable randomness.",
    color: "from-cyan-500/20 to-blue-600/20",
  },
  {
    icon: "📊",
    title: "Transparent Odds",
    description:
      "Clear odds calculation (Jackpot / (.7 × Tickets bought)) with 100+ tickets per syndicate for dramatically better chances.",
    color: "from-cyan-500/20 to-blue-600/20",
  },
  {
    icon: "🚀",
    title: "Grow Your Odds",
    description:
      "The more members in your Syndicate, the higher your chances of winning compared to playing alone.",
    color: "from-cyan-500/20 to-blue-600/20",
  },
  {
    icon: "💰",
    title: "GHO Integration",
    description:
      "Use Lens Chain's native GHO stablecoin for predictable and stable transaction fees when participating in syndicates.",
    color: "from-cyan-500/20 to-blue-600/20",
  },
];

export function AdaptedFeatureSection() {
  return (
    <section className="py-16 bg-black/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Why Choose Syndicate?
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-sm">
            Our platform combines the power of collective participation with
            programmable philanthropy to create a win-win for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all h-full bg-black/40">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
