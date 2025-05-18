import React, { useMemo } from "react";
import { MenuToGrid } from "../ui/layout/menu-to-grid";
import type { Syndicate } from "@/types/syndicate";

interface SyndicateMenuGridProps {
  syndicates: Syndicate[];
}

// Generate a placeholder image with a colored background and text
const generatePlaceholderImage = (index: number, text: string) => {
  const colors = [
    "#4CAF50",
    "#2196F3",
    "#FF9800",
    "#E91E63",
    "#9C27B0",
    "#00BCD4",
  ];
  const color = colors[index % colors.length];

  // Return a data URL for a colored SVG with text
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='${color.replace(
    "#",
    "%23"
  )}' /%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'%3E${text}%3C/text%3E%3C/svg%3E`;
};

const SyndicateMenuGrid: React.FC<SyndicateMenuGridProps> = ({
  syndicates,
}) => {
  // Transform syndicates data to the format expected by MenuToGrid
  const menuItems = useMemo(
    () =>
      syndicates.map((syndicate, index) => {
        // Generate placeholder images based on syndicate name and cause
        const placeholders = [
          generatePlaceholderImage(index, syndicate.name.charAt(0)),
          generatePlaceholderImage(index + 1, syndicate.cause.charAt(0)),
          generatePlaceholderImage(index + 2, "🎯"),
        ];

        // Use syndicate images or placeholders
        const images = syndicate.images || placeholders;

        // Use additional images for the grid view if available
        const gridImages = syndicate.gridImages || [
          ...images,
          generatePlaceholderImage(index + 3, "🏆"),
          generatePlaceholderImage(index + 4, "🎲"),
        ];

        return {
          id: syndicate.id,
          title: syndicate.name,
          images,
          gridImages,
        };
      }),
    [syndicates]
  );

  return (
    <div className="syndicate-menu-grid">
      <MenuToGrid items={menuItems} />
    </div>
  );
};

export default SyndicateMenuGrid;
