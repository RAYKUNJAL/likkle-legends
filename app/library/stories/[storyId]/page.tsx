
"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Loader2, Play, Pause, Volume2, ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import Button from "@/components/Button";

interface StoryPlayerProps {
    params: {
        storyId: string;
    }
}

export default function StoryPlayerPage({ params }: StoryPlayerProps) {
    const [book, setBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVoice, setCurrentVoice] = useState<'tanty' | 'roti'>('tanty');
    const [activeIndex, setActiveIndex] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const fetchStory = async () => {
            // In a real scenario, fetch by ID. For now, fetch the seeded one if ID matches 'island-journey' or just grab the first one.
            const query = params.storyId === 'island-journey'
                ? supabase.from('storybooks').select('*').eq('title', 'The Island Journey').single()
                : supabase.from('storybooks').select('*').eq('id', params.storyId).single();

            const { data, error } = await query;

            if (data) {
                setBook(data);
                // Preload first audio
                if (data.content_json?.chapters?.[0]?.audio_tracks?.[currentVoice]?.url) {
                    // preloading logic
                }
            } else {
                console.error("Story not found", error);
            }
            setLoading(false);
        };
        fetchStory();
    }, [params.storyId]);

    // Handle audio for the active slide
    useEffect(() => {
        if (!book) return;
        const chapter = book.content_json.chapters[activeIndex];
        const audioUrl = chapter?.audio_tracks?.[currentVoice]?.url;

        if (audioRef.current) {
            audioRef.current.pause();
            if (audioUrl) {
                audioRef.current.src = audioUrl;
                if (isPlaying) {
                    audioRef.current.play().catch(e => console.error("Play error:", e));
                }
            } else {
                // If no specific voice track, fallback to default or nothing
                audioRef.current.src = "";
            }
        }
    }, [activeIndex, currentVoice, book]);

    // Toggle Play/Pause
    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#FDF6E3]"><Loader2 className="animate-spin h-10 w-10 text-orange-500" /></div>;
    if (!book) return <div className="h-screen flex items-center justify-center bg-[#FDF6E3] text-xl font-bold text-gray-700">Story not found. Try seeding "The Island Journey" first.</div>;

    const chapters = book.content_json.chapters;

    return (
        <div className="min-h-screen bg-[#FDF6E3] text-gray-800 font-sans">
            <audio
                ref={audioRef}
                onEnded={() => setIsPlaying(false)}
            />

            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => window.history.back()} className="p-2 hover:bg-orange-50 rounded-full transition-colors">
                        <ArrowRight className="h-6 w-6 rotate-180 text-orange-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">{book.title}</h1>
                        <p className="text-xs text-orange-600 font-medium tracking-wide uppercase">Chapter {activeIndex + 1} of {chapters.length}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Voice Switcher */}
                    <div className="bg-orange-50 rounded-full p-1 flex border border-orange-200">
                        <button
                            onClick={() => { setCurrentVoice('tanty'); setIsPlaying(true); }}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${currentVoice === 'tanty' ? 'bg-orange-500 text-white shadow-md' : 'text-orange-700 hover:bg-orange-100'}`}
                        >
                            👵 Tanty
                        </button>
                        <button
                            onClick={() => { setCurrentVoice('roti'); setIsPlaying(true); }}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${currentVoice === 'roti' ? 'bg-blue-500 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}
                        >
                            🤖 Roti
                        </button>
                    </div>

                    <Button
                        onClick={togglePlay}
                        className={`rounded-full h-12 w-12 p-0 flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                        {isPlaying ? <Pause className="h-6 w-6 text-white fill-current" /> : <Play className="h-6 w-6 text-white fill-current ml-1" />}
                    </Button>
                </div>
            </header>

            {/* Main Carousel */}
            <main className="h-screen pt-20 pb-10 flex items-center justify-center">
                <div className="w-full max-w-5xl h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white relative">
                    <Swiper
                        modules={[Navigation, Pagination, EffectFade]}
                        spaceBetween={0}
                        slidesPerView={1}
                        effect="fade"
                        navigation={{
                            nextEl: '.swiper-button-next-custom',
                            prevEl: '.swiper-button-prev-custom',
                        }}
                        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                        className="h-full w-full"
                    >
                        {chapters.map((chapter: any, index: number) => {
                            // Use seeded image or fallback placeholder
                            const imgSrc = chapter.images?.[0]?.url || "https://images.unsplash.com/photo-1614730341194-75c60740a2d3?q=80&w=2070&auto=format&fit=crop";

                            return (
                                <SwiperSlide key={chapter.id}>
                                    <div className="relative h-full w-full flex">
                                        {/* Image Side */}
                                        <div className="w-1/2 h-full relative bg-gray-100 border-r border-orange-100">
                                            <Image
                                                src={imgSrc}
                                                alt={chapter.title}
                                                fill
                                                className="object-cover"
                                                priority={index === 0}
                                            />
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                                        </div>

                                        {/* Text Side */}
                                        <div className="w-1/2 h-full p-12 flex flex-col justify-center bg-[#FFFBF0] relative overflow-hidden">
                                            {/* Abstract decorative elements */}
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
                                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-300 rounded-full blur-[100px] opacity-20 -ml-20 -mb-20"></div>

                                            <div className="relative z-10">
                                                <h2 className="text-3xl font-extrabold text-orange-900 mb-6 font-display">{chapter.title}</h2>
                                                <div className="space-y-6">
                                                    {chapter.text.map((paragraph: string, i: number) => (
                                                        <p key={i} className="text-xl leading-relaxed text-gray-700 font-serif">
                                                            {paragraph}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>

                    {/* Custom Nav Buttons */}
                    <button className="swiper-button-prev-custom absolute left-6 top-1/2 -translate-y-1/2 z-20 h-14 w-14 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-orange-600 hover:bg-orange-500 hover:text-white transition-all">
                        <ArrowRight className="h-6 w-6 rotate-180" />
                    </button>
                    <button className="swiper-button-next-custom absolute right-6 top-1/2 -translate-y-1/2 z-20 h-14 w-14 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-orange-600 hover:bg-orange-500 hover:text-white transition-all">
                        <ArrowRight className="h-6 w-6" />
                    </button>
                </div>
            </main>
        </div>
    );
}
