"use client";

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Characters from '@/components/Characters';
import AnnouncementBar from '@/components/AnnouncementBar';
import TantySpiceWidget from '@/components/AIWidgets';
import Link from 'next/link';

import DigitalMagic from '@/components/DigitalMagic';
import FAQ from '@/components/FAQ';
import StoryGenerator from '@/components/StoryGenerator';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';

import { siteContent } from '@/lib/content';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const { finalCTA, trustStack, testimonials } = siteContent;

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-grow">
        <Hero />

        {/* Trust Banner */}
        <div className="bg-deep py-6 overflow-hidden select-none">
          <div className="flex animate-marquee gap-12 text-white/50 font-bold text-sm uppercase tracking-widest items-center whitespace-nowrap">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-16 items-center">
                <span>{trustStack.strip.text}</span>
                <span className="w-2 h-2 bg-primary rounded-full"></span>
              </div>
            ))}
          </div>
        </div>

        <HowItWorks />
        <Features />
        <DigitalMagic />

        {/* Emotional Positioning / Story Section */}
        <section id="story" className="py-24 bg-deep text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[150px] opacity-10 -mr-64 -mt-64"></div>

          <div className="container grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <span className="text-secondary font-bold uppercase tracking-widest text-sm">Building Connections</span>
              <h2 className="text-4xl lg:text-6xl font-black leading-[1.1]">Identity, Culture & SEL <br /> <span className="text-primary italic">Wrapped in Fun.</span></h2>
              <p className="text-xl text-white/70 leading-relaxed max-w-xl">
                Too many Caribbean children grow up disconnected from their roots or unsure how to express big feelings.
                Likkle Legends brings emotional literacy and Caribbean pride straight into their hands each month.
              </p>

              <div className="grid gap-6">
                {siteContent.emotionalPositioning.pillars.map((pillar, i) => (
                  <div key={i} className="flex gap-6 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="w-16 h-16 bg-white/10 text-3xl rounded-3xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      {pillar.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-2">{pillar.title}</h4>
                      <p className="text-white/60 leading-relaxed">{pillar.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden border-[12px] border-white/5 rotate-3 shadow-2xl">
              <img src="/images/child_reading.png" alt="Happy child" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-transparent to-transparent"></div>
            </div>
          </div>
        </section>

        <Characters />
        <StoryGenerator />

        {/* Founder / Trust Stack Section */}
        <section className="py-24 bg-[#FFFDF7]">
          <div className="container">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl lg:text-5xl font-black text-deep leading-tight">
                  {trustStack.founderSection.title}
                </h2>
                <div className="space-y-6">
                  {trustStack.founderSection.bullets.map((bullet, i) => (
                    <div key={i} className="flex gap-4">
                      <CheckCircle2 className="text-primary shrink-0 w-6 h-6 mt-1" />
                      <p className="text-lg text-deep/70 leading-relaxed">{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-[3rem] bg-zinc-100 overflow-hidden shadow-2xl relative z-10">
                  <img src="/images/hero.png" alt="Founders" className="w-full h-full object-cover grayscale opacity-80" />
                </div>
                <div className="absolute -bottom-10 -right-10 bg-primary text-white p-12 rounded-[3rem] shadow-2xl z-20 hidden md:block">
                  <p className="text-3xl font-black mb-1">Authentic</p>
                  <p className="font-bold text-white/80">From our home to yours.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Pricing />

        {/* Social Proof / Testimonials Section */}
        <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
          <div className="container">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl lg:text-5xl font-black text-deep">{testimonials.title}</h2>
              <p className="text-xl text-deep/60">{testimonials.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {testimonials.items.map((item, i) => (
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
                  {finalCTA.headline}
                </h2>
                <p className="text-xl text-white/60 leading-relaxed">
                  {finalCTA.subheadline}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
                  <Link href={finalCTA.primaryCTA.href} className="btn btn-primary btn-lg px-12 py-6 text-xl shadow-2xl shadow-primary/20 hover:scale-105 transition-transform group">
                    {finalCTA.primaryCTA.label} <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <Link href={finalCTA.secondaryCTA.href} className="btn bg-white/10 text-white hover:bg-white/20 px-12 py-6 text-xl border border-white/20">
                    {finalCTA.secondaryCTA.label}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FAQ />
      </main>

      <Footer />

      <TantySpiceWidget />
    </div>
  );
}
