"use client";

import { Mail, Grid, Globe, Sparkles } from 'lucide-react';
import { siteContent } from '@/lib/content';

export default function Features() {
  const { coreBenefits } = siteContent;

  const icons = [<Mail />, <Grid />, <Globe />, <Sparkles />];

  return (
    <section id="features" className="py-24 bg-zinc-50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-black text-deep">{coreBenefits.title}</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {coreBenefits.items.map((item, i) => (
            <div key={i} className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-zinc-50 text-deep group-hover:bg-primary group-hover:text-white transition-colors`}>
                {icons[i % icons.length]}
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 block">{item.label}</span>
              <h3 className="text-xl font-bold mb-4 leading-tight group-hover:text-primary transition-colors">{item.headline}</h3>
              <p className="text-deep/60 text-sm leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
