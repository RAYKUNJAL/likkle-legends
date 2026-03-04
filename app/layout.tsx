import type { Metadata } from "next";
import dynamic from "next/dynamic";
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
    url: 'https://www.likklelegends.com',
    siteName: 'Likkle Legends',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Likkle Legends' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteContent.meta.title,
    description: siteContent.meta.description,
    images: ['/images/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.likklelegends.com',
  },
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
};

import { UserProvider } from '@/components/UserContext';
import StructuredData from '@/components/StructuredData';

const GlobalClientFeatures = dynamic(
  () => import('@/components/GlobalClientFeatures'),
  { ssr: false }
);

export default async function RootLayout({
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
        className={`${montserrat.variable} ${fredoka.variable} ${quicksand.variable} font-montserrat antialiased`}
        suppressHydrationWarning
      >
        <GlobalClientFeatures notificationContent={siteContent} />
        <UserProvider>
          <GeoProvider>
            {children}
          </GeoProvider>
        </UserProvider>
      </body>
    </html>
  );
}
