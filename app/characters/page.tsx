import { siteContent } from '@/lib/content';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Meet the Likkle Legends',
    description: 'Learn about Dilly Doubles, Mango Moko, and Steelpan Sam - the guides on your child\'s Caribbean adventure.',
};

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
                        {characters.characters.map((char, i) => (
                            <div key={char.name} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}>
                                <div className="w-full lg:w-1/2">
                                    <div className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-zinc-50 transform group-hover:scale-105 transition-transform duration-500">
                                        <Image
                                            src={char.image}
                                            alt={char.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="w-full lg:w-1/2 space-y-8">
                                    <span className="px-6 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest border border-primary/20">
                                        {char.role}
                                    </span>
                                    <h2 className="text-4xl lg:text-6xl font-black text-deep">{char.name}</h2>
                                    <p className="text-2xl font-bold text-primary italic">&quot;{char.tagline}&quot;</p>
                                    <p className="text-xl text-deep/70 leading-relaxed">
                                        {char.description}
                                    </p>
                                    <div className="pt-6">
                                        <Link href="/signup" className="btn btn-primary btn-lg shadow-xl shadow-primary/20">
                                            Start Adventure with {char.name.split(' ')[0]}
                                        </Link>
                                    </div>
                                </div>
                            </div>
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
