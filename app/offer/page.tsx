import type { Metadata } from "next";
import OfferFAQ from "@/components/offer/OfferFAQ";

export const metadata: Metadata = {
  title: "Likkle Legends — Caribbean Learning for Kids 3–8",
  description: "Caribbean learning that feels like home. Stories, phonics, and activities for kids 3–8.",
  robots: "index, follow",
};

const CTA_LABEL = "Start with the Intro Mailer";
const CTA_HREF = "/offer/checkout";

// ─────────────────────────────────────────────────────────────────────────────
// Hero character SVG — 5 Likkle Legends on a Caribbean beach.
// Hand-crafted by the brand team. Past VERBATIM — do not modify.
// ─────────────────────────────────────────────────────────────────────────────
const HERO_SVG = `
<div className="relative mx-auto w-full max-w-[560px]">
  <svg
    viewBox="0 0 560 520"
    width="100%"
    role="img"
    aria-label="The five Likkle Legends characters on a Caribbean beach with a story mailer"
    style={{ display: "block", filter: "drop-shadow(0 30px 55px rgba(15,23,42,.20))" }}
  >
    <defs>
      <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c7ecff" /><stop offset="0.55" stopColor="#a7ddf7" /><stop offset="1" stopColor="#8ed2f2" />
      </linearGradient>
      <radialGradient id="sun3" cx="0.5" cy="0.45" r="0.55">
        <stop offset="0" stopColor="#fff7d8" /><stop offset="0.5" stopColor="#ffd76a" /><stop offset="1" stopColor="#ffb020" />
      </radialGradient>
      <linearGradient id="sea3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#33c0cc" /><stop offset="1" stopColor="#0e9aa7" /></linearGradient>
      <linearGradient id="sand3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9b8" /><stop offset="1" stopColor="#f4c97b" /></linearGradient>
      <linearGradient id="env3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#fff2df" /></linearGradient>
      <linearGradient id="cta3" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fb7118" /><stop offset="1" stopColor="#fbbf24" /></linearGradient>
      <linearGradient id="dDilly" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5ecbff" /><stop offset="1" stopColor="#1e93e6" /></linearGradient>
      <linearGradient id="dTanty" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fb8fd0" /><stop offset="1" stopColor="#e0479f" /></linearGradient>
      <linearGradient id="dRoti"  x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b79cff" /><stop offset="1" stopColor="#7c3aed" /></linearGradient>
      <linearGradient id="dScor"  x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff8b9c" /><stop offset="1" stopColor="#e0324b" /></linearGradient>
      <linearGradient id="dMango" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd166" /><stop offset="1" stopColor="#f97316" /></linearGradient>
      <clipPath id="round3"><rect x="0" y="0" width="560" height="520" rx="46" /></clipPath>
    </defs>

    <g clipPath="url(#round3)">
      <rect width="560" height="520" fill="url(#sky3)" />
      <circle cx="452" cy="104" r="52" fill="url(#sun3)" />
      <circle cx="452" cy="104" r="70" fill="#ffd76a" opacity="0.16" />
      <g fill="#ffffff" opacity="0.8">
        <ellipse cx="120" cy="80" rx="40" ry="17" /><ellipse cx="146" cy="74" rx="28" ry="14" /><ellipse cx="310" cy="52" rx="28" ry="12" />
      </g>
      <path d="M0 230 Q140 214 280 230 T560 230 V300 H0 Z" fill="url(#sea3)" />
      <g stroke="#eafcff" strokeWidth="3" fill="none" opacity="0.55">
        <path d="M40 262 q18 -9 36 0 t36 0" /><path d="M440 270 q18 -9 36 0 t36 0" />
      </g>
      <path d="M0 280 Q160 258 340 280 T560 276 V520 H0 Z" fill="url(#sand3)" />

      <g opacity="0.95">
        <path d="M56 300 C50 258 48 228 58 196" stroke="#a06a2c" strokeWidth="9" fill="none" strokeLinecap="round" />
        <g fill="#2e9e5b">
          <path d="M58 196 C28 182 8 186 -6 200 C20 192 42 196 58 206 Z" />
          <path d="M58 196 C88 182 108 186 122 200 C96 192 74 196 58 206 Z" />
          <path d="M58 196 C46 166 28 152 8 148 C32 158 46 176 58 202 Z" />
        </g>
      </g>

      <g transform="translate(372 128) scale(0.72)">
        <rect x="0" y="0" width="170" height="118" rx="16" fill="url(#env3)" stroke="#f0d9b3" strokeWidth="2" />
        <rect x="20" y="-20" width="130" height="95" rx="10" fill="#ffffff" stroke="#ffe0b0" strokeWidth="2" />
        <rect x="36" y="-4" width="98" height="9" rx="4" fill="#fb923c" opacity="0.85" />
        <rect x="36" y="12" width="82" height="7" rx="3" fill="#0ea5a4" opacity="0.5" />
        <rect x="36" y="26" width="92" height="7" rx="3" fill="#94a3b8" opacity="0.45" />
        <text x="85" y="60" textAnchor="middle" fontSize="26">🌴</text>
      </g>

      <g fill="#c99a4e" opacity="0.32">
        <ellipse cx="86" cy="452" rx="44" ry="11" />
        <ellipse cx="184" cy="466" rx="50" ry="12" />
        <ellipse cx="286" cy="470" rx="52" ry="13" />
        <ellipse cx="388" cy="466" rx="50" ry="12" />
        <ellipse cx="486" cy="452" rx="44" ry="11" />
      </g>

      <g transform="translate(86 372)">
        <circle r="56" fill="url(#dDilly)" /><circle r="56" fill="#fff" opacity="0.10" />
        <ellipse cx="-18" cy="-12" rx="12" ry="15" fill="#fff" /><circle cx="-16" cy="-8" r="6" fill="#0f172a" />
        <ellipse cx="18" cy="-12" rx="12" ry="15" fill="#fff" /><circle cx="20" cy="-8" r="6" fill="#0f172a" />
        <path d="M-14 16 Q0 28 14 16" stroke="#0f172a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M2 -40 L-10 -26 L-2 -26 L-12 -12 L12 -30 L2 -30 Z" fill="#fde047" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="-32" cy="10" r="6" fill="#bfe6ff" opacity="0.7" /><circle cx="32" cy="10" r="6" fill="#bfe6ff" opacity="0.7" />
      </g>

      <g transform="translate(184 384)">
        <circle r="62" fill="url(#dTanty)" /><circle r="62" fill="#fff" opacity="0.10" />
        <path d="M-48 -28 A52 52 0 0 1 48 -28 L42 -42 A58 58 0 0 0 -42 -42 Z" fill="#e2e8f0" />
        <ellipse cx="-20" cy="-6" rx="11" ry="14" fill="#fff" /><circle cx="-18" cy="-3" r="5.5" fill="#0f172a" />
        <ellipse cx="20" cy="-6" rx="11" ry="14" fill="#fff" /><circle cx="22" cy="-3" r="5.5" fill="#0f172a" />
        <circle cx="-20" cy="-5" r="15" fill="none" stroke="#0f172a" strokeWidth="2.5" opacity="0.5" />
        <circle cx="20" cy="-5" r="15" fill="none" stroke="#0f172a" strokeWidth="2.5" opacity="0.5" />
        <path d="M-15 24 Q0 38 15 24" stroke="#0f172a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <circle cx="-34" cy="12" r="7" fill="#ffd1e6" /><circle cx="34" cy="12" r="7" fill="#ffd1e6" />
      </g>

      <g transform="translate(286 384)">
        <circle r="66" fill="url(#dRoti)" /><circle r="66" fill="#fff" opacity="0.10" />
        <rect x="-40" y="-34" width="80" height="60" rx="18" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="3" />
        <line x1="0" y1="-34" x2="0" y2="-50" stroke="#c7d2fe" strokeWidth="4" /><circle cx="0" cy="-54" r="5.5" fill="#fbbf24" />
        <circle cx="-17" cy="-6" r="10" fill="#0f172a" /><circle cx="-14" cy="-9" r="3.5" fill="#67e8f9" />
        <circle cx="17" cy="-6" r="10" fill="#0f172a" /><circle cx="20" cy="-9" r="3.5" fill="#67e8f9" />
        <rect x="-13" y="12" width="26" height="7" rx="3.5" fill="#7c3aed" />
      </g>

      <g transform="translate(388 384)">
        <circle r="60" fill="url(#dScor)" /><circle r="60" fill="#fff" opacity="0.10" />
        <path d="M0 -52 q9 -7 3 -18" stroke="#2e9e5b" strokeWidth="6" fill="none" strokeLinecap="round" />
        <ellipse cx="-18" cy="-6" rx="11" ry="14" fill="#fff" /><circle cx="-16" cy="-3" r="5.5" fill="#0f172a" />
        <ellipse cx="18" cy="-6" rx="11" ry="14" fill="#fff" /><circle cx="20" cy="-3" r="5.5" fill="#0f172a" />
        <path d="M-16 20 Q0 36 16 20 Q8 26 -16 20" fill="#0f172a" />
        <path d="M-34 4 q-5 7 -2 14 M34 4 q5 7 2 14" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.55" />
      </g>

      <g transform="translate(486 372)">
        <circle r="56" fill="url(#dMango)" /><circle r="56" fill="#fff" opacity="0.10" />
        <path d="M-6 -50 q6 -8 16 -6" stroke="#2e9e5b" strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="8" cy="-44" rx="10" ry="5" fill="#2e9e5b" transform="rotate(-25 8 -44)" />
        <ellipse cx="-18" cy="-10" rx="11" ry="14" fill="#fff" /><circle cx="-16" cy="-6" r="5.5" fill="#0f172a" />
        <ellipse cx="18" cy="-10" rx="11" ry="14" fill="#fff" /><circle cx="20" cy="-6" r="5.5" fill="#0f172a" />
        <path d="M-13 16 Q0 27 13 16" stroke="#0f172a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <circle cx="-30" cy="8" r="6" fill="#ffe0a3" opacity="0.8" /><circle cx="30" cy="8" r="6" fill="#ffe0a3" opacity="0.8" />
      </g>
    </g>

    <g transform="translate(160 456)">
      <rect x="0" y="0" width="240" height="44" rx="22" fill="#ffffff" stroke="#ffe0b0" strokeWidth="2" />
      <text x="120" y="28" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0f172a" fontFamily="Montserrat, sans-serif">Meet the five Legends</text>
    </g>

    <g transform="translate(30 250)">
      <rect x="0" y="0" width="146" height="50" rx="25" fill="#ffffff" stroke="#ffe0b0" strokeWidth="2" />
      <circle cx="27" cy="25" r="15" fill="url(#cta3)" /><text x="27" y="31" textAnchor="middle" fontSize="15" fill="#fff">✓</text>
      <text x="50" y="22" fontSize="12" fontWeight="700" fill="#0f172a" fontFamily="Montserrat, sans-serif">Ages 3–8</text>
      <text x="50" y="37" fontSize="9.5" fill="#64748b" fontFamily="Montserrat, sans-serif">phonics + culture</text>
    </g>
  </svg>
</div>
`;

// ─── CTA button (shared, 5x repeats) ──────────────────────────────────────────
function CTAButton({ variant = "primary" }: { variant?: "primary" | "white" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-black tracking-tight transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95";
  const styles = variant === "white"
    ? "bg-white text-[#fb7118] shadow-lg"
    : "bg-gradient-to-r from-[#fb7118] to-[#fbbf24] text-white shadow-lg shadow-orange-200/50";
  return (
    <a href={CTA_HREF} className={`${base} ${styles}`}>
      {CTA_LABEL}
      <span aria-hidden>→</span>
    </a>
  );
}

// ─── Trust badge ──────────────────────────────────────────────────────────────
function TrustBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white border border-[#eceae4] px-4 py-2 text-sm font-bold text-[#1c1c1c] shadow-sm">
      <span className="text-base">{icon}</span>
      {text}
    </div>
  );
}

// ─── Content card ─────────────────────────────────────────────────────────────
function ContentCard({ emoji, title, desc, gradient }: { emoji: string; title: string; desc: string; gradient: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-[#eceae4] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#fbbf24]/40">
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${gradient}`} />
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="text-lg font-bold text-[#1c1c1c] mb-1">{title}</h3>
      <p className="text-sm text-[#5f5f5d] leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── Character card ───────────────────────────────────────────────────────────
function CharacterCard({ src, name, role, catchphrase, gradient }: { src: string; name: string; role: string; catchphrase: string; gradient: string }) {
  return (
    <div className="group relative flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2">
      <div className={`relative w-24 h-24 rounded-full ${gradient} p-1 shadow-lg mb-3 transition-transform group-hover:scale-110 overflow-hidden`}>
        <img src={src} alt={name} className="w-full h-full object-cover rounded-full" />
      </div>
      <h3 className="text-sm font-bold text-[#1c1c1c]">{name}</h3>
      <p className="text-xs text-[#5f5f5d] mb-1">{role}</p>
      <p className="text-xs italic text-[#0e9aa7] opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-[140px]">
        &ldquo;{catchphrase}&rdquo;
      </p>
    </div>
  );
}

export default function OfferPage() {
  return (
    <div className="min-h-screen bg-[#fef9f0] text-[#1c1c1c]" style={{ fontFamily: "Montserrat, sans-serif" }}>
      {/* ── CSS animations ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ll-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes ll-drift { 0% { transform: translateX(0); } 100% { transform: translateX(40px); } }
        .ll-hero-svg { animation: ll-float 4s ease-in-out infinite; }
        .ll-cloud { animation: ll-drift 30s linear infinite alternate; }
        @media (prefers-reduced-motion: reduce) {
          .ll-hero-svg, .ll-cloud { animation: none !important; }
        }
      `}} />

      {/* ── 1. Header ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#fef9f0]/80 border-b border-[#eceae4]/60">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight text-[#1c1c1c]">Likkle Legends</span>
          <div className="flex items-center gap-5 text-xs font-semibold text-[#5f5f5d]">
            <a href="/login" className="hover:text-[#0e9aa7] transition-colors">Member Login</a>
            <a href="/faq" className="hover:text-[#0e9aa7] transition-colors">Help</a>
          </div>
        </div>
      </header>

      {/* ── 2. Hero ── */}
      <section className="relative overflow-hidden px-5 pt-12 pb-8">
        {/* Drifting clouds */}
        <div className="absolute top-10 left-[5%] text-4xl opacity-20 ll-cloud pointer-events-none">☁️</div>
        <div className="absolute top-20 right-[15%] text-3xl opacity-15 pointer-events-none">☁️</div>

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e9aa7] mb-3">For Caribbean Families Abroad</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-[#1c1c1c] mb-4">
            Caribbean learning that feels like{" "}
            <span className="bg-gradient-to-r from-[#fb7118] to-[#fbbf24] bg-clip-text text-transparent">home</span>
            {" "}for kids 3–8
          </h1>
          <p className="text-lg text-[#5f5f5d] leading-relaxed max-w-xl mx-auto mb-6">
            Stories, phonics practice, and school-style activities designed to help children grow in reading, confidence, and connection to their Caribbean roots.
          </p>
          <div className="flex flex-col items-center gap-3">
            <CTAButton />
            <a href="/offer/checkout" className="text-sm font-semibold text-[#0e9aa7] underline underline-offset-2 hover:text-[#fb7118] transition-colors">
              Preview a Sample
            </a>
          </div>
          <p className="text-xs text-[#5f5f5d]/70 mt-4">Digital access for families worldwide. Physical mail options shown where available.</p>
        </div>

        {/* Hero — real character images in a row */}
        <div className="mx-auto max-w-2xl mt-10 flex flex-wrap justify-center gap-3 md:gap-4">
          <img src="/images/dilly-doubles.jpg" alt="Dilly Doubles" className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-cover shadow-lg border-2 border-white" style={{ animation: "ll-float 4s ease-in-out infinite" }} />
          <img src="/images/tanty_spice_avatar.jpg" alt="Tanty Spice" className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-lg border-2 border-white" style={{ animation: "ll-float 4s ease-in-out infinite 0.5s" }} />
          <img src="/images/roti-new.jpg" alt="R.O.T.I." className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-cover shadow-lg border-2 border-white" style={{ animation: "ll-float 4s ease-in-out infinite 1s" }} />
          <img src="/images/scorcha_pepper.jpg" alt="Scorcha Pepper" className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-cover shadow-lg border-2 border-white" style={{ animation: "ll-float 4s ease-in-out infinite 1.5s" }} />
          <img src="/images/mango_moko.png" alt="Mango Moko" className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-cover shadow-lg border-2 border-white" style={{ animation: "ll-float 4s ease-in-out infinite 2s" }} />
        </div>
        <p className="text-center mt-4 text-sm font-bold text-[#0e9aa7]">Meet the five Legends 🌺</p>
      </section>

      {/* ── 3. Hero trust block ── */}
      <section className="px-5 py-6">
        <div className="mx-auto max-w-3xl flex flex-wrap justify-center gap-3">
          <TrustBadge icon="👧" text="Ages 3–8" />
          <TrustBadge icon="🏝️" text="Caribbean Diaspora" />
          <TrustBadge icon="📚" text="Literacy Practice" />
          <TrustBadge icon="✨" text="Portal Access" />
        </div>
      </section>

      {/* ── 4. Problem section ── */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-6">
            Your child can grow up proud of where they come from — and still get real learning support
          </h2>
          <p className="text-[#5f5f5d] text-center leading-relaxed mb-8">
            Many Caribbean parents abroad want more than generic kids&apos; content. They want something that helps their child stay connected to culture while also making reading, language, and home learning feel more engaging and more personal.
          </p>
          <div className="grid gap-3">
            {[
              { e: "🌍", t: "Learning that feels culturally distant" },
              { e: "📱", t: "Screen time that entertains but does not guide" },
              { e: "📝", t: "Home practice that feels hard to keep consistent" },
              { e: "💛", t: "A child who needs something they can actually connect with" },
            ].map((b) => (
              <div key={b.t} className="flex items-center gap-3 rounded-xl bg-white border border-[#eceae4] p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <span className="text-xl">{b.e}</span>
                <span className="text-sm font-semibold text-[#1c1c1c]">{b.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Solution section ── */}
      <section className="px-5 py-16 bg-gradient-to-b from-[#a7ddf7]/30 to-[#fef9f0]">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Likkle Legends brings culture, literacy, and play together in one experience
          </h2>
          <p className="text-[#5f5f5d] leading-relaxed">
            Each learning experience combines Caribbean-inspired stories, early literacy activities, and guided ways for families to read, talk, and learn together. It is designed to feel warm and fun for children while still giving parents something more structured than random content.
          </p>
        </div>
      </section>

      {/* ── 6. How it works ── */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[#fb7118]/20 via-[#fbbf24]/40 to-[#0e9aa7]/20" />
            {[
              { n: 1, t: "Choose your child's age band", d: "Pick the learning experience that fits your child best, from early sound play to more independent reading and writing.", c: "from-[#fb7118] to-[#f97316]" },
              { n: 2, t: "Start with your first learning pack", d: "Get an intro experience with guided activities, themed learning, and a first look at the Likkle Legends world.", c: "from-[#fbbf24] to-[#fb7118]" },
              { n: 3, t: "Unlock more through the portal", d: "Continue with digital activities, stories, and member content designed to keep your child engaged beyond day one.", c: "from-[#0e9aa7] to-[#33c0cc]" },
            ].map((s) => (
              <div key={s.n} className="relative flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${s.c} flex items-center justify-center text-white text-2xl font-black shadow-lg mb-4 z-10`}>
                  {s.n}
                </div>
                <h3 className="text-lg font-bold mb-2">{s.t}</h3>
                <p className="text-sm text-[#5f5f5d] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <CTAButton />
          </div>
        </div>
      </section>

      {/* ── 7. What's inside ── */}
      <section className="px-5 py-16 bg-white/50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-10">What your child gets</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ContentCard emoji="📖" title="Story-led learning" desc="Caribbean-centered themes that make every story feel like coming home." gradient="bg-gradient-to-r from-[#fb7118] to-[#f97316]" />
            <ContentCard emoji="🔤" title="Phonics & literacy" desc="Early reading practice woven naturally into stories and activities." gradient="bg-gradient-to-r from-[#0e9aa7] to-[#33c0cc]" />
            <ContentCard emoji="📝" title="Activity sheets" desc="School-style guided tasks you can print and use at home." gradient="bg-gradient-to-r from-[#fbbf24] to-[#fb7118]" />
            <ContentCard emoji="⚡" title="Character adventures" desc="Familiar island characters that make learning feel like a world to explore." gradient="bg-gradient-to-r from-[#5ecbff] to-[#1e93e6]" />
            <ContentCard emoji="portal" title="Portal access" desc="Continue learning with digital activities, stories, and member content." gradient="bg-gradient-to-r from-[#b79cff] to-[#7c3aed]" />
            <ContentCard emoji="👨‍👩‍👧" title="Parent guidance" desc="Make home learning easier with structured, parent-friendly support." gradient="bg-gradient-to-r from-[#fb8fd0] to-[#e0479f]" />
          </div>
          <div className="text-center mt-10">
            <CTAButton />
          </div>
        </div>
      </section>

      {/* ── 8. Literacy credibility ── */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-4">
            Real phonics and school-style practice, made more engaging
          </h2>
          <p className="text-[#5f5f5d] text-center leading-relaxed mb-10">
            Likkle Legends includes activities that help children practice early literacy foundations such as rhyme, sound awareness, letter-sound connections, blending, vocabulary, and simple reading tasks. The focus is to make reading practice feel more inviting through stories, characters, and culturally familiar learning moments.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { age: "Ages 3–4", items: ["Sound play", "Rhymes", "Listening", "Vocabulary", "Early language"], c: "from-[#5ecbff] to-[#0e9aa7]" },
              { age: "Ages 4–6", items: ["Letter sounds", "Blending", "Handwriting", "First words", "Reading practice"], c: "from-[#fb7118] to-[#fbbf24]" },
              { age: "Ages 6–8", items: ["Reading practice", "Vocabulary", "Comprehension", "Guided written work", "Creative writing"], c: "from-[#b79cff] to-[#7c3aed]" },
            ].map((band) => (
              <div key={band.age} className="rounded-2xl bg-white border border-[#eceae4] overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${band.c}`} />
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-3">{band.age}</h3>
                  <ul className="space-y-2">
                    {band.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-[#5f5f5d]">
                        <span className="text-[#0e9aa7]">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Character section ── */}
      <section className="px-5 py-16 bg-gradient-to-b from-[#fef9f0] to-[#fff2df]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Meet the world your child can grow with</h2>
          <p className="text-[#5f5f5d] leading-relaxed mb-10">
            Likkle Legends is built around memorable island-inspired characters, stories, and adventures that give children familiar faces to return to as they learn. This makes the experience feel less like a worksheet and more like a world they want to be part of.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <CharacterCard src="/images/dilly-doubles.jpg" name="Dilly Doubles" role="Hype-man & Buddy" catchphrase="Lesss goooo, Legend!" gradient="bg-gradient-to-br from-[#5ecbff] to-[#1e93e6]" />
            <CharacterCard src="/images/tanty_spice_avatar.jpg" name="Tanty Spice" role="Storyteller & Heart" catchphrase="Come nuh, sit down wid me." gradient="bg-gradient-to-br from-[#fb8fd0] to-[#e0479f]" />
            <CharacterCard src="/images/roti-new.jpg" name="R.O.T.I." role="Learning Robot" catchphrase="Brains on—sunshine mode!" gradient="bg-gradient-to-br from-[#b79cff] to-[#7c3aed]" />
            <CharacterCard src="/images/scorcha_pepper.jpg" name="Scorcha Pepper" role="Feelings Coach" catchphrase="Hot feelings, cool choices." gradient="bg-gradient-to-br from-[#ff8b9c] to-[#e0324b]" />
            <CharacterCard src="/images/mango_moko.png" name="Mango Moko" role="Island Lookout" catchphrase="Stand tall and look again." gradient="bg-gradient-to-br from-[#ffd166] to-[#f97316]" />
          </div>
          <CTAButton />
        </div>
      </section>

      {/* ── 10. Offer section ── */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-md">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-8">Start with a simple first step</h2>
          <div className="rounded-3xl bg-white border-2 border-[#fbbf24]/30 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#fb7118] to-[#fbbf24] p-5 text-center">
              <h3 className="text-2xl font-black text-white">Intro Mailer</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#5f5f5d] leading-relaxed mb-5">
                A low-friction way to explore the Likkle Legends experience with your child. Start with guided activities, early literacy practice, and a first step into the stories, characters, and portal.
              </p>
              <ul className="space-y-3 mb-6">
                {["Intro learning pack", "Age-appropriate activity set", "First portal access step", "Parent guidance for getting started"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-semibold text-[#1c1c1c]">
                    <span className="w-5 h-5 rounded-full bg-[#fbbf24]/20 flex items-center justify-center text-[#fb7118] text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col items-center gap-2">
                <CTAButton />
                <p className="text-xs text-[#5f5f5d]/70 mt-2">What&apos;s included and pricing are shown clearly before checkout.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. FAQ ── */}
      <section className="px-5 py-16 bg-white/50">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-8">Questions?</h2>
          <OfferFAQ />
        </div>
      </section>

      {/* ── 12. Final CTA ── */}
      <section className="px-5 py-20 bg-gradient-to-br from-[#fb7118] to-[#fbbf24]">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
            Help your child grow in reading, confidence, and cultural connection
          </h2>
          <p className="text-white/90 leading-relaxed mb-8">
            Start with a simple first step designed to make literacy practice feel more personal, more joyful, and easier to bring into everyday family life.
          </p>
          <CTAButton variant="white" />
          <a href="/login" className="block mt-4 text-sm font-semibold text-white/80 underline underline-offset-2 hover:text-white transition-colors">
            Already a member? Log in
          </a>
        </div>
      </section>

      {/* ── 13. Footer ── */}
      <footer className="px-5 py-8 bg-[#fef9f0] border-t border-[#eceae4]">
        <div className="mx-auto max-w-4xl flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-[#5f5f5d]">
          <a href="/login" className="hover:text-[#0e9aa7]">Member Login</a>
          <a href="/faq" className="hover:text-[#0e9aa7]">Help / Contact</a>
          <a href="/privacy" className="hover:text-[#0e9aa7]">Privacy Policy</a>
          <a href="/terms" className="hover:text-[#0e9aa7]">Terms</a>
          <span className="text-[#5f5f5d]/60">Shipping / access varies by destination</span>
          <span className="text-[#5f5f5d]/60">COPPA compliant — child safety first</span>
        </div>
      </footer>
    </div>
  );
}
