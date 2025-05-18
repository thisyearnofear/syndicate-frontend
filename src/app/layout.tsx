import "./globals.css";
import { Providers } from "@/components/web3/Providers";

export const metadata = {
  title: "Syndicate - Win Together, Impact Together",
  description:
    "Syndicate: SocialFi-powered, programmable philanthropy. Pool your luck, pledge your impact, and win together on Lens.",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
  metadataBase: new URL("https://syndicate-lens.vercel.app"),
  openGraph: {
    title: "Syndicate - Win Together, Impact Together",
    description:
      "Syndicate: SocialFi-powered, programmable philanthropy. Join cause-driven lottery syndicates powered by Lens Protocol.",
    images: [
      {
        url: "/icon.png",
        width: 120,
        height: 120,
        alt: "Syndicate Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased m-0 p-0 min-h-screen bg-black text-white">
        <Providers>
          <main className="flex flex-col items-center w-full">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
