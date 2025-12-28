import React, { useEffect, useState } from 'react';
import { X, Gift } from 'lucide-react';
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
                   <Gift size={40} />
                </div>
                <span className="font-heading font-bold text-primary text-xl">Wait!</span>
             </div>
          </div>
          <div className="p-8 md:w-3/5">
            <h3 className="font-heading font-bold text-2xl text-text mb-2">
              Don't leave empty handed!
            </h3>
            <p className="text-textLight mb-6 text-sm">
              Unlock a special <span className="font-bold text-primary">15% OFF</span> your first box when you join today.
            </p>
            
            <div className="bg-gray-50 p-3 rounded-lg text-center mb-6 border border-dashed border-gray-300 group cursor-pointer hover:bg-gray-100 transition-colors"
                 onClick={() => {
                   navigator.clipboard.writeText('LEGEND15');
                   alert('Code copied!');
                 }}
            >
               <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Click to Copy Code</span>
               <span className="font-mono font-bold text-2xl text-text tracking-wider group-hover:text-primary transition-colors">LEGEND15</span>
            </div>

            <Button 
              fullWidth 
              onClick={() => {
                setIsVisible(false);
                window.location.href = '#pricing';
              }}
            >
              Claim Offer
            </Button>
            <button 
              onClick={() => setIsVisible(false)}
              className="w-full text-center text-xs text-gray-400 mt-4 hover:text-gray-600 underline"
            >
              No thanks, I don't want to save money
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentModal;