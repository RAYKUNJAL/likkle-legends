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
            className={`rounded-2xl border transition-all overflow-hidden ${
              isOpen
                ? 'border-[var(--caribbean-mango)]/40 bg-white shadow-md'
                : 'border-slate-200 bg-white/80 hover:border-[var(--caribbean-sky)]/50'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
            >
              <span className="font-montserrat text-base font-bold text-slate-800 sm:text-lg">
                {item.q}
              </span>
              <span
                className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-lg font-bold transition-all ${
                  isOpen
                    ? 'bg-[var(--caribbean-mango)] text-white rotate-45'
                    : 'bg-amber-50 text-[var(--caribbean-mango)]'
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                <p className="font-quicksand text-sm leading-relaxed text-slate-600 sm:text-base">
                  {item.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
