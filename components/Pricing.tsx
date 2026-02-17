"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Gift, Crown, Star } from 'lucide-react';
import { SUBSCRIPTION_PLANS, getLocalizedPrice, SubscriptionTier } from '@/lib/paypal';
import { detectCountry, GeoInfo } from '@/lib/geo-routing';
import { siteContent } from '@/lib/content';

interface PricingProps {
  content?: typeof siteContent.pricing;
}

export default function Pricing({ content }: PricingProps) {
  const pricing = content || siteContent.pricing;
  const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'digital' | 'mail'>('mail');

  useEffect(() => {
    detectCountry().then(setGeoInfo);
  }, []);

  const filteredPlans = pricing.plans.filter((p: any) => p.tab === activeTab);

  return (
    <section id="pricing" className="py-32 relative overflow-hidden bg-white">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-50/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container relative z-10">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/50 text-emerald-700 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-200">
            Plans & Access
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-deep leading-tight tracking-tight">
            {pricing.title}
          </h2>
          <p className="text-xl text-deep/60 font-medium">
            {pricing.subtitle}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-16 relative z-20">
          <div className="glass-card p-1.5 border border-slate-100 shadow-premium inline-flex" style={{ borderRadius: '1.5rem' }}>
            {pricing.tabs.map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex flex-col items-center select-none cursor-pointer active:scale-95 ${activeTab === tab.id
                  ? 'bg-deep text-white shadow-lg'
                  : 'text-slate-400 hover:text-deep hover:bg-slate-50'
                  }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[9px] uppercase tracking-widest mt-0.5 opacity-60 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`}>
                  {tab.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {filteredPlans.map((plan: any) => (
            <div
              key={plan.id}
              className={`relative glass-card flex flex-col h-full border transition-all duration-500 hover:shadow-2xl group ${plan.badge ? 'border-emerald-200 shadow-xl scale-105 z-10' : 'border-slate-100 shadow-premium'
                }`}
              style={{ borderRadius: '3rem' }}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                  {plan.badge}
                </div>
              )}

              <div className="p-10 flex-1 flex flex-col">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-deep mb-2">{plan.name}</h3>
                  <p className="text-sm text-deep/60 leading-relaxed font-medium min-h-[3rem]">
                    {plan.best_for}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-deep tracking-tighter">
                      {plan.price_display.split('/')[0]}
                    </span>
                    <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                      {plan.price_display.includes('/') ? '/' + plan.price_display.split('/')[1] : ''}
                    </span>
                  </div>
                  {plan.notice && (
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-2">
                      {plan.notice}
                    </p>
                  )}
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Includes:</p>
                  {plan.features.map((feature: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-deep/70 text-sm font-bold leading-tight">{feature}</span>
                    </div>
                  ))}

                  {plan.limits && (
                    <div className="pt-4 border-t border-slate-50 space-y-2">
                      {plan.limits.ai_story_studio_builds_per_month && (
                        <p className="text-xs font-bold text-deep">
                          <span className="text-blue-500">✨ {plan.limits.ai_story_studio_builds_per_month}</span> AI Story Builds / mo
                        </p>
                      )}
                      {plan.limits.downloads_per_month && (
                        <p className="text-xs font-bold text-deep">
                          <span className="text-purple-500">📥 {plan.limits.downloads_per_month}</span> Downloads / mo
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Link
                  href={plan.cta.href}
                  className={`w-full py-5 rounded-2xl font-black text-center text-sm uppercase tracking-widest transition-all ${plan.badge
                    ? 'bg-deep text-white shadow-xl hover:bg-slate-800'
                    : 'bg-white border-2 border-slate-100 text-deep hover:bg-slate-50'
                    }`}
                >
                  {plan.cta.label}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto glass-card border border-slate-100 shadow-premium overflow-hidden" style={{ borderRadius: '2.5rem' }}>
          <div className="p-8 bg-slate-50/50 border-b border-slate-100">
            <h4 className="text-center font-black text-deep uppercase tracking-widest text-sm">Compare Features</h4>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Capabilities</th>
                {pricing.plans.map((p: any) => (
                  <th key={p.id} className="p-6 text-[9px] font-black text-deep uppercase tracking-widest text-center">{p.name.replace(' (Digital)', '')}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pricing.comparison_table.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/30">
                  <td className="p-6 text-sm font-bold text-deep/60">{row.label}</td>
                  {row.values.map((v: string, j: number) => (
                    <td key={j} className="p-6 text-center">
                      {v === "Yes" ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" strokeWidth={3} />
                      ) : v === "No" ? (
                        <span className="text-slate-200">—</span>
                      ) : (
                        <span className="text-xs font-black text-deep">{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
