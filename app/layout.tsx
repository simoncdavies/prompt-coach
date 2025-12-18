import type { Metadata } from "next";
import { Space_Grotesk, Roboto_Mono } from "next/font/google";
import "./globals.css";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt Coach | Refine AI Coding Prompts",
    description:
      "Improve AI coding responses by linting your prompts for Claude, OpenAI, and Gemini.",
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
        {children}
      </body>
    </html>
  );
}
