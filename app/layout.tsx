import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fredoka, Quicksand } from "next/font/google";
import "./globals.css";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

import { siteContent } from '@/lib/content';
import { getMergedSiteContent } from '@/lib/services/cms';
import NotificationBar from '@/components/landing/NotificationBar';

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
    description: siteContent.meta.description,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

import AnalyticsLoader from '@/components/AnalyticsLoader';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { UserProvider } from '@/components/UserContext';
import StructuredData from '@/components/StructuredData';
// TantySpiceWidget removed - R.O.T.I. is the primary chat interface

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let content = siteContent;
  try {
    content = await getMergedSiteContent();
  } catch (err) {
    console.error("Failed to load CMS content:", err);
  }

  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} ${quicksand.variable} font-quicksand antialiased`}
        suppressHydrationWarning
      >
        <NotificationBar content={content} />
        <AnalyticsLoader />
        <CookieConsentBanner />
        <UserProvider>
          {children}
          {/* Tanty chatbot removed per user request */}
        </UserProvider>
      </body>
    </html>
  );
}
