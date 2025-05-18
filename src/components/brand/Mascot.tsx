"use client";

import Link from "next/link";

// Playful doodle mascot for Syndicate
export default function Mascot() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 select-none hover:opacity-90 transition-opacity"
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="#FDF6E3"
          stroke="#B5B5B5"
          strokeDasharray="6 4"
          strokeWidth="4"
        />
        <rect
          x="35"
          y="35"
          width="50"
          height="50"
          rx="12"
          fill="#B3E5FC"
          stroke="#222"
          strokeWidth="2"
        />
        <text x="60" y="65" textAnchor="middle" fontSize="32" fill="#222">
          😀
        </text>
      </svg>
      <span className="font-bold text-xl text-[#222] tracking-tight">
        syndicate
      </span>
    </Link>
  );
}
