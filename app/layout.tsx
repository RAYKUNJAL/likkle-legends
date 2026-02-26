import { Suspense } from "react";
import type { Metadata } from "next";
import { Fredoka, Quicksand, Montserrat } from "next/font/google";
import "./globals.css";

// Montserrat: primary brand font — preloaded (critical)
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
});

// Fredoka/Quicksand: accent fonts — lazy loaded, no CLS penalty
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

import { siteContent } from '@/lib/content';
import { getCachedSiteContent } from '@/lib/services/cms';
import NotificationBar from '@/components/landing/NotificationBar';
import { GeoProvider } from '@/components/GeoContext';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.likklelegends.com'),
  title: {
    default: siteContent.meta.title,
    template: `%s | Likkle Legends`,
  },
  description: siteContent.meta.description,
  openGraph: {
    title: siteContent.meta.title,
    description: siteContent.meta.description,
    url: '/',
    siteName: 'Likkle Legends',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteContent.meta.title,
    description: siteContent.meta.description,
  },
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
};

import AnalyticsLoader from '@/components/AnalyticsLoader';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { UserProvider } from '@/components/UserContext';
import StructuredData from '@/components/StructuredData';
import ReferralTracker from '@/components/ReferralTracker';
import { Toaster } from 'react-hot-toast';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let content = siteContent;
  try {
    content = await getCachedSiteContent();
  } catch (err) {
    console.error("Failed to load CMS content:", err);
  }

  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${montserrat.variable} ${fredoka.variable} ${quicksand.variable} font-montserrat antialiased`}
        suppressHydrationWarning
      >
        <NotificationBar content={content} />
        <AnalyticsLoader />
        <Suspense fallback={null}>
          <ReferralTracker />
        </Suspense>
        <CookieConsentBanner />
        <Toaster position="top-right" />
        <UserProvider suppressHydrationWarning>
          <GeoProvider>
            {children}
          </GeoProvider>
        </UserProvider>
      </body>
    </html>
  );
}
