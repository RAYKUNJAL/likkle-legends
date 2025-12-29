"use client";

import Image from 'next/image';

const chars = [
    {
        name: "Dilly Doubles",
        role: "Food & Traditions Expert",
        desc: "He knows every street food spot in Trinidad and loves sharing the magic of our flavors.",
        img: "/images/dilly_doubles.png"
    },
    {
        name: "Mango Moko",
        role: "Perspective & Pride Guide",
        desc: "Standing tall on her stilts, Mango teaches kids how to see the world from high up.",
        img: "/images/mango_moko.png"
    },
    {
        name: "Steelpan Sam",
        role: "Music & Rhythm Master",
        desc: "Everything in the world has a beat, and Sam is here to help you find yours.",
        img: "/images/steelpan_sam.png"
    }
];

export default function Characters() {
    return (
        <section id="characters" className="py-24">
            <div className="container">
                <div className="section-header text-center mb-16">
                    <span className="text-primary font-bold uppercase tracking-widest text-sm">Your Child's Guides</span>
                    <h2 className="text-4xl lg:text-5xl font-bold mt-2">Meet the Likkle Legends</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                    {chars.map((c, i) => (
                        <div key={i} className="group flex flex-col items-center text-center">
                            <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-4 border-4 border-white">
                                <Image src={c.img} alt={c.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 text-white">
                                    <p className="text-sm italic font-medium">"Ready for a Caribbean journey?"</p>
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-1 text-deep">{c.name}</h3>
                            <div className="px-4 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                                {c.role}
                            </div>
                            <p className="text-deep/70 leading-relaxed text-sm lg:text-base px-2">
                                {c.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
