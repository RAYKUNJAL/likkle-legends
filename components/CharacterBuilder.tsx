import React, { useState, useRef } from 'react';
import { Download, RefreshCw, Sparkles, Camera, Shuffle } from 'lucide-react';
import Button from './Button';

const CharacterBuilder: React.FC = () => {
  // State
  const [skinTone, setSkinTone] = useState<string>('#8D5524');
  const [hairStyle, setHairStyle] = useState<string>('puffs');
  const [hairColor, setHairColor] = useState<string>('#000000');
  const [outfitStyle, setOutfitStyle] = useState<string>('dashiki');
  const [outfitColor, setOutfitColor] = useState<string>('#FF6B35');
  const [headwear, setHeadwear] = useState<string>('none');
  const [headwearColor, setHeadwearColor] = useState<string>('#F72585');
  const [accessory, setAccessory] = useState<string>('none');
  
  const svgRef = useRef<SVGSVGElement>(null);

  // Options Data
  const skinTones = ['#FAD7BD', '#E0AC69', '#C68642', '#8D5524', '#583E2A', '#3A2518'];
  const hairColors = ['#000000', '#4A3223', '#A52A2A', '#D4AF37', '#808080', '#F72585'];
  const baseColors = ['#FF6B35', '#00B4D8', '#F72585', '#06D6A0', '#FF9F1C', '#FFFFFF', '#333333', '#6A4C93'];

  // Helper for randomizer
  const randomChoice = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

  const randomize = () => {
    setSkinTone(randomChoice(skinTones));
    setHairStyle(randomChoice(['puffs', 'short', 'braids', 'locs', 'afro', 'cornrows', 'bantu', 'fade']));
    setHairColor(randomChoice(hairColors));
    setOutfitStyle(randomChoice(['tshirt', 'dashiki', 'madras', 'uniform', 'carnival']));
    setOutfitColor(randomChoice(baseColors));
    setHeadwear(randomChoice(['none', 'none', 'none', 'headwrap', 'straw_hat', 'snapback'])); 
    setHeadwearColor(randomChoice(baseColors));
    setAccessory(randomChoice(['none', 'flower', 'flag', 'glasses', 'pan_sticks', 'necklace']));
  };

  const downloadCharacter = () => {
    if (!svgRef.current) return;
    
    // Create a canvas to draw the SVG onto
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Add XML namespace if missing (required for some browsers)
    const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Set higher resolution for better quality
      canvas.width = 600;
      canvas.height = 600;
      
      if (ctx) {
        // 1. Draw Background Gradient
        const gradient = ctx.createRadialGradient(300, 300, 0, 300, 300, 400);
        gradient.addColorStop(0, "#FFFDF7");
        gradient.addColorStop(1, "#FFE0B2"); // Soft warm orange
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Draw Decorative Pattern (Polka dots)
        ctx.fillStyle = "rgba(255, 107, 53, 0.15)"; // Primary color, low opacity
        for (let x = 0; x < canvas.width; x += 40) {
            for (let y = 0; y < canvas.height; y += 40) {
                if ((x + y) % 80 === 0) { // Staggered pattern
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // 3. Central Glow/Circle behind Avatar
        ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(300, 280, 220, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // 4. Draw SVG Avatar
        // Centered in 600x600, shifted slightly up to make room for text
        ctx.drawImage(img, 75, 55, 450, 450);

        // 5. Add Branding Text
        ctx.font = "bold 28px sans-serif";
        ctx.fillStyle = "#023047"; // Deep Navy
        ctx.textAlign = "center";
        ctx.fillText("My Likkle Legend", 300, 560);
        
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#FF6B35"; // Primary
        ctx.fillText("likklelegends.com", 300, 585);
        
        // Trigger download
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = "my-likkle-legend.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      }
    };
    img.src = url;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-primary/20 flex flex-col lg:flex-row h-full">
      {/* Canvas Area */}
      <div className="bg-background relative w-full lg:w-1/2 p-4 flex items-center justify-center min-h-[400px]">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#FF6B35 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="relative w-80 h-80 transition-all duration-300 transform hover:scale-105">
          {/* Avatar SVG */}
          <svg 
            ref={svgRef}
            viewBox="0 0 300 300" 
            className="w-full h-full drop-shadow-2xl"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="madras" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill={outfitColor} />
                <path d="M0 10 H20 M10 0 V20" stroke="rgba(0,0,0,0.2)" strokeWidth="4" />
                <path d="M0 5 H20 M0 15 H20 M5 0 V20 M15 0 V20" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              </pattern>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* --- CARNIVAL BACK PIECE (Behind Body) --- */}
            {outfitStyle === 'carnival' && (
              <g transform="translate(150, 150)">
                 {[-40, -20, 0, 20, 40].map((angle, i) => (
                   <g key={i} transform={`rotate(${angle}) translate(0, -100)`}>
                     <ellipse cx="0" cy="0" rx="15" ry="50" fill={i % 2 === 0 ? outfitColor : '#FFD700'} stroke="white" strokeWidth="2" />
                     <circle cx="0" cy="-40" r="5" fill="#00B4D8" />
                   </g>
                 ))}
              </g>
            )}

            {/* --- HAIR BACK (Behind Head) --- */}
            {hairStyle === 'puffs' && headwear !== 'headwrap' && (
              <g fill={hairColor}>
                 <circle cx="90" cy="110" r="35" />
                 <circle cx="210" cy="110" r="35" />
              </g>
            )}
            {hairStyle === 'locs' && headwear !== 'headwrap' && (
              <g stroke={hairColor} strokeWidth="12" strokeLinecap="round">
                <path d="M100 120 Q80 180 90 220" />
                <path d="M110 120 Q100 180 110 230" />
                <path d="M200 120 Q220 180 210 220" />
                <path d="M190 120 Q200 180 190 230" />
                <path d="M150 120 V230" />
                <path d="M130 120 Q120 180 130 230" />
                <path d="M170 120 Q180 180 170 230" />
              </g>
            )}
             {hairStyle === 'afro' && headwear !== 'headwrap' && (
               <circle cx="150" cy="130" r="75" fill={hairColor} />
            )}

            {/* --- BODY --- */}
            <g transform="translate(150, 240)">
               {/* Neck */}
               <rect x="-25" y="-60" width="50" height="60" fill={skinTone} />
               <path d="M-25 -20 Q0 -10 25 -20" fill="rgba(0,0,0,0.1)" /> {/* Neck shadow */}
               
               {/* Shoulders/Torso */}
               <path 
                 d="M-60 0 Q-70 -20 -40 -40 L-25 -40 L25 -40 L40 -40 Q70 -20 60 0 L60 60 H-60 Z" 
                 fill={outfitStyle === 'madras' ? 'url(#madras)' : outfitStyle === 'uniform' ? '#FFFFFF' : outfitColor} 
               />

               {/* Outfit Details */}
               {outfitStyle === 'dashiki' && (
                 <g stroke="white" strokeWidth="2" fill="none">
                   <path d="M-25 -40 V-10 L0 10 L25 -10 V-40" strokeWidth="4" />
                   <path d="M0 10 V60" />
                   <circle cx="0" cy="25" r="3" fill="white" stroke="none"/>
                   <circle cx="0" cy="40" r="3" fill="white" stroke="none"/>
                 </g>
               )}

               {outfitStyle === 'uniform' && (
                 <g>
                    {/* Collar */}
                    <path d="M-25 -40 L-35 -30 L-25 -20 L0 -25 L25 -20 L35 -30 L25 -40" fill="#FFFFFF" stroke="#E0E0E0" />
                    {/* Tie */}
                    <path d="M-5 -25 L5 -25 L8 0 L0 10 L-8 0 Z" fill={outfitColor} />
                 </g>
               )}
               
               {outfitStyle === 'carnival' && (
                 <g>
                   <path d="M-25 -40 L0 -10 L25 -40" fill="none" stroke="#FFD700" strokeWidth="5" />
                   <circle cx="0" cy="-10" r="8" fill="#FFD700" />
                   <circle cx="0" cy="-10" r="4" fill={headwearColor} />
                 </g>
               )}

               {/* Arms */}
               <path d="M-60 0 L-60 60 L-30 60 L-30 40 Z" fill={skinTone} />
               <path d="M60 0 L60 60 L30 60 L30 40 Z" fill={skinTone} />
            </g>

            {/* --- HEAD --- */}
            <g transform="translate(150, 130)">
               {/* Ears */}
               <ellipse cx="-55" cy="10" rx="10" ry="15" fill={skinTone} />
               <ellipse cx="55" cy="10" rx="10" ry="15" fill={skinTone} />
               
               {/* Face Shape */}
               <path d="M-50 -40 Q-55 40 0 60 Q55 40 50 -40 Q50 -70 0 -70 Q-50 -70 -50 -40" fill={skinTone} />
               
               {/* Cheeks */}
               <circle cx="-30" cy="20" r="12" fill="#FF8A80" opacity="0.3" />
               <circle cx="30" cy="20" r="12" fill="#FF8A80" opacity="0.3" />

               {/* Eyes */}
               <g fill="#FFFFFF">
                 <ellipse cx="-20" cy="0" rx="12" ry="14" />
                 <ellipse cx="20" cy="0" rx="12" ry="14" />
               </g>
               <g fill="#3E2723">
                 <circle cx="-20" cy="0" r="6" />
                 <circle cx="20" cy="0" r="6" />
                 <circle cx="-18" cy="-2" r="2" fill="white" /> {/* Reflection */}
                 <circle cx="22" cy="-2" r="2" fill="white" />
               </g>
               
               {/* Eyebrows */}
               <g stroke="#3E2723" strokeWidth="3" strokeLinecap="round" fill="none">
                  <path d="M-30 -15 Q-20 -20 -10 -15" />
                  <path d="M10 -15 Q20 -20 30 -15" />
               </g>

               {/* Nose */}
               <path d="M-5 20 Q0 25 5 20" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />

               {/* Mouth */}
               <path d="M-15 35 Q0 45 15 35" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>

            {/* --- HAIR FRONT (On top of head) --- */}
            {headwear !== 'headwrap' && (
              <g transform="translate(150, 130)">
                 {hairStyle === 'fade' && (
                   <path d="M-50 -40 V-60 H50 V-40 Q50 -70 0 -70 Q-50 -70 -50 -40" fill={hairColor} />
                 )}
                 {hairStyle === 'short' && (
                   <path d="M-52 -30 Q-55 -80 0 -80 Q55 -80 52 -30 Q50 -50 0 -50 Q-50 -50 -52 -30" fill={hairColor} />
                 )}
                 {hairStyle === 'cornrows' && (
                   <g>
                      <path d="M-50 -40 Q-50 -70 0 -70 Q50 -70 50 -40 L50 -20 Q0 -30 -50 -20 Z" fill={hairColor} opacity="0.9"/>
                      <path d="M-40 -25 Q-20 -60 0 -60 Q20 -60 40 -25" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
                      <path d="M-20 -28 Q-10 -60 0 -60 Q10 -60 20 -28" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
                      <path d="M0 -30 V-60" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
                   </g>
                 )}
                 {hairStyle === 'bantu' && (
                   <g fill={hairColor}>
                     <path d="M-50 -40 Q-50 -70 0 -70 Q50 -70 50 -40" fill={hairColor} />
                     <circle cx="-30" cy="-60" r="10" />
                     <circle cx="0" cy="-65" r="10" />
                     <circle cx="30" cy="-60" r="10" />
                     <circle cx="-15" cy="-50" r="10" />
                     <circle cx="15" cy="-50" r="10" />
                   </g>
                 )}
                 {hairStyle === 'puffs' && (
                   <path d="M-50 -40 Q-50 -70 0 -70 Q50 -70 50 -40" fill={hairColor} />
                 )}
                 {hairStyle === 'braids' && (
                    <g fill={hairColor}>
                      <path d="M-50 -40 Q-50 -70 0 -70 Q50 -70 50 -40" />
                    </g>
                 )}
              </g>
            )}

            {/* --- HEADWEAR --- */}
            {headwear === 'headwrap' && (
               <g transform="translate(150, 130)">
                  <path d="M-55 -20 Q-60 -60 0 -70 Q60 -60 55 -20 Q50 -10 0 -10 Q-50 -10 -55 -20" fill={headwearColor} />
                  <path d="M-20 -50 Q0 -80 20 -50" fill={headwearColor} />
                  <circle cx="0" cy="-55" r="15" fill={headwearColor} />
                  {/* Fold details */}
                  <path d="M-50 -20 Q0 -30 50 -20" stroke="rgba(0,0,0,0.1)" strokeWidth="2" fill="none" />
               </g>
            )}
            {headwear === 'straw_hat' && (
              <g transform="translate(150, 130)">
                 <ellipse cx="0" cy="-40" rx="70" ry="20" fill="#E0C097" stroke="#8D6E63" strokeWidth="2" />
                 <path d="M-35 -40 Q-35 -90 0 -90 Q35 -90 35 -40" fill="#E0C097" stroke="#8D6E63" strokeWidth="2" />
                 <path d="M-35 -45 Q0 -35 35 -45" stroke={headwearColor} strokeWidth="10" fill="none" />
              </g>
            )}
             {headwear === 'snapback' && (
              <g transform="translate(150, 130)">
                 <path d="M-52 -35 Q-55 -70 0 -70 Q55 -70 52 -35" fill={headwearColor} />
                 <rect x="-40" y="-35" width="80" height="10" fill={headwearColor} />
                 <path d="M-50 -30 L50 -30 L40 -20 L-40 -20 Z" fill="#333" /> {/* Brim */}
              </g>
            )}

            {/* --- ACCESSORIES --- */}
            {accessory === 'glasses' && (
              <g transform="translate(150, 130)">
                 <g stroke="#333" strokeWidth="2" fill={outfitColor} fillOpacity="0.3">
                    <circle cx="-20" cy="0" r="14" />
                    <circle cx="20" cy="0" r="14" />
                 </g>
                 <line x1="-6" y1="0" x2="6" y2="0" stroke="#333" strokeWidth="2" />
              </g>
            )}
            {accessory === 'necklace' && (
              <g transform="translate(150, 240)">
                 <path d="M-20 -20 Q0 10 20 -20" stroke="#E0E0E0" strokeWidth="2" fill="none" />
                 <circle cx="0" cy="10" r="4" fill="white" stroke="#E0E0E0" strokeWidth="1" />
                 <path d="M-1 7 L1 7 L1 13 L-1 13 Z" fill="#5D4037" /> {/* Cowrie shell slit */}
              </g>
            )}
            {accessory === 'flower' && (
              <g transform="translate(200, 100)">
                 <path d="M0 0 Q10 -15 20 0 Q10 15 0 0" fill={outfitColor === '#F72585' ? '#FFD700' : '#F72585'} />
                 <path d="M0 0 Q-10 -15 -20 0 Q-10 15 0 0" fill={outfitColor === '#F72585' ? '#FFD700' : '#F72585'} />
                 <circle cx="0" cy="0" r="5" fill="white" />
              </g>
            )}
            {accessory === 'flag' && (
              <g transform="translate(220, 220) rotate(-10)">
                <rect width="40" height="25" fill="#CE1126" stroke="black" strokeWidth="1"/>
                <path d="M0 0 L40 25" stroke="black" strokeWidth="8" />
                <path d="M0 0 L40 25" stroke="white" strokeWidth="2" />
                <rect x="-2" y="0" width="4" height="60" fill="gray" />
              </g>
            )}
            {accessory === 'pan_sticks' && (
              <g transform="translate(90, 220)">
                <rect x="0" y="0" width="4" height="40" fill="#8D6E63" transform="rotate(-15)" />
                <circle cx="-5" cy="0" r="4" fill="#F72585" />
                <g transform="translate(120, 0)">
                   <rect x="0" y="0" width="4" height="40" fill="#8D6E63" transform="rotate(15)" />
                   <circle cx="7" cy="0" r="4" fill="#00B4D8" />
                </g>
              </g>
            )}

          </svg>
        </div>

        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-bold text-deep shadow-md border border-gray-100">
            Meet Your Legend
          </span>
        </div>
      </div>

      {/* Controls Area */}
      <div className="w-full lg:w-1/2 p-6 flex flex-col gap-5 overflow-y-auto max-h-[550px] hide-scrollbar bg-gray-50/50">
        <div className="flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur p-2 rounded-xl border border-gray-100 shadow-sm z-10">
          <div>
            <h3 className="font-heading font-bold text-xl text-deep">Style Your Legend</h3>
          </div>
          <div className="flex gap-2">
             <button 
               onClick={randomize}
               className="p-2 bg-gray-100 rounded-full text-primary hover:bg-primary hover:text-white transition-colors"
               title="Randomize"
             >
               <Shuffle size={20} />
             </button>
             <button 
               onClick={downloadCharacter}
               className="p-2 bg-primary text-white rounded-full hover:bg-orange-600 transition-colors shadow-sm"
               title="Download Image"
             >
               <Camera size={20} />
             </button>
          </div>
        </div>

        {/* --- TABS / SECTIONS --- */}

        {/* Skin Tone & Hair Color */}
        <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100">
          <label className="text-xs font-bold uppercase text-textLight tracking-wider block mb-2">Appearance</label>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Skin */}
            <div className="flex -space-x-2">
              {skinTones.map(tone => (
                <button
                  key={tone}
                  onClick={() => setSkinTone(tone)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 hover:z-10 relative ${skinTone === tone ? 'border-primary ring-2 ring-primary/30 z-10 scale-110' : 'border-white'}`}
                  style={{ backgroundColor: tone }}
                  aria-label="Select skin tone"
                />
              ))}
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            {/* Hair Color */}
            <div className="flex -space-x-2">
              {hairColors.map(color => (
                <button
                  key={color}
                  onClick={() => setHairColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 hover:z-10 relative ${hairColor === color ? 'border-primary ring-2 ring-primary/30 z-10 scale-110' : 'border-white'}`}
                  style={{ backgroundColor: color }}
                  aria-label="Select hair color"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Hair Styles */}
        <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-100">
           <label className="text-xs font-bold uppercase text-textLight tracking-wider block">Hair Style</label>
           <div className="grid grid-cols-4 gap-2">
             {['puffs', 'short', 'braids', 'locs', 'afro', 'cornrows', 'bantu', 'fade'].map(style => (
               <button
                 key={style}
                 onClick={() => setHairStyle(style)}
                 className={`px-1 py-2 rounded-lg text-[10px] sm:text-xs border font-medium capitalize transition-all ${hairStyle === style ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-gray-100 text-textLight hover:border-gray-300'}`}
               >
                 {style}
               </button>
             ))}
           </div>
        </div>

        {/* Headwear */}
        <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex justify-between items-center mb-2">
             <label className="text-xs font-bold uppercase text-textLight tracking-wider block">Headwear</label>
             {headwear !== 'none' && headwear !== 'straw_hat' && (
                <div className="flex gap-1">
                   {baseColors.slice(0, 5).map(c => (
                     <button key={c} onClick={() => setHeadwearColor(c)} className="w-4 h-4 rounded-full border border-gray-200" style={{backgroundColor: c}}></button>
                   ))}
                </div>
             )}
          </div>
          <div className="flex flex-wrap gap-2">
             {['none', 'headwrap', 'straw_hat', 'snapback'].map(hw => (
               <button
                 key={hw}
                 onClick={() => setHeadwear(hw)}
                 className={`px-3 py-2 rounded-lg text-xs border font-medium capitalize transition-all ${headwear === hw ? 'border-secondary bg-secondary/10 text-secondary shadow-sm' : 'border-gray-100 text-textLight hover:border-gray-300'}`}
               >
                 {hw.replace('_', ' ')}
               </button>
             ))}
           </div>
        </div>

        {/* Outfit */}
        <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-100">
          <label className="text-xs font-bold uppercase text-textLight tracking-wider block">Outfit Style</label>
          <div className="flex flex-wrap gap-2 mb-3">
             {['tshirt', 'dashiki', 'madras', 'uniform', 'carnival'].map(style => (
               <button
                 key={style}
                 onClick={() => setOutfitStyle(style)}
                 className={`flex-1 px-2 py-2 rounded-lg text-xs border font-medium capitalize transition-all ${outfitStyle === style ? 'border-accent bg-accent/10 text-accent shadow-sm' : 'border-gray-100 text-textLight hover:border-gray-300'}`}
               >
                 {style}
               </button>
             ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {baseColors.map(color => (
              <button
                key={color}
                onClick={() => setOutfitColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${outfitColor === color ? 'border-gray-400 ring-2 ring-gray-200' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
                aria-label="Select shirt color"
              />
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-100">
           <label className="text-xs font-bold uppercase text-textLight tracking-wider block">Accessory</label>
           <div className="flex flex-wrap gap-2">
             {[
               {id: 'none', label: 'None'},
               {id: 'flower', label: 'Hibiscus'},
               {id: 'flag', label: 'Trini Flag'},
               {id: 'glasses', label: 'Shades'},
               {id: 'pan_sticks', label: 'Pan Sticks'},
               {id: 'necklace', label: 'Shells'}
             ].map(acc => (
               <button
                 key={acc.id}
                 onClick={() => setAccessory(acc.id)}
                 className={`px-3 py-2 rounded-lg text-xs border font-medium transition-all ${accessory === acc.id ? 'border-success bg-success/10 text-success shadow-sm' : 'border-gray-100 text-textLight hover:border-gray-300'}`}
               >
                 {acc.label}
               </button>
             ))}
           </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 flex gap-3 mt-auto">
          <Button size="sm" fullWidth onClick={downloadCharacter}>
            <Download size={16} className="mr-2" /> Download Legend
          </Button>
          <button 
             onClick={() => {
               setSkinTone('#8D5524');
               setHairStyle('puffs');
               setOutfitStyle('tshirt');
               setOutfitColor('#FF6B35');
               setAccessory('none');
               setHeadwear('none');
             }}
             className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
             title="Reset"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterBuilder;