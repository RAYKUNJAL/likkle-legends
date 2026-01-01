"use client";

import React from 'react';
import Link from 'next/link';
import { Crown, X } from 'lucide-react';
import { useUser } from './UserContext';

const UpgradeBanner: React.FC = () => {
  const { user, canAccess } = useUser();
  const [isVisible, setIsVisible] = React.useState(true);

  // Don't show if user is already on Legends Plus or higher
  if (!isVisible || !user || canAccess('legends_plus')) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="bg-deep text-white rounded-xl shadow-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto border border-white/10 relative overflow-hidden">
        {/* Shine effect */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 w-20 h-full bg-white transform -skew-x-12 -translate-x-full animate-[shimmer_3s_infinite]"></div>
        </div>

        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0 animate-bounce">
            <Crown size={24} />
          </div>
          <div>
            <h4 className="font-heading font-bold text-lg">Unlock Unlimited Adventures!</h4>
            <p className="text-gray-300 text-sm">Get the full Reading Buddy, Parent Dashboard & more.</p>
          </div>
        </div>

        <div className="flex gap-2 z-10">
          <Link
            href="/checkout?plan=legends_plus"
            className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Upgrade to Legends+
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 text-gray-400 hover:text-white"
            aria-label="Dismiss upgrade banner"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeBanner;