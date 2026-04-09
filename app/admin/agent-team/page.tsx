'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Agent {
  id: string; name: string; role: string;
  tier: 'orchestrator' | 'specialist' | 'growth' | 'retention';
  description: string; model: string;
  status: 'active' | 'standby' | 'needs_setup' | 'error';
  lastRun: string; capabilities: string[];
  triggerAction: string | null; icon: string; color: string; badge?: string;
}

interface AgentLog {
  id: string; agent_id: string; agent_name: string;
  action: string; status: 'started' | 'success' | 'error';
  summary: string | null; details: Record<string, unknown>;
  duration_ms: number | null; triggered_by: string;
  created_at: string;
}

interface TriggerState { [agentId: string]: 'idle' | 'loading' | 'success' | 'error'; }

const TIER_META: Record<string, { label: string; description: string; order: number }> = {
  orchestrator: { label: '🧩 Tier 1 — Orchestrators', description: 'Master coordinators that route tasks and manage sub-agents', order: 0 },
  specialist:   { label: '🎓 Tier 2 — Content Specialists', description: 'Deep domain experts generating stories, blogs, and curriculum', order: 1 },
  growth:       { label: '📈 Tier 3 — Growth & Marketing', description: 'Paid ads, organic social, and creative production', order: 2 },
  retention:    { label: '💰 Tier 4 — Retention & Revenue', description: 'Email nurture, analytics, and conversion optimisation', order: 3 },
};

const STATUS_CONFIG = {
  active:      { label: 'Active',      dot: 'bg-emerald-400', text: 'text-emerald-400', ring: 'ring-emerald-400/30' },
  standby:     { label: 'Standby',     dot: 'bg-amber-400',   text: 'text-amber-400',   ring: 'ring-amber-400/30' },
  needs_setup: { label: 'Needs Setup', dot: 'bg-red-400',     text: 'text-red-400',     ring: 'ring-red-400/30' },
  error:       { label: 'Error',       dot: 'bg-red-500',     text: 'text-red-500',     ring: 'ring-red-500/30' },
};

const LOG_STATUS_CONFIG = {
  started: { icon: '⏳', color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20' },
  success: { icon: '✅', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  error:   { icon: '❌', color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20' },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function AgentCard({ agent, triggerState, onTrigger, onLaunchManus }: {
  agent: Agent; triggerState: TriggerState;
  onTrigger: (a: Agent) => void; onLaunchManus: () => void;
}) {
  const status = STATUS_CONFIG[agent.status];
  const tState = triggerState[agent.id] || 'idle';
  return (
    <div className="relative bg-[#0D1B35] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/20 transition-all"
      style={{ boxShadow: `0 0 0 1px ${agent.color}15` }}>
      {agent.badge && (
        <div className="absolute top-3 right-3">
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">{agent.badge}</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: `${agent.color}22`, border: `1px solid ${agent.color}44` }}>{agent.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-bold text-sm">{agent.name}</h3>
            <span className={`flex items-center gap-1 text-xs font-medium ring-1 px-2 py-0.5 rounded-full ${status.text} ${status.ring}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${agent.status === 'active' ? 'animate-pulse' : ''}`} />
              {status.label}
            </span>
          </div>
          <p className="text-white/50 text-xs mt-0.5">{agent.role}</p>
        </div>
      </div>
      <p className="text-white/60 text-xs leading-relaxed line-clamp-3">{agent.description}</p>
      <div className="flex items-center justify-between text-xs text-white/40 border-t border-white/5 pt-3">
        <span className="font-mono bg-white/5 px-2 py-0.5 rounded">{agent.model}</span>
        <span>Last: {agent.lastRun}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {agent.capabilities.slice(0, 4).map(cap => (
          <span key={cap} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40">{cap.replace(/_/g, ' ')}</span>
        ))}
        {agent.capabilities.length > 4 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/30">+{agent.capabilities.length - 4} more</span>
        )}
      </div>
      {agent.triggerAction ? (
        <button onClick={() => agent.id === 'manus-ad-manager' ? onLaunchManus() : onTrigger(agent)}
          disabled={tState === 'loading'}
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: tState === 'success' ? '#10B98122' : tState === 'error' ? '#EF444422' : `${agent.color}22`,
            color: tState === 'success' ? '#10B981' : tState === 'error' ? '#EF4444' : agent.color,
            border: `1px solid ${tState === 'success' ? '#10B98144' : tState === 'error' ? '#EF444444' : `${agent.color}44`}`,
          }}>
          {tState === 'loading' ? '⏳ Running...' : tState === 'success' ? '✓ Done!' : tState === 'error' ? '✗ Failed — retry'
            : agent.id === 'manus-ad-manager' ? '🚀 Launch Manus' : '▶ Trigger Agent'}
        </button>
      ) : (
        <div className="w-full py-2.5 rounded-xl text-xs text-center text-white/20 bg-white/5 border border-white/5">
          Always-on — no manual trigger needed
        </div>
      )}
    </div>
  );
}

function LiveActivityLog({ logs, loading, onRefresh }: {
  logs: AgentLog[]; loading: boolean; onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading && logs.length === 0) {
    return (
      <div className="bg-[#0D1B35] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-white font-bold text-sm">Live Activity Log</h2>
        </div>
        <div className="text-white/30 text-sm text-center py-8">Loading agent history...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1B35] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-white font-bold">Live Activity Log</h2>
          <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{logs.length} entries</span>
        </div>
        <button onClick={onRefresh} disabled={loading}
          className="text-xs text-white/40 hover:text-white/70 transition flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg">
          {loading ? '↻ Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="text-4xl">🤖</div>
          <p className="text-white/40 text-sm">No agent activity yet.</p>
          <p className="text-white/25 text-xs max-w-sm mx-auto">
            Trigger an agent above or wait for the Monday 9AM cron to run. All activity will appear here with full details.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => {
            const cfg = LOG_STATUS_CONFIG[log.status];
            const isOpen = expanded === log.id;
            const hasDetails = log.details && Object.keys(log.details).length > 0;
            return (
              <div key={log.id} className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
                <button className="w-full flex items-start gap-3 p-3 text-left"
                  onClick={() => hasDetails && setExpanded(isOpen ? null : log.id)}>
                  <span className="text-sm mt-0.5 shrink-0">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold ${cfg.color}`}>{log.agent_name}</span>
                      <span className="text-white/30 text-xs">·</span>
                      <span className="text-white/50 text-xs">{log.action.replace(/_/g, ' ')}</span>
                      {log.triggered_by === 'manual' && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/20">manual</span>
                      )}
                    </div>
                    {log.summary && <p className="text-white/60 text-xs mt-1 leading-relaxed">{log.summary}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-white/30 text-xs">{timeAgo(log.created_at)}</div>
                    {log.duration_ms != null && (
                      <div className="text-white/20 text-xs">{log.duration_ms < 1000 ? `${log.duration_ms}ms` : `${(log.duration_ms / 1000).toFixed(1)}s`}</div>
                    )}
                    {hasDetails && (
                      <div className="text-white/20 text-xs mt-1">{isOpen ? '▲ less' : '▼ details'}</div>
                    )}
                  </div>
                </button>
                {isOpen && hasDetails && (
                  <div className="border-t border-white/10 p-3">
                    <pre className="text-xs text-white/40 font-mono whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AgentTeamPage() {
  const [agents, setAgents]           = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [triggerStates, setTriggerStates] = useState<TriggerState>({});
  const [showManusModal, setShowManusModal] = useState(false);
  const [filterTier, setFilterTier]   = useState<string>('all');
  const [logs, setLogs]               = useState<AgentLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [sessionLog, setSessionLog]   = useState<string[]>([]);

  const addSessionLog = (msg: string) =>
    setSessionLog(prev => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev].slice(0, 10));

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/admin/agent-logs?limit=50');
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch { /* silent */ }
    finally { setLogsLoading(false); }
  }, []);

  useEffect(() => {
    fetch('/api/admin/agents?action=status')
      .then(r => r.json())
      .then(data => { if (data.agents) setAgents(data.agents); })
      .catch(() => {})
      .finally(() => setAgentsLoading(false));
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30_000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const triggerAgent = async (agent: Agent) => {
    if (!agent.triggerAction) return;
    setTriggerStates(s => ({ ...s, [agent.id]: 'loading' }));
    addSessionLog(`Triggering ${agent.name}...`);
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: agent.triggerAction, agentId: agent.id, params: { triggered_by: 'manual' } }),
      });
      const data = await res.json();
      if (data.success) {
        setTriggerStates(s => ({ ...s, [agent.id]: 'success' }));
        addSessionLog(`✓ ${agent.name} completed`);
        setTimeout(fetchLogs, 2000);
      } else {
        setTriggerStates(s => ({ ...s, [agent.id]: 'error' }));
        addSessionLog(`✗ ${agent.name} failed: ${data.error || 'Unknown error'}`);
      }
    } catch {
      setTriggerStates(s => ({ ...s, [agent.id]: 'error' }));
      addSessionLog(`✗ ${agent.name} — network error`);
    }
    setTimeout(() => setTriggerStates(s => ({ ...s, [agent.id]: 'idle' })), 4000);
  };

  const activeCount  = agents.filter(a => a.status === 'active').length;
  const needsSetup   = agents.filter(a => a.status === 'needs_setup').length;
  const tiers        = Object.entries(TIER_META).sort((a, b) => a[1].order - b[1].order);
  const filteredAgents = filterTier === 'all' ? agents : agents.filter(a => a.tier === filterTier);

  const successCount = logs.filter(l => l.status === 'success').length;
  const errorCount   = logs.filter(l => l.status === 'error').length;
  const lastRunAt    = logs[0] ? timeAgo(logs[0].created_at) : 'Never';

  return (
    <div className="min-h-screen bg-[#060D1F] text-white">
      <div className="border-b border-white/10 bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <a href="/admin/overview" className="text-white/40 hover:text-white text-sm transition">← Admin</a>
                <span className="text-white/20">/</span>
                <span className="text-white/60 text-sm">Agent Team</span>
              </div>
              <h1 className="text-3xl font-black text-white">🤖 AI Agent Team</h1>
              <p className="text-white/50 mt-1 text-sm">Your full squad of AI agents scaling Likkle Legends to $1M ARR</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-center">
                <div className="text-2xl font-black text-emerald-400">{activeCount}</div>
                <div className="text-xs text-white/40">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-blue-400">{successCount}</div>
                <div className="text-xs text-white/40">Total Runs</div>
              </div>
              {errorCount > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-black text-red-400">{errorCount}</div>
                  <div className="text-xs text-white/40">Errors</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-sm font-black text-white/60">{lastRunAt}</div>
                <div className="text-xs text-white/40">Last Run</div>
              </div>
              <button onClick={() => setShowManusModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 rounded-xl font-bold text-sm transition shadow-lg shadow-red-500/20">
                🚀 Launch Manus
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* Tier Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'orchestrator', 'specialist', 'growth', 'retention'].map(tier => (
            <button key={tier} onClick={() => setFilterTier(tier)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filterTier === tier ? 'bg-white text-[#060D1F]' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}>
              {tier === 'all' ? '🌐 All Agents' : TIER_META[tier]?.label?.split(' — ')[0] || tier}
            </button>
          ))}
        </div>

        {/* Agent Grid */}
        {agentsLoading ? (
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
                    <AgentCard key={agent.id} agent={agent} triggerState={triggerStates}
                      onTrigger={triggerAgent} onLaunchManus={() => setShowManusModal(true)} />
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* Session Log (ephemeral, this session only) */}
        {sessionLog.length > 0 && (
          <div className="bg-[#0D1B35] border border-white/10 rounded-2xl p-4">
            <p className="text-white/40 text-xs font-semibold mb-2">THIS SESSION</p>
            <div className="space-y-1 font-mono text-xs">
              {sessionLog.map((e, i) => <div key={i} className="text-white/50">{e}</div>)}
            </div>
          </div>
        )}

        {/* Persistent Supabase Log */}
        <LiveActivityLog logs={logs} loading={logsLoading} onRefresh={fetchLogs} />

        {/* Setup Checklist */}
        <div className="bg-[#0D1B35] border border-amber-500/20 rounded-2xl p-6">
          <h2 className="text-amber-300 font-black text-lg mb-4">⚡ Setup Checklist</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { key: 'MANUS_WEBHOOK_URL',           label: 'Manus Webhook URL',              desc: 'From manus.im → Your Project → Webhook',        critical: true },
              { key: 'META_ADS_ACCESS_TOKEN',        label: 'Meta Ads Access Token',          desc: 'Meta Business → System Users → Generate Token', critical: true },
              { key: 'OPENAI_API_KEY',               label: 'OpenAI API Key',                 desc: 'For GPT-4o ad copy generation',                  critical: false },
              { key: 'NEXT_PUBLIC_SITE_URL',         label: 'NEXT_PUBLIC_SITE_URL',           desc: 'Set to https://www.likklelegends.com in Vercel ✓', critical: false },
              { key: 'META_PAGE_ID',                 label: 'Meta Page ID (61587...)',        desc: 'Already added ✓',                                critical: false },
              { key: 'NEXT_PUBLIC_META_PIXEL_ID',    label: 'Meta Pixel (43859...)',          desc: 'Already added ✓',                                critical: false },
            ].map(item => (
              <div key={item.key} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                <span className="text-lg mt-0.5">
                  {!item.critical || item.desc.includes('✓') ? '✅' : item.critical ? '🔴' : '🟡'}
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

      {showManusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0D1B35] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">🚀 Launch Manus Ad Agent</h2>
              <button onClick={() => setShowManusModal(false)} className="text-white/40 hover:text-white text-2xl">×</button>
            </div>
            <p className="text-white/60 text-sm">Add <code className="bg-white/10 px-1 rounded">MANUS_WEBHOOK_URL</code> to Vercel env vars then trigger from the agent card below.</p>
            <button onClick={() => setShowManusModal(false)}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
