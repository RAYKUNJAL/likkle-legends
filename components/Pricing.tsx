"use client";

import { Check, Info } from 'lucide-react';
import Link from 'next/link';

const tiers = [
    {
        name: "Mail Club",
        price: "10",
        description: "The Perfect Starter",
        features: [
            "Physical Monthly Letter",
            "1x Cultural Flashcard",
            "1x Coloring Sheet (Physical)",
            "Access to 5 Island Nursery Songs",
            "Cancel Anytime"
        ],
        cta: "Start Mail Club",
        variant: "outline"
    },
    {
        name: "Legends Plus",
        price: "24",
        description: "Full Cultural Immersion",
        features: [
            "Everything in Mail Club",
            "20+ Island Nursery Songs Library",
            "Unlimited Printable Coloring Pages",
            "3 Digital Storybooks / Month",
            "AI Reading Buddy Access",
            "Parent Co-Pilot Dashboard"
        ],
        cta: "Upgrade to Plus",
        variant: "primary",
        highlight: true,
        badge: "BEST FOR LEARNING"
    },
    {
        name: "Annual Plus",
        price: "19",
        billing: "Billed annually ($228)",
        description: "The Grand Adventure",
        features: [
            "2 MONTHS FREE",
            "Exclusive Character Welcome Box",
            "All Digital Storybooks (Archive)",
            "Priority Access to New Songs",
            "Custom Child Shoutout in Story",
            "All Legends Plus Features"
        ],
        cta: "Choose Annual",
        variant: "secondary"
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-zinc-50">
            <div className="container">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl lg:text-5xl font-bold">Simple, Flexible Pricing</h2>
                    <p className="text-lg text-deep/70">Join 500+ families already on their cultural journey! Choose the plan that fits your family's needs.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`relative flex flex-col p-8 rounded-3xl bg-white border-2 transition-all duration-300 hover:shadow-xl ${tier.highlight ? 'border-primary ring-4 ring-primary/10 lg:scale-105 z-10' : 'border-border'
                                }`}
                        >
                            {tier.badge && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {tier.badge}
                                </span>
                            )}

                            <div className="mb-8 text-center sm:text-left">
                                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                                <p className="text-deep/60 text-sm mb-4">{tier.description}</p>
                                <div className="flex items-baseline justify-center sm:justify-start gap-1">
                                    <span className="text-5xl font-black text-deep">${tier.price}</span>
                                    <span className="text-deep/60">/mo</span>
                                </div>
                                {tier.billing && <p className="text-xs font-semibold text-secondary mt-2 uppercase">{tier.billing}</p>}
                            </div>

                            <ul className="space-y-4 flex-1 mb-8">
                                {tier.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <Check className={`w-5 h-5 mt-0.5 shrink-0 ${tier.highlight ? 'text-primary' : 'text-secondary'}`} />
                                        <span className="text-deep/80 leading-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/signup"
                                className={`btn btn-lg w-full ${tier.variant === 'primary' ? 'btn-primary' : tier.variant === 'secondary' ? 'btn-secondary' : 'btn-outline'}`}
                            >
                                {tier.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Tier 4: Educator Section */}
                <div className="mt-16 p-8 rounded-3xl bg-deep text-white flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                        <h3 className="text-3xl font-bold flex items-center gap-3">
                            Educators & Homeschoolers <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Coming Soon</span>
                        </h3>
                        <p className="max-w-xl text-white/70">
                            Get SEL + Caribbean culture lesson plans for groups of 1-10 kids. Includes classroom licenses and digital portal for all students.
                        </p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-black mb-2">$39 - $59<span className="text-sm font-normal">/mo</span></div>
                        <Link href="#contact" className="btn border border-white/30 hover:bg-white/10 text-white">Join the Waitlist</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
