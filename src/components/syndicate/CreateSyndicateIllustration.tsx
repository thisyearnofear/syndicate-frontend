import React from "react";

export function CreateSyndicateIllustration() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 280,
        margin: "0 auto 1.5rem",
        userSelect: "none",
        opacity: 0.85,
      }}
      aria-label="Create Syndicate Illustration"
    >
      {/* Simple SVG placeholder, replace or style as needed */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="120"
        viewBox="0 0 280 120"
        fill="none"
      >
        <ellipse cx="140" cy="60" rx="120" ry="50" fill="#E0F7FA" />
        <circle cx="70" cy="60" r="28" fill="#00BCD4" />
        <circle cx="210" cy="60" r="28" fill="#B2EBF2" />
        <circle cx="140" cy="44" r="32" fill="#0097A7" />
      </svg>
      <div
        style={{
          textAlign: "center",
          marginTop: 8,
          color: "#00BCD4",
          fontWeight: 500,
        }}
      >
        🎨 Build your Syndicate
      </div>
    </div>
  );
}
