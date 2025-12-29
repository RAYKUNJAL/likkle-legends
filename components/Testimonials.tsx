import React from 'react';
import { Star } from 'lucide-react';
import { TESTIMONIALS } from '../data';

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-center text-text mb-16">
          Loved by 500+ Families
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="bg-background rounded-2xl p-8 relative">
              <div className="flex gap-1 mb-4 text-orange-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-text italic mb-6 leading-relaxed">"{t.content}"</p>
              <div className="flex items-center gap-4">
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <p className="font-heading font-bold text-sm text-text">{t.name}</p>
                  <p className="text-xs text-textLight uppercase tracking-wide">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;