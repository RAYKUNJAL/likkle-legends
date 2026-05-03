import Link from 'next/link';
import {
    AGE_BANDS,
    CARIBBEAN_CURRICULUM_SOURCES,
    CURRICULUM_PILLARS,
    SCHOOL_READINESS_MODULES,
} from '@/lib/education/caribbean-curriculum';

const characterLabel: Record<string, string> = {
    tanty_spice: 'Tanty Spice',
    roti: 'R.O.T.I.',
    dilly_doubles: 'Dilly Doubles',
    mango_moko: 'Mango Moko',
    scorcha_pepper: 'Scorcha Pepper',
};

export default function AdminCurriculumPage() {
    return (
        <main className="min-h-screen bg-[#FFFDF7] px-6 py-10 text-deep">
            <div className="mx-auto max-w-7xl space-y-10">
                <header className="flex flex-col gap-4 border-b border-orange-100 pb-8 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">School Readiness</p>
                        <h1 className="mt-3 text-4xl font-black tracking-tight lg:text-6xl">Caribbean Curriculum Map</h1>
                        <p className="mt-4 max-w-3xl text-lg font-semibold leading-relaxed text-deep/60">
                            The platform should prove learning outcomes, not just entertain. This map ties Likkle Legends content, voices, storybooks, games, and reports to regional primary-learning pillars.
                        </p>
                    </div>
                    <Link href="/admin" className="w-fit rounded-2xl bg-white px-5 py-3 text-sm font-black text-deep shadow-sm ring-1 ring-black/5 hover:text-primary">
                        Back to Admin
                    </Link>
                </header>

                <section className="grid gap-4 md:grid-cols-3">
                    {AGE_BANDS.map((band) => (
                        <article key={band.id} className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5">
                            <p className="text-xs font-black uppercase tracking-widest text-primary">{band.label}</p>
                            <h2 className="mt-2 text-2xl font-black">Ages {band.ages.join(', ')}</h2>
                            <p className="mt-3 text-sm font-bold leading-relaxed text-deep/55">{band.learningShape}</p>
                            <ul className="mt-5 space-y-2">
                                {band.productRules.map((rule) => (
                                    <li key={rule} className="rounded-xl bg-orange-50 px-3 py-2 text-sm font-bold text-deep/65">
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </section>

                <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-primary">Core Learning Pillars</p>
                            <h2 className="text-3xl font-black">What Every Feature Must Teach</h2>
                        </div>
                        <p className="max-w-xl text-sm font-semibold text-deep/50">
                            Each pillar needs content, practice, assessment evidence, parent language, and a character guide.
                        </p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                        {CURRICULUM_PILLARS.map((pillar) => (
                            <article key={pillar.id} className="rounded-2xl border border-zinc-100 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-black">{pillar.label}</h3>
                                        <p className="mt-2 text-sm font-semibold leading-relaxed text-deep/55">{pillar.schoolLanguage}</p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                                        {characterLabel[pillar.characterLead]}
                                    </span>
                                </div>
                                <p className="mt-4 rounded-xl bg-yellow-50 p-3 text-sm font-bold leading-relaxed text-deep/65">{pillar.parentLanguage}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {pillar.evidenceTargets.map((target) => (
                                        <span key={target} className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-black text-deep/45">
                                            {target}
                                        </span>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                    <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5">
                        <p className="text-xs font-black uppercase tracking-widest text-primary">School Sales Module</p>
                        <h2 className="mt-2 text-3xl font-black">Foundational Build List</h2>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {SCHOOL_READINESS_MODULES.map((item) => (
                                <div key={item} className="rounded-xl bg-zinc-50 px-4 py-3 text-sm font-black text-deep/65">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-[2rem] bg-deep p-6 text-white shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest text-primary">Sources To Align</p>
                        <div className="mt-5 space-y-4">
                            {CARIBBEAN_CURRICULUM_SOURCES.map((source) => (
                                <a
                                    key={source.url}
                                    href={source.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block rounded-2xl bg-white/10 p-4 transition hover:bg-white/15"
                                >
                                    <p className="font-black">{source.label}</p>
                                    <p className="mt-2 text-sm font-semibold leading-relaxed text-white/55">{source.note}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
