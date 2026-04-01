import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQClient from '@/components/FAQClient';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions',
    description: 'Find answers about Likkle Legends Mail Club, subscription plans, shipping, and how we help children connect with their Caribbean heritage.',
    alternates: {
        canonical: '/faq',
    },
    openGraph: {
        title: 'Frequently Asked Questions',
        description: 'Find answers about Likkle Legends Mail Club, subscription plans, shipping, and how we help children connect with their Caribbean heritage.',
        url: '/faq',
        siteName: 'Likkle Legends',
        type: 'website',
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Likkle Legends' }],
    },
};

export default function FAQPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FFFDF7]">
            <Navbar />
            <main className="flex-grow pt-32 pb-24">
                <FAQClient />
            </main>
            <Footer />
        </div>
    );
}
