import Link from 'next/link';

const STEPS = [
    {
        title: 'Monday draft',
        body: 'npx tsx scripts/weekly-picture-book.ts --draft writes an original story manuscript. It does not publish.',
    },
    {
        title: 'Read it',
        body: 'Check content/weekly-drafts for kind, original fiction. New books are not labeled as traditional folktales.',
    },
    {
        title: 'Art, then verify',
        body: 'npx tsx scripts/weekly-picture-book.ts --publish <file> adds the book only when the cover and every page PNG exist. Then run verify-kids-library.',
    },
];

export default function WeeklyBooksPage() {
    return (
        <main className="min-h-screen bg-[#F8FAFC] px-4 py-10 md:px-8">
            <article className="max-w-3xl mx-auto space-y-8">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Weekly picture books</p>
                <h1 className="text-4xl md:text-6xl font-black text-deep">One new picture book a week</h1>
                <p className="text-lg text-deep/70 font-bold leading-relaxed">
                    A Grok bot routine, or any Monday job, can run the script in this repo. The kids shelf only receives a book when it is fully illustrated. Drafts stay drafts.
                </p>
                <ol className="space-y-4">
                    {STEPS.map((step, index) => (
                        <li key={step.title} className="bg-white rounded-3xl p-6 shadow-sm">
                            <p className="text-xs font-black uppercase tracking-widest text-deep/40">Step {index + 1}</p>
                            <h2 className="text-2xl font-black text-deep mt-1">{step.title}</h2>
                            <p className="mt-2 font-bold text-deep/70">{step.body}</p>
                        </li>
                    ))}
                </ol>
                <p className="font-bold text-deep/60">
                    Full operator notes live in <code>docs/weekly-picture-books.md</code>. The HTTP trigger is <code>POST /api/cron/weekly-picture-book</code> with <code>CRON_SECRET</code>.
                </p>
                <Link href="/library/build-your-story" className="inline-flex rounded-full bg-primary text-white px-6 py-3 font-black">
                    Build a story with a child&apos;s name
                </Link>
            </article>
        </main>
    );
}
