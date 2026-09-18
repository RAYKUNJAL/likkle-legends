import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AccountTrialPage() {
    return (
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center px-6 py-16">
            <div className="max-w-xl w-full bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl p-10">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Choose how you start</p>
                <h1 className="text-4xl font-black text-deep tracking-tight mt-3">Free explorer or paid trial</h1>
                <p className="mt-4 text-deep/60 font-medium leading-relaxed">
                    We do not silently unlock premium. Pick the path that matches the promise:
                </p>
                <div className="mt-8 space-y-4">
                    <Link
                        href="/signup?plan=free"
                        className="block rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-6 hover:border-emerald-400 transition-colors"
                    >
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-700">No credit card</p>
                        <h2 className="text-2xl font-black text-slate-900 mt-1">Free explorer account</h2>
                        <p className="text-sm font-medium text-slate-600 mt-2">
                            Creates a real free account. Playable songs, public games, and portal basics. Not a 7-day premium pass.
                        </p>
                    </Link>
                    <Link
                        href="/checkout?plan=legends_plus"
                        className="block rounded-3xl border-2 border-orange-200 bg-orange-50 p-6 hover:border-orange-400 transition-colors"
                    >
                        <p className="text-xs font-black uppercase tracking-widest text-orange-700">PayPal required</p>
                        <h2 className="text-2xl font-black text-slate-900 mt-1">7-day paid trial</h2>
                        <p className="text-sm font-medium text-slate-600 mt-2">
                            Checkout confirms a payment method. Nothing is charged today if PayPal trial start_time is set. Cancel within 7 days to avoid the first charge.
                        </p>
                    </Link>
                </div>
                <Link href="/pricing" className="inline-block mt-8 text-sm font-black text-deep/50 hover:text-deep">
                    Compare plans →
                </Link>
            </div>
        </div>
    );
}
