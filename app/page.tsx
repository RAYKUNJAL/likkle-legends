// Server Component — cached for 60 seconds (ISR)
// Waitlist state lives in WaitlistController (client-only island)
import dynamic from 'next/dynamic';
import { NavbarV2 } from "@/components/landing-v2/NavbarV2";
import { WaitlistController } from "@/components/landing-v3/WaitlistController";

export const revalidate = 60; // Re-generate at most once per minute

// ── Below fold: lazily loaded ─────────────────────────────────────────────────
const SocialProofBar        = dynamic(() => import('@/components/landing-v2/SocialProofBar').then(m => ({ default: m.SocialProofBar })),               { ssr: false, loading: () => <div className="h-20 bg-white" /> });
const BenefitStory          = dynamic(() => import('@/components/landing-v2/BenefitStory').then(m => ({ default: m.BenefitStory })),                   { ssr: false, loading: () => <div className="h-64 bg-white" /> });
const PhysicalDigitalBridge = dynamic(() => import('@/components/landing-v2/PhysicalDigitalBridge').then(m => ({ default: m.PhysicalDigitalBridge })), { ssr: false, loading: () => <div className="h-64 bg-white" /> });
const FeatureMatrix         = dynamic(() => import('@/components/landing-v2/FeatureMatrix').then(m => ({ default: m.FeatureMatrix })),                 { ssr: false, loading: () => <div className="h-64 bg-white" /> });
const VillainSection        = dynamic(() => import('@/components/landing-v2/VillainSection').then(m => ({ default: m.VillainSection })),               { ssr: false, loading: () => <div className="h-64 bg-white" /> });
const GuaranteeBand         = dynamic(() => import('@/components/landing-v2/GuaranteeBand').then(m => ({ default: m.GuaranteeBand })),                 { ssr: false, loading: () => <div className="h-32 bg-white" /> });
const TripleTier            = dynamic(() => import('@/components/landing-v2/TripleTier').then(m => ({ default: m.TripleTier })),                       { ssr: false, loading: () => <div className="h-96 bg-white" /> });
const BlogPreview           = dynamic(() => import('@/components/landing-v3/BlogPreview').then(m => ({ default: m.BlogPreview })),                     { ssr: false, loading: () => <div className="h-64 bg-white" /> });
const AccordionV2           = dynamic(() => import('@/components/landing-v2/AccordionV2').then(m => ({ default: m.AccordionV2 })),                     { ssr: false, loading: () => <div className="h-64 bg-white" /> });
const FooterV2              = dynamic(() => import('@/components/landing-v2/FooterV2').then(m => ({ default: m.FooterV2 })),                           { ssr: false, loading: () => <div className="h-32 bg-deep" /> });
const StickyMobileCTA       = dynamic(() => import('@/components/landing/StickyMobileCTA'),                                                            { ssr: false });

const benefitContent = [
  {
    header: "Physical Surprise",
    body: "There's no dopamine hit like actual mail. We bridge the gap between digital games and physical wonder with your child's name on a real envelope."
  },
  {
    header: "Cultural Confidence",
    body: "We don't just teach reading; we teach heritage. Your child sees themselves reflected in every character and every mission."
  }
];

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

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavbarV2 />

      <main className="flex-grow pt-0 space-y-0">
        {/* Hero + MeetTheLegends + WaitlistModal share state — client island */}
        <WaitlistController />

        <SocialProofBar />
        <BenefitStory title="The Legacy in the Mailbox." content={benefitContent} />
        <PhysicalDigitalBridge />
        <FeatureMatrix />
        <VillainSection />
        <GuaranteeBand />
        <TripleTier />
        <BlogPreview />
        <AccordionV2 items={faqItems} />
      </main>

      <FooterV2 />
      <StickyMobileCTA />
    </div>
  );
}
