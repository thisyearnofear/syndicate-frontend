import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Preload images
 * @param {string} selector - Selector/scope from where images need to be preloaded. Default is 'img'
 */
export const preloadImages = (selector = 'img'): Promise<void> => {
  return new Promise((resolve) => {
    // If we're on the server, resolve immediately
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    // If imagesLoaded is available, use it
    if (typeof (window as any).imagesLoaded === 'function') {
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
        img.addEventListener('load', checkAllLoaded);
        img.addEventListener('error', checkAllLoaded);
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
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    // If WebFont is available, use it
    if (typeof (window as any).WebFont === 'function') {
      (window as any).WebFont.load({
        typekit: {
          id: id
        },
        active: resolve
      });
      return;
    }

    // If WebFont is not available, resolve immediately
    resolve();
  });
};
