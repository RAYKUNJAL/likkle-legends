import { NavbarV2 } from "@/components/landing-v2/NavbarV2";
import { HeroSplit } from "@/components/landing-v2/HeroSplit";
import { SocialProofBar } from "@/components/landing-v2/SocialProofBar";
import { DualCharacterGrid } from "@/components/landing-v2/DualCharacterGrid";
import { BenefitStory } from "@/components/landing-v2/BenefitStory";
import { ComparisonTable } from "@/components/landing-v2/ComparisonTable";
import { AccordionV2 } from "@/components/landing-v2/AccordionV2";
import { FooterV2 } from "@/components/landing-v2/FooterV2";

const landingDataV2 = {
  "project_name": "Likkle Legends V2 - High Conversion",
  "framework": "Google Antigravity",
  "global_settings": {
    "primary_cta": "$10 Intro Experience",
    "primary_font": "Montserrat",
    "mobile_priority": "high"
  },
  "sections": [
    {
      "id": "hero_conversion",
      "type": "HeroSplit",
      "content": {
        "headline": "Don't Let the Culture Fade. Start Their Journey for $10.",
        "subheadline": "The only personalized Caribbean adventure that lands in your mailbox and unlocks a digital universe. Ages 4-8.",
        "cta_main": "Start the $10 Intro Experience",
        "cta_sub": "Try Free Digital Access",
        "visual_note": "Image of child holding a bright yellow Legend Envelope next to a tablet showing R.O.T.I."
      }
    },
    {
      "id": "trust_stats",
      "type": "SocialProofBar",
      "data": {
        "text": "Join 512+ Caribbean families raising confident, cultured kids.",
        "badges": ["Ad-Free", "Kid-Safe AI", "COPPA Compliant"]
      }
    },
    {
      "id": "character_guides",
      "type": "DualCharacterGrid",
      "title": "Meet Your Child's Cultural Guides",
      "characters": [
        {
          "name": "Tanty Spice",
          "title": "The AI Storytelling Auntie",
          "image": "/images/tanty_spice.png",
          "hook": "Like having a Caribbean Auntie in your pocket.",
          "benefit_copy": "She ensures the dialect doesn't get lost and the stories don't fade. Tanty is the safe, ad-free voice that reminds your child where they come from.",
          "focus": "Emotional Literacy & Heritage"
        },
        {
          "name": "R.O.T.I.",
          "title": "Robotic Operational Teaching Interface",
          "image": "/images/roti-new.jpg",
          "hook": "Smart Tech with a Caribbean Soul.",
          "benefit_copy": "He’s more than a robot; he's a literacy partner. R.O.T.I. uses voice-recognition to help kids master reading while they explore the geography and symbols of the Caribbean.",
          "focus": "Confidence & Reading Skills"
        }
      ]
    },
    {
      "id": "about_the_mail",
      "type": "BenefitStory",
      "title": "The 'Legend Envelope'—Why We Ditched the Box",
      "content": [
        {
          "header": "Big Magic, Small Footprint",
          "body": "We believe the magic is in the message, not the cardboard. By using our signature 'Legend Envelopes' instead of bulky boxes, we keep your shipping costs near zero and ensure your mail fits perfectly in any standard mailbox—no 'porch pirates' or missed deliveries."
        },
        {
          "header": "Personalized Just for Them",
          "body": "This isn't generic junk mail. Every letter is addressed to your child by name, continuing their specific island adventure and unlocking new secrets in the digital portal."
        }
      ]
    },
    {
      "id": "pricing_matrix",
      "type": "ComparisonTable",
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
          "highlight": true, // Mapped from is_featured
          "price": "$10",
          "ribbon": "ONE-TIME OFFER",
          "billing": "One-Time",
          "features": [
            "1 Personalized Physical Letter",
            "Full Digital Universe Unlock",
            "Collectible Sticker Pack",
            "Priority Tanty & R.O.T.I. Access"
          ],
          "cta": "Get the $10 Intro"
        },
        {
          "name": "Legends Plus",
          "price": "$19.99",
          "billing": "per month",
          "highlight": false,
          "features": [
            "Monthly Personalized Mail",
            "New Physical Activities",
            "Parent Progress Dashboard",
            "Exclusive Character Badges"
          ],
          "cta": "Join the Monthly Club"
        }
      ]
    },
    {
      "id": "faq_trust",
      "type": "Accordion",
      "items": [
        {
          "q": "How long does the mail take?",
          "a": "We ship within 48 hours. Domestic (US) takes 3-5 days; International takes 7-14 days. You get instant digital access the moment you join!"
        },
        {
          "q": "Is the AI safe for my child?",
          "a": "100%. Our AI is closed-loop and doesn't access the open web. It only discusses Likkle Legends stories and culture."
        }
      ]
    }
  ]
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarV2 />

      <main className="flex-grow pt-0">
        {landingDataV2.sections.map((section: any) => {
          switch (section.type) {
            case "HeroSplit":
              return <HeroSplit key={section.id} content={section.content} />;
            case "SocialProofBar":
              return <SocialProofBar key={section.id} data={section.data} />;
            case "DualCharacterGrid":
              return <DualCharacterGrid key={section.id} title={section.title} characters={section.characters} />;
            case "BenefitStory":
              return <BenefitStory key={section.id} title={section.title} content={section.content} />;
            case "ComparisonTable":
              return <ComparisonTable key={section.id} tiers={section.tiers} />;
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
