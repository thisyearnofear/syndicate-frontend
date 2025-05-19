"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Syndicates Page - Currently redirects to the Explore page
 * In the future, this can be implemented as a dedicated syndicates listing page
 */
export default function SyndicatesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the explore page for now
    router.replace("/explore");
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold">Redirecting to Explore Page...</h1>
      <p className="mt-4 text-white/70">
        The dedicated Syndicates page is coming soon. Redirecting you to the
        Explore page.
      </p>
    </div>
  );
}
