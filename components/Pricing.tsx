"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Gift, Crown, Star } from 'lucide-react';
import { SUBSCRIPTION_PLANS, getLocalizedPrice, SubscriptionTier } from '@/lib/paypal';
import { detectCountry, GeoInfo } from '@/lib/geo-routing';

export default function Pricing() {
  const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    detectCountry().then(setGeoInfo);
  }, []);

  const getPlanIcon = (id: string) => {
    switch (id) {
      case 'starter_mailer': return '📬';
      case 'legends_plus': return '⭐';
      case 'family_legacy': return '👑';
      default: return '✨';
    }
  };

  const getPlanGradient = (id: string) => {
    switch (id) {
      case 'starter_mailer': return 'from-blue-500 to-cyan-500';
      case 'legends_plus': return 'from-primary to-accent';
      case 'family_legacy': return 'from-amber-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
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
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {(Object.entries(SUBSCRIPTION_PLANS) as [SubscriptionTier, typeof SUBSCRIPTION_PLANS.starter_mailer][]).map(([id, plan]) => {
            const price = geoInfo
              ? getLocalizedPrice(plan.price, geoInfo.countryCode)
              : { price: plan.price, symbol: '$', currency: 'USD' };

            const annualPrice = billingCycle === 'annual'
              ? (geoInfo ? getLocalizedPrice(plan.priceYearly || plan.price * 10, geoInfo.countryCode) : { ...price, price: plan.priceYearly || plan.price * 10 })
              : price;

            const monthlyEquivalent = billingCycle === 'annual'
              ? Math.round(annualPrice.price / 12 * 100) / 100
              : price.price;

            const isPopular = id === 'legends_plus';

            return (
              <div
                key={id}
                className={`relative rounded-[2rem] overflow-hidden transition-all hover:scale-105 ${isPopular ? 'ring-4 ring-primary/30 shadow-2xl' : 'shadow-xl'
                  }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-accent py-2 text-center">
                    <span className="text-white text-sm font-bold flex items-center justify-center gap-1">
                      <Star size={14} /> MOST POPULAR
                    </span>
                  </div>
                )}

                <div className={`bg-white p-8 ${isPopular ? 'pt-14' : ''}`}>
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br ${getPlanGradient(id)} items-center justify-center text-3xl mb-4`}>
                      {getPlanIcon(id)}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">{plan.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-black text-gray-900">
                        {price.symbol}{monthlyEquivalent.toFixed(2)}
                      </span>
                      <span className="text-gray-400">/mo</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Billed annually at {price.symbol}{annualPrice.price.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={12} className="text-green-600" />
                        </div>
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={`/checkout?plan=${id}&cycle=${billingCycle}`}
                    className={`block w-full py-4 rounded-2xl font-bold text-center transition-all ${isPopular
                      ? 'bg-gradient-to-r from-primary to-accent text-white hover:opacity-90'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Row */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <Check className="text-green-500" size={18} />
            Cancel anytime
          </span>
          <span className="flex items-center gap-2">
            <Check className="text-green-500" size={18} />
            Free shipping worldwide
          </span>
          <span className="flex items-center gap-2">
            <Check className="text-green-500" size={18} />
            30-day money-back guarantee
          </span>
          <span className="flex items-center gap-2">
            <Check className="text-green-500" size={18} />
            Secure PayPal checkout
          </span>
        </div>

        {/* Enterprise/Schools CTA */}
        <div className="mt-16 bg-deep rounded-3xl p-8 md:p-12 text-white text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-amber-400" />
          <h3 className="text-2xl md:text-3xl font-black mb-3">Schools & Educators</h3>
          <p className="text-white/70 max-w-xl mx-auto mb-6">
            Bring Caribbean cultural education to your classroom with our special educator pricing and curriculum resources
          </p>
          <Link
            href="/educators"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-deep rounded-2xl font-bold hover:bg-white/90 transition-colors"
          >
            <Sparkles size={20} />
            Learn About Educator Plans
          </Link>
        </div>
      </div>
    </section>
  );
}
