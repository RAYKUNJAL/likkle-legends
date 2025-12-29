<<<<<<< HEAD
"use client";

import Image from 'next/image';
import { siteContent } from '@/lib/content';

export default function Characters() {
    const { characters } = siteContent;

    const images = [
        "/images/dilly_doubles.png",
        "/images/mango_moko.png",
        "/images/steelpan_sam.png"
    ];

    return (
        <section id={characters.id} className="py-24 bg-[#FAF9F6]">
            <div className="container">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <span className="text-primary font-bold uppercase tracking-widest text-sm">{characters.eyebrow}</span>
                    <h2 className="text-4xl lg:text-5xl font-black text-deep">{characters.title}</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {characters.characters.map((char, i) => (
                        <div key={char.name} className="group flex flex-col items-center">
                            <div className="relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden mb-8 shadow-2xl transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-primary/20 border-8 border-white">
                                <Image
                                    src={images[i]}
                                    alt={char.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 text-white">
                                    <p className="font-bold italic text-white/90">{char.tagline}</p>
                                </div>
                            </div>

                            <div className="text-center px-4">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block border border-primary/20">
                                    {char.role}
                                </span>
                                <h3 className="text-3xl font-black text-deep mb-4 group-hover:text-primary transition-colors">{char.name}</h3>
                                <p className="text-deep/60 text-sm leading-relaxed max-w-xs mx-auto">
                                    {char.bio}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
=======
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
>>>>>>> origin/main
