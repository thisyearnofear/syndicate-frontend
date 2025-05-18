"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: "gradient" | "particles" | "waves";
  intensity?: "low" | "medium" | "high";
  colors?: string[];
}

export function AnimatedBackground({
  children,
  className,
  variant = "gradient",
  intensity = "medium",
  colors = ["#22d3ee", "#3b82f6", "#8b5cf6"],
}: AnimatedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const wavesRef = useRef<SVGSVGElement>(null);

  // Intensity factors
  const intensityFactors = {
    low: 0.5,
    medium: 1,
    high: 1.5,
  };

  const factor = intensityFactors[intensity];

  // Gradient animation
  useEffect(() => {
    if (variant === "gradient" && containerRef.current) {
      const tl = gsap.timeline({
        repeat: -1,
        yoyo: true,
      });

      // Create a subtle moving gradient effect
      tl.to(containerRef.current, {
        backgroundPosition: "200% 100%",
        duration: 15 / factor,
        ease: "sine.inOut",
      });
    }
  }, [variant, factor]);

  // Particles animation
  useEffect(() => {
    if (variant === "particles" && particlesRef.current) {
      const particleCount = Math.floor(20 * factor);
      const particles: HTMLDivElement[] = [];

      // Create particles
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "absolute rounded-full opacity-0";

        // Random size between 4px and 12px
        const size = Math.floor(Math.random() * 8) + 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;

        // Random color from the colors array
        const colorIndex = Math.floor(Math.random() * colors.length);
        particle.style.backgroundColor = colors[colorIndex];

        particlesRef.current.appendChild(particle);
        particles.push(particle);
      }

      // Animate particles
      particles.forEach((particle) => {
        // Initial position
        gsap.set(particle, {
          x: Math.random() * 100 - 50,
          y: Math.random() * 100 - 50,
          opacity: 0,
        });

        // Animation timeline
        const tl = gsap.timeline({
          repeat: -1,
          delay: Math.random() * 5,
        });

        tl.to(particle, {
          opacity: Math.random() * 0.5 + 0.1,
          duration: 1,
        })
          .to(particle, {
            x: "+=50",
            y: "+=50",
            duration: 10 / factor,
            ease: "sine.inOut",
          })
          .to(
            particle,
            {
              opacity: 0,
              duration: 1,
            },
            "-=1"
          );
      });

      return () => {
        // Cleanup
        particles.forEach((particle) => {
          if (particlesRef.current && particlesRef.current.contains(particle)) {
            particlesRef.current.removeChild(particle);
          }
        });
      };
    }
  }, [variant, factor, colors]);

  // Waves animation
  useEffect(() => {
    if (variant === "waves" && wavesRef.current) {
      const paths = wavesRef.current.querySelectorAll("path");

      paths.forEach((path, index) => {
        const delay = index * 0.2;

        const altPath = path.getAttribute("data-alt-path");
        if (altPath) {
          gsap.to(path, {
            attr: { d: altPath },
            duration: 5 / factor,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay,
          });
        }
      });
    }
  }, [variant, factor]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        variant === "gradient" && "bg-gradient-to-br bg-[length:200%_200%]",
        className
      )}
      style={
        variant === "gradient"
          ? {
              backgroundImage: `linear-gradient(135deg, ${colors.join(", ")})`,
            }
          : undefined
      }
    >
      {variant === "particles" && (
        <div
          ref={particlesRef}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        />
      )}

      {variant === "waves" && (
        <svg
          ref={wavesRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 1200 800"
        >
          <path
            d="M0,800 C300,700 600,750 1200,800 L1200,800 L0,800 Z"
            data-alt-path="M0,800 C400,650 700,800 1200,800 L1200,800 L0,800 Z"
            fill={colors[0]}
            opacity="0.2"
          />
          <path
            d="M0,800 C500,650 800,700 1200,800 L1200,800 L0,800 Z"
            data-alt-path="M0,800 C600,750 900,650 1200,800 L1200,800 L0,800 Z"
            fill={colors[1]}
            opacity="0.2"
          />
          <path
            d="M0,800 C700,750 1000,650 1200,800 L1200,800 L0,800 Z"
            data-alt-path="M0,800 C200,700 500,750 1200,800 L1200,800 L0,800 Z"
            fill={colors[2]}
            opacity="0.2"
          />
        </svg>
      )}

      {children}
    </div>
  );
}
