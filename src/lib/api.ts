// src/lib/api.ts
// Utility to call the backend /authorize endpoint
export async function authorize(account: string, signedBy: string) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3003";
  const sharedSecret = process.env.NEXT_PUBLIC_SHARED_SECRET || "dev_secret"; // Set this in your .env.local

  const res = await fetch(`${backendUrl}/authorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${sharedSecret}`,
    },
    body: JSON.stringify({ account, signedBy }),
    credentials: "include", // for CSRF cookie
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
