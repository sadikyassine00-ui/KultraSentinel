import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { Providers } from './providers';
import { Header, type AuthUser } from '@/components/Header';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { isAllowedAdminEmail } from '@/lib/auth';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.usekultra.com'),
  title: 'Kultra | Real-Time Google Merchant Center Slack Alerts',
  description:
    "Google won't text you when policy changes silently kill your bestselling ads. Kultra monitors your feed 24/7 and delivers instant alerts before you waste another dollar of ad spend.",
  alternates: {
    canonical: 'https://www.usekultra.com',
  },
  icons: {
    icon: [
      { url: '/favicon-48x48.png?v=20260925-gmc', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png?v=20260925-gmc', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg?v=20260925-gmc', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png?v=20260925-gmc', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico?v=20260925-gmc', sizes: 'any' },
    ],
    shortcut: '/favicon.ico?v=20260925-gmc',
    apple: [
      { url: '/apple-touch-icon.png?v=20260925-gmc', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon.png?v=20260925-gmc',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.usekultra.com',
    siteName: 'Kultra',
    title: 'Kultra | Real-Time Google Merchant Center Slack Alerts',
    description:
      'Real-Time Google Merchant Center Disapproval Alerts in Slack. Sub-30-second Cloud Pub/Sub incident dispatch with direct one-click fix links before ad spend bleeds.',
    images: [
      {
        url: 'https://www.usekultra.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kultra | Real-Time Google Merchant Center Slack Alerts',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kultra | Real-Time Google Merchant Center Slack Alerts',
    description:
      'Real-Time Google Merchant Center Disapproval Alerts in Slack. Sub-30-second Cloud Pub/Sub incident dispatch with direct one-click fix links before ad spend bleeds.',
    images: [
      {
        url: 'https://www.usekultra.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kultra | Real-Time Google Merchant Center Slack Alerts',
      },
    ],
  },
};

async function resolveInitialUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(COOKIE_NAME)?.value;
    if (!rawToken) {
      return null;
    }

    const session = await verifySessionToken(rawToken);
    if (!session || !session.email) {
      return null;
    }

    const isAdmin = Boolean(
      session.role === 'admin' ||
      session.isSuperAdmin ||
      isAllowedAdminEmail(session.email)
    );

    let planName = isAdmin ? 'Admin' : 'Active Plan';
    let planTier = isAdmin ? 'Superadmin' : 'Solo';

    if (process.env.NEXT_RUNTIME !== 'edge') {
      try {
        const { findTenantByEmail } = await import('@/lib/db');
        const tenant = await findTenantByEmail(session.email);
        if (tenant) {
          const { evaluateSubscription } = await import('@/lib/subscription');
          const sub = evaluateSubscription(tenant);
          planName = sub.planName;
          planTier = sub.planTier;
        }
      } catch {
        // Non-blocking fallback
      }
    }

    return {
      email: session.email,
      name: session.name || null,
      role: session.role || (isAdmin ? 'admin' : 'user'),
      isAdmin,
      planName,
      planTier,
    };
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await resolveInitialUser();

  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Search & Browser Favicon Hierarchy (48x48 PNG explicitly first with fresh cache buster) */}
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v=20260925-gmc" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png?v=20260925-gmc" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=20260925-gmc" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=20260925-gmc" />
        <link rel="alternate icon" href="/favicon.ico?v=20260925-gmc" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20260925-gmc" />
        <link rel="manifest" href="/site.webmanifest?v=20260925-gmc" />
        <meta name="theme-color" content="#0a0b0d" />
        <meta name="msapplication-TileColor" content="#0a0b0d" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tinos:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0b0d] text-[#f4f1ea] font-sans antialiased overflow-x-hidden max-w-full selection:bg-[#f2a93b]/20 selection:text-[#f4f1ea] min-h-screen flex flex-col">
        <Providers>
          <Header initialUser={initialUser} />
          <div className="flex-1 flex flex-col min-h-0 w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
