'use client';

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="no-print fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-amber-400 hover:bg-amber-500 text-white font-black px-8 py-4 rounded-2xl shadow-2xl border-b-4 border-amber-600 hover:translate-y-0.5 hover:border-b-2 transition-all text-lg"
        >
            🖨️ Print / Save as PDF
        </button>
    );
}
