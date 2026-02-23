import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import VideoHero from '@/components/landing/VideoHero';
import Features from '@/components/Features';
import CharacterShowcase from '@/components/CharacterShowcase';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import ParentEmotionalHook from '@/components/landing/ParentEmotionalHook';
import SocialProofStrip from '@/components/landing/SocialProofStrip';

export const metadata: Metadata = {
  title: "Likkle Legends | Caribbean Learning for Kids 4–8",
  description:
    "Help your child grow academically while staying connected to Caribbean culture—wherever you live. Stories, songs, activities, and monthly character drops for kids 4-8.",
  alternates: { canonical: 'https://likklelegends.com' },
  openGraph: {
    title: "Likkle Legends | Caribbean Learning for Kids 4–8",
    description: "Join 500+ families raising proud, confident Caribbean kids.",
    images: [{ url: '/images/og-image.png' }],
  },
};

export default function Page() {
  return (
    <div className="min-h-screen font-sans selection:bg-primary/20 selection:text-primary">
      {/* ─── Navigation ─────────────────────────────────── */}
      <Navbar />

      <main>
        {/* ─── 1. AWARENESS ──────────────────────────────── */}
        {/* Goal: Stop the scroll. Make parents feel seen. */}
        <VideoHero />

        {/* ─── 2. EMOTIONAL HOOK ─────────────────────────── */}
        {/* Goal: Speak to the deeper parent pain — identity, belonging, roots */}
        <ParentEmotionalHook />

        {/* ─── 3. SOCIAL PROOF ───────────────────────────── */}
        {/* Goal: Build credibility with real family stories */}
        <SocialProofStrip />

        {/* ─── 4. MEET THE GUIDES ────────────────────────── */}
        {/* Goal: Let the characters sell themselves. Each has a name, story, role. */}
        <CharacterShowcase />

        {/* ─── 5. WHAT THEY GET ──────────────────────────── */}
        {/* Goal: Make the value concrete. Physical + digital. */}
        <Features />

        {/* ─── 6. HOW IT WORKS ───────────────────────────── */}
        {/* Goal: Reduce friction. 3 simple steps. */}
        <HowItWorks />

        {/* ─── 7. CHOOSE YOUR PLAN ───────────────────────── */}
        {/* Goal: Present options simply. Push to $10 intro. */}
        <Pricing />

        {/* ─── 8. COMMON QUESTIONS ───────────────────────── */}
        <FAQ />
      </main>

      {/* ─── Footer ─────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
