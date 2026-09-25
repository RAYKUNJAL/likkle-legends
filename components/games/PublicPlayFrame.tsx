import Link from 'next/link';

/**
 * Kid play chrome for public /games/* routes.
 * Trial and signup CTAs stay on /games. This frame has no pay or checkout actions.
 */
export default function PublicPlayFrame({
    title,
    eyebrow,
    children,
}: {
    title: string;
    eyebrow: string;
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-[#071422] text-white">
            <header className="border-b border-white/10 bg-[#071422]">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
                    <Link href="/games" className="inline-flex min-h-11 items-center text-sm font-extrabold text-[#FFD23F]">
                        ← Games
                    </Link>
                    <h1 className="truncate text-center text-sm font-black sm:text-base">{title}</h1>
                    <p className="hidden text-xs font-bold uppercase tracking-wide text-white/60 sm:block">{eyebrow}</p>
                </div>
            </header>
            <div className="mx-auto max-w-5xl px-3 py-4 sm:px-4">{children}</div>
        </main>
    );
}
