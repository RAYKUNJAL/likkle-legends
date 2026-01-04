import React from 'react';
import Image from 'next/image';
import { ShoppingBag, Gift, ArrowRight } from 'lucide-react';
import Button from '../components/Button';

// --- SHARED HEADER ---
const ShopHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
   <div className="bg-deep text-white py-16 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      <div className="container mx-auto px-4 relative z-10">
         <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">{title}</h1>
         <p className="text-xl text-gray-300 max-w-2xl mx-auto">{subtitle}</p>
      </div>
   </div>
);

// --- PAST BOXES ---
export const PastBoxes: React.FC = () => {
   const boxes = [
      { title: "Carnival Colors", price: "$35", img: "https://picsum.photos/id/1018/400/300", tag: "Limited Stock" },
      { title: "Rainforest Explorers", price: "$35", img: "https://picsum.photos/id/1039/400/300", tag: "Sold Out" },
      { title: "Instrument Makers", price: "$35", img: "https://picsum.photos/id/1056/400/300", tag: "Bestseller" },
   ];

   return (
      <div className="bg-background min-h-screen pb-20">
         <ShopHeader title="Shop Past Adventures" subtitle="Missed a month? Catch up on the fun with our single-purchase boxes." />
         <div className="container mx-auto px-4 mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {boxes.map((box, idx) => (
                  <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group">
                     <div className="relative h-64 overflow-hidden">
                        <Image src={box.img} alt={box.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        {box.tag && (
                           <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md ${box.tag === 'Sold Out' ? 'bg-gray-500' : 'bg-primary'}`}>
                              {box.tag}
                           </span>
                        )}
                     </div>
                     <div className="p-6">
                        <h3 className="font-heading font-bold text-xl text-deep mb-2">{box.title}</h3>
                        <div className="flex justify-between items-center">
                           <span className="text-lg font-bold text-primary">{box.price}</span>
                           <Button size="sm" variant={box.tag === 'Sold Out' ? 'outline' : 'primary'} disabled={box.tag === 'Sold Out'} className={box.tag === 'Sold Out' ? 'opacity-50 !border-gray-300 !text-gray-400' : ''}>
                              {box.tag === 'Sold Out' ? 'Unavailable' : 'Add to Cart'}
                           </Button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

// --- MERCHANDISE ---
export const Merchandise: React.FC = () => {
   const items = [
      { name: "Likkle Legends Tee", price: "$25", img: "https://picsum.photos/id/338/400/400" },
      { name: "Dilly Doubles Plushie", price: "$28", img: "https://picsum.photos/id/1062/400/400" },
      { name: "Explorer Tote Bag", price: "$18", img: "https://picsum.photos/id/445/400/400" },
      { name: "Character Sticker Pack", price: "$8", img: "https://picsum.photos/id/1080/400/400" },
   ];

   return (
      <div className="bg-background min-h-screen pb-20">
         <ShopHeader title="Official Merch" subtitle="Wear your pride on your sleeve (literally) with our exclusive gear." />
         <div className="container mx-auto px-4 mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {items.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                     <div className="rounded-xl overflow-hidden aspect-square mb-4 bg-gray-100 relative">
                        <Image src={item.img} alt={item.name} fill className="object-cover" />
                     </div>
                     <h3 className="font-heading font-bold text-text mb-1">{item.name}</h3>
                     <p className="text-textLight mb-3">{item.price}</p>
                     <Button size="sm" variant="outline" fullWidth className="!border-gray-200 hover:!border-primary">View Details</Button>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

// --- GIFT SUBSCRIPTION ---
export const GiftSubscription: React.FC = () => {
   return (
      <div className="bg-background min-h-screen pb-20">
         <div className="bg-secondary text-white py-16 text-center">
            <div className="container mx-auto px-4">
               <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <Gift size={40} />
               </div>
               <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">Give the Gift of Culture</h1>
               <p className="text-xl text-white/90 max-w-2xl mx-auto">The perfect birthday or holiday present for the little legend in your life.</p>
            </div>
         </div>

         <div className="container mx-auto px-4 -mt-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
               {[3, 6, 12].map((months) => (
                  <div key={months} className="bg-white p-8 rounded-3xl shadow-xl border-2 border-transparent hover:border-secondary transition-all text-center flex flex-col">
                     <h3 className="font-heading font-bold text-2xl text-deep mb-2">{months} Month Gift</h3>
                     <p className="text-textLight mb-6">One-time payment</p>
                     <div className="text-4xl font-bold text-primary mb-2">${months * 24 - 5}</div>
                     <p className="text-xs text-gray-400 mb-8">Save ${5 * (months / 3)}</p>

                     <ul className="text-left space-y-3 mb-8 flex-1">
                        <li className="flex gap-2 text-sm text-text"><span className="text-secondary">✓</span> {months} Physical Boxes</li>
                        <li className="flex gap-2 text-sm text-text"><span className="text-secondary">✓</span> Full Digital Access</li>
                        <li className="flex gap-2 text-sm text-text"><span className="text-secondary">✓</span> Personalized Gift Note</li>
                     </ul>

                     <Button fullWidth variant="secondary">Gift This Plan</Button>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};