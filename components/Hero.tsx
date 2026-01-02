"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Check, ArrowRight, Play } from 'lucide-react';
import { siteContent } from '@/lib/content';
import { useScrollParallax } from '@/hooks/useScrollParallax';

interface HeroProps {
  content?: typeof siteContent.hero;
}

export default function Hero({ content }: HeroProps) {
  const hero = content || siteContent.hero;

  // Apply parallax to elements with the class
  useScrollParallax(-0.15, '.parallax-element');

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-[#FFFDF7]">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="space-y-10 animate-in fade-in slide-in-from-left duration-700">
          <div className="flex gap-3">
            {hero.age_paths.map((path, i) => (
              <span key={i} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${i === 0 ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                {path.label}
              </span>
            ))}
          </div>

          <h1 className="text-5xl lg:text-7xl font-black text-deep leading-[1.1] tracking-tight">
            {hero.headline}
          </h1>

          <p className="text-xl text-deep/70 leading-relaxed max-w-xl">
            {hero.subheadline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href={hero.primary_cta.href} className="btn btn-primary btn-lg px-8 py-6 text-lg group shadow-2xl shadow-primary/30 shimmer-btn">
              {hero.primary_cta.label} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link href={hero.secondary_cta.href} className="btn bg-white border-2 border-zinc-100 text-deep hover:bg-zinc-50 py-6 px-8 font-bold shadow-xl shadow-black/5 flex items-center gap-2">
              <Play size={16} className="fill-current" />
              {hero.secondary_cta.label}
            </Link>
          </div>

          <div className="flex flex-wrap gap-8 text-sm font-bold opacity-60 pt-4">
            {hero.trust_row.badges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="text-primary w-5 h-5" /> {badge}
              </div>
            ))}
          </div>
        </div>

        <div className="relative aspect-[4/5] lg:aspect-auto h-full min-h-[500px] animate-float">
          <div className="absolute -inset-10 bg-primary/10 rounded-full blur-[100px] animate-pulse-slow"></div>

          {/* Floating Element: $10 Badge */}
          <div className="absolute top-10 right-0 lg:-right-10 z-20 glass-card w-32 h-32 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-white animate-bounce group hover:scale-110 transition-transform cursor-pointer parallax-element">
            <span className="text-[10px] font-black uppercase tracking-tighter text-deep/60">Only</span>
            <span className="text-4xl font-black leading-none text-primary">$10</span>
            <span className="text-[10px] font-black text-deep/60 uppercase">/MO</span>
          </div>

          <div className="h-full w-full rounded-[4rem] overflow-hidden shadow-2xl rotate-2 border-[12px] border-white glass-card parallax-element relative min-h-[500px]" style={{ transitionDelay: '0.1s' }}>
            <Image
              src={hero.hero_media.src}
              alt={hero.hero_media.alt}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Decorative bits */}
          {hero.new_mission_chip.enabled && (
            <div className="absolute -bottom-6 -left-6 glass-card p-6 rounded-3xl shadow-xl flex items-center gap-4 border border-white animate-in fade-in zoom-in duration-1000 delay-500 parallax-element" style={{ transitionDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-2xl">✨</div>
              <div>
                <p className="text-xs font-black text-deep uppercase tracking-widest">{hero.new_mission_chip.label}</p>
                <p className="text-sm font-bold text-deep/60">{hero.new_mission_chip.title}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-25 hidden lg:block">
        <div className="w-6 h-10 border-2 border-deep rounded-full flex justify-center p-1">
          <div className="w-1.5 h-1.5 bg-deep rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
