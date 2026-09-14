import type { Metadata } from 'next';
import './satoshi-font.css';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  metadataBase: new URL('https://kultra.ai'),
  title: 'Kultra: Google Merchant Center Disapproval Watchdog',
  description:
    "Google won't text you when policy changes silently kill your bestselling ads. Kultra monitors your feed 24/7 and delivers instant alerts before you waste another dollar of ad spend.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Kultra: Google Merchant Center Disapproval Watchdog',
    description:
      "Google won't text you when policy changes silently kill your bestselling ads. Kultra monitors your feed 24/7 and delivers instant alerts before you waste another dollar of ad spend.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kultra',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kultra: Google Merchant Center Disapproval Watchdog',
    description:
      "Google won't text you when policy changes silently kill your bestselling ads. Kultra monitors your feed 24/7 and delivers instant alerts before you waste another dollar of ad spend.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0a0b1d" />
        <meta name="msapplication-TileColor" content="#0a0b1d" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0b1dff] text-[#FDF4D2] antialiased overflow-x-hidden selection:bg-[#FF788D]/25 selection:text-[#FDF4D2] min-h-screen flex flex-col">
        <Providers>
          <Header />
          <div className="flex-1 flex flex-col min-h-0 w-full">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
