import React, { useState } from 'react';
import { Download, RefreshCw, CheckCircle } from 'lucide-react';
import Button from './Button';

type Feature = {
  id: string;
  name: string;
  value: string;
  type: 'color' | 'path' | 'image';
};

const CharacterBuilder: React.FC = () => {
  // State
  const [skinTone, setSkinTone] = useState<string>('#8D5524');
  const [hairStyle, setHairStyle] = useState<string>('puffs');
  const [hairColor, setHairColor] = useState<string>('#000000');
  const [shirtColor, setShirtColor] = useState<string>('#FF6B35');
  const [accessory, setAccessory] = useState<string>('none');

  // Options
  const skinTones = ['#FAD7BD', '#E0AC69', '#C68642', '#8D5524', '#583E2A', '#3A2518'];
  const hairColors = ['#000000', '#4A3223', '#A52A2A', '#D4AF37'];
  
  // Updated to match new brand palette (Primary, Secondary, Accent, Success, Gold)
  const shirtColors = ['#FF6B35', '#00B4D8', '#F72585', '#06D6A0', '#FF9F1C'];
  
  const accessories = [
    { id: 'none', label: 'None' },
    { id: 'flower', label: 'Hibiscus' },
    { id: 'flag', label: 'Trini Flag' },
    { id: 'glasses', label: 'Shades' },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-primary/20 flex flex-col md:flex-row h-full">
      {/* Canvas Area */}
      <div className="bg-background relative w-full md:w-1/2 p-8 flex items-center justify-center min-h-[300px]">
        <div className="relative w-64 h-64">
          {/* Avatar SVG */}
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
            {/* Body/Shirt */}
            <path 
              d="M50 160 Q50 140 100 140 T150 160 V200 H50 Z" 
              fill={shirtColor} 
            />
            {/* Neck */}
            <rect x="85" y="130" width="30" height="20" fill={skinTone} />
            
            {/* Head */}
            <circle cx="100" cy="90" r="45" fill={skinTone} />
            
            {/* Facial Features */}
            <g fill="#333">
              <circle cx="85" cy="85" r="4" />
              <circle cx="115" cy="85" r="4" />
              <path d="M85 110 Q100 120 115 110" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Hair: Puffs */}
            {hairStyle === 'puffs' && (
              <g fill={hairColor}>
                <circle cx="55" cy="60" r="25" />
                <circle cx="145" cy="60" r="25" />
                <path d="M60 50 Q100 20 140 50" fill="none" stroke={hairColor} strokeWidth="15" />
              </g>
            )}

            {/* Hair: Short */}
            {hairStyle === 'short' && (
              <path d="M60 80 Q60 40 100 40 T140 80 V90 H60 Z" fill={hairColor} />
            )}

             {/* Hair: Braids */}
             {hairStyle === 'braids' && (
               <g stroke={hairColor} strokeWidth="6" strokeLinecap="round">
                 <path d="M100 50 L80 140" />
                 <path d="M100 50 L120 140" />
                 <path d="M100 50 L60 130" />
                 <path d="M100 50 L140 130" />
                 <path d="M60 80 Q60 40 100 40 T140 80 Z" fill={hairColor} stroke="none"/>
               </g>
            )}

            {/* Accessories */}
            {accessory === 'glasses' && (
              <g>
                 <circle cx="85" cy="85" r="10" fill="black" opacity="0.5" />
                 <circle cx="115" cy="85" r="10" fill="black" opacity="0.5" />
                 <line x1="95" y1="85" x2="105" y2="85" stroke="black" strokeWidth="2" />
              </g>
            )}
            
            {accessory === 'flower' && (
              <g transform="translate(130, 60)">
                <path d="M0 0 Q10 -10 20 0 Q10 10 0 0" fill="#F72585" />
                <path d="M0 0 Q-10 -10 -20 0 Q-10 10 0 0" fill="#F72585" />
                <path d="M0 0 Q0 -20 0 -10" stroke="yellow" strokeWidth="2" />
                <circle cx="0" cy="0" r="5" fill="yellow" />
              </g>
            )}

             {accessory === 'flag' && (
              <g transform="translate(150, 140) rotate(-10)">
                <rect width="40" height="25" fill="#CE1126" />
                <path d="M0 0 L40 25" stroke="black" strokeWidth="6" />
                <path d="M0 0 L40 25" stroke="white" strokeWidth="2" />
              </g>
            )}

          </svg>
          
          <div className="absolute -bottom-4 left-0 right-0 text-center">
            <span className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-deep shadow-sm">
              My Legend
            </span>
          </div>
        </div>
      </div>

      {/* Controls Area */}
      <div className="w-full md:w-1/2 p-6 flex flex-col gap-6 overflow-y-auto max-h-[500px]">
        <div>
          <h3 className="font-heading font-bold text-xl text-deep mb-4">Create Your Legend</h3>
          <p className="text-sm text-textLight mb-4">Design your own Caribbean explorer character!</p>
        </div>

        {/* Skin Tone */}
        <div>
          <label className="text-xs font-bold uppercase text-textLight tracking-wider mb-2 block">Skin Tone</label>
          <div className="flex flex-wrap gap-2">
            {skinTones.map(tone => (
              <button
                key={tone}
                onClick={() => setSkinTone(tone)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${skinTone === tone ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'}`}
                style={{ backgroundColor: tone }}
                aria-label="Select skin tone"
              />
            ))}
          </div>
        </div>

        {/* Hair Style */}
        <div>
           <label className="text-xs font-bold uppercase text-textLight tracking-wider mb-2 block">Hair Style</label>
           <div className="flex gap-2">
             {['puffs', 'short', 'braids'].map(style => (
               <button
                 key={style}
                 onClick={() => setHairStyle(style)}
                 className={`px-3 py-2 rounded-lg text-sm border-2 font-medium capitalize transition-colors ${hairStyle === style ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-textLight hover:border-gray-300'}`}
               >
                 {style}
               </button>
             ))}
           </div>
        </div>

        {/* Shirt Color */}
        <div>
          <label className="text-xs font-bold uppercase text-textLight tracking-wider mb-2 block">Outfit Color</label>
          <div className="flex flex-wrap gap-2">
            {shirtColors.map(color => (
              <button
                key={color}
                onClick={() => setShirtColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${shirtColor === color ? 'border-gray-400 ring-2 ring-gray-200' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
                aria-label="Select shirt color"
              />
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div>
           <label className="text-xs font-bold uppercase text-textLight tracking-wider mb-2 block">Accessory</label>
           <div className="flex flex-wrap gap-2">
             {accessories.map(acc => (
               <button
                 key={acc.id}
                 onClick={() => setAccessory(acc.id)}
                 className={`px-3 py-2 rounded-lg text-sm border-2 font-medium transition-colors ${accessory === acc.id ? 'border-secondary bg-secondary/10 text-secondary' : 'border-gray-200 text-textLight hover:border-gray-300'}`}
               >
                 {acc.label}
               </button>
             ))}
           </div>
        </div>
        
        <div className="pt-4 border-t border-gray-100 flex gap-3">
          <Button size="sm" fullWidth>
            <Download size={16} className="mr-2" /> Save
          </Button>
          <button 
             onClick={() => {
               setSkinTone('#8D5524');
               setHairStyle('puffs');
               setShirtColor('#FF6B35');
               setAccessory('none');
             }}
             className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterBuilder;