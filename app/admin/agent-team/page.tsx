'use client';

import React, { useState, useEffect } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Agent {
  id: string;
  name: string;
  role: string;
  tier: 'orchestrator' | 'specialist' | 'growth' | 'retention';
  description: string;
  model: string;
  status: 'active' | 'standby' | 'needs_setup' | 'error';
  lastRun: string;
  capabilities: string[];
  triggerAction: string | null;
  icon: string;
  color: string;
  badge?: string;
}

interface TriggerState {
  [agentId: string]: 'idle' | 'loading' | 'success' | 'error';
}

// ─── Tier Labels ───────────────────────────────────────────────────────────────
const TIER_META: Record<string, { label: string; description: string; order: number }> = {
  orchestrator: {
    label: '🧩 Tier 1 — Orchestrators',
    description: 'Master coordinators that route tasks and manage sub-agents',
    order: 0,
  },
  specialist: {
    label: '🎓 Tier 2 — Content Specialists',
    description: 'Deep domain experts generating stories, blogs, and curriculum',
    order: 1,
  },
  growth: {
    label: '📈 Tier 3 — Growth & Marketing',
    description: 'Paid ads, organic social, and creative production',
    order: 2,
  },
  retention: {
    label: '💰 Tier 4 — Retention & Revenue',
    description: 'Email nurture, analytics, and conversion optimisation',
    order: 3,
  },
};

const STATUS_CONFIG = {
  active: { label: 'Active', dot: 'bg-emerald-400', text: 'text-emerald-400', ring: 'ring-emerald-400/30' },
  standby: { label: 'Standby', dot: 'bg-amber-400', text: 'text-amber-400', ring: 'ring-amber-400/30' },
  needs_setup: { label: 'Needs Setup', dot: 'bg-red-400', text: 'text-red-400', ring: 'ring-red-400/30' },
  error: { label: 'Error', dot: 'bg-red-500', text: 'text-red-500', ring: 'ring-red-500/30' },
};

// ─── Manus Launch Modal ────────────────────────────────────────────────────────
function ManusLaunchModal({
  onClose,
  onLaunch,
  loading,
  result,
}: {
  onClose: () => void;
  onLaunch: (budget: number) => void;
  loading: boolean;
  result: any;
}) {
  const [budget, setBudget] = useState(3.34);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0D1B35] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📣</span>
            <div>
              <h2 className="text-white font-bold text-lg">Launch Manus Ad Agent</h2>
              <p className="text-white/80 text-sm">Autonomous Meta ad management for Caribbean diaspora</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-6">
          {!result ? (
            <>
              {/* Budget config */}
              <div>
                <label className="block text-white/70 text-sm mb-2 font-medium">Daily Budget (USD)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={budget}
                    onChange={e => setBudget(parseFloat(e.target.value))}
                    className="flex-1 accent-orange-500"
                  />
                  <span className="text-white font-bold text-xl w-20 text-right">${budget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>~$30/mo min</span>
                  <span>~$600/mo max</span>
                </div>
              </div>

              {/* Budget split */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-blue-400 text-2xl font-black">${(budget * 0.6).toFixed(2)}</div>
                  <div className="text-white/60 text-xs mt-1">60% Cold (TOFU)<br />Caribbean diaspora cities</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-orange-400 text-2xl font-black">${(budget * 0.4).toFixed(2)}</div>
                  <div className="text-white/60 text-xs mt-1">40% Retargeting (MOFU)<br />Pixel visitors + leads</div>
                </div>
              </div>

              {/* What Manus will do */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
                <p className="text-white/80 text-sm font-semibold mb-3">✅ Manus will autonomously manage:</p>
                {[
                  'Creative rotation across 5 characters (R.O.T.I., Tanty, Dilly, Sam, Mango)',
                  'Audience expansion in 11 Caribbean diaspora cities + 20 island nations',
                  'Bid optimisation — pause if CPC > $3.00 or CTR < 0.5%',
                  'Budget scaling when ROAS exceeds 4× target',
                  'Daily performance reports sent to your webhook',
                  'A/B testing ad copy variants (TOFU / MOFU / BOFU)',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Env warning */}
              {!process.env.NEXT_PUBLIC_META_PIXEL_ID && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-300 text-sm">
                  ⚠️ Add <code className="bg-white/10 px-1 rounded">MANUS_WEBHOOK_URL</code> to Vercel env vars to activate live Manus handoff. Brief will be prepared and stored locally until configured.
                </div>
              )}

              <button
                onClick={() => onLaunch(budget)}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition text-lg"
              >
                {loading ? '🤖 Sending to Manus...' : '🚀 Launch Manus Ad Agent'}
              </button>
            </>
          ) : (
            /* Result state */
            <div className="text-center py-6 space-y-4">
              <div className="text-5xl">{result.success ? '🎉' : '❌'}</div>
              <h3 className="text-white font-bold text-xl">
                {result.success ? 'Brief Sent to Manus!' : 'Handoff Failed'}
              </h3>
              <p className="text-white/60 text-sm max-w-md mx-auto">{result.result?.message}</p>
              {result.result?.manusTaskId && (
                <div className="inline-block bg-white/10 rounded-lg px-4 py-2 text-sm text-white/70 font-mono">
                  Task ID: {result.result.manusTaskId}
                </div>
              )}
              <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10">
                <p className="text-white/50 text-xs mb-2 font-semibold">NEXT STEPS:</p>
                {result.success ? (
                  <ul className="space-y-1 text-sm text-white/60">
                    <li>→ Manus will begin managing your Meta ad account</li>
                    <li>→ Check Meta Ads Manager for new campaigns (PAUSED by default)</li>
                    <li>→ Review and activate campaigns in Meta Business Suite</li>
                    <li>→ Daily reports will arrive at /api/manus/webhook</li>
                  </ul>
                ) : (
                  <ul className="space-y-1 text-sm text-white/60">
                    <li>→ Add MANUS_WEBHOOK_URL to Vercel environment variables</li>
                    <li>→ Get your Manus webhook URL from manus.im dashboard</li>
                    <li>→ Brief data has been logged — retry when configured</li>
                  </ul>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Agent Card ────────────────────────────────────────────────────────────────
function AgentCard({
  agent,
  triggerState,
  onTrigger,
  onLaunchManus,
}: {
  agent: Agent;
  triggerState: TriggerState;
  onTrigger: (agent: Agent) => void;
  onLaunchManus: () => void;
}) {
  const status = STATUS_CONFIG[agent.status];
  const tState = triggerState[agent.id] || 'idle';

  return (
    <div
      className="relative bg-[#0D1B35] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/20 transition-all group"
      style={{ boxShadow: `0 0 0 1px ${agent.color}15` }}
    >
      {/* Badge */}
      {agent.badge && (
        <div className="absolute top-3 right-3">
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
            {agent.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: `${agent.color}22`, border: `1px solid ${agent.color}44` }}
        >
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-bold text-sm">{agent.name}</h3>
            <span
              className={`flex items-center gap-1 text-xs font-medium ring-1 px-2 py-0.5 rounded-full ${status.text} ${status.ring}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${agent.status === 'active' ? 'animate-pulse' : ''}`} />
              {status.label}
            </span>
          </div>
          <p className="text-white/50 text-xs mt-0.5">{agent.role}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-white/60 text-xs leading-relaxed line-clamp-3">{agent.description}</p>

      {/* Model + Last run */}
      <div className="flex items-center justify-between text-xs text-white/40 border-t border-white/5 pt-3">
        <span className="font-mono bg-white/5 px-2 py-0.5 rounded">{agent.model}</span>
        <span>Last: {agent.lastRun}</span>
      </div>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1">
        {agent.capabilities.slice(0, 4).map(cap => (
          <span
            key={cap}
            className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40"
          >
            {cap.replace(/_/g, ' ')}
          </span>
        ))}
        {agent.capabilities.length > 4 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/30">
            +{agent.capabilities.length - 4} more
          </span>
        )}
      </div>

      {/* Trigger Button */}
      {agent.triggerAction && (
        <button
          onClick={() => agent.id === 'manus-ad-manager' ? onLaunchManus() : onTrigger(agent)}
          disabled={tState === 'loading'}
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: tState === 'success'
              ? '#10B98122'
              : tState === 'error'
              ? '#EF444422'
              : `${agent.color}22`,
            color: tState === 'success'
              ? '#10B981'
              : tState === 'error'
              ? '#EF4444'
              : agent.color,
            border: `1px solid ${tState === 'success' ? '#10B98144' : tState === 'error' ? '#EF444444' : `${agent.color}44`}`,
          }}
        >
          {tState === 'loading' ? '⏳ Running...'
            : tState === 'success' ? '✓ Done!'
            : tState === 'error' ? '✗ Failed — retry'
            : agent.id === 'manus-ad-manager' ? '🚀 Launch Manus'
            : '▶ Trigger Agent'}
        </button>
      )}

      {!agent.triggerAction && (
        <div className="w-full py-2.5 rounded-xl text-xs text-center text-white/20 bg-white/5 border border-white/5">
          Always-on agent — no manual trigger needed
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AgentTeamPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggerStates, setTriggerStates] = useState<TriggerState>({});
  const [showManusModal, setShowManusModal] = useState(false);
  const [manusLoading, setManusLoading] = useState(false);
  const [manusResult, setManusResult] = useState<any>(null);
  const [filterTier, setFilterTier] = useState<string>('all');
  const [log, setLog] = useState<string[]>([]);

  // Fetch agent roster
  useEffect(() => {
    fetch('/api/admin/agents?action=status')
      .then(r => r.json())
      .then(data => {
        if (data.agents) setAgents(data.agents);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addLog = (msg: string) => {
    setLog(prev => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev].slice(0, 20));
  };

  const triggerAgent = async (agent: Agent) => {
    if (!agent.triggerAction) return;

    setTriggerStates(s => ({ ...s, [agent.id]: 'loading' }));
    addLog(`Triggering ${agent.name}...`);

    try {
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: agent.triggerAction, agentId: agent.id }),
      });
      const data = await res.json();

      if (data.success) {
        setTriggerStates(s => ({ ...s, [agent.id]: 'success' }));
        addLog(`✓ ${agent.name} completed successfully`);
      } else {
        setTriggerStates(s => ({ ...s, [agent.id]: 'error' }));
        addLog(`✗ ${agent.name} failed: ${data.error || 'Unknown error'}`);
      }
    } catch {
      setTriggerStates(s => ({ ...s, [agent.id]: 'error' }));
      addLog(`✗ ${agent.name} — network error`);
    }

    // Reset after 4s
    setTimeout(() => setTriggerStates(s => ({ ...s, [agent.id]: 'idle' })), 4000);
  };

  const launchManus = async (budget: number) => {
    setManusLoading(true);
    addLog(`🚀 Sending ad brief to Manus AI (budget: $${budget.toFixed(2)}/day)...`);

    try {
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'launch_manus', params: { dailyBudget: budget } }),
      });
      const data = await res.json();
      setManusResult(data);
      addLog(data.success ? '✓ Manus brief sent!' : `✗ Manus failed: ${data.error}`);
    } catch {
      setManusResult({ success: false, result: { message: 'Network error — could not reach Manus endpoint' } });
      addLog('✗ Manus — network error');
    } finally {
      setManusLoading(false);
    }
  };

  // Stats
  const activeCount = agents.filter(a => a.status === 'active').length;
  const needsSetup = agents.filter(a => a.status === 'needs_setup').length;
  const tiers = Object.entries(TIER_META).sort((a, b) => a[1].order - b[1].order);
  const filteredAgents = filterTier === 'all' ? agents : agents.filter(a => a.tier === filterTier);

  return (
    <div className="min-h-screen bg-[#060D1F] text-white">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-white/10 bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <a href="/admin/overview" className="text-white/40 hover:text-white text-sm transition">
                  ← Admin
                </a>
                <span className="text-white/20">/</span>
                <span className="text-white/60 text-sm">Agent Team</span>
              </div>
              <h1 className="text-3xl font-black text-white">🤖 AI Agent Team</h1>
              <p className="text-white/50 mt-1 text-sm">
                Your full squad of AI agents scaling Likkle Legends to $1M ARR
              </p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-black text-emerald-400">{activeCount}</div>
                <div className="text-xs text-white/40">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-white/60">{agents.length - activeCount - needsSetup}</div>
                <div className="text-xs text-white/40">Standby</div>
              </div>
              {needsSetup > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-black text-red-400">{needsSetup}</div>
                  <div className="text-xs text-white/40">Needs Setup</div>
                </div>
              )}
              <button
                onClick={() => { setManusResult(null); setShowManusModal(true); }}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 rounded-xl font-bold text-sm transition shadow-lg shadow-red-500/20"
              >
                🚀 Launch Manus
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* ── Manus Call-out Banner ───────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/60 to-orange-950/60 p-6">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="text-4xl">🤖</div>
            <div className="flex-1">
              <h2 className="text-white font-black text-lg">
                Activate Manus AI — Autonomous Meta Ad Manager
              </h2>
              <p className="text-white/60 text-sm mt-1 max-w-2xl">
                Manus is purpose-built for Facebook/Instagram ad management. Once activated, it will autonomously A/B test your 5 Caribbean characters, optimise bids, rotate creatives, and scale winning ads — all targeting your Caribbean diaspora audience in 11 US cities + 20 island nations. Your $100 seed budget goes further with AI-driven optimisation.
              </p>
            </div>
            <button
              onClick={() => { setManusResult(null); setShowManusModal(true); }}
              className="shrink-0 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl font-bold text-white hover:from-red-400 hover:to-orange-400 transition shadow-lg"
            >
              Configure & Launch →
            </button>
          </div>
        </div>

        {/* ── Tier Filter ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {['all', 'orchestrator', 'specialist', 'growth', 'retention'].map(tier => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filterTier === tier
                  ? 'bg-white text-[#060D1F]'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {tier === 'all' ? '🌐 All Agents' : TIER_META[tier]?.label?.split(' — ')[0] || tier}
            </button>
          ))}
        </div>

        {/* ── Agent Grid by Tier ──────────────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-20 text-white/40">Loading agent roster...</div>
        ) : (
          tiers.map(([tierKey, tierMeta]) => {
            const tierAgents = filteredAgents.filter(a => a.tier === tierKey);
            if (tierAgents.length === 0) return null;

            return (
              <div key={tierKey}>
                <div className="mb-4">
                  <h2 className="text-white font-black text-lg">{tierMeta.label}</h2>
                  <p className="text-white/40 text-sm">{tierMeta.description}</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tierAgents.map(agent => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      triggerState={triggerStates}
                      onTrigger={triggerAgent}
                      onLaunchManus={() => { setManusResult(null); setShowManusModal(true); }}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* ── Architecture Diagram ────────────────────────────────────────── */}
        <div className="bg-[#0D1B35] border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-black text-lg mb-6">🗺️ Agent Architecture — How They Work Together</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[600px] space-y-4">
              {/* Flow diagram */}
              {[
                {
                  title: 'INBOUND TRAFFIC',
                  items: ['Meta Ads (Manus)', 'Organic Social', 'Email / Referrals'],
                  bg: 'from-red-950/60 to-orange-950/60',
                  border: 'border-red-500/30',
                  icon: '📥',
                },
                {
                  title: 'ANANSI CORE — User Intelligence Layer',
                  items: ['Intent routing', 'Memory extraction', 'Personalisation'],
                  bg: 'from-purple-950/60 to-indigo-950/60',
                  border: 'border-purple-500/30',
                  icon: '🕷️',
                },
                {
                  title: 'ISLANDBRAIN — Content Director',
                  items: ['Story Agent', 'Blog Writer', 'Module Manager', 'Social Agent'],
                  bg: 'from-blue-950/60 to-cyan-950/60',
                  border: 'border-blue-500/30',
                  icon: '🧠',
                },
                {
                  title: 'RETENTION LAYER — Keep & Grow Revenue',
                  items: ['Email Nurture', 'Analytics Agent', 'Growth Agent', 'Ad Copywriter'],
                  bg: 'from-emerald-950/60 to-teal-950/60',
                  border: 'border-emerald-500/30',
                  icon: '💰',
                },
              ].map((layer, i) => (
                <React.Fragment key={i}>
                  <div className={`rounded-xl bg-gradient-to-r ${layer.bg} border ${layer.border} p-4`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span>{layer.icon}</span>
                      <span className="text-white font-bold text-sm">{layer.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {layer.items.map(item => (
                        <span key={item} className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60">{item}</span>
                      ))}
                    </div>
                  </div>
                  {i < 3 && (
                    <div className="text-center text-white/30 text-lg">↓</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ── Activity Log ────────────────────────────────────────────────── */}
        {log.length > 0 && (
          <div className="bg-[#0D1B35] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Activity Log
            </h2>
            <div className="space-y-1 font-mono text-xs">
              {log.map((entry, i) => (
                <div key={i} className="text-white/50">{entry}</div>
              ))}
            </div>
          </div>
        )}

        {/* ── Setup Checklist ──────────────────────────────────────────────── */}
        <div className="bg-[#0D1B35] border border-amber-500/20 rounded-2xl p-6">
          <h2 className="text-amber-300 font-black text-lg mb-4">⚡ Setup Checklist — Unlock Full Agent Power</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { key: 'MANUS_WEBHOOK_URL', label: 'Manus Webhook URL', desc: 'From manus.im → Your Project → Webhook', critical: true },
              { key: 'META_ADS_ACCESS_TOKEN', label: 'Meta Ads Access Token', desc: 'Meta Business → System Users → Generate Token', critical: true },
              { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', desc: 'For GPT-4o ad copy generation', critical: false },
              { key: 'META_PAGE_ID', label: 'Meta Page ID (61587732686874)', desc: 'Already added ✓', critical: false },
              { key: 'META_AD_ACCOUNT_ID', label: 'Meta Ad Account (act_1445727133389527)', desc: 'Already added ✓', critical: false },
              { key: 'NEXT_PUBLIC_META_PIXEL_ID', label: 'Meta Pixel (4385961946335645)', desc: 'Already added ✓', critical: false },
            ].map(item => (
              <div key={item.key} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                <span className="text-lg mt-0.5">
                  {item.key.includes('PAGE_ID') || item.key.includes('AD_ACCOUNT') || item.key.includes('PIXEL')
                    ? '✅' : item.critical ? '🔴' : '🟡'}
                </span>
                <div>
                  <p className="text-white/80 text-sm font-semibold">{item.label}</p>
                  <p className="text-white/40 text-xs mt-0.5 font-mono">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Manus Modal ─────────────────────────────────────────────────────── */}
      {showManusModal && (
        <ManusLaunchModal
          onClose={() => setShowManusModal(false)}
          onLaunch={launchManus}
          loading={manusLoading}
          result={manusResult}
        />
      )}
    </div>
  );
}
