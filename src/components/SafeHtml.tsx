// Component to safely render user-generated HTML using DOMPurify
// Usage: <SafeHtml html={someUserHtml} />
import React from "react";
import { sanitize } from "@/lib/sanitize";

type SafeHtmlProps = {
  html: string;
  className?: string;
};

export function SafeHtml({ html, className }: SafeHtmlProps) {
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  );
}
