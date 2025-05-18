"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  variant?: "gradient" | "confetti" | "animals" | "minimal";
  intensity?: "low" | "medium" | "high";
}

// Animal emoji array for random selection
const animalEmojis = [
  "🦊",
  "🐼",
  "🦁",
  "🐯",
  "🐨",
  "🐰",
  "🐶",
  "🐱",
  "🦄",
  "🐢",
  "🐬",
  "🦉",
  "🦋",
  "🐝",
  "🐌",
  "🦔",
  "🐙",
  "🦑",
  "🦦",
  "🦥",
  "🦝",
  "🦡",
  "🦘",
  "🦒",
];

export function AnimatedBackground({
  className,
  children,
  variant = "gradient",
  intensity = "medium",
}: AnimatedBackgroundProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const animalsRef = useRef<HTMLDivElement>(null);

  // Generate random animals for decoration
  const randomAnimals = Array.from({ length: 8 }, () => {
    const randomIndex = Math.floor(Math.random() * animalEmojis.length);
    return animalEmojis[randomIndex];
  });

  useEffect(() => {
    // Make sure we're in the browser environment
    if (typeof window === "undefined" || !backgroundRef.current) return;

    // Different animations based on variant
    if (variant === "gradient") {
      // Animate gradient background
      try {
        gsap.to(backgroundRef.current, {
          backgroundPosition: "100% 100%",
          duration:
            intensity === "high" ? 15 : intensity === "medium" ? 30 : 60,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });
      } catch (error) {
        console.error("GSAP gradient animation error:", error);
      }
    }

    // Animate floating animals if they exist
    if (variant === "animals" && animalsRef.current) {
      try {
        const animals = animalsRef.current.querySelectorAll(".floating-animal");

        if (animals.length > 0) {
          gsap.to(animals, {
            y: -15,
            duration: 2,
            ease: "power1.inOut",
            stagger: 0.3,
            repeat: -1,
            yoyo: true,
          });
        }
      } catch (error) {
        console.error("GSAP animals animation error:", error);
      }
    }

    // Animate confetti if that variant is selected
    if (variant === "confetti" && backgroundRef.current) {
      try {
        // Create confetti elements
        const confettiCount =
          intensity === "high" ? 100 : intensity === "medium" ? 50 : 25;
        const confettiContainer = document.createElement("div");
        confettiContainer.className =
          "absolute inset-0 overflow-hidden pointer-events-none";
        backgroundRef.current.appendChild(confettiContainer);

        for (let i = 0; i < confettiCount; i++) {
          const confetti = document.createElement("div");
          const size = Math.random() * 10 + 5;
          const color = `hsl(${Math.random() * 360}, 80%, 60%)`;

          confetti.className = "absolute rounded-sm";
          confetti.style.width = `${size}px`;
          confetti.style.height = `${size}px`;
          confetti.style.backgroundColor = color;
          confetti.style.left = `${Math.random() * 100}%`;
          confetti.style.top = `${Math.random() * 100}%`;
          confetti.style.opacity = `${Math.random() * 0.7 + 0.3}`;
          confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

          confettiContainer.appendChild(confetti);

          gsap.to(confetti, {
            y: `${Math.random() * 200 + 100}`,
            x: `${(Math.random() - 0.5) * 100}`,
            rotation: `+=${Math.random() * 360}`,
            duration: Math.random() * 10 + 10,
            repeat: -1,
            ease: "none",
            delay: Math.random() * 5,
          });
        }
      } catch (error) {
        console.error("GSAP confetti animation error:", error);
      }
    }

    return () => {
      // Clean up animations
      try {
        if (backgroundRef.current) {
          gsap.killTweensOf(backgroundRef.current);
        }

        if (variant === "animals" && animalsRef.current) {
          const animals =
            animalsRef.current.querySelectorAll(".floating-animal");
          if (animals.length > 0) {
            gsap.killTweensOf(animals);
          }
        }
      } catch (error) {
        console.error("GSAP cleanup error:", error);
      }
    };
  }, [variant, intensity]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background element */}
      <div
        ref={backgroundRef}
        className={cn(
          "absolute inset-0 z-0",
          variant === "gradient" &&
            "bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-pink-600/30 bg-[length:200%_200%] bg-[0%_0%]",
          variant === "minimal" && "bg-black"
        )}
      />

      {/* Animals variant */}
      {variant === "animals" && (
        <div ref={animalsRef} className="absolute inset-0 z-0 overflow-hidden">
          {randomAnimals.map((animal, index) => (
            <div
              key={index}
              className="floating-animal absolute text-4xl opacity-20"
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
              }}
            >
              {animal}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
