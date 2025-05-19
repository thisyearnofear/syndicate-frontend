import { SyndicateHome } from "@/components/syndicate/SyndicateHome";
import { getLensClient } from "@/lib/lens/client";

async function getAuthenticatedAccount() {
  try {
    const client = await getLensClient();

    // Just check if authenticated and return a simple object
    const isAuthenticated = await client.authentication.isAuthenticated();
    if (!isAuthenticated) return null;

    // Return a simple object without trying to access specific properties
    return {
      authenticated: true,
    };
  } catch (error) {
    console.error("Error getting authenticated account:", error);
    return null;
  }
}

export default async function Home() {
  // We'll get the account but not use it for now
  await getAuthenticatedAccount();

  return (
    <main className="min-h-screen w-full bg-black text-white">
      <SyndicateHome />
    </main>
  );
}
