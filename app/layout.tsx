import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "RealYield Auditor — Understand the yield before the APY",
  description:
    "Evidence-backed DeFi yield analysis with deterministic risk scoring, dependency mapping, and scenario simulation.",
  metadataBase: new URL("https://realyield-auditor.openai.site"),
  openGraph: {
    title: "RealYield Auditor",
    description: "Know where the yield comes from before you trust the APY.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "RealYield Auditor",
    description: "Know where the yield comes from before you trust the APY.",
    images: ["/og.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${mono.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}
