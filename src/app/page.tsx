import { SyndicateHome } from "@/components/syndicate/SyndicateHome";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";

async function getAuthenticatedAccount() {
  const client = await getLensClient();
  if (!client.isSessionClient()) return null;
  const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
  if (!authenticatedUser) return null;
  return fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(
    null
  );
}

export default async function Home() {
  const account = await getAuthenticatedAccount();

  return (
    <main className="min-h-screen w-full bg-black text-white">
      <SyndicateHome />
    </main>
  );
}
