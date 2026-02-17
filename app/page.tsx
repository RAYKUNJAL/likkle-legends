import { NavbarV2 } from "@/components/landing-v2/NavbarV2";
import { InteractivePassportHero } from "@/components/landing-v2/InteractivePassportHero";
import { SocialProofBar } from "@/components/landing-v2/SocialProofBar";
import { CharacterUniverseGrid } from "@/components/landing-v2/CharacterUniverseGrid";
import { PhysicalDigitalBridge } from "@/components/landing-v2/PhysicalDigitalBridge";
import { FeatureMatrix } from "@/components/landing-v2/FeatureMatrix";
import { VillainSection } from "@/components/landing-v2/VillainSection";
import { GuaranteeBand } from "@/components/landing-v2/GuaranteeBand";
import { TripleTier } from "@/components/landing-v2/TripleTier";
import { AccordionV2 } from "@/components/landing-v2/AccordionV2";
import { FooterV2 } from "@/components/landing-v2/FooterV2";

const faqItems = [
  {
    q: "How long does the mail take?",
    a: "We ship within 48 hours to US addresses. Domestic delivery takes 3–7 business days. You get instant digital portal access the moment you purchase—no waiting for the mail! Canada and UK mail is coming soon.",
  },
  {
    q: "Is the AI safe for my child?",
    a: "100%. Our AI is closed-loop and doesn't access the open web. It only discusses Likkle Legends stories and culture. We are fully COPPA compliant, ad-free, and parent-controlled.",
  },
  {
    q: "What islands do you cover?",
    a: "We cover 30+ Caribbean islands and diaspora communities including Jamaica, Trinidad & Tobago, Barbados, The Bahamas, Guyana, Haiti, Dominican Republic, St. Lucia, Grenada, Antigua & Barbuda, and many more.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. The $10 Intro is a one-time purchase with no commitment. If you upgrade to Legends Member, you can cancel your monthly subscription at any time with zero fees.",
  },
  {
    q: "What is the 'Legend Key Code'?",
    a: "The Legend Key Code is a unique code included in every physical Legend Envelope. When entered in the digital portal, it unlocks an exclusive Island Pack tailored to your chosen heritage island—bonus stories, activities, and content.",
  },
  {
    q: "Do you ship outside the US?",
    a: "Not yet for physical mail—US-only right now. Canada and UK are next on the list. Join the waitlist and we'll notify you the moment international shipping goes live. The full digital portal is available worldwide instantly.",
  },
  {
    q: "What's the Triple Promise Guarantee?",
    a: "Three promises: (1) Instant portal access after purchase, (2) If your US envelope is delayed or lost, we reissue your Key Code, (3) If you don't love it within 30 days, we refund your $10. One refund per household.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarV2 />

      <main className="flex-grow pt-0">
        <InteractivePassportHero />
        <SocialProofBar />
        <CharacterUniverseGrid />
        <PhysicalDigitalBridge />
        <FeatureMatrix />
        <VillainSection />
        <GuaranteeBand />
        <TripleTier />
        <AccordionV2 items={faqItems} />
      </main>

      <FooterV2 />
    </div>
  );
}
