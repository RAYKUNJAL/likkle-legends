import React from 'react';
import { Check } from 'lucide-react';
import Button from './Button';
import { PRICING_PLANS } from '../data';

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-secondary/5 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-bold tracking-widest text-sm uppercase mb-2 block">Simple Pricing</span>
          <h2 className="font-heading font-bold text-4xl text-text mb-4">
            Start Your Adventure Today
          </h2>
          <p className="text-textLight text-lg">
            Choose the plan that fits your family. Cancel or pause anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PRICING_PLANS.map((plan, idx) => (
            <div 
              key={idx}
              className={`relative rounded-3xl p-8 md:p-10 border transition-all duration-300 ${
                plan.isPopular 
                  ? 'bg-white border-primary shadow-xl shadow-primary/10 scale-105 z-10' 
                  : 'bg-white/60 border-gray-200 hover:bg-white hover:shadow-lg'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                  MOST POPULAR
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="font-heading font-bold text-2xl text-text mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="font-heading font-bold text-5xl text-text">{plan.price}</span>
                  <span className="text-textLight">{plan.period}</span>
                </div>
                <p className={`text-sm ${plan.isPopular ? 'text-primary font-semibold' : 'text-textLight'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${plan.isPopular ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-text text-sm md:text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.isPopular ? 'primary' : 'outline'} 
                fullWidth
                size="lg"
                className={plan.isPopular ? '' : '!border-gray-300 !text-gray-600 hover:!border-primary hover:!text-primary'}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-textLight">
            All plans renew automatically. You can cancel easily from your account dashboard.
            <br />
            100% Satisfaction Guarantee.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;