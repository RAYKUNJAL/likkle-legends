
import Link from 'next/link';
import { ArrowRight, Check, Star } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/paypal';

export default function PricingLadderPreview({ content }: { content: any }) {
    const { pricing } = content;
    // We now use the constant, but can still use title/subtitle from content if available

    const plansToShow = [
        SUBSCRIPTION_PLANS.plan_free_forever,
        SUBSCRIPTION_PLANS.plan_digital_legends,
        SUBSCRIPTION_PLANS.plan_mail_intro
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container">
                <div className="text-center mb-12 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black text-deep">
                        {pricing?.title || "Choose Your Path"}
                    </h2>
                    <p className="text-lg text-deep/60 max-w-lg mx-auto">
                        {pricing?.subtitle || "Start small, grow with your family. Most families begin with the free plan."}
                    </p>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6">
                        {plansToShow.map((plan: any) => {
                            const isRecommended = plan.id === 'plan_digital_legends';
                            const isFree = plan.id === 'plan_free_forever';

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-3xl p-6 border-2 transition-all flex flex-col ${isRecommended
                                        ? 'bg-emerald-50 border-emerald-300 shadow-xl scale-[1.02] z-10'
                                        : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-lg'
                                        }`}
                                >
                                    {isRecommended && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-max">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                                                <Star className="w-3 h-3" /> Most Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center mb-6 pt-2">
                                        <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${isRecommended ? 'text-emerald-600' : 'text-deep/50'
                                            }`}>
                                            {plan.name}
                                        </p>
                                        <div className="flex items-baseline justify-center gap-1">
                                            {isFree ? (
                                                <span className="text-4xl font-black text-deep">Free</span>
                                            ) : (
                                                <>
                                                    <span className="text-4xl font-black text-deep">${plan.price}</span>
                                                    <span className="text-deep/60">/mo</span>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-sm text-deep/60 mt-2 min-h-[3rem]">{plan.description}</p>
                                    </div>

                                    <div className="space-y-3 mb-8 flex-1">
                                        {(plan.features || []).slice(0, 4).map((feature: string) => (
                                            <div key={feature} className="flex items-start gap-2">
                                                <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isRecommended ? 'text-emerald-500' : 'text-zinc-400'}`} />
                                                <span className="text-sm text-deep/70">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href={isFree ? '/auth/signup' : `/checkout?plan=${plan.id}`}
                                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all group ${isRecommended
                                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                            : 'bg-zinc-100 hover:bg-zinc-200 text-deep'
                                            }`}
                                    >
                                        {isFree ? "Start For Free" : "Choose Plan"}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center mt-8">
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-2 text-deep/60 hover:text-deep font-bold transition-colors group"
                        >
                            Compare All 5 Plans
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
