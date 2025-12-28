import React from 'react';

const FlashCardShowcase: React.FC = () => {
  return (
    <section className="py-20 bg-orange-50/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-bold tracking-widest text-sm uppercase mb-2 block">Inside The Box</span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-deep mb-4">
            Collect Them All!
          </h2>
          <p className="text-textLight text-lg max-w-2xl mx-auto">
            Every month comes with durable, high-quality flashcards featuring Caribbean vocabulary, flora, and fauna. Here is a sneak peek at this month's collection.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-10 md:gap-16 perspective-1000">
           {/* Card 1: Zaboca */}
           <div className="w-full max-w-[340px] aspect-[2.5/3.5] bg-[#FFF9C4] rounded-3xl border-8 border-[#7C4DFF] p-6 relative shadow-2xl transform rotate-[-3deg] hover:rotate-0 transition-all duration-300 hover:scale-105 flex flex-col">
              <div className="text-center flex-1 flex flex-col">
                 <h3 className="font-heading font-bold text-4xl text-[#4527A0] mb-2 leading-none">
                   Z <span className="text-2xl text-deep font-sans">is for</span> Zaboca
                 </h3>
                 <p className="text-deep font-semibold text-sm mb-4 leading-tight italic opacity-80">
                   Locals across the Caribbean say "zaboca" instead of "avocado."
                 </p>
                 
                 {/* Character Illustration Recreation */}
                 <div className="flex-1 flex items-center justify-center min-h-[160px]">
                    <div className="w-32 h-40 bg-gradient-to-br from-lime-500 to-green-600 rounded-[50%_50%_45%_45%] relative shadow-lg">
                       {/* Shine */}
                       <div className="absolute top-6 right-6 w-8 h-12 bg-white/20 rounded-full rotate-[15deg] blur-sm"></div>
                       {/* Face */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex flex-col items-center justify-center pt-8">
                          <div className="flex gap-4 mb-2">
                             <div className="w-8 h-10 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                                <div className="w-4 h-4 bg-black rounded-full absolute bottom-2 right-2"></div>
                             </div>
                             <div className="w-8 h-10 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                                <div className="w-4 h-4 bg-black rounded-full absolute bottom-2 left-2"></div>
                             </div>
                          </div>
                          <div className="w-12 h-6 bg-red-900 rounded-b-full overflow-hidden relative">
                             <div className="w-8 h-4 bg-red-500 rounded-full absolute bottom-[-5px] left-2"></div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <ul className="text-left text-deep text-sm space-y-2 mb-6 mt-4 px-2 font-medium">
                    <li className="flex gap-2 items-start">
                      <span className="text-[#4527A0] text-lg leading-none">•</span>
                      <span>It's creamy, with healthy oils</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="text-[#4527A0] text-lg leading-none">•</span>
                      <span>Tastes great with pepper sauce like "chow"!</span>
                    </li>
                 </ul>

                 <div className="mt-auto bg-[#7C4DFF] text-white py-2 px-8 rounded-full inline-block font-heading font-bold text-lg shadow-md mx-auto">
                    Likkle Legends
                 </div>
              </div>
           </div>

           {/* Card 2: Nutmeg */}
           <div className="w-full max-w-[340px] aspect-[2.5/3.5] bg-[#FFF9C4] rounded-3xl border-8 border-[#7C4DFF] p-6 relative shadow-2xl transform rotate-[3deg] hover:rotate-0 transition-all duration-300 hover:scale-105 flex flex-col">
              <div className="text-center flex-1 flex flex-col">
                 <h3 className="font-heading font-bold text-4xl text-[#4527A0] mb-4 leading-none">
                   N <span className="text-2xl text-deep font-sans">is for</span> Nutmeg
                 </h3>
                 
                 {/* Character Illustration Recreation */}
                 <div className="flex-1 flex items-center justify-center min-h-[160px] relative">
                     {/* Mace (Red covering) */}
                     <div className="w-40 h-40 bg-red-500 rounded-full flex items-center justify-center relative shadow-md">
                        {/* Detail lines on mace */}
                        <div className="absolute inset-0 border-4 border-red-600 rounded-full opacity-30"></div>
                        
                        {/* Nut (Brown center) - Peeking out like the image */}
                        <div className="w-28 h-28 bg-amber-800 rounded-full relative flex items-center justify-center border-4 border-amber-900 shadow-inner">
                           {/* Face */}
                           <div className="flex flex-col items-center pt-2">
                             <div className="flex gap-2 mb-1">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                   <div className="w-3 h-3 bg-black rounded-full"></div>
                                </div>
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                   <div className="w-3 h-3 bg-black rounded-full"></div>
                                </div>
                             </div>
                             <div className="w-10 h-5 bg-black rounded-b-full overflow-hidden relative">
                                <div className="w-6 h-3 bg-red-500 rounded-t-full absolute bottom-[-2px] left-2"></div>
                             </div>
                           </div>
                           
                           {/* Hand waving (Simple circle) */}
                           <div className="absolute -right-12 top-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                              <span className="text-white text-xs">Hi!</span>
                           </div>
                        </div>
                     </div>
                 </div>

                 <p className="text-deep font-semibold text-sm mb-6 mt-4 leading-tight px-2">
                   Nutmeg is a big seed wrapped in nutmeg's lacy red covering called mace.
                 </p>

                 <div className="mt-auto bg-[#7C4DFF] text-white py-2 px-8 rounded-full inline-block font-heading font-bold text-lg shadow-md mx-auto">
                    Likkle Legends
                 </div>
              </div>
           </div>
        </div>
        
        <div className="text-center mt-12">
           <p className="text-sm text-gray-500 mb-4">*Actual cards may vary slightly. Collect a new set every month!</p>
        </div>
      </div>
    </section>
  );
};

export default FlashCardShowcase;