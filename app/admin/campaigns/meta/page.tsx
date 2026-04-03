'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, RefreshCw, AlertCircle, CheckCircle2, Copy,
  ExternalLink, Target, Users, DollarSign, Sparkles, Pause,
  BarChart3,
} from 'lucide-react';

interface AdConfig {
  configured: boolean;
  adAccountId: string | null;
  pageId: string | null;
  pixelId: string | null;
  hasAccessToken: boolean;
  characters: Array<{ id: string; name: string; imageFile: string; hook: string; targetEmotion: string; bestForStage: string }>;
  copyTemplates: Record<string, { headlines: string[]; descriptions: string[]; ctas: string[] }>;
}

interface AdVariant {
  headline: string;
  primary_text: string;
  description: string;
  cta: string;
  emotional_hook: string;
}

const CHARACTER_IMAGES: Record<string, string> = {
  tanty_spice: '/games/images/tanty_spice_avatar.jpg',
  roti: '/games/images/roti-new.jpg',
  dilly_doubles: '/games/images/dilly-doubles.jpg',
  mango_moko: '/games/images/mango_moko.png',
  steelpan_sam: '/games/images/steelpan_sam.png',
};

export default function MetaCampaignsPage() {
  const [config, setConfig] = useState<AdConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [launchResult, setLaunchResult] = useState<any>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [budget, setBudget] = useState(100);
  const [selectedChar, setSelectedChar] = useState('tanty_spice');
  const [selectedStage, setSelectedStage] = useState<'tofu' | 'mofu' | 'bofu'>('tofu');
  const [generatedCopy, setGeneratedCopy] = useState<{ variants: AdVariant[]; imageUrl: string; character: any } | null>(null);
  const [tab, setTab] = useState<'launch' | 'creative' | 'targeting'>('launch');

  useEffect(() => {
    fetch('/api/meta/ads?action=config')
      .then(r => r.json()).then(setConfig).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleLaunch = async () => {
    setLaunching(true); setLaunchError(null);
    try {
      const res = await fetch('/api/meta/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'launch_caribbean', budgetUSD: budget }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLaunchResult(data);
    } catch (e: any) { setLaunchError(e.message); }
    finally { setLaunching(false); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/ads/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: selectedStage, character: selectedChar, count: 4 }) });
      setGeneratedCopy(await res.json());
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  const missing = [
    !config?.adAccountId && 'META_AD_ACCOUNT_ID',
    !config?.pageId && 'META_PAGE_ID',
    !config?.hasAccessToken && 'META_ADS_ACCESS_TOKEN',
    !config?.pixelId && 'NEXT_PUBLIC_META_PIXEL_ID',
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black mb-1 flex items-center gap-2">
              <span className="text-blue-400">📣</span> Meta Ads Agent
            </h1>
            <p className="text-slate-400">AI-powered Caribbean diaspora campaign launcher</p>
          </div>
          <a href="https://business.facebook.com/adsmanager" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-colors">
            <ExternalLink className="w-4 h-4" /> Open Ads Manager
          </a>
        </div>

        {/* Config status */}
        {missing.length > 0 ? (
          <div className="mb-6 p-5 bg-amber-900/30 border border-amber-500/40 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300 mb-2">Add to Vercel Environment Variables:</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {missing.map(v => <code key={v} className="px-2 py-1 bg-black/30 rounded text-amber-300 text-xs font-mono">{v}</code>)}
                </div>
                <p className="text-amber-200/60 text-xs">Get from: business.facebook.com → Settings → Ad Accounts & Pages</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-3 bg-green-900/20 border border-green-500/30 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm font-bold">Meta Ads Connected</span>
            <span className="text-slate-500 text-xs ml-auto">{config?.adAccountId}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 bg-slate-800/50 rounded-2xl p-1">
          {[
            { id: 'launch', label: 'Launch Campaign', icon: Zap },
            { id: 'creative', label: 'AI Copy Generator', icon: Sparkles },
            { id: 'targeting', label: 'Targeting Map', icon: Target },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <t.icon className="w-4 h-4" /><span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* LAUNCH TAB */}
        {tab === 'launch' && (
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 space-y-5">
            <div>
              <h2 className="text-xl font-black flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-green-400" />Caribbean Diaspora Launch
              </h2>
              <p className="text-slate-400 text-sm">2 campaigns · US cities + islands · 4 character ads · All start PAUSED for review.</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">Total Budget</span>
                <span className="text-2xl font-black text-green-400">${budget}</span>
              </div>
              <input type="range" min={50} max={500} step={10} value={budget} onChange={e => setBudget(+e.target.value)} className="w-full accent-blue-500" />
              <div className="flex justify-between text-xs text-slate-500 mt-1"><span>$50</span><span>$500</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/20">
                <p className="text-xs text-blue-300 font-bold uppercase mb-1">Cold Traffic (60%)</p>
                <p className="text-2xl font-black">${Math.round(budget * 0.6)}</p>
                <p className="text-xs text-slate-400 mt-1">US diaspora cities + Caribbean islands</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-900/20 border border-purple-500/20">
                <p className="text-xs text-purple-300 font-bold uppercase mb-1">Retargeting (40%)</p>
                <p className="text-2xl font-black">${Math.round(budget * 0.4)}</p>
                <p className="text-xs text-slate-400 mt-1">30-day website visitors</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-300">
              {[
                '3 character creatives: Tanty Spice, R.O.T.I, Dilly Doubles',
                'Caribbean interests + behavioral targeting',
                'Miami · NYC · Newark · Hartford · Atlanta · Houston · DC',
                'All ads PAUSED — activate after review in Ads Manager',
              ].map((t, i) => <p key={i} className="flex items-center gap-2"><span className="text-blue-400">→</span>{t}</p>)}
            </div>

            {launchError && <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-sm">{launchError}</div>}

            {launchResult && (
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                <p className="font-bold text-green-300 flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4" />Campaigns Created!</p>
                <p className="text-green-200/70 text-sm mb-3">{launchResult.summary}</p>
                <a href="https://business.facebook.com/adsmanager" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-bold transition-colors">
                  Review & Activate <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <button onClick={handleLaunch} disabled={launching || !config?.configured}
              className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
              style={{ background: config?.configured ? 'linear-gradient(135deg,#1877F2,#0d5fc4)' : 'rgb(51,65,85)' }}>
              {launching ? <><RefreshCw className="w-5 h-5 animate-spin" />Creating...</>
                : <><Zap className="w-5 h-5" />{config?.configured ? `Launch $${budget} Campaign` : 'Configure Meta Ads First'}</>}
            </button>
          </div>
        )}

        {/* CREATIVE TAB */}
        {tab === 'creative' && (
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 space-y-5">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />AI Ad Copy Generator
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {config?.characters.filter(c => CHARACTER_IMAGES[c.id]).map(char => (
                <button key={char.id} onClick={() => setSelectedChar(char.id)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all ${selectedChar === char.id ? 'border-purple-500 scale-105' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                  <img src={CHARACTER_IMAGES[char.id]} alt={char.name} className="w-full h-20 object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <p className="absolute bottom-1 left-0 right-0 text-center text-white text-[10px] font-black">{char.name}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {(['tofu', 'mofu', 'bofu'] as const).map(s => (
                <button key={s} onClick={() => setSelectedStage(s)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${selectedStage === s ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                  {s === 'tofu' ? '🎯 Cold' : s === 'mofu' ? '🔥 Warm' : '💳 Hot'}
                </button>
              ))}
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 transition-colors disabled:opacity-50">
              {generating ? <><RefreshCw className="w-4 h-4 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4" />Generate 4 Variants</>}
            </button>

            {generatedCopy?.variants?.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="p-4 bg-slate-700/40 rounded-xl border border-slate-600/30">
                <div className="flex justify-between items-start gap-3 mb-1.5">
                  <p className="font-black text-white">{v.headline}</p>
                  <button onClick={() => navigator.clipboard.writeText(`${v.headline}\n\n${v.primary_text}\n\n${v.description}`)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0" title="Copy">
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
                <p className="text-slate-300 text-sm mb-2">{v.primary_text}</p>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold">{v.cta}</span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold">{v.emotional_hook}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* TARGETING TAB */}
        {tab === 'targeting' && (
          <div className="space-y-4">
            <div className="p-5 bg-blue-900/20 border border-blue-500/20 rounded-2xl">
              <p className="font-black text-blue-300 mb-3 text-sm uppercase tracking-wider flex items-center gap-2"><Users className="w-4 h-4" />US Caribbean Diaspora Cities</p>
              <div className="flex flex-wrap gap-2">
                {['Miami FL','Fort Lauderdale FL','Orlando FL','Brooklyn NY','Bronx NY','Newark NJ','Hartford CT','Atlanta GA','Houston TX','Washington DC','Boston MA'].map(c => (
                  <span key={c} className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-xs font-bold">{c}</span>
                ))}
              </div>
            </div>
            <div className="p-5 bg-green-900/20 border border-green-500/20 rounded-2xl">
              <p className="font-black text-green-300 mb-3 text-sm uppercase tracking-wider flex items-center gap-2"><Target className="w-4 h-4" />Caribbean Islands Direct</p>
              <div className="flex flex-wrap gap-2">
                {['Trinidad & Tobago','Jamaica','Barbados','Guyana','St. Lucia','Grenada','Antigua','Bahamas','Dominican Republic','Haiti','Belize','St. Kitts'].map(c => (
                  <span key={c} className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-xs font-bold">{c}</span>
                ))}
              </div>
            </div>
            <div className="p-5 bg-purple-900/20 border border-purple-500/20 rounded-2xl">
              <p className="font-black text-purple-300 mb-3 text-sm uppercase tracking-wider flex items-center gap-2"><Sparkles className="w-4 h-4" />Interest Targeting</p>
              <div className="flex flex-wrap gap-2">
                {['Caribbean','Caribbean culture','Reggae music','Soca music','Calypso','Steelpan','Parenting',"Children's education",'Early childhood ed','Jamaican culture','Trinidad & Tobago'].map(c => (
                  <span key={c} className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-xs font-bold">{c}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[['25–44', 'Age Range'], ['All Genders', 'Gender'], ['English', 'Language']].map(([val, lbl]) => (
                <div key={lbl} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                  <p className="text-xl font-black text-white">{val}</p>
                  <p className="text-xs text-slate-400 mt-1">{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
