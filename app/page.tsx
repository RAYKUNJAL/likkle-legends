import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQ from '@/components/FAQ';
import { siteContent } from '@/lib/content';
import { getMergedSiteContent } from '@/lib/services/cms';

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
  FeatureShowcase,
  TrustBar
} from '@/components/landing';

import LibraryGrid from '@/components/library/LibraryGrid';
import StoryStudioWizard from '@/components/studio/StoryStudioWizard';
import TantySpiceRadio from '@/components/landing/TantySpiceRadio';
import ClientAnalytics from '@/components/landing/ClientAnalytics';


export default async function Home() {
  try {
    const content = await getMergedSiteContent();
    const testimonials = content.testimonials;

    return (
      <div className="flex flex-col min-h-screen">
        <ClientAnalytics />
        <Navbar />

        <main className="flex-grow">
          {/* Hero Section */}
          <LandingHero content={content} />

          {/* Likkle Library Preview */}
          <LibraryGrid isLandingPage={true} />

          {/* Trust Banner */}
          <TrustBar />

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

          {/* How It Works */}
          <HowItWorksV2 content={content} />

          {/* Character Roles */}
          <CharacterRoles content={content} />

          {/* Story Studio Wizard (Actual Product UI) */}
          <StoryStudioWizard />

          {/* Island Radio Preview (Tanty Spice Radio) */}
          <TantySpiceRadio />

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
  } catch (error) {
    console.error("CRITICAL BUILD ERROR in Home Page:", error);
    // Fallback UI to allow build to complete
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-deep mb-4">Likkle Legends</h1>
          <p className="text-deep/60">We are currently updating our island. Please check back soon!</p>
          {/* Fallback - no components dependent on content */}
        </div>
      </div>
    );
  }
}
