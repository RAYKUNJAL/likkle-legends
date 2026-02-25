"use client";

import { useState, useEffect } from 'react';
import { Download, Gift, Star, BookOpen, Music, Palette } from 'lucide-react';
import LeadCaptureModal from '@/components/LeadCaptureModal';

interface LeadMagnet {
    id: string;
    title: string;
    description: string;
    pdf_url: string;
    thumbnail_url?: string;
    target_audience: string;
    tags: string[];
    download_count: number;
}

// Placeholder lead magnets until DB is populated
const PLACEHOLDER_MAGNETS: LeadMagnet[] = [
    {
        id: '1',
        title: 'Islander ABCs Coloring Book',
        description: 'A 26-page coloring book featuring Caribbean animals, foods, and culture for each letter of the alphabet.',
        pdf_url: '#',
        thumbnail_url: '/images/magnets/abc-coloring.jpg',
        target_audience: 'all',
        tags: ['coloring', 'alphabet', 'preschool'],
        download_count: 1247
    },
    {
        id: '2',
        title: 'Caribbean Counting Worksheets',
        description: 'Practice numbers 1-20 with coconuts, mangoes, and island treasures! Perfect for ages 3-6.',
        pdf_url: '#',
        thumbnail_url: '/images/magnets/counting.jpg',
        target_audience: 'parent',
        tags: ['math', 'counting', 'worksheets'],
        download_count: 892
    },
    {
        id: '3',
        title: 'Anansi Mini-Stories Bundle',
        description: '5 classic Anansi spider tales adapted for young readers. Includes discussion questions!',
        pdf_url: '#',
        thumbnail_url: '/images/magnets/anansi.jpg',
        target_audience: 'all',
        tags: ['stories', 'folklore', 'reading'],
        download_count: 2103
    },
    {
        id: '4',
        title: 'Classroom Caribbean Kit',
        description: 'Complete teacher resource pack: 10 lesson plans, 25 worksheets, and cultural activity guides.',
        pdf_url: '#',
        thumbnail_url: '/images/magnets/teacher-kit.jpg',
        target_audience: 'teacher',
        tags: ['teacher', 'curriculum', 'lesson-plans'],
        download_count: 567
    },
    {
        id: '5',
        title: 'Island Kitchen Recipe Cards',
        description: 'Kid-friendly Caribbean recipes: sugar cakes, bake & saltfish, and more. Cook together as a family!',
        pdf_url: '#',
        thumbnail_url: '/images/magnets/recipes.jpg',
        target_audience: 'parent',
        tags: ['cooking', 'family', 'culture'],
        download_count: 743
    },
    {
        id: '6',
        title: 'Carnival Craft Activity Guide',
        description: 'Make your own carnival costume, steel pan, and masquerade mask with simple materials!',
        pdf_url: '#',
        thumbnail_url: '/images/magnets/carnival.jpg',
        target_audience: 'all',
        tags: ['crafts', 'carnival', 'activities'],
        download_count: 1089
    },
];

const CATEGORY_ICONS: Record<string, typeof BookOpen> = {
    'stories': BookOpen,
    'reading': BookOpen,
    'math': Star,
    'counting': Star,
    'coloring': Palette,
    'crafts': Palette,
    'cooking': Gift,
    'teacher': Star,
};

export default function ResourcesPage() {
    const [magnets, setMagnets] = useState<LeadMagnet[]>(PLACEHOLDER_MAGNETS);
    const [showModal, setShowModal] = useState(false);
    const [selectedMagnet, setSelectedMagnet] = useState<LeadMagnet | null>(null);
    const [filter, setFilter] = useState<'all' | 'parent' | 'teacher'>('all');
    const [hasEmail, setHasEmail] = useState(false);

    useEffect(() => {
        // Check if user already has email in localStorage
        const savedEmail = localStorage.getItem('ll_lead_email');
        if (savedEmail) {
            setHasEmail(true);
        }

        // Load magnets from DB
        loadMagnets();
    }, []);

    const loadMagnets = async () => {
        try {
            const res = await fetch('/api/lead-magnets');
            const data = await res.json();
            if (data.magnets?.length > 0) {
                setMagnets(data.magnets);
            }
        } catch {
            // Use placeholders if API fails
        }
    };

    const handleDownload = (magnet: LeadMagnet) => {
        if (hasEmail) {
            // Direct download
            window.open(magnet.pdf_url, '_blank');
            trackDownload(magnet.id);
        } else {
            // Show capture modal
            setSelectedMagnet(magnet);
            setShowModal(true);
        }
    };

    const handleCaptureSuccess = (email: string) => {
        localStorage.setItem('ll_lead_email', email);
        setHasEmail(true);

        // Trigger download after a moment
        if (selectedMagnet) {
            setTimeout(() => {
                window.open(selectedMagnet.pdf_url, '_blank');
                trackDownload(selectedMagnet.id);
            }, 1500);
        }
    };

    const trackDownload = async (magnetId: string) => {
        try {
            await fetch('/api/lead-magnets/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ magnet_id: magnetId })
            });
        } catch {
            // Silent fail
        }
    };

    const filteredMagnets = magnets.filter(m =>
        filter === 'all' || m.target_audience === filter || m.target_audience === 'all'
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50">
            {/* Hero Section */}
            <header className="bg-gradient-to-br from-primary via-orange-500 to-yellow-500 text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-bold mb-6">
                        <Gift size={18} />
                        100% FREE Downloads
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        Free Caribbean Kids Resources
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                        Printables, activity guides, and educational materials celebrating Caribbean culture.
                        Perfect for parents, teachers, and families!
                    </p>
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="sticky top-0 bg-white border-b border-gray-100 py-4 z-10">
                <div className="max-w-5xl mx-auto px-4 flex items-center justify-center gap-2">
                    {[
                        { key: 'all', label: 'All Resources' },
                        { key: 'parent', label: 'For Parents' },
                        { key: 'teacher', label: 'For Teachers' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key as any)}
                            className={`px-5 py-2 rounded-xl font-bold transition-all ${filter === key
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resources Grid */}
            <main className="max-w-5xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMagnets.map((magnet) => {
                        const IconComponent = CATEGORY_ICONS[magnet.tags[0]] || Gift;

                        return (
                            <div
                                key={magnet.id}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                            >
                                {/* Thumbnail */}
                                <div className="h-40 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                                    <IconComponent size={48} className="text-primary/50" />
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg capitalize">
                                            {magnet.target_audience === 'all' ? 'Everyone' : magnet.target_audience}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {magnet.download_count.toLocaleString()} downloads
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-black text-gray-900 mb-2">
                                        {magnet.title}
                                    </h3>

                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                        {magnet.description}
                                    </p>

                                    <button
                                        onClick={() => handleDownload(magnet)}
                                        className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                                    >
                                        <Download size={18} />
                                        {hasEmail ? 'Download Free' : 'Get Free Download'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA Section */}
                <div className="mt-16 bg-gradient-to-br from-deep via-gray-900 to-deep text-white rounded-3xl p-8 md:p-12 text-center">
                    <h2 className="text-2xl md:text-3xl font-black mb-4">
                        Want All Resources + Weekly Content?
                    </h2>
                    <p className="text-white/70 mb-6 max-w-xl mx-auto">
                        Join the Likkle Legends family for free stories, songs, games, and printables
                        delivered to your inbox every week!
                    </p>
                    <button
                        onClick={() => {
                            setSelectedMagnet(null);
                            setShowModal(true);
                        }}
                        className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Join Free - Get Weekly Content 🌴
                    </button>
                </div>
            </main>

            {/* Lead Capture Modal */}
            <LeadCaptureModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                source={selectedMagnet ? 'lead_magnet' : 'resources_page'}
                leadMagnetId={selectedMagnet?.id}
                leadMagnetTitle={selectedMagnet?.title}
                onSuccess={handleCaptureSuccess}
            />
        </div>
    );
}
