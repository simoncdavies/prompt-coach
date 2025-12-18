import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
