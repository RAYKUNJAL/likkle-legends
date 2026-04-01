import { siteContent } from '@/lib/content';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Meet the Likkle Legends',
    description: 'Learn about Dilly Doubles, Mango Moko, and Steelpan Sam - the guides on your child\'s Caribbean adventure.',
    alternates: {
        canonical: '/characters',
    },
};

import CharacterDetailCard from '@/components/character/CharacterDetailCard';

export default function CharactersPage() {
    const { characters } = siteContent;

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                {/* Hero section */}
                <section className="bg-deep text-white py-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
                    <div className="container relative z-10 text-center">
                        <h1 className="text-5xl lg:text-7xl font-black mb-6">{characters.title}</h1>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">
                            The magical guides helping your little legend discover the rhythm, flavors, and pride of the Caribbean.
                        </p>
                    </div>
                </section>

                {/* Character Detail List */}
                <section className="py-24 bg-white">
                    <div className="container space-y-32">
                        {characters.characters.map((char: any, i: number) => (
                            <CharacterDetailCard key={char.name} char={char} index={i} />
                        ))}
                    </div>
                </section>

                {/* Meet Tanty Spice (AI) */}
                <section className="py-24 bg-amber-50">
                    <div className="container">
                        <div className="bg-white rounded-[4rem] p-12 lg:p-24 shadow-xl border border-amber-100 flex flex-col md:flex-row gap-16 items-center">
                            <div className="w-48 h-48 bg-accent/20 rounded-[3rem] flex items-center justify-center text-7xl shadow-inner shrink-0">
                                ✨
                            </div>
                            <div className="space-y-6">
                                <h2 className="text-4xl font-black text-deep">Meet Tanty Spice (AI)</h2>
                                <p className="text-xl text-deep/70 leading-relaxed max-w-2xl">
                                    Tanty is our wise, warm, and funny Caribbean auntie. She&apos;s always online to help children talk about their feelings and help parents find the best tools for their little legend&apos;s growth.
                                </p>
                                <Link href="/#tanty" className="inline-flex items-center font-bold text-primary hover:underline">
                                    Chat with Tanty now &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
