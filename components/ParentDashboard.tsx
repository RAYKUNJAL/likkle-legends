"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, Settings } from 'lucide-react';
import { useUser } from './UserContext';
import { getParentSuggestions } from '../lib/gemini';

const ParentDashboard: React.FC = () => {
  const { user, activeChild, canAccess } = useUser();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const locked = !canAccess('legends_plus');

  const loadMissions = useCallback(async () => {
    if (!activeChild) return;
    setLoading(true);
    const data = await getParentSuggestions(
      activeChild.age_track === 'mini' ? '4-5' : '6-8',
      "Steel Pan making craft",
      new Date().toLocaleString('default', { month: 'long' })
    );
    setMissions(data);
    setLoading(false);
  }, [activeChild]);

  useEffect(() => {
    if (!locked && activeChild) {
      loadMissions();
    }
  }, [locked, activeChild?.age_track, loadMissions, activeChild]);

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

          {/* Tier Badge */}
          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2 text-xs">
            <span className="font-bold text-textLight uppercase px-2">Current Plan:</span>
            <span className={`px-3 py-1 rounded-full font-bold ${canAccess('legends_plus') ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
              }`}>
              {user?.subscription_tier.replace('_', ' ') || 'Free'}
            </span>
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
                  <Link
                    href="/checkout?plan=legends_plus"
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                  >
                    Upgrade to Legends Plus
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg text-white">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl">Weekly Unity Missions</h3>
                  <p className="text-sm text-textLight">AI-generated based on {activeChild?.first_name}'s progress</p>
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
            <div className="bg-deep text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
              <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                <Calendar size={18} /> Next Box
              </h3>
              <div className="bg-white/10 rounded-xl p-4 mb-4 relative z-10">
                <p className="text-xs text-gray-300 uppercase tracking-wider mb-1">Theme</p>
                <p className="font-bold text-lg">Carnival Colors 🎭</p>
              </div>
              <div className="flex justify-between text-sm text-gray-300 border-t border-white/10 pt-4 relative z-10">
                <span>Shipping</span>
                <span className="text-white font-bold">In 5 Days</span>
              </div>
            </div>

            {/* Child Profile Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-heading font-bold text-lg mb-4 text-text flex items-center gap-2">
                🌟 Active Legend
              </h3>
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl">
                <div className="text-3xl">{activeChild?.total_xp && activeChild.total_xp > 1000 ? '🦁' : '🐣'}</div>
                <div>
                  <p className="font-black text-text">{activeChild?.first_name || 'Your Legend'}</p>
                  <p className="text-[10px] text-textLight font-bold uppercase tracking-widest">{activeChild?.age_track === 'mini' ? 'Mini Legend (4-5)' : 'Big Legend (6-8)'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-textLight font-bold">Total XP</span>
                  <span className="font-black text-primary">{activeChild?.total_xp.toLocaleString()} XP</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-textLight font-bold">Primary Island</span>
                  <span className="font-black text-secondary">{activeChild?.primary_island}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-heading font-bold text-lg mb-4 text-text flex items-center gap-2">
                <Settings size={18} /> Village Safety Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-textLight">Audio Narrations</span>
                  <button className="w-10 h-6 bg-primary rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-textLight">Patois Intensity</span>
                  <select className="text-xs bg-gray-50 border-none rounded-lg p-1 font-bold">
                    <option>Gentle</option>
                    <option>Full Flavor</option>
                  </select>
                </div>
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <button className="text-[10px] font-black uppercase text-red-500 tracking-widest hover:underline">
                    Data Deletion Request
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-3xl p-6 border-2 border-dashed border-blue-100">
              <h4 className="font-heading font-black text-blue-950 text-sm mb-2">Heritage Resources</h4>
              <p className="text-xs text-blue-900/60 font-bold mb-4">Download Tanty's Guide to Caribbean Storytelling at Home.</p>
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl text-xs font-black shadow-lg">Download PDF</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParentDashboard;