"use client";

import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { Button } from "./button";

// Linear interpolation function from MagneticButtons
const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

// Calculate distance between two points
function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const a = x1 - x2;
  const b = y1 - y2;
  return Math.hypot(a, b);
}

interface MagneticButtonProps extends React.PropsWithChildren {
  strength?: number;
  distance?: number;
  scale?: number;
  animateChildren?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  textEffect?: "slide" | "scale" | "none";
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  borderEffect?: boolean;
}

export const MagneticButton = React.forwardRef<
  HTMLButtonElement,
  MagneticButtonProps
>(
  (
    {
      children,
      className,
      strength = 50,
      distance = 0.5,
      scale = 1.1,
      animateChildren = true,
      textEffect = "none",
      backgroundColor,
      hoverBackgroundColor,
      borderEffect = false,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const boundingRef = useRef<DOMRect | null>(null);
    const mousePosition = useRef({ x: 0, y: 0 });
    const renderedStyles = useRef({
      tx: { previous: 0, current: 0, amt: 0.1 },
      ty: { previous: 0, current: 0, amt: 0.1 },
    });
    const frameRef = useRef<number | null>(null);

    // Initialize GSAP animation
    useEffect(() => {
      if (!buttonRef.current) return;

      // Reset position when component mounts
      gsap.set(buttonRef.current, { x: 0, y: 0, scale: 1 });

      // If we want to animate children, find the inner elements
      if (animateChildren) {
        const childElements =
          buttonRef.current.querySelectorAll(".magnetic-child");
        if (childElements.length > 0) {
          gsap.set(childElements, { x: 0, y: 0 });
        }
      }

      return () => {
        // Reset on unmount
        if (buttonRef.current) {
          gsap.set(buttonRef.current, {
            x: 0,
            y: 0,
            scale: 1,
            clearProps: "all",
          });
        }

        // Cancel animation frame
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
      };
    }, [animateChildren]);

    // Render function for smooth animation
    const render = () => {
      if (!buttonRef.current || !isHovered) return;

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

      // Apply transform
      gsap.set(buttonRef.current, {
        x: renderedStyles.current.tx.previous,
        y: renderedStyles.current.ty.previous,
      });

      // Animate children in opposite direction for parallax effect
      if (animateChildren) {
        const childElements =
          buttonRef.current.querySelectorAll(".magnetic-child");
        if (childElements.length > 0) {
          gsap.set(childElements, {
            x: -renderedStyles.current.tx.previous * 0.3,
            y: -renderedStyles.current.ty.previous * 0.3,
          });
        }
      }

      frameRef.current = requestAnimationFrame(render);
    };

    const enterHandler = () => {
      setIsHovered(true);
      if (buttonRef.current) {
        boundingRef.current = buttonRef.current.getBoundingClientRect();

        // Scale animation
        gsap.to(buttonRef.current, {
          scale: scale,
          duration: 0.4,
          ease: "power2.out",
        });

        // Background color animation if provided
        if (hoverBackgroundColor) {
          gsap.to(buttonRef.current, {
            backgroundColor: hoverBackgroundColor,
            duration: 0.3,
          });
        }

        // Border effect animation
        if (borderEffect) {
          gsap.to(buttonRef.current, {
            borderColor: "rgba(255, 255, 255, 0.8)",
            borderWidth: "2px",
            duration: 0.3,
          });
        }

        // Text effect animations
        if (textEffect === "slide") {
          const textElement =
            buttonRef.current.querySelector(".magnetic-child");
          if (textElement) {
            gsap.fromTo(
              textElement,
              { y: "20%", opacity: 0 },
              {
                y: "0%",
                opacity: 1,
                duration: 0.3,
                ease: "power2.out",
              }
            );
          }
        } else if (textEffect === "scale") {
          const textElement =
            buttonRef.current.querySelector(".magnetic-child");
          if (textElement) {
            gsap.to(textElement, {
              scale: 0.9,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        }

        // Start render loop for smooth animation
        frameRef.current = requestAnimationFrame(render);
      }
    };

    const leaveHandler = () => {
      setIsHovered(false);
      if (buttonRef.current) {
        // Reset position and scale
        gsap.to(buttonRef.current, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "elastic.out(1, 0.3)",
        });

        // Reset background color if provided
        if (backgroundColor) {
          gsap.to(buttonRef.current, {
            backgroundColor: backgroundColor,
            duration: 0.3,
          });
        }

        // Reset border effect
        if (borderEffect) {
          gsap.to(buttonRef.current, {
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: "1px",
            duration: 0.3,
          });
        }

        // Reset children animations
        if (animateChildren) {
          const childElements =
            buttonRef.current.querySelectorAll(".magnetic-child");
          if (childElements.length > 0) {
            gsap.to(childElements, {
              x: 0,
              y: 0,
              scale: 1,
              duration: 0.4,
              ease: "elastic.out(1, 0.3)",
            });
          }
        }

        // Reset rendered styles
        renderedStyles.current.tx.current = 0;
        renderedStyles.current.ty.current = 0;

        // Cancel animation frame
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
      }
    };

    const moveHandler = (e: React.MouseEvent) => {
      if (isHovered && buttonRef.current && boundingRef.current) {
        // Calculate mouse position relative to button center
        const rect = boundingRef.current;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;

        // Calculate distance from mouse to button center
        const distanceMouseButton = calculateDistance(
          mouseX,
          mouseY,
          buttonCenterX,
          buttonCenterY
        );

        // Only apply effect if mouse is within trigger distance
        const distanceToTrigger = rect.width * 1.5;

        if (distanceMouseButton < distanceToTrigger) {
          // Calculate movement based on distance from center
          const x = (mouseX - buttonCenterX) * distance;
          const y = (mouseY - buttonCenterY) * distance;

          // Update current values for lerp
          renderedStyles.current.tx.current = x;
          renderedStyles.current.ty.current = y;
        }
      }
    };

    return (
      <Button
        ref={(node) => {
          // Handle both the forwarded ref and our local ref
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          if (node) {
            buttonRef.current = node;
          }
        }}
        className={cn(
          "relative overflow-hidden transition-colors",
          backgroundColor && `bg-[${backgroundColor}]`,
          className
        )}
        onMouseEnter={enterHandler}
        onMouseLeave={leaveHandler}
        onMouseMove={moveHandler}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

MagneticButton.displayName = "MagneticButton";
