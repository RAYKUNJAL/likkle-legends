"use client";

import React, { useState } from 'react';
import { Volume2, Info, X, Music, Sun } from 'lucide-react';

const StorybookWidget: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const hotspots = [
    {
      id: 'steelpan',
      x: '70%',
      y: '65%',
      label: 'Steel Pan',
      content: 'The Steel Pan was invented in Trinidad! It is the only acoustic instrument invented in the 20th century.',
      type: 'sound',
      color: 'bg-primary'
    },
    {
      id: 'hibiscus',
      x: '20%',
      y: '75%',
      label: 'Hibiscus',
      content: 'The Hibiscus is a favorite flower of hummingbirds. In the Caribbean, we sometimes make tea from it!',
      type: 'fact',
      color: 'bg-accent'
    },
    {
      id: 'sun',
      x: '10%',
      y: '10%',
      label: 'Caribbean Sun',
      content: 'The Caribbean sun is warm and bright all year round. Perfect for beach days at Pigeon Point!',
      type: 'animation',
      color: 'bg-yellow-400'
    }
  ];

  const handleInteraction = (item: typeof hotspots[0]) => {
    setActiveItem(item.id);
    if (item.type === 'sound') {
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-secondary/20">
      <div className="bg-secondary/10 p-4 border-b border-secondary/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Demo</span>
          <h3 className="font-heading font-bold text-text">Interactive Story: "Sunny Day in Tobago"</h3>
        </div>
        <div className="flex gap-2 text-xs text-textLight">
          <span className="flex items-center gap-1"><Info size={14} /> Click the bouncing dots!</span>
        </div>
      </div>

      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-b from-blue-300 via-blue-100 to-amber-100">
        {/* Scenery - SVG Illustration */}
        <div className="absolute inset-0">
          {/* Sun */}
          <div className="absolute top-8 left-8 text-yellow-400 animate-spin-slow" style={{ animationDuration: '20s' }}>
            <Sun size={80} fill="currentColor" />
          </div>

          {/* Ocean */}
          <div className="absolute bottom-0 w-full h-1/3 bg-[#0099ff] opacity-80"></div>
          <div className="absolute bottom-4 w-full h-1/3 bg-[#00C6FF] opacity-60 animate-pulse"></div>

          {/* Sand */}
          <div className="absolute bottom-0 w-full h-1/6 bg-[#FFF7EC] rounded-t-[50%] scale-150 translate-y-4"></div>

          {/* Coconut Tree (Simple CSS shapes) */}
          <div className="absolute right-10 bottom-10 w-4 h-64 bg-amber-800 rotate-[-5deg] rounded-full"></div>
          <div className="absolute right-0 bottom-60 w-32 h-32 text-green-600">
            <div className="absolute w-24 h-8 bg-current rounded-full rotate-45"></div>
            <div className="absolute w-24 h-8 bg-current rounded-full -rotate-45"></div>
            <div className="absolute w-24 h-8 bg-current rounded-full rotate-12"></div>
            <div className="absolute w-24 h-8 bg-current rounded-full -rotate-12 top-4"></div>
          </div>

          {/* Steel Pan Stand */}
          <div className="absolute right-[25%] bottom-[15%]">
            <div className="w-24 h-12 bg-gray-400 rounded-b-full border-4 border-gray-600 shadow-lg transform rotate-6"></div>
            <div className="w-2 h-16 bg-gray-700 mx-auto"></div>
          </div>

          {/* Flower */}
          <div className="absolute left-[20%] bottom-[15%] text-accent">
            <div className="w-4 h-20 bg-green-600 mx-auto"></div>
            <div className="w-12 h-12 bg-current rounded-full -mt-24 relative">
              <div className="absolute inset-0 bg-pink-400 rounded-full opacity-50 scale-150 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Hotspots */}
        {hotspots.map((spot) => (
          <button
            key={spot.id}
            onClick={() => handleInteraction(spot)}
            className={`absolute w-8 h-8 rounded-full ${spot.color} shadow-lg border-2 border-white flex items-center justify-center transform transition-transform hover:scale-125 z-10 animate-bounce`}
            style={{ left: spot.x, top: spot.y }}
            aria-label={`Interact with ${spot.label}`}
          >
            <span className="w-2 h-2 bg-white rounded-full"></span>
          </button>
        ))}

        {/* Interaction Modal/Popup */}
        {activeItem && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border-l-4 border-primary animate-slide-up z-20">
            <button
              onClick={() => setActiveItem(null)}
              aria-label="Close details"
              title="Close details"
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              <X size={18} />
            </button>
            <div className="flex gap-4 items-start">
              <div className={`p-3 rounded-full ${hotspots.find(h => h.id === activeItem)?.color} text-white shrink-0`}>
                {hotspots.find(h => h.id === activeItem)?.type === 'sound' ? <Music size={20} /> : <Info size={20} />}
              </div>
              <div>
                <h4 className="font-heading font-bold text-lg text-gray-800 mb-1">
                  {hotspots.find(h => h.id === activeItem)?.label}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {hotspots.find(h => h.id === activeItem)?.content}
                </p>

                {isPlaying && activeItem === 'steelpan' && (
                  <div className="mt-2 flex items-center gap-2 text-primary font-bold text-xs animate-pulse">
                    <Volume2 size={14} /> Playing Calypso Beat... 🎵
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorybookWidget;