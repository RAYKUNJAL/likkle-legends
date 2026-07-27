'use client';

import { useState } from 'react';

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'What age is Likkle Legends best for?',
    a: 'Likkle Legends is designed for kids ages 3–8. We group content into three literacy bands — ages 3–4 (pre-readers), 4–6 (early readers), and 6–8 (growing readers) — so every mailer and activity matches where your child is right now.',
  },
  {
    q: 'Do I have to live in the Caribbean to use this?',
    a: 'No — most of our families live abroad in the US, Canada, the UK, and beyond. Likkle Legends was built for Caribbean diaspora families who want their children to stay connected to home culture from wherever they are. Digital access works worldwide instantly.',
  },
  {
    q: 'What comes in the Intro Mailer?',
    a: 'The Intro Mailer includes a personalized Caribbean story mailer, a set of printable activity sheets, and preview access to the member portal where your child can meet the five Legends, hear stories read aloud, and try learning activities.',
  },
  {
    q: 'Is the physical mail shipped internationally?',
    a: 'Physical mail currently ships to the US within 48 hours of your order. Families outside the US get full digital access instantly — the mailer, activity sheets, and portal all work online — and we are expanding physical shipping soon.',
  },
  {
    q: 'How does the literacy practice actually work?',
    a: 'Each mailer combines phonics-based reading, Caribbean-themed storytelling, and hands-on activity sheets. Younger children build letter and sound awareness with the 3–4 band; the 4–6 band works on blending and sight words; the 6–8 band practices fluency and comprehension. It grows with your child.',
  },
  {
    q: 'Is Likkle Legends safe for my child?',
    a: 'Yes. Likkle Legends is COPPA-compliant, uses kid-safe AI for the buddy chat and content, and is built for parents to manage. There are no ads and no third-party tracking on your child\'s activity.',
  },
  {
    q: 'Can I cancel or get a refund?',
    a: 'Absolutely. The Intro Mailer is a one-time purchase with no subscription required. If it is not a fit, contact us within 30 days for a full refund — no questions asked.',
  },
  {
    q: 'Do I need any special device or app?',
    a: 'No. Likkle Legends runs in any modern web browser on a phone, tablet, or computer. Activity sheets are printable PDFs you can open on any device.',
  },
  {
    q: 'Will my child actually learn, or is this just for fun?',
    a: 'Both — and the learning is real. Every mailer is built around early literacy outcomes: letter-sound recognition, blending, sight words, vocabulary, and reading comprehension, grouped by age band (3–4, 4–6, 6–8). The Caribbean stories and characters are the *vehicle* for the phonics and reading practice — they keep your child coming back so the practice actually sticks. You\'ll see the work in the printable activity sheets and portal tasks; your child just experiences it as a story they love.',
  },
  {
    q: 'How is this different from YouTube or ABCmouse?',
    a: 'Two things no generic app offers: (1) a Caribbean cultural connection — the stories, songs, characters, and references sound and look like where your child comes from, not a generic cartoon; and (2) structured phonics woven into that culture, not random videos. YouTube entertains but doesn\'t guide; ABCmouse is thorough but culturally generic. Likkle Legends is the one place your child gets real reading practice inside a world that feels like home.',
  },
  {
    q: 'What if my child doesn\'t speak a Caribbean language?',
    a: 'That\'s completely fine — and very common. Likkle Legends is built in English for English-speaking families, so it works whether you\'re from Jamaica, Trinidad, Barbados, Guyana, or anywhere in the diaspora. The Caribbean flavor is in the stories, characters, food references, and culture — not in a language barrier. It\'s designed for kids who are growing up abroad and may only speak English but still deserve to feel connected to their roots.',
  },
];

export default function OfferFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              isOpen
                ? 'border-[#fb7118]/30 bg-white shadow-[0_14px_36px_-18px_rgba(251,113,24,0.4)]'
                : 'border-[#eceae4] bg-white/70 hover:border-[#0e9aa7]/40 hover:bg-white'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
            >
              <span className="font-montserrat text-base font-bold tracking-tight text-[#1c1c1c] sm:text-lg">
                {item.q}
              </span>
              <span
                className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-lg font-bold transition-all duration-300 ${
                  isOpen
                    ? 'rotate-45 bg-gradient-to-br from-[#fb7118] to-[#fbbf24] text-white shadow-md'
                    : 'bg-[#fef9f0] text-[#fb7118]'
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div
              className="grid transition-all duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 font-quicksand text-sm leading-relaxed text-[#5f5f5d] sm:px-6 sm:pb-6 sm:text-base">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
