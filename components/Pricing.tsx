"use client";

import { Check, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { siteContent } from '@/lib/content';

export default function Pricing() {
  const { pricing } = siteContent;

  return (
    <section id={pricing.id} className="py-24 bg-zinc-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-50"></div>

      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl lg:text-6xl font-black text-deep">{pricing.title}</h2>
          <p className="text-xl text-deep/60">{pricing.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch mb-20">
          {pricing.plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-10 rounded-[3rem] bg-white border-2 transition-all duration-500 hover:shadow-2xl ${plan.highlight === 'recommended'
                ? 'border-primary ring-8 ring-primary/5 lg:scale-110 z-10'
                : 'border-zinc-100'
                }`}
            >
              {plan.badge && (
                <span className={`absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.15em] text-white shadow-lg ${plan.highlight === 'recommended' ? 'bg-primary' : 'bg-deep'
                  }`}>
                  {plan.badge}
                </span>
              )}

              <div className="mb-10 text-center">
                <h3 className="text-3xl font-black mb-4 text-deep">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-6xl font-black text-deep leading-none">{plan.priceLabel.split('/')[0]}</span>
                  <span className="text-deep/40 font-bold">/{plan.priceLabel.split('/')[1]}</span>
                </div>
                <p className="text-deep/50 text-xs font-bold uppercase tracking-widest">{plan.billingNote}</p>
              </div>

              <ul className="space-y-5 flex-1 mb-10">
                {plan.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm font-medium">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.highlight === 'recommended' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                      }`}>
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <span className="text-deep/80 leading-relaxed text-pretty">{bullet}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`btn btn-lg w-full py-6 text-lg font-black tracking-tight ${plan.highlight === 'recommended'
                  ? 'btn-primary shadow-xl shadow-primary/20'
                  : plan.highlight === 'best-value'
                    ? 'btn-secondary shadow-xl shadow-secondary/20'
                    : 'bg-deep text-white hover:bg-black shadow-xl shadow-black/10'
                  }`}
              >
                {plan.ctaLabel}
              </Link>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div className="max-w-4xl mx-auto p-8 bg-white border border-dashed border-zinc-200 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 mb-20 text-center md:text-left">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg text-deep">Our Legend's Guarantee</p>
            <p className="text-sm text-deep/60 leading-relaxed">{pricing.guarantee}</p>
          </div>
        </div>

        {/* Educator Section */}
        <div className="p-12 rounded-[4rem] bg-deep text-white flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary rotate-45 translate-x-32 -translate-y-32 blur-[100px] opacity-20 transition-transform group-hover:scale-150"></div>

          <div className="space-y-6 relative z-10 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <h3 className="text-4xl font-black">{pricing.educators.title}</h3>
              <span className="text-[10px] font-black bg-white/10 px-4 py-1 rounded-full uppercase tracking-widest border border-white/20">
                {pricing.educators.subtitle}
              </span>
            </div>
            <p className="max-w-2xl text-xl text-white/60 leading-relaxed">
              {pricing.educators.description}
            </p>
          </div>

          <div className="flex flex-col items-center lg:items-end relative z-10 shrink-0">
            <div className="text-5xl font-black mb-4">{pricing.educators.priceRange}<span className="text-xl font-normal opacity-40"> /mo</span></div>
            <Link href={pricing.educators.ctaHref} className="btn bg-white text-deep px-10 py-5 text-lg font-black hover:scale-105 transition-transform shadow-2xl">
              {pricing.educators.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
