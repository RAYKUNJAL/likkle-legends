import { siteContent } from '@/lib/content';
import { getMergedSiteContent } from '@/lib/services/cms';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const slug = params.slug;
    let content = {} as any;
    try {
        content = await getMergedSiteContent();
    } catch {
        content = siteContent;
    }

    // Normalize slug lookup - support both hyphenated and underscored if needed, but IDs are underscored in standard
    const character = content.characters?.characters?.find((c: any) =>
        c.id === slug || c.id === slug.replace(/-/g, '_') ||
        c.name.toLowerCase().replace(/[^a-z0-9]/g, '_') === slug.replace(/-/g, '_')
    );

    if (!character) return { title: 'Character Not Found' };

    return {
        title: `${character.name} | Likkle Legends`,
        description: character.description
    };
}

export default async function CharacterDetailPage({ params }: { params: { slug: string } }) {
    const slug = params.slug;
    let content = {} as any;
    try {
        content = await getMergedSiteContent();
    } catch {
        content = siteContent;
    }

    const characters = content.characters?.characters || [];
    const char = characters.find((c: any) =>
        c.id === slug || c.id === slug.replace(/-/g, '_')
    );

    if (!char) {
        // Fallback search by normalized name if ID matching fails (legacy support)
        const nameMatch = characters.find((c: any) =>
            c.name.toLowerCase().replace(/ /g, '_').replace(/\./g, '') === slug.replace(/-/g, '_')
        );
        if (nameMatch) {
            return CharacterDetailView(nameMatch);
        }
        notFound();
    }

    return CharacterDetailView(char);
}

function CharacterDetailView(char: any) {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-grow">
                {/* Back Link */}
                <div className="container pt-8 pb-4">
                    <Link href="/characters" className="inline-flex items-center gap-2 text-deep/60 hover:text-deep font-bold transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to All Guides
                    </Link>
                </div>

                <div className="container pb-24">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        {/* Image Side */}
                        <div className="relative order-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-[3rem] -rotate-3 transform scale-105" />
                            <div className="relative aspect-square rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl bg-zinc-50">
                                <Image
                                    src={char.image}
                                    alt={char.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Content Side */}
                        <div className="order-2 space-y-8">
                            <div className="space-y-4">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-widest text-xs">
                                    {char.role}
                                </span>
                                <h1 className="text-5xl lg:text-7xl font-black text-deep leading-tight">
                                    {char.name}
                                </h1>
                                <p className="text-2xl font-bold text-primary italic font-serif">
                                    "{char.tagline}"
                                </p>
                            </div>

                            <div className="space-y-6">
                                <p className="text-xl text-deep/80 leading-relaxed">
                                    {char.description}
                                </p>

                                {char.brand_role && (
                                    <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                                        <h4 className="font-black text-deep mb-2 uppercase tracking-wide text-sm opacity-60">Role in the Village</h4>
                                        <p className="font-medium text-deep">{char.brand_role}</p>
                                    </div>
                                )}
                            </div>

                            {char.parent_value && char.parent_value.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-deep text-lg">How {char.name.split(' ')[0]} helps your child grow:</h3>
                                    <ul className="space-y-3">
                                        {char.parent_value.map((val: string, i: number) => (
                                            <li key={i} className="flex gap-3 items-start">
                                                <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                                                <span className="text-deep/80 font-medium">{val}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="pt-6">
                                <Link
                                    href="/signup"
                                    className="inline-flex items-center gap-3 bg-primary text-white text-xl font-black px-10 py-5 rounded-3xl shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition-all"
                                >
                                    Start Adventure Now
                                    <ArrowRight className="w-6 h-6" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
