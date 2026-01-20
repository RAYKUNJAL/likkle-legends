import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQ from '@/components/FAQ';
import { getMergedSiteContent } from '@/lib/services/cms';
import { CheckCircle2 } from 'lucide-react';

// New landing page components
import {
  LandingHero,
  ProblemRecognition,
  SolutionDefinition,
  OfferSpotlight,
  FreeTrialSection,
  HowItWorksV2,
  CharacterRoles,
  IslandRadioPreview,
  MonthlyDropSection,
  PricingLadderPreview,
  FinalCTASection,
  StickyMobileCTA,
  ChatbotStaticCard,
  FoundersSection,
  WhoItIsFor,
  EducatorBlock,
  StoryStudioLeadMagnet,
  FeatureShowcase
} from '@/components/landing';

export default async function Home() {
  let content = {} as any;
  try {
    content = await getMergedSiteContent();
  } catch (err) {
    console.error("Home page CMS fetch error:", err);
    content = siteContent;
  }

  const testimonials = content?.testimonials || siteContent.testimonials;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <LandingHero content={content} />

        {/* Trust Banner */}
        <div className="bg-deep py-4 overflow-hidden select-none">
          <div className="flex animate-marquee gap-12 text-white/50 font-bold text-xs uppercase tracking-widest items-center whitespace-nowrap">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-12 items-center">
                <span>✨ Caribbean Culture</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span>📚 Early Learning</span>
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                <span>🛡️ Safe & Ad-Free</span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Problem Recognition */}
        <ProblemRecognition content={content} />

        {/* Who It Is For */}
        <WhoItIsFor content={content} />

        {/* Solution Definition */}
        <SolutionDefinition content={content} />

        {/* Feature Showcase (Images) */}
        <FeatureShowcase content={content} />

        {/* Founders Section */}
        <FoundersSection content={content} />

        {/* $10 Offer Spotlight */}
        <OfferSpotlight />

        {/* Free Trial Section */}
        <FreeTrialSection />

        {/* How It Works */}
        <HowItWorksV2 content={content} />

        {/* Character Roles */}
        <CharacterRoles content={content} />

        {/* Story Studio Lead Magnet */}
        <StoryStudioLeadMagnet content={content} />

        {/* Island Radio Preview */}
        <IslandRadioPreview content={content} />

        {/* Monthly Drop Section */}
        <MonthlyDropSection content={content} />

        {/* Pricing Ladder Preview */}
        <PricingLadderPreview content={content} />

        {/* Educator Block */}
        <EducatorBlock content={content} />

        {/* Chatbot Static Card (replaces live demo) */}
        <ChatbotStaticCard />

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
          <div className="container">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-black text-deep">{testimonials.title}</h2>
              <p className="text-lg text-deep/60">{testimonials.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {testimonials.items.map((item: any, i: number) => (
                <div key={i} className="p-8 rounded-3xl bg-zinc-50 border border-zinc-100 flex flex-col relative group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <div className="text-emerald-500/20 text-6xl font-serif absolute top-6 left-6 select-none">&ldquo;</div>
                  <div className="relative z-10 flex-1">
                    <h4 className="text-xl font-bold mb-4 leading-tight text-deep group-hover:text-emerald-600 transition-colors">
                      {item.headline}
                    </h4>
                    <p className="text-deep/70 italic leading-relaxed mb-6">
                      {item.quote}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-6 border-t border-zinc-200/50">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-xl" />
                    <div>
                      <p className="font-bold text-deep">{item.name}</p>
                      <p className="text-xs font-medium text-deep/40 uppercase tracking-widest">{item.meta}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <FinalCTASection content={content} />

        {/* FAQ */}
        <FAQ content={content} />
      </main>

      <Footer />

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA />
    </div>
  );
}
