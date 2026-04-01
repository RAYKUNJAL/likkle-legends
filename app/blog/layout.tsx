import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Blog | Likkle Legends',
  description: 'Caribbean culture, parenting tips, and educational insights for raising proud Caribbean kids.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog | Likkle Legends',
    description: 'Caribbean culture, parenting tips, and educational insights for raising proud Caribbean kids.',
    url: '/blog',
    siteName: 'Likkle Legends',
    type: 'website',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Likkle Legends' }],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
