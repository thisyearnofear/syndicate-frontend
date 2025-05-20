import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Preload images
 * @param {string} selector - Selector/scope from where images need to be preloaded. Default is 'img'
 */
export const preloadImages = (selector = "img"): Promise<void> => {
  return new Promise((resolve) => {
    // If we're on the server, resolve immediately
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    // If imagesLoaded is available, use it
    if (typeof (window as any).imagesLoaded === "function") {
      (window as any).imagesLoaded(
        document.querySelectorAll(selector),
        { background: true },
        resolve
      );
      return;
    }

    // Fallback: manually load images
    const images = document.querySelectorAll(selector);
    if (images.length === 0) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= images.length) {
        resolve();
      }
    };

    images.forEach((img) => {
      if ((img as HTMLImageElement).complete) {
        checkAllLoaded();
      } else {
        img.addEventListener("load", checkAllLoaded);
        img.addEventListener("error", checkAllLoaded);
      }
    });
  });
};

/**
 * Preload fonts using Web Font Loader if available
 * @param {string} id - Typekit ID
 */
export const preloadFonts = (id: string): Promise<void> => {
  return new Promise((resolve) => {
    // If we're on the server, resolve immediately
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    // If WebFont is available, use it
    if (typeof (window as any).WebFont === "function") {
      (window as any).WebFont.load({
        typekit: {
          id: id,
        },
        active: resolve,
      });
      return;
    }

    // If WebFont is not available, resolve immediately
    resolve();
  });
};

/**
 * Generates an explorer link for an address on a specific chain
 * @param address The address to generate a link for
 * @param chainId The chain ID (232 for Lens, 8453 for Base)
 * @returns The explorer URL for the address
 */
export function getExplorerLink(address: string, chainId: number): string {
  switch (chainId) {
    case 232: // Lens Chain
      return `https://explorer.lens.xyz/address/${address}`;
    case 37111: // Lens Testnet
      return `https://testnet.lensscan.io/address/${address}`;
    case 8453: // Base
      return `https://basescan.org/address/${address}`;
    default:
      return `https://explorer.lens.xyz/address/${address}`;
  }
}

/**
 * Formats an address for display by showing only the first 6 and last 4 characters
 * @param address The address to format
 * @returns The formatted address string
 */
export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
