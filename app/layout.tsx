import type { Metadata } from "next";
import { Space_Grotesk, Roboto_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "../styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prompt.dvlpr.co.uk"),
  title: {
    default: "Prompt Coach | Refine AI Coding Prompts",
    template: "%s | Prompt Coach",
  },
  description:
    "Prompt Coach helps you lint, analyze, and improve prompts so Claude, OpenAI, and Gemini return better code.",
  keywords: [
    "prompt engineering",
    "AI code generation",
    "prompt linting",
    "Claude",
    "OpenAI",
    "Gemini",
    "developer tools",
    "code review",
    "LLM prompts",
  ],
  applicationName: "Prompt Coach",
  authors: [{ name: "Prompt Coach" }],
  creator: "Prompt Coach",
  publisher: "Prompt Coach",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.svg",
        color: "#2ba84a",
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Prompt Coach | Refine AI Coding Prompts",
    description:
      "Refine your AI coding prompts with structured linting, feedback, and examples for Claude, OpenAI, and Gemini.",
    url: "/",
    siteName: "Prompt Coach",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Prompt Coach - Refine AI coding prompts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt Coach | Refine AI Coding Prompts",
    description:
      "Improve AI coding responses by linting your prompts for Claude, OpenAI, and Gemini.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${robotoMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
