import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getContestStats } from '@/app/actions/growth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContestClient from './ContestClient';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const supabase = createClient();
    const { data: contest } = await supabase
        .from('contests')
        .select('title, description')
        .eq('slug', params.slug)
        .single();

    if (!contest) return { title: 'Contest Not Found' };

    return {
        title: `${contest.title} | Likkle Legends`,
        description: contest.description,
    };
}

export default async function ContestPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();

    // Fetch contest details (server-side)
    const { data: contest } = await supabase
        .from('contests')
        .select('*')
        .eq('slug', params.slug)
        .eq('is_active', true)
        .single();

    if (!contest) {
        notFound();
    }

    // Get initial stats (leaderboard)
    const stats = await getContestStats(params.slug);

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <Navbar />
            <main className="pt-24 lg:pt-32 pb-20">
                <div className="max-w-6xl mx-auto px-4">
                    <ContestClient
                        contest={contest}
                        initialStats={stats}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}
