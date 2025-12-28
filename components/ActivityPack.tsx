import React from 'react';
import { Download, Scissors, Palette, Star } from 'lucide-react';
import Button from './Button';

const ActivityPack: React.FC = () => {
  const handleDownload = () => {
    // Dummy download action
    alert("Downloading 'Carnival Colors' Activity Pack PDF...");
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col relative group hover:border-green-200 transition-colors">
       <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 flex-1 flex flex-col items-center text-center relative">
          {/* Decorative background elements */}
          <div className="absolute top-4 left-4 text-green-200 animate-pulse"><Star size={24} /></div>
          <div className="absolute bottom-12 right-6 text-emerald-200 opacity-50"><Scissors size={48} /></div>
          
          <div className="w-32 h-40 bg-white shadow-xl rounded-lg mb-6 rotate-[-3deg] flex flex-col items-center justify-center border border-gray-200 relative group-hover:rotate-0 group-hover:scale-105 transition-all duration-300">
             <div className="w-full h-2/3 bg-gray-50 flex items-center justify-center border-b border-gray-100 rounded-t-lg">
                <Palette size={40} className="text-gray-300" />
             </div>
             <div className="w-full h-1/3 p-2 flex flex-col gap-2 justify-center">
                 <div className="h-2 w-3/4 bg-gray-200 rounded mx-auto"></div>
                 <div className="h-2 w-1/2 bg-gray-200 rounded mx-auto"></div>
             </div>
             
             {/* Badge */}
             <div className="absolute -top-3 -right-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                NEW
             </div>
          </div>
          
          <h4 className="font-heading font-bold text-xl text-deep mb-2">Carnival Colors 🎭</h4>
          <p className="text-sm text-textLight mb-6 leading-relaxed max-w-xs">
             Get creative offline! Includes coloring pages, a DIY mask template, and word search.
          </p>
          
          <div className="mt-auto w-full">
            <Button onClick={handleDownload} fullWidth size="md" variant="secondary" className="shadow-none">
               <Download size={18} className="mr-2" /> Download PDF
            </Button>
            <p className="text-xs text-gray-400 mt-3 font-medium">PDF Format • 2.4 MB</p>
          </div>
       </div>
    </div>
  );
};

export default ActivityPack;