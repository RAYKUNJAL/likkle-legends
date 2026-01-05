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
  weight: ["400", "500", "600", "700"],
});

import { siteContent } from '@/lib/content';

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
};

import AnalyticsLoader from '@/components/AnalyticsLoader';
import CookieBanner from '@/components/CookieBanner';
import { UserProvider } from '@/components/UserContext';
import StructuredData from '@/components/StructuredData';

import TantySpiceWidget from '@/components/TantySpiceWidget';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} ${quicksand.variable} antialiased`}
        suppressHydrationWarning
      >
        <AnalyticsLoader />
        <CookieBanner />
        <UserProvider>
          {children}
          <TantySpiceWidget />
        </UserProvider>
      </body>
    </html>
  );
}
