import GetStartedWizard from '@/components/GetStartedWizard';
import Link from 'next/link';
import Image from 'next/image';

export default function GetStartedPage() {
    return (
        <div className="min-h-screen bg-[#FFFDF7] flex flex-col">
            {/* Minimal Header */}
            <header className="py-8 px-8 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative h-12 w-48">
                        <Image src="/images/logo.png" alt="Likkle Legends" fill className="object-contain group-hover:scale-105 transition-transform" />
                    </div>
                </Link>
                <div className="text-sm font-bold text-deep/40 hidden md:block uppercase tracking-widest">
                    Build Your Box
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-4 pb-24">
                <GetStartedWizard />
            </main>

            {/* Background Decorations */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[150px] opacity-10 pointer-events-none -mr-64 -mt-64"></div>
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-secondary rounded-full blur-[150px] opacity-10 pointer-events-none -ml-64 -mb-64"></div>
        </div>
    );
}
