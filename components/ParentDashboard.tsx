import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Settings } from 'lucide-react';
import { useUser } from './UserContext';
import { getParentSuggestions } from '../lib/gemini';
import Button from './Button';

const ParentDashboard: React.FC = () => {
  const { user, isLocked, upgradeTier, setAgeGroup } = useUser();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const locked = isLocked('legends_plus');

  useEffect(() => {
    if (!locked) {
      loadMissions();
    }
  }, [locked, user.ageGroup]);

  const loadMissions = async () => {
    setLoading(true);
    const data = await getParentSuggestions(
      user.ageGroup === 'mini' ? '4-5' : '6-8',
      "Steel Pan making craft",
      new Date().toLocaleString('default', { month: 'long' })
    );
    setMissions(data);
    setLoading(false);
  };

  return (
    <section id="parents" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
           <div>
              <span className="text-deep font-bold tracking-widest text-sm uppercase mb-2 block">For Parents</span>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-text">
                Parent Co-pilot Dashboard
              </h2>
           </div>
           
           {/* Demo Controls */}
           <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2 text-xs">
              <span className="font-bold text-textLight uppercase px-2">Demo Settings:</span>
              <select 
                value={user.tier} 
                onChange={(e) => upgradeTier(e.target.value as any)}
                className="p-1 border rounded"
              >
                <option value="mail_club">Mail Club ($10)</option>
                <option value="legends_plus">Legends Plus ($24)</option>
              </select>
              <select 
                value={user.ageGroup} 
                onChange={(e) => setAgeGroup(e.target.value as any)}
                className="p-1 border rounded"
              >
                <option value="mini">Mini (4-5)</option>
                <option value="big">Big (6-8)</option>
              </select>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Co-pilot Section */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 relative overflow-hidden">
               {locked && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-center p-8">
                    <Sparkles size={48} className="text-primary mb-4" />
                    <h3 className="font-heading font-bold text-2xl text-deep mb-2">Unlock Your AI Co-pilot</h3>
                    <p className="text-textLight mb-6 max-w-md">Get personalized weekly missions, conversation starters, and activity ideas tailored to your child's age and progress.</p>
                    <Button onClick={() => upgradeTier('legends_plus')}>
                      Upgrade to Legends Plus
                    </Button>
                  </div>
               )}
               
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg text-white">
                   <Sparkles size={20} />
                 </div>
                 <div>
                   <h3 className="font-heading font-bold text-xl">Weekly Unity Missions</h3>
                   <p className="text-sm text-textLight">AI-generated based on {user.name}'s progress</p>
                 </div>
               </div>

               {loading ? (
                 <div className="space-y-4 animate-pulse">
                   <div className="h-24 bg-gray-100 rounded-xl"></div>
                   <div className="h-24 bg-gray-100 rounded-xl"></div>
                   <div className="h-24 bg-gray-100 rounded-xl"></div>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {missions.map((mission, idx) => (
                     <div key={idx} className="border border-gray-100 rounded-xl p-5 hover:border-primary/30 transition-colors flex gap-4 items-start group bg-gray-50/50">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 font-bold text-gray-400 group-hover:text-primary group-hover:border-primary transition-colors">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                             <h4 className="font-bold text-text">{mission.title}</h4>
                             <span className="text-[10px] uppercase font-bold tracking-wider bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">{mission.type}</span>
                          </div>
                          <p className="text-sm text-textLight">{mission.description}</p>
                        </div>
                     </div>
                   ))}
                   {!locked && missions.length === 0 && <p>No missions loaded. Check API key.</p>}
                 </div>
               )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             <div className="bg-deep text-white rounded-3xl p-6 shadow-xl">
               <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                 <Calendar size={18} /> Next Box
               </h3>
               <div className="bg-white/10 rounded-xl p-4 mb-4">
                 <p className="text-xs text-gray-300 uppercase tracking-wider mb-1">Theme</p>
                 <p className="font-bold text-lg">Carnival Colors 🎭</p>
               </div>
               <div className="flex justify-between text-sm text-gray-300 border-t border-white/10 pt-4">
                 <span>Shipping</span>
                 <span className="text-white font-bold">In 5 Days</span>
               </div>
             </div>

             <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
               <h3 className="font-heading font-bold text-lg mb-4 text-text flex items-center gap-2">
                 <Settings size={18} /> Child Profile
               </h3>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-textLight">Name</span>
                    <span className="font-bold text-text">{user.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-textLight">Age Group</span>
                    <span className="font-bold text-text bg-gray-100 px-2 py-1 rounded">
                      {user.ageGroup === 'mini' ? 'Mini (4-5)' : 'Big (6-8)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-textLight">Plan</span>
                    <span className={`font-bold px-2 py-1 rounded ${user.tier === 'legends_plus' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                      {user.tier === 'legends_plus' ? 'Legends+' : 'Mail Club'}
                    </span>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParentDashboard;