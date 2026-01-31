
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPromoterStats } from '@/app/actions/growth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PromoterDashboard from '@/components/promoters/PromoterDashboard';
import PromoterApplication from '@/components/promoters/PromoterApplication';

export const metadata: Metadata = {
    title: 'Promoter Partner Program | Likkle Legends',
    description: 'Join our affiliate program and earn 20% recurring commission sharing Caribbean culture.',
};

export default async function PromoterPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If not logged in, redirect to login with return URL
    if (!user) {
        redirect('/login?next=/promoters');
    }

    // Check if user is a promoter
    const stats = await getPromoterStats();

    if (stats && stats.status === 'approved') {
        return (
            <div className="min-h-screen bg-[#FDFBF7]">
                <Navbar />
                <main className="pt-32 pb-20">
                    <PromoterDashboard stats={stats} />
                </main>
                <Footer />
            </div>
        );
    } else if (stats && (stats.status === 'pending_approval' || stats.status === 'suspended')) {
        return (
            <div className="min-h-screen bg-[#FDFBF7]">
                <Navbar />
                <main className="pt-32 pb-20 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-lg">
                        <div className="text-5xl mb-4">⏳</div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Application {stats.status === 'suspended' ? 'Suspended' : 'Pending'}</h1>
                        <p className="text-gray-500">
                            {stats.status === 'suspended'
                                ? "Your partner account has been suspended. Please contact support."
                                : "We are reviewing your application. You'll receive an email shortly!"}
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Show Application Form
    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <Navbar />
            <main className="pt-32 pb-20">
                <PromoterApplication />
            </main>
            <Footer />
        </div>
    );
}
