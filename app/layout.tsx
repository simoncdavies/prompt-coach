import type { Metadata } from 'next';
import { Roboto_Mono, Space_Grotesk } from 'next/font/google';
import { GoogleAnalytics } from '@/components/analytics/googleAnalytics';
import { GoogleTagManager } from '@/components/analytics/googleTagManager';
import CookiesBanner from '@/components/CookieBanner';
import '../styles/globals.css';

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://prompt.dvlpr.co.uk'),
  title: {
    default: 'Prompt Coach | Write Prompts That Get Better Code',
    template: '%s | Prompt Coach',
  },
  description:
    'Paste your prompt and get clear feedback plus an improved version for Claude, OpenAI, and Gemini.',
  keywords: [
    'prompt engineering',
    'AI code generation',
    'prompt linting',
    'Claude',
    'OpenAI',
    'Gemini',
    'developer tools',
    'code review',
    'LLM prompts',
  ],
  applicationName: 'Prompt Coach',
  authors: [{ name: 'Prompt Coach' }],
  creator: 'Prompt Coach',
  publisher: 'Prompt Coach',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
        color: '#2ba84a',
      },
    ],
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Prompt Coach | Write Prompts That Get Better Code',
    description:
      'Write clearer prompts and get better coding results with structured feedback and improved rewrites.',
    url: '/',
    siteName: 'Prompt Coach',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Prompt Coach - Refine AI coding prompts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prompt Coach | Write Prompts That Get Better Code',
    description:
      'Paste your prompt, get practical feedback, and improve AI coding outputs across major models.',
    images: ['/og.png'],
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
        {gtmId ? <GoogleTagManager /> : <GoogleAnalytics />}
        {children}
        <CookiesBanner />
      </body>
    </html>
  );
}
