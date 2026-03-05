import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, Target } from 'lucide-react';
import {
    FEATURE_SUITES,
    getFeatureSuite,
    isFeatureSuiteSlug,
    type FeatureSuiteSlug,
} from '@/lib/feature-suites';
import SuiteAIGenerator from '@/components/features/SuiteAIGenerator';

export function generateStaticParams() {
    return (Object.keys(FEATURE_SUITES) as FeatureSuiteSlug[]).map((suite) => ({ suite }));
}

export default function FeatureSuitePage({ params }: { params: { suite: string } }) {
    if (!isFeatureSuiteSlug(params.suite)) {
        notFound();
    }

    const suite = getFeatureSuite(params.suite);
    if (!suite) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-deep text-white">
            <header className="border-b border-white/10 bg-black/20 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <Link href="/#features" className="inline-flex items-center gap-2 text-white/70 hover:text-white">
                        <ArrowLeft size={18} />
                        Back to Features
                    </Link>
                    <Link href={suite.ctaHref} className="rounded-xl bg-primary px-4 py-2 font-black text-white hover:opacity-90">
                        {suite.ctaLabel}
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-10">
                <section className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-8">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Led by {suite.ledBy}</p>
                    <h1 className="mt-3 text-4xl font-black tracking-tight">{suite.title}</h1>
                    <p className="mt-3 text-lg text-white/80">{suite.hero}</p>
                    <p className="mt-2 text-white/60">{suite.description}</p>
                </section>

                <section className="mb-10">
                    <SuiteAIGenerator suite={suite.slug} suiteTitle={suite.title} />
                </section>

                <section className="grid gap-6">
                    {suite.items.map((item) => (
                        <article
                            key={item.id}
                            id={item.id}
                            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
                        >
                            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-2xl font-black">{item.name}</h2>
                                    <p className="text-white/70">{item.description}</p>
                                </div>
                                <Link
                                    href={item.primaryHref}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 font-black hover:bg-white/20"
                                >
                                    Try This Feature
                                    <ArrowRight size={16} />
                                </Link>
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                                {item.lessons.map((lesson) => (
                                    <div key={lesson.title} className="rounded-2xl border border-white/10 bg-deep/60 p-4">
                                        <h3 className="font-black">{lesson.title}</h3>
                                        <div className="mt-2 space-y-1 text-sm text-white/70">
                                            <p className="inline-flex items-center gap-2">
                                                <Clock size={14} />
                                                {lesson.duration}
                                            </p>
                                            <p className="inline-flex items-center gap-2">
                                                <Target size={14} />
                                                {lesson.objective}
                                            </p>
                                        </div>
                                        <p className="mt-2 text-sm text-white/85">{lesson.activity}</p>
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    );
}
