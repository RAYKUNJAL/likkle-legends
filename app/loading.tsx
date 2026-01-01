export default function Loading() {
    return (
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl animate-pulse">🌴</span>
                    </div>
                </div>
                <p className="font-black text-deep/40 text-sm uppercase tracking-widest animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    );
}
