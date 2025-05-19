import { SyndicateHome } from "@/components/syndicate/SyndicateHome";
import { getLensClient } from "@/lib/lens/client";

async function getAuthenticatedAccount() {
  const client = await getLensClient();
  if (!client.isSessionClient()) return null;
  const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
  if (!authenticatedUser) return null;

  // Just return the authenticated user info
  return {
    address: authenticatedUser.address,
  };
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
