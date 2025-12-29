<<<<<<< HEAD
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Check, ArrowRight, Play } from 'lucide-react';
import { siteContent } from '@/lib/content';

export default function Hero() {
    const { hero, site } = siteContent;

    return (
        <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-[#FFFDF7]">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="container grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div className="space-y-10 animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex gap-3">
                        <span className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-secondary/20">
                            {hero.ageTracks.labelMini}
                        </span>
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            {hero.ageTracks.labelBig}
                        </span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black text-deep leading-[1.1] tracking-tight">
                        {hero.headline.split(',').map((part, i) => (
                            <span key={i} className={i === 1 ? "text-primary block mt-2" : ""}>
                                {part}{i === 0 ? ',' : ''}
                            </span>
                        ))}
                    </h1>

                    <p className="text-xl text-deep/70 leading-relaxed max-w-xl">
                        {hero.subheadline}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link href={hero.primaryCTA.href} className="btn btn-primary btn-lg px-8 py-6 text-lg group shadow-2xl shadow-primary/30">
                            {hero.primaryCTA.label} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button
                            onClick={() => {
                                const widget = document.querySelector('button[class*="bg-accent"]');
                                if (widget instanceof HTMLElement) widget.click();
                            }}
                            className="btn bg-white border-2 border-zinc-100 text-deep hover:bg-zinc-50 py-6 px-8 font-bold shadow-xl shadow-black/5"
                        >
                            {hero.supportCTA.label}
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-8 text-sm font-bold opacity-60 pt-4">
                        {hero.valueStrip.badges.map((badge, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Check className="text-primary w-5 h-5" /> {badge}
                            </div>
                        ))}
                    </div>

                    <div className="pt-4">
                        <Link href={hero.secondaryCTA.href} className="text-deep/40 font-black text-xs uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 group">
                            <span className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-colors">
                                <Play size={12} className="ml-0.5" />
                            </span>
                            {hero.secondaryCTA.label}
                        </Link>
                    </div>
                </div>

                <div className="relative aspect-[4/5] lg:aspect-auto h-full min-h-[500px] animate-float">
                    <div className="absolute -inset-10 bg-primary/10 rounded-full blur-[100px] animate-pulse-slow"></div>

                    {/* Floating Element: $10 Badge */}
                    <div className="absolute top-10 right-0 lg:-right-10 z-20 bg-secondary text-white w-32 h-32 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-white/50 backdrop-blur-sm animate-bounce group hover:scale-110 transition-transform cursor-pointer">
                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-80">Only</span>
                        <span className="text-4xl font-black leading-none">$10</span>
                        <span className="text-[10px] font-black opacity-80 uppercase">/MO</span>
                    </div>

                    <div className="relative h-full w-full rounded-[4rem] overflow-hidden shadow-2xl rotate-2 border-[12px] border-white bg-white/50">
                        <Image
                            src="/images/child_reading.png"
                            alt={hero.heroImageAlt}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Decorative bits */}
                    <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl flex items-center gap-4 border border-zinc-100 animate-in fade-in zoom-in duration-1000 delay-500">
                        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-2xl">✨</div>
                        <div>
                            <p className="text-xs font-black text-deep uppercase tracking-widest">New Mission</p>
                            <p className="text-sm font-bold text-deep/60">Island Beat Challenge</p>
                        </div>
                    </div>
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
=======
import React from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';
import Button from './Button';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-scale-up"
        style={{ 
          // Fun, playful Pineapple on beach image fitting the "Flavors" theme
          backgroundImage: 'url("https://images.unsplash.com/photo-1576016770956-debb63d92058?q=80&w=2669&auto=format&fit=crop")', 
        }}
      >
        {/* Adjusted gradient for better text readability on bright background */}
        <div className="absolute inset-0 bg-gradient-to-r from-deep/90 via-deep/60 to-deep/20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-10">
        <div className="max-w-3xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white font-bold text-sm mb-6 tracking-wide backdrop-blur-md border border-white/20">
            AGES 4-8 • CARIBBEAN CULTURE & SEL
          </span>
          
          <h1 className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6 drop-shadow-lg">
            Your Child Just Got a <span className="text-primary text-shadow-sm">Magical Letter</span> from a Likkle Legend!
          </h1>
          
          <p className="font-sans text-xl md:text-2xl text-gray-100 mb-10 leading-relaxed max-w-2xl drop-shadow-md">
            A monthly adventure in culture, confidence, and Caribbean fun — delivered straight to your mailbox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" onClick={() => window.location.href = '#pricing'}>
              Start The Adventure <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.href = '#examples'}>
              <PlayCircle className="mr-2 w-5 h-5" /> See What's Inside
            </Button>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/90 font-medium text-sm md:text-base">
            <span className="flex items-center drop-shadow-sm">✓ 500+ Happy Families</span>
            <span className="flex items-center drop-shadow-sm">✓ Cancel Anytime</span>
            <span className="flex items-center drop-shadow-sm">✓ Ships Worldwide</span>
          </div>
        </div>
      </div>
      
      {/* Decorative Wave at bottom */}
      <div className="absolute bottom-0 left-0 w-full leading-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto text-white fill-current">
          <path fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
>>>>>>> origin/main
