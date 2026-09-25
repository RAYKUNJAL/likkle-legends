"use client";

import React, { useEffect, useState } from 'react';
import { X, Heart } from 'lucide-react';
import Button from './Button';

const ExitIntentModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Desktop exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    // Mobile timer fallback (since there is no mouse leave)
    const mobileTimer = setTimeout(() => {
      // Check if it's a mobile viewport and hasn't shown yet
      if (window.innerWidth < 768 && !hasShown) {
        // Only show on mobile after 30 seconds of engagement
        // setIsVisible(true);
        // setHasShown(true);
        // Commented out to be less intrusive on mobile for this demo,
        // but this is where you'd put it.
      }
    }, 30000);

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(mobileTimer);
    };
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative animate-scale-up">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 p-2"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="bg-primary/10 p-8 md:w-2/5 flex items-center justify-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-secondary/20 rounded-full translate-x-1/2 translate-y-1/2"></div>

            <div className="text-center relative z-10">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md text-primary ring-4 ring-white/50">
                <Heart size={40} />
              </div>
              <span className="font-heading font-bold text-primary text-xl">Wait!</span>
            </div>
          </div>
          <div className="p-8 md:w-3/5">
            <h3 className="font-heading font-bold text-2xl text-text mb-2">
              Start free — no card needed
            </h3>
            <p className="text-textLight mb-6 text-sm">
              Create a free parent account and explore stories, games, and island radio. Paid buddy, full library, and mail kits stay locked until you upgrade.
            </p>

            <Button
              fullWidth
              onClick={() => {
                setIsVisible(false);
                window.location.href = '/signup';
              }}
            >
              Create your free account
            </Button>
            <button
              onClick={() => setIsVisible(false)}
              className="w-full text-center text-xs text-gray-400 mt-4 hover:text-gray-600 underline"
            >
              No thanks, maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentModal;
