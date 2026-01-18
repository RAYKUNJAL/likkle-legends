
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Image from 'next/image';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Characters from '@/components/Characters';
import AnnouncementBar from '@/components/AnnouncementBar';
import Link from 'next/link';

import FAQ from '@/components/FAQ';
import StoryGenerator from '@/components/StoryGenerator';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';
import TantysPorchSection from '@/components/TantysPorchSection';
import TantyRadio from '@/components/TantyRadio';
import { Music, ShieldCheck } from 'lucide-react';

import { getMergedSiteContent } from '@/lib/services/cms';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default async function Home() {
  const content = await getMergedSiteContent();

  const {
    cta_banner,
    founders_section,
    testimonials,
    identity_section,
    hero,
    educator_block
  } = content;

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-grow">
        {/* Pass fetched content to Hero */}
        <Hero content={hero} />

        {/* Trust Banner (Marquee) */}
        <div className="bg-deep py-6 overflow-hidden select-none">
          <div className="flex animate-marquee gap-12 text-white/50 font-bold text-sm uppercase tracking-widest items-center whitespace-nowrap">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-16 items-center">
                <span>{hero.trust_row?.ticker_text || "Trusted by families worldwide"}</span>
                <span className="w-2 h-2 bg-primary rounded-full"></span>
              </div>
            ))}
          </div>
        </div>

        {/* PROMINENT TANTY SECTION */}
        <TantysPorchSection />

        <HowItWorks content={content} />

        {/* TANTY RADIO SECTION */}
        <section className="py-24 bg-deep overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern.png')] opacity-5 pointer-events-none"></div>
          <div className="container relative z-10">
            <div className="text-center mb-16 space-y-4">
              <span className="text-primary font-bold uppercase tracking-[0.2em] text-sm">Now Playing</span>
              <h2 className="text-4xl lg:text-6xl font-black text-white">Tanty's Magic Radio</h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Tune in to island rhythms & folklore stories narrated by Tanty Spice herself.
              </p>
            </div>

            <TantyRadio />

            <div className="mt-20 grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-white/10 text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">📻</div>
                <h4 className="text-xl font-bold text-white mb-2">Authentic Sound</h4>
                <p className="text-white/60">Real Caribbean accents and instruments that feel like home.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-white/10 text-center">
                <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">📖</div>
                <h4 className="text-xl font-bold text-white mb-2">Folklore Stories</h4>
                <p className="text-white/60">Anansi, Papa Bois, and more legends brought to life.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-white/10 text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">🛡️</div>
                <h4 className="text-xl font-bold text-white mb-2">100% Kid Safe</h4>
                <p className="text-white/60">Ad-free, curated content designed for little ears.</p>
              </div>
            </div>
          </div>
        </section>

        <Features content={content} />

        <section id="identity" className="py-24 bg-deep text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[150px] opacity-10 -mr-64 -mt-64"></div>

          <div className="container grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <span className="text-secondary font-bold uppercase tracking-widest text-sm">Identity & Culture</span>
              <h2 className="text-4xl lg:text-6xl font-black leading-[1.1]">{identity_section.title}</h2>
              <div className="space-y-4">
                <p className="text-xl text-white/70 leading-relaxed font-bold">{identity_section.problem_text}</p>
                <p className="text-xl text-white/70 leading-relaxed">{identity_section.solution_text}</p>
              </div>

              <div className="grid gap-6">
                {identity_section.pillars.map((pillar: any, i: number) => (
                  <div key={i} className="flex gap-6 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="w-16 h-16 bg-white/10 text-3xl rounded-3xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      {pillar.icon === 'relationship' ? '🤝' : '✨'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-2">{pillar.title}</h4>
                      <p className="text-white/60 leading-relaxed">{pillar.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden border-[12px] border-white/5 rotate-3 shadow-2xl min-h-[400px]">
              <Image src={identity_section.supporting_media} alt="Happy child" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-transparent to-transparent"></div>
            </div>
          </div>
        </section>

        <Characters content={content} />
        <StoryGenerator />

        {/* Founder Section */}
        <section className="py-24 bg-[#FFFDF7]">
          <div className="container">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl lg:text-5xl font-black text-deep leading-tight">
                  {founders_section.title}
                </h2>
                <div className="space-y-6">
                  {founders_section.bullets.map((bullet: string, i: number) => (
                    <div key={i} className="flex gap-4">
                      <CheckCircle2 className="text-primary shrink-0 w-6 h-6 mt-1" />
                      <p className="text-lg text-deep/70 leading-relaxed">{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-[3rem] bg-zinc-100 overflow-hidden shadow-2xl relative z-10">
                  <Image src={founders_section.image} alt="Founders" fill className="w-full h-full object-cover grayscale opacity-80" />
                </div>
                <div className="absolute -bottom-10 -right-10 bg-primary text-white p-12 rounded-[3rem] shadow-2xl z-20 hidden md:block">
                  <p className="text-3xl font-black mb-1">Authentic</p>
                  <p className="font-bold text-white/80">From our home to yours.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Pricing content={content.pricing} />


        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
          <div className="container">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl lg:text-5xl font-black text-deep">{testimonials.title}</h2>
              <p className="text-xl text-deep/60">{testimonials.subtitle}</p>
              <p className="font-bold text-primary">{testimonials.featured_rating}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {testimonials.items.map((item: any, i: number) => (
                <div key={i} className="p-12 rounded-[4rem] bg-zinc-50 border border-zinc-100 flex flex-col relative group hover:bg-white hover:shadow-2xl transition-all duration-500">
                  <div className="text-primary/20 text-8xl font-serif absolute top-8 left-8 select-none">“</div>
                  <div className="relative z-10 flex-1">
                    <h4 className="text-2xl font-black mb-6 leading-tight text-deep group-hover:text-primary transition-colors">
                      {item.headline}
                    </h4>
                    <p className="text-xl text-deep/70 italic leading-relaxed mb-10">
                      {item.quote}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 pt-8 border-t border-zinc-200/50">
                    <div className="w-16 h-16 bg-gradient-to-br from-zinc-200 to-zinc-300 rounded-2xl"></div>
                    <div>
                      <p className="font-black text-deep text-lg">{item.name}</p>
                      <p className="text-xs font-bold text-deep/40 uppercase tracking-widest">{item.meta}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-[#FFFDF7]">
          <div className="container">
            <div className="relative p-12 lg:p-24 rounded-[4rem] bg-deep overflow-hidden flex flex-col items-center text-center shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 blur-[100px] -mr-48 -mt-48"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent opacity-20 blur-[100px] -ml-48 -mb-48"></div>

              <div className="relative z-10 max-w-3xl space-y-8">
                <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                  {cta_banner.headline}
                </h2>
                <p className="text-xl text-white/60 leading-relaxed">
                  {cta_banner.subheadline}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
                  <Link href={cta_banner.primary_cta.href} className="btn btn-primary btn-lg px-12 py-6 text-xl shadow-2xl shadow-primary/20 hover:scale-105 transition-transform group">
                    {cta_banner.primary_cta.label} <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <Link href={cta_banner.secondary_cta.href} className="btn bg-white/10 text-white hover:bg-white/20 px-12 py-6 text-xl border border-white/20">
                    {cta_banner.secondary_cta.label}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FAQ content={content} />
      </main>

      <Footer />

    </div>
  );
}
