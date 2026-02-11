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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    detectCountry().then(setGeoInfo);
  }, []);

  const getPlanIcon = (id: string) => {
    switch (id) {
      case 'plan_free_forever': return '🌱';
      case 'plan_digital_legends': return '📱';
      case 'plan_mail_intro': return '📬';
      case 'plan_legends_plus': return '⭐';
      case 'plan_family_legacy': return '👑';
      default: return '✨';
    }
  };

  const getPlanGradient = (id: string) => {
    switch (id) {
      case 'plan_free_forever': return 'from-green-100 to-emerald-200';
      case 'plan_digital_legends': return 'from-sky-400 to-blue-500 text-white';
      case 'plan_mail_intro': return 'from-indigo-400 to-purple-500 text-white';
      case 'plan_legends_plus': return 'from-primary to-accent text-white';
      case 'plan_family_legacy': return 'from-amber-400 to-orange-500 text-white';
      default: return 'from-gray-100 to-gray-200';
    }
  };

  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-sky-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold mb-4">
            <Gift size={16} />
            Pricing & Plans
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Choose Your <span className="text-primary">Adventure</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Every plan includes monthly mailers, digital access, and AI-powered learning experiences
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${billingCycle === 'monthly'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${billingCycle === 'annual'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Annual
              <span className="px-2 py-0.5 bg-green-400 text-green-900 text-xs font-bold rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-wrap justify-center gap-6 max-w-[90rem] mx-auto">
          {(Object.entries(SUBSCRIPTION_PLANS) as [SubscriptionTier, typeof SUBSCRIPTION_PLANS.plan_free_forever][]).map(([id, plan]) => {
            const isFree = id === 'plan_free_forever';

            const price = isFree
              ? { price: 0, symbol: '', currency: 'USD' }
              : geoInfo
                ? getLocalizedPrice(plan.price, geoInfo.countryCode)
                : { price: plan.price, symbol: '$', currency: 'USD' };

            const annualPrice = isFree || billingCycle === 'annual'
              ? (geoInfo ? getLocalizedPrice(plan.priceYearly || plan.price * 10, geoInfo.countryCode) : { ...price, price: plan.priceYearly || plan.price * 10 })
              : price;

            const monthlyEquivalent = isFree
              ? 0
              : billingCycle === 'annual'
                ? Math.round(annualPrice.price / 12 * 100) / 100
                : price.price;

            const isPopular = id === 'plan_digital_legends'; // Digital is Most Popular
            const isPremium = id === 'plan_legends_plus' || id === 'plan_family_legacy';

            return (
              <div
                key={id}
                className={`relative rounded-[2rem] overflow-hidden transition-all hover:scale-105 w-full md:w-[48%] lg:w-[30%] xl:w-[19%] flex flex-col ${isPopular ? 'ring-4 ring-primary/30 shadow-2xl scale-105 z-10' : 'shadow-xl bg-white'
                  }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className={`absolute top-0 left-0 right-0 py-2 text-center ${id === 'plan_free_forever' ? 'bg-gray-100 text-gray-500' :
                    isPopular ? 'bg-gradient-to-r from-primary to-accent text-white' :
                      isPremium ? 'bg-amber-100 text-amber-800' : 'bg-gray-50 text-gray-500'
                    }`}>
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                      {isPopular && <Star size={12} />} {plan.badge}
                    </span>
                  </div>
                )}

                <div className={`p-6 pt-12 flex-1 flex flex-col ${isPopular ? 'bg-white' : ''}`}>
                  {/* Plan Header */}
                  <div className="text-center mb-4">
                    <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanGradient(id)} items-center justify-center text-2xl mb-3 shadow-sm`}>
                      {getPlanIcon(id)}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 leading-tight min-h-[3rem] flex items-center justify-center">{plan.name}</h3>
                    <p className="text-gray-500 text-xs mt-1 min-h-[2.5rem]">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-0.5">
                      {isFree ? (
                        <span className="text-4xl font-black text-gray-900">Free</span>
                      ) : (
                        <>
                          <span className="text-4xl font-black text-gray-900">
                            {price.symbol}{monthlyEquivalent.toFixed(2)}
                          </span>
                          <span className="text-gray-400 text-sm">/mo</span>
                        </>
                      )}
                    </div>
                    {!isFree && billingCycle === 'annual' && (
                      <p className="text-xs text-green-600 font-bold mt-1">
                        Billed {price.symbol}{annualPrice.price.toFixed(2)}/yr
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-8 flex-1">
                    {plan.features.slice(0, 6).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={10} className="text-green-600" />
                        </div>
                        <span className="text-gray-600 text-xs leading-snug text-left">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={`/checkout?plan=${id}&cycle=${billingCycle}`}
                    className={`block w-full py-3 rounded-xl font-bold text-center text-sm transition-all ${isPopular
                      ? 'bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-lg shadow-primary/20'
                      : isFree
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                  >
                    {isFree ? 'Start Free' : 'Choose Plan'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Row */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 text-base font-bold text-gray-700">
          <span className="flex items-center gap-2">
            <Check className="text-green-600" size={20} />
            Cancel anytime
          </span>
          <span className="flex items-center gap-2">
            <Check className="text-green-600" size={20} />
            Free shipping worldwide
          </span>
          <span className="flex items-center gap-2">
            <Check className="text-green-600" size={20} />
            30-day money-back guarantee
          </span>
          <span className="flex items-center gap-2">
            <Check className="text-green-600" size={20} />
            Secure PayPal checkout
          </span>
        </div>

        {/* Enterprise/Schools CTA */}
        <div className="mt-16 bg-deep rounded-3xl p-8 md:p-12 text-white text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-amber-400" />
          <h3 className="text-2xl md:text-3xl font-black mb-3">{siteContent.educator_block.title}</h3>
          <p className="text-white font-bold max-w-xl mx-auto mb-6">
            {siteContent.educator_block.description}
          </p>
          <Link
            href={siteContent.educator_block.cta.href}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-deep rounded-2xl font-bold hover:bg-white/90 transition-colors"
          >
            <Sparkles size={20} />
            {siteContent.educator_block.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
