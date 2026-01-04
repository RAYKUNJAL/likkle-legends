import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactClient from '@/components/ContactClient';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: "Have questions about Likkle Legends? Reach out to our team! We're here to help with subscription inquiries, feedback, and more.",
};

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FFFDF7]">
            <Navbar />
            <main className="flex-grow pt-32 pb-24">
                <ContactClient />
            </main>
            <Footer />
        </div>
    );
}
