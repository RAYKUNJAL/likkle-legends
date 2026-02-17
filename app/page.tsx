import { NavbarV2 } from "@/components/landing-v2/NavbarV2";
import { InteractiveHero } from "@/components/landing-v2/InteractiveHero";
import { SocialProofStrip } from "@/components/landing-v2/SocialProofStrip";
import { FeatureGridV2 } from "@/components/landing-v2/FeatureGridV2";
import { EditorialSection } from "@/components/landing-v2/EditorialSection";
import { ComparisonTable } from "@/components/landing-v2/ComparisonTable";
import { TestimonialSliderV2 } from "@/components/landing-v2/TestimonialSliderV2";
import { AccordionV2 } from "@/components/landing-v2/AccordionV2";
import { FooterV2 } from "@/components/landing-v2/FooterV2";

const landingData = {
  "site_id": "likkle-legends-v2",
  "theme": {
    "primary_color": "#FF6B00",
    "secondary_color": "#2D5A27",
    "font_family": "Montserrat, sans-serif",
    "mobile_optimized": true
  },
  "navigation": {
    "sticky": true,
    "cta_button": "Get Started ($10)"
  },
  "sections": [
    {
      "id": "hero_v2",
      "component": "InteractiveHero",
      "content": {
        "eyebrow": "Culture. Identity. Mailbox Magic.",
        "headline": "Don't Let the Culture Fade. Give Them a Story to Call Their Own.",
        "subheadline": "The only personalized Caribbean adventure that lands in your mailbox and unlocks a digital universe. Start your first 'Legend Letter' today for just $10.",
        "primary_cta": {
          "text": "Start My $10 Intro Experience",
          "link": "#pricing",
          "impact": "pulse_animation"
        },
        "secondary_cta": {
          "text": "Try Free Digital Only",
          "link": "/free-signup"
        },
        "visual": {
          "type": "video_loop",
          "src": "video_of_kid_opening_bright_yellow_envelope",
          "caption": "Instant smiles, zero shipping stress."
        }
      }
    },
    {
      "id": "trust_bar",
      "component": "SocialProofStrip",
      "data": {
        "label": "Trusted by 512+ Caribbean Families Worldwide",
        "stars": 5.0,
        "badges": ["Ad-Free", "Kid-Safe AI", "Teacher Approved"]
      }
    },
    {
      "id": "ai_digital_universe",
      "component": "FeatureGrid",
      "settings": { "background": "light_green_gradient", "priority": "high" },
      "title": "Instant Digital Magic (While You Wait for the Mail)",
      "items": [
        {
          "character": "Tanty Spice",
          "title": "AI Storytelling Auntie",
          "description": "An interactive chatbot that speaks in island rhythms, teaching kids proverbs, food, and culture in a safe environment.",
          "icon": "tanty_spice_avatar"
        },
        {
          "character": "The Reading Buddy",
          "title": "Interactive Literacy Partner",
          "description": "Your child reads aloud, and their buddy helps them with pronunciation and dialect. Confidence starts here.",
          "icon": "reading_buddy_icon"
        }
      ]
    },
    {
      "id": "about_the_mail",
      "component": "EditorialSection",
      "title": "The 'Legend Envelope'—Why We Ditched the Box",
      "copy_blocks": [
        {
          "header": "Big Magic, Small Footprint",
          "body": "We believe the magic is in the message, not the cardboard. By using our signature 'Legend Envelopes' instead of bulky boxes, we keep your shipping costs near zero and ensure your mail fits perfectly in any standard mailbox—no 'porch pirates' or missed deliveries."
        },
        {
          "header": "Personalized Just for Them",
          "body": "This isn't generic junk mail. Every letter is addressed to your child by name, continuing their specific island adventure and unlocking new secrets in the digital portal."
        }
      ],
      "visual": "high_res_flatlay_envelope_letter_stickers"
    },
    {
      "id": "pricing_matrix",
      "component": "ComparisonTable",
      "tiers": [
        {
          "name": "Free Forever",
          "price": "$0",
          "billing": "Free",
          "features": ["3 Digital Stories", "Island Radio", "Basic AI Chat"],
          "cta": "Sign Up Free",
          "highlight": false
        },
        {
          "name": "Legend Mail Intro",
          "price": "$10",
          "billing": "One-Time Offer",
          "features": [
            "1 Personalized Physical Letter",
            "Full Digital Universe Unlock",
            "Collectible Sticker Pack",
            "Priority Tanty Spice Access"
          ],
          "cta": "Get the $10 Intro",
          "highlight": true,
          "ribbon": "BEST FOR COLD TRAFFIC"
        },
        {
          "name": "Legends Plus",
          "price": "$19.99",
          "billing": "per month",
          "features": [
            "Monthly Personalized Mail",
            "New Physical Activities Each Month",
            "Parent Progress Dashboard",
            "Exclusive Character Badges"
          ],
          "cta": "Join the Monthly Club",
          "highlight": false
        }
      ]
    },
    {
      "id": "social_proof_real",
      "component": "TestimonialSlider",
      "items": [
        {
          "name": "Alicia Roberts",
          "location": "Miami, FL",
          "quote": "My son Mason actually waits by the mailbox now. He thinks Tanty Spice sent him a secret message!",
          "rating": 5
        },
        {
          "name": "David K.",
          "location": "London, UK",
          "quote": "Finally, a way to keep our Trini roots alive that doesn't feel like a boring school lesson.",
          "rating": 5
        }
      ]
    },
    {
      "id": "final_objections_faq",
      "component": "Accordion",
      "items": [
        {
          "q": "How long does the mail take?",
          "a": "We ship within 48 hours. Domestic (US) takes 3-5 days; International takes 7-14 days. You get instant digital access the moment you join!"
        },
        {
          "q": "Is my child's data safe?",
          "a": "Absolutely. Our AI is closed-loop, meaning it only talks about Likkle Legends content. No ads, no tracking, no weirdness."
        }
      ]
    }
  ],
  "footer": {
    "sticky_cta": "Claim Your $10 Legend Letter"
  }
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarV2 />

      <main className="flex-grow pt-0">
        {landingData.sections.map((section: any) => {
          switch (section.component) {
            case "InteractiveHero":
              return <InteractiveHero key={section.id} content={section.content} />;
            case "SocialProofStrip":
              return <SocialProofStrip key={section.id} data={section.data} />;
            case "FeatureGrid":
              return <FeatureGridV2 key={section.id} title={section.title} items={section.items} settings={section.settings} />;
            case "EditorialSection":
              return <EditorialSection key={section.id} title={section.title} copy_blocks={section.copy_blocks} visual={section.visual} />;
            case "ComparisonTable":
              return <ComparisonTable key={section.id} tiers={section.tiers} />;
            case "TestimonialSlider":
              return <TestimonialSliderV2 key={section.id} items={section.items} />;
            case "Accordion":
              return <AccordionV2 key={section.id} items={section.items} />;
            default:
              return null;
          }
        })}
      </main>

      <FooterV2 />
    </div>
  );
}
