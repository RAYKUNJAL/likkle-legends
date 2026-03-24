'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[ADMIN ERROR BOUNDARY]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-gray-100 max-w-md w-full">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4">Command Center Error</h2>
        <p className="text-gray-500 font-bold mb-8 italic">
          "{error.message || 'An unexpected error occurred in the admin dashboard.'}"
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => reset()}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
          >
            Try Island Recovery
          </button>
          <Link
            href="/admin"
            className="w-full py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all font-sans"
          >
            Back to Bridge
          </Link>
        </div>
      </div>
      <p className="mt-8 text-xs text-gray-400 font-black uppercase tracking-widest">
        Likkle Legends Command Hub 🌴
      </p>
    </div>
  );
}
