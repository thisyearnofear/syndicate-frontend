"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/data-display/skeleton";

interface OptimizedImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  showSkeleton?: boolean;
  className?: string;
  containerClassName?: string;
  onImageError?: (error: Error) => void;
}

/**
 * OptimizedImage component that uses Next.js Image with error handling and loading states
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/images/placeholder.svg",
  showSkeleton = true,
  className,
  containerClassName,
  onImageError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleError = (e: any) => {
    setError(true);
    setIsLoading(false);
    if (onImageError) {
      onImageError(new Error(`Failed to load image: ${src}`));
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={cn("relative", containerClassName)}>
      {isLoading && showSkeleton && (
        <Skeleton className={cn("absolute inset-0", className)} />
      )}
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}
