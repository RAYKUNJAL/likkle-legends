'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Heart, Music, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const CHARACTERS = [
    {
        name: 'Dilly Doubles',
        role: 'Joy Specialist',
        color: '#7B3FBE',
        personality: 'The rhythm master of the islands, bringing music and movement to every lesson.',
        teaches: 'Joy, Movement, and Island Celebrations',
        icon: Music,
        gradient: 'from-purple-500 to-purple-700',
        image: '/images/dilly-doubles.jpg'
    },
    {
        name: 'R.O.T.I.',
        role: 'Learning Buddy',
        color: '#B45309',
        personality: 'A friendly guide who makes learning island history fun and interactive.',
        teaches: 'Island History, Phonics, and Math',
        icon: Zap,
        gradient: 'from-amber-400 to-orange-500',
        image: '/images/roti-new.jpg'
    },
    {
        name: 'Tanty Spice',
        role: 'Wisdom Guardian',
        color: '#BE185D',
        personality: 'Warm and caring, she shares the hidden wisdom of Caribbean traditions.',
        teaches: 'Cultural Stories, Folklore, and Traditions',
        icon: Heart,
        gradient: 'from-pink-500 to-rose-600',
        image: '/images/tanty_spice_avatar.jpg'
    },
    {
        name: 'Mango Moko',
        role: 'Balance Protector',
        color: '#15803D',
        personality: 'Watching over the islands, ensuring every child grows with confidence and pride.',
        teaches: 'Geography, Traditions, and Life Balance',
        icon: Shield,
        gradient: 'from-green-500 to-emerald-700',
        image: '/images/mango_moko.png'
    }
];

interface MeetTheLegendsProps {
    onOpenWaitlist?: () => void;
}

export function MeetTheLegends({ onOpenWaitlist }: MeetTheLegendsProps) {
    return (
        <section className="py-24 bg-white px-6 overflow-hidden relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black text-slate-900 mb-6"
                    >
                        Meet Your <span className="text-[var(--caribbean-mango)]">Legendary</span> Teachers
                    </motion.h2>
                    <p className="text-slate-500 text-xl max-w-2xl mx-auto">
                        The Archipelago is full of friends who help your child explore their roots through stories, math, and music.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {CHARACTERS.map((char, index) => (
                        <motion.div
                            key={char.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="relative group"
                        >
                            <Card className="h-full overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all rounded-[32px]">
                                <div className="h-64 bg-white flex items-center justify-center relative overflow-hidden">
                                    <motion.img
                                        src={char.image}
                                        alt={char.name}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.05 }}
                                    />
                                    <div className="absolute top-4 right-4 z-20">
                                        <char.icon className="w-6 h-6 text-slate-700" />
                                    </div>
                                </div>
                                <CardContent className="p-6 bg-white">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">{char.role}</p>
                                    <h3 className="text-2xl font-black mb-3 text-slate-900">{char.name}</h3>
                                    <p className="text-sm font-bold text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                                        {char.personality}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Teaches: {char.teaches.split(',')[0]}</p>
                                    <Button
                                        onClick={() => window.location.href = '/checkout'}
                                        variant="outline"
                                        className="w-full h-11 rounded-xl border-2 font-bold group-hover:bg-slate-50 transition-colors text-slate-700 border-slate-300"
                                    >
                                        Learn More
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}

                    {/* Join the Team Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 }}
                        className="lg:col-span-1"
                    >
                        <Card className="h-full border-4 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-8 text-center group rounded-[32px]">
                            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-6 text-slate-400 group-hover:scale-110 group-hover:bg-[var(--caribbean-sun)] group-hover:text-white transition-all">
                                <Heart className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-slate-600 mb-2">More Friends Coming!</h3>
                            <p className="text-sm font-bold text-slate-400 mb-6">Our universe is growing with new characters from every island.</p>
                            <Button
                                variant="ghost"
                                className="font-black text-[var(--caribbean-ocean)] uppercase tracking-widest text-xs"
                                onClick={() => window.location.href = '/contact'}
                            >
                                Suggest a Character
                            </Button>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}