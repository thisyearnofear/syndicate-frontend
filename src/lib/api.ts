// src/lib/api.ts
// Utility to call the backend /authorize endpoint
export async function authorize(account: string, signedBy: string) {
  const backendUrl =
    process.env.NEXT_PUBLIC_AUTH_BACKEND_URL || "https://site--syndicate-backend--wxs584h67csv.code.run/";
  const sharedSecret = process.env.NEXT_PUBLIC_AUTH_BACKEND_SECRET || "dev_secret"; // Set this in your .env.local

  const res = await fetch(`${backendUrl}/authorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sharedSecret}`,
    },
    body: JSON.stringify({ account, signedBy }),
    credentials: "include", // for CSRF cookie
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
