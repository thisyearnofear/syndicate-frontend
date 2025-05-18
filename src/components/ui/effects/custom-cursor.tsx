"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

// Linear interpolation function
const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

interface CustomCursorProps {
  color?: string;
  size?: number;
  opacity?: number;
  zIndex?: number;
  className?: string;
}

export function CustomCursor({
  color = "rgba(255, 255, 255, 0.8)",
  size = 25,
  opacity = 1,
  zIndex = 9999,
  className,
}: CustomCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<SVGCircleElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const mousePosition = useRef({ x: 0, y: 0 });
  const renderedStyles = useRef({
    tx: { previous: 0, current: 0, amt: 0.2 },
    ty: { previous: 0, current: 0, amt: 0.2 },
    scale: { previous: 1, current: 1, amt: 0.2 },
    opacity: { previous: opacity, current: opacity, amt: 0.2 },
  });
  const requestRef = useRef<number | null>(null);

  // Initialize cursor
  useEffect(() => {
    // Set initial opacity to 0
    if (cursorRef.current) {
      gsap.set(cursorRef.current, { opacity: 0 });
    }

    // Track mouse position
    const updateMousePosition = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };

      if (!isVisible) {
        setIsVisible(true);
        gsap.to(cursorRef.current, {
          duration: 0.9,
          ease: "Power3.easeOut",
          opacity: opacity,
        });
      }

      // Update current values
      renderedStyles.current.tx.current = e.clientX;
      renderedStyles.current.ty.current = e.clientY;
    };

    // Handle mouse enter/leave for interactive elements
    const handleMouseEnter = () => {
      setIsActive(true);
      renderedStyles.current.scale.current = 4;
      renderedStyles.current.opacity.current = 0.2;
    };

    const handleMouseLeave = () => {
      setIsActive(false);
      renderedStyles.current.scale.current = 1;
      renderedStyles.current.opacity.current = opacity;
    };

    // Add event listeners
    window.addEventListener("mousemove", updateMousePosition);

    // Add event listeners to interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);

      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });

      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [opacity, isVisible]);

  // Animation loop
  useEffect(() => {
    const render = () => {
      // Apply lerp for smooth animation
      renderedStyles.current.tx.previous = lerp(
        renderedStyles.current.tx.previous,
        renderedStyles.current.tx.current,
        renderedStyles.current.tx.amt
      );

      renderedStyles.current.ty.previous = lerp(
        renderedStyles.current.ty.previous,
        renderedStyles.current.ty.current,
        renderedStyles.current.ty.amt
      );

      renderedStyles.current.scale.previous = lerp(
        renderedStyles.current.scale.previous,
        renderedStyles.current.scale.current,
        renderedStyles.current.scale.amt
      );

      renderedStyles.current.opacity.previous = lerp(
        renderedStyles.current.opacity.previous,
        renderedStyles.current.opacity.current,
        renderedStyles.current.opacity.amt
      );

      // Apply styles
      if (cursorRef.current) {
        gsap.set(cursorRef.current, {
          x: renderedStyles.current.tx.previous,
          y: renderedStyles.current.ty.previous,
          opacity: renderedStyles.current.opacity.previous,
        });
      }

      if (cursorInnerRef.current) {
        gsap.set(cursorInnerRef.current, {
          scale: renderedStyles.current.scale.previous,
        });
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={cn(
        "fixed top-0 left-0 pointer-events-none transform -translate-x-1/2 -translate-y-1/2",
        className
      )}
      style={{
        width: size,
        height: size,
        zIndex: zIndex,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          ref={cursorInnerRef}
          className="cursor-inner"
          cx={size / 2}
          cy={size / 2}
          r={size / 4}
          fill="none"
          stroke={color}
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
