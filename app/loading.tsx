import Image from 'next/image';

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[20%] right-[15%] w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[20%] left-[15%] w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="flex flex-col items-center gap-8 relative z-10">
                <div className="relative w-32 h-32">
                    {/* Pulsing ring */}
                    <div className="absolute inset-[-10px] border-4 border-primary/20 rounded-full animate-ping opacity-20"></div>

                    {/* Spinning border */}
                    <div className="absolute inset-[-4px] border-4 border-primary rounded-full border-t-transparent animate-spin"></div>

                    {/* The Sun */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full shadow-lg p-2">
                        <div className="relative w-full h-full animate-bounce">
                            <Image
                                src="/icon.png"
                                alt="Loading..."
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <p className="font-black text-deep text-lg uppercase tracking-[0.2em] animate-pulse">
                        Setting Sail...
                    </p>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0s]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
