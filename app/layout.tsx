import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", baseUrl).toString();

  return {
    metadataBase: baseUrl,
    title: "SignalBrief — Turn documents into clear next moves",
    description: "A working AI document intelligence case study with a real OpenAI path, explicit local mode, and verifiable engineering controls.",
    other: {
      google: "notranslate",
    },
    openGraph: {
      title: "SignalBrief",
      description: "A reliable path from messy source documents to structured decisions.",
      type: "website",
      images: [{ url: socialImage, alt: "SignalBrief editorial document intelligence workspace" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "SignalBrief",
      description: "Turn messy documents into clear next moves.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" translate="no" className="notranslate"><body>{children}</body></html>;
}
