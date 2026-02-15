import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSplit from '@/components/landing/HeroSplit';
import TrustBar from '@/components/landing/TrustBar';
import CardGrid from '@/components/landing/CardGrid';
import OfferCards from '@/components/landing/OfferCards';
import Steps3 from '@/components/landing/Steps3';
import CarouselDemo from '@/components/landing/CarouselDemo';
import CharacterShowcase from '@/components/landing/CharacterShowcase';
import FeatureBuckets from '@/components/landing/FeatureBuckets';
import PricingCards from '@/components/landing/PricingCards';
import AccordionFAQ from '@/components/landing/AccordionFAQ';
import GalleryPreview from '@/components/landing/GalleryPreview';
import CTASection from '@/components/landing/CTASection';
import StickyMobileCTA from '@/components/landing/StickyMobileCTA';
import ClientAnalytics from '@/components/landing/ClientAnalytics';
import LibraryGrid from '@/components/library/LibraryGrid';
import TantySpiceRadio from '@/components/landing/TantySpiceRadio';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <ClientAnalytics />
      <Navbar />

      <main className="flex-grow">
        {/* 1. Hero Section (Geo-aware, v2 messaging) */}
        <HeroSplit />

        {/* 2. Trust Bar (Social Proof stat + featured quotes) */}
        <TrustBar />

        {/* 3. Likkle Library Preview (Visual Product Proof) */}
        <LibraryGrid isLandingPage={true} />

        {/* 4. What You Get (CardGrid) */}
        <CardGrid />

        {/* 5. Offer Spotlight (Intro $10 vs Free) */}
        <OfferCards />

        {/* 6. How It Works (Clarity on Flow) */}
        <Steps3 />

        {/* 6.5 Tanty Spice Radio Teaser */}
        <TantySpiceRadio />

        {/* 7. Story Studio Interactive Demo */}
        <CarouselDemo />

        {/* 8. Characters Showcase */}
        <CharacterShowcase />

        {/* 9. Platform Features Inside (Buckets) */}
        <FeatureBuckets />

        {/* 10. Sample Pack Gallery (Physical Proof) */}
        <GalleryPreview />

        {/* 11. Plans & Upgrades (PricingCards) */}
        <PricingCards />

        {/* 12. Final CTA Section */}
        <CTASection />

        {/* 13. Accordion FAQ */}
        <AccordionFAQ />
      </main>

      <Footer />

      {/* Sticky Mobile CTA (Geo-aware variant) */}
      <StickyMobileCTA />
    </div>
  );
}
