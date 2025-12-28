import React from 'react';
import { TRUST_BADGES, FEATURES } from '../data';

const Features: React.FC = () => {
  return (
    <>
      {/* Trust Badges Bar */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TRUST_BADGES.map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="mb-3 p-3 rounded-full bg-gray-50" style={{ color: badge.color }}>
                  <badge.icon size={28} />
                </div>
                <h4 className="font-heading font-bold text-gray-800 text-sm">{badge.title}</h4>
                <p className="text-gray-500 text-xs">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2">
              <span className="text-primary font-bold tracking-widest text-sm uppercase mb-2 block">The Challenge</span>
              <h2 className="font-heading font-bold text-3xl md:text-5xl text-text mb-6 leading-tight">
                Kids crave connection, culture, and confidence.
              </h2>
              <p className="text-lg text-textLight leading-relaxed mb-6">
                Too many Caribbean children grow up disconnected from their roots or unsure how to express big feelings. 
              </p>
              <p className="text-lg text-textLight leading-relaxed">
                <span className="font-bold text-text">Likkle Legends</span> brings emotional literacy and Caribbean pride straight into their hands each month, turning "learning" into a magical mailbox moment.
              </p>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
              <img 
                src="https://picsum.photos/id/1066/600/400" 
                alt="Child happy reading a letter" 
                className="rounded-2xl shadow-2xl relative z-10 w-full transform hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Grid */}
      <section id="how-it-works" className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-accent font-bold tracking-widest text-sm uppercase mb-2 block">What Your Child Gets</span>
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-text mb-6">
              Inside Every Monthly Adventure
            </h2>
            <p className="text-textLight text-lg">
              Each box is a curated experience designed to spark joy, curiosity, and pride.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {FEATURES.map((feature, idx) => (
              <div 
                key={idx} 
                className="relative rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100 flex flex-col items-center h-full"
                style={{ backgroundColor: feature.bgColor }}
              >
                {feature.badge && (
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {feature.badge}
                  </span>
                )}
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm text-white"
                  style={{ backgroundColor: feature.color }}
                >
                  <feature.icon size={32} />
                </div>
                <h3 className="font-heading font-bold text-lg text-text mb-3 leading-tight">{feature.title}</h3>
                <p className="text-sm text-textLight leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;