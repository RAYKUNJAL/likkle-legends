import React from 'react';
import { CHARACTERS } from '../data';

const Characters: React.FC = () => {
  return (
    <section id="characters" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-widest text-sm uppercase mb-2 block">Meet The Legends</span>
          <h2 className="font-heading font-bold text-4xl text-text">
            Your Child's Caribbean Guides
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {CHARACTERS.map((char, idx) => (
            <div key={idx} className="group relative">
              {/* Background Blob */}
              <div className={`absolute inset-0 rounded-3xl transform rotate-3 scale-95 transition-transform group-hover:rotate-6 ${char.color}`}></div>
              
              {/* Card Content */}
              <div className="relative bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-lg transition-transform duration-300 hover:-translate-y-2">
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-gray-100">
                  <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-text mb-1">{char.name}</h3>
                <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-4">{char.role}</p>
                <p className="text-textLight">{char.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Characters;