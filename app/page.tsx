import { Metadata } from 'next';
import VideoHero from '@/components/landing/VideoHero';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import Pricing from '@/components/Pricing';

export const metadata: Metadata = {
  title: "Likkle Legends | The #1 Caribbean Education Mail Club for Kids",
  description: "Join 500+ families raising proud, confident Caribbean kids. Monthly cultural letters, activities, and AI-powered stories for ages 4-9.",
  alternates: {
    canonical: 'https://likklelegends.com',
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-orange-50 font-sans selection:bg-orange-200 selection:text-orange-900">
      <Navbar />

      <main>
        {/* 1. Above the fold: Cinematic Video Hero */}
        <VideoHero />

        {/* 2. Trust Bar / Features */}
        <Features />

        {/* 3. The Journey: How it works */}
        <HowItWorks />

        {/* 4. The Value: Pricing & Plans */}
        <Pricing />

        {/* 5. Common Questions */}
        <FAQ />
      </main>

      {/* 6. Footer */}
      <Footer />
    </div>
  );
}
