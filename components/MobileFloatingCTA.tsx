import React, { useEffect, useState } from 'react';
import Button from './Button';

const MobileFloatingCTA: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero (approx 600px)
      // This ensures we don't duplicate the CTA when the hero CTA is visible
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden z-40 animate-slide-up pb-safe">
       <div className="flex items-center gap-3 container mx-auto">
          <div className="flex-1 min-w-0">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Offer ends soon</p>
             <p className="font-heading font-bold text-primary truncate">Save 15% Today</p>
          </div>
          <Button size="sm" onClick={() => window.location.href = '#pricing'} className="shadow-none">
            Get Started
          </Button>
       </div>
    </div>
  );
};

export default MobileFloatingCTA;