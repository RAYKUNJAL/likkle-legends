'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Agent {
  id: string; key: string; name: string; role: string;
  model: string | null; status: string; tier: string | null;
  description: string | null; capabilities: string[];
  auto_trigger: boolean; run_count: number; pending_approvals: number;
}

interface ActivityRow {
  id: string; created_at: string; agent_key: string; task_type: string | null;
  subject: string | null; action_summary: string; outcome: string;
  severity: string; requires_attention: boolean;
  linked_task_id: string | null; linked_run_id: string | null; meta: Record<string, unknown>;
}

interface TaskRow {
  id: string; type: string; priority: string; status: string;
  created_by: string; assigned_to: string;
  approval_required: boolean; created_at: string; updated_at: string;
  error: { message: string } | null;
}

interface Approval {
  id: string; task_id: string; approval_type: string; status: string;
  requested_by: string; action_summary: string | null; risk_level: string;
  created_at: string;
}

interface RunStats { total: number; success_runs: number; failed_runs: number; pending_approvals: number; }

interface TriggerResult {
  success: boolean; runId?: string; taskId?: string;
  result?: Record<string, unknown>; error?: string;
}

// ─── Output renderers — show actual agent work product ────────────────────────
function SocialPostsOutput({ posts }: { posts: { day: string; theme: string; caption: string; hashtags: string[]; suggestedTime: string }[] }) {
  return (
    <div className="space-y-3">
      <p className="text-emerald-400 text-xs font-bold">✅ Generated {posts.length} social posts for the week</p>
      {posts.map((p, i) => (
        <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold text-sm">{p.day}</span>
            <span className="text-white/40 text-xs">{p.suggestedTime}</span>
          </div>
          <p className="text-white/50 text-xs mb-2 italic">{p.theme}</p>
          <p className="text-white/80 text-xs leading-relaxed whitespace-pre-line">{p.caption}</p>
          <p className="text-blue-400/70 text-xs mt-2">{p.hashtags.join(' ')}</p>
        </div>
      ))}
    </div>
  );
}

function AdCopyOutput({ variants, character }: { variants: { headline: string; primary_text: string; cta: string }[]; character: { name: string } }) {
  return (
    <div className="space-y-3">
      <p className="text-emerald-400 text-xs font-bold">✅ Generated {variants.length} ad variants for {character?.name}</p>
      {variants.map((v, i) => (
        <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-white font-semibold text-sm mb-1">Variant {i + 1}</p>
          <p className="text-amber-300 text-xs font-bold mb-1">"{v.headline}"</p>
          <p className="text-white/70 text-xs leading-relaxed">{v.primary_text}</p>
          <span className="text-xs mt-2 inline-block bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">CTA: {v.cta}</span>
        </div>
      ))}
    </div>
  );
}

function ContentScheduleOutput({ scheduled, skipped, themes_used }: { scheduled: number; skipped: number; themes_used: string[] }) {
  return (
    <div className="space-y-2">
      {scheduled === 0 ? (
        <p className="text-amber-400 text-xs font-bold">⚡ Content already scheduled for this week ({skipped} dates already have content)</p>
      ) : (
        <p className="text-emerald-400 text-xs font-bold">✅ Scheduled {scheduled} content items for the week</p>
      )}
      {themes_used.length > 0 && (
        <div className="space-y-1">
          {themes_used.map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-white/60">
              <span className="text-white/30 shrink-0">→</span>{t}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GenericOutput({ data }: { data: Record<string, unknown> }) {
  if (data.acknowledged) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
        <p className="text-amber-300 text-sm font-bold mb-1">⚠️ Agent acknowledged — no execution endpoint yet</p>
        <p className="text-white/50 text-xs">Task and run records were created. This agent needs a real backend endpoint to do actual work. Coming in the next build.</p>
      </div>
    );
  }
  if (data.error && typeof data.error === 'string') {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
        <p className="text-red-400 text-sm font-bold">❌ {data.error}</p>
      </div>
    );
  }
  return (
    <pre className="text-xs text-white/50 font-mono whitespace-pre-wrap overflow-x-auto max-h-64 bg-white/5 rounded-xl p-3">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function OutputPanel({ agentKey, agentName, result, onClose }: {
  agentKey: string; agentName: string;
  result: TriggerResult; onClose: () => void;
}) {
  const output = result.result || {};

  const renderOutput = () => {
    if (!result.success && result.error) {
      return <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{result.error}</div>;
    }
    if (agentKey === 'social-agent' && Array.isArray(output.posts)) {
      return <SocialPostsOutput posts={output.posts as Parameters<typeof SocialPostsOutput>[0]['posts']} />;
    }
    if (agentKey === 'ad-copy-agent' && Array.isArray(output.variants)) {
      return <AdCopyOutput variants={output.variants as Parameters<typeof AdCopyOutput>[0]['variants']} character={output.character as { name: string }} />;
    }
    if ((agentKey === 'island-brain' || agentKey === 'story-agent') && 'scheduled' in output) {
      return <ContentScheduleOutput scheduled={output.scheduled as number} skipped={output.skipped as number} themes_used={output.themes_used as string[] || []} />;
    }
    return <GenericOutput data={output} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl bg-[#0D1B35] border border-white/15 rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${result.success ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-white font-bold">{agentName}</span>
              <span className="text-white/40 text-xs">run complete</span>
            </div>
            {result.runId && (
              <p className="text-white/25 text-xs font-mono mt-0.5">run: {result.runId.slice(0, 16)}…</p>
            )}
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white text-2xl leading-none transition">×</button>
        </div>

        {/* Output */}
        <div className="p-5 overflow-y-auto flex-1">
          <p className="text-white/40 text-xs font-semibold mb-3 uppercase tracking-wider">Agent Output</p>
          {renderOutput()}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-white/30 text-xs">All outputs are recorded in Supabase → agent_runs</p>
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TIER_ORDER = ['orchestrator', 'operations', 'specialist', 'growth', 'retention'];
const TIER_META: Record<string, { label: string; color: string }> = {
  orchestrator: { label: '🧩 Orchestrators',       color: '#8B5CF6' },
  operations:   { label: '⚙️ Operations Layer',     color: '#3B82F6' },
  specialist:   { label: '🎓 Content Specialists',  color: '#F59E0B' },
  growth:       { label: '📈 Growth & Marketing',   color: '#EF4444' },
  retention:    { label: '💰 Retention & Revenue',  color: '#10B981' },
};
const STATUS_DOT: Record<string, string> = {
  active: 'bg-emerald-400 animate-pulse', standby: 'bg-amber-400',
  needs_setup: 'bg-red-400', error: 'bg-red-500',
};
const STATUS_TEXT: Record<string, string> = {
  active: 'text-emerald-400', standby: 'text-amber-400',
  needs_setup: 'text-red-400', error: 'text-red-500',
};
const SEVERITY_CONFIG: Record<string, { bg: string; border: string; icon: string }> = {
  info:     { bg: 'bg-blue-400/5',    border: 'border-blue-400/20',    icon: 'ℹ️' },
  warning:  { bg: 'bg-amber-400/10',  border: 'border-amber-400/20',   icon: '⚠️' },
  error:    { bg: 'bg-red-400/10',    border: 'border-red-400/20',     icon: '❌' },
  critical: { bg: 'bg-red-600/15',    border: 'border-red-600/30',     icon: '🚨' },
};
const OUTCOME_COLOR: Record<string, string> = {
  success: 'text-emerald-400', error: 'text-red-400', failed: 'text-red-400',
  awaiting_approval: 'text-amber-400', approved: 'text-emerald-400', denied: 'text-red-400',
};

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d/60)}m ago`;
  if (d < 86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
}

// ─── Agent Card ───────────────────────────────────────────────────────────────
function AgentCard({ agent, triggerState, onTrigger }: {
  agent: Agent;
  triggerState: 'idle' | 'loading' | 'success' | 'error';
  onTrigger: (key: string) => void;
}) {
  const tierColor = TIER_META[agent.tier || '']?.color || '#6366F1';
  const isLoading = triggerState === 'loading';

  return (
    <div className="bg-[#0D1B35] border border-white/10 rounded-2xl p-4 flex flex-col gap-3 hover:border-white/20 transition-all"
      style={{ boxShadow: `0 0 0 1px ${tierColor}12` }}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-sm">{agent.name}</span>
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ring-1 ring-current ${STATUS_TEXT[agent.status] || 'text-white/40'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[agent.status] || 'bg-white/40'}`} />
              {agent.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-white/40 text-xs mt-0.5">{agent.role}</p>
        </div>
      </div>

      <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{agent.description}</p>

      <div className="flex items-center justify-between text-xs text-white/25 border-t border-white/5 pt-2">
        <span className="font-mono bg-white/5 px-2 py-0.5 rounded truncate max-w-[120px]">{agent.model || '—'}</span>
        <span>{agent.run_count} runs</span>
      </div>

      {agent.status !== 'needs_setup' ? (
        <button onClick={() => onTrigger(agent.key)} disabled={isLoading}
          className="w-full py-2.5 rounded-xl text-xs font-bold transition-all relative overflow-hidden"
          style={{
            background: triggerState === 'success' ? '#10B98122' : triggerState === 'error' ? '#EF444422' : `${tierColor}20`,
            color: triggerState === 'success' ? '#10B981' : triggerState === 'error' ? '#EF4444' : tierColor,
            border: `1px solid ${triggerState === 'success' ? '#10B98144' : triggerState === 'error' ? '#EF444444' : `${tierColor}40`}`,
          }}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Running...
            </span>
          ) : triggerState === 'success' ? '✓ Done — see output ↑'
            : triggerState === 'error' ? '✗ Failed — check log'
            : '▶ Run Agent'}
        </button>
      ) : (
        <div className="w-full py-2.5 rounded-xl text-xs text-center text-red-400/60 bg-red-500/5 border border-red-500/20">
          ⚙️ Setup required
        </div>
      )}
    </div>
  );
}

// ─── Task Board ───────────────────────────────────────────────────────────────
function TaskBoard({ tasks }: { tasks: Record<string, TaskRow[]> }) {
  const cols = [
    { key: 'queued', label: 'Queued', color: 'text-white/50' },
    { key: 'running', label: 'Running', color: 'text-blue-400' },
    { key: 'awaiting_approval', label: 'Needs Approval', color: 'text-amber-400' },
    { key: 'failed', label: 'Failed', color: 'text-red-400' },
    { key: 'done', label: 'Done', color: 'text-emerald-400' },
  ];
  return (
    <div className="bg-[#0D1B35] border border-white/10 rounded-2xl p-6">
      <h2 className="text-white font-black mb-5">📋 Task Board</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cols.map(col => (
          <div key={col.key}>
            <div className={`text-xs font-bold mb-2 ${col.color}`}>
              {col.label} ({(tasks[col.key] || []).length})
            </div>
            <div className="space-y-1.5">
              {(tasks[col.key] || []).length === 0 ? (
                <div className="text-white/20 text-xs italic py-2">empty</div>
              ) : (tasks[col.key] || []).slice(0, 6).map(t => (
                <div key={t.id} className="bg-white/5 border border-white/5 rounded-lg p-2">
                  <p className="text-white/70 text-xs font-medium truncate">
                    {t.type.replace('manual_trigger.', '').replace(/_/g, ' ')}
                  </p>
                  <p className="text-white/25 text-xs">{t.assigned_to} · {timeAgo(t.updated_at)}</p>
                  {t.error && <p className="text-red-400 text-xs mt-1 truncate">{t.error.message}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Approval Center ──────────────────────────────────────────────────────────
function ApprovalCenter({ approvals, onDecide }: {
  approvals: Approval[]; onDecide: (id: string, d: 'approved' | 'denied') => void;
}) {
  if (approvals.length === 0) return null;
  return (
    <div className="bg-[#0D1B35] border border-amber-500/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <h2 className="text-amber-300 font-black">⚡ Approval Center</h2>
        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">{approvals.length} pending</span>
      </div>
      <div className="space-y-3">
        {approvals.map(a => (
          <div key={a.id} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-white font-semibold text-sm">{a.requested_by.replace('-', ' ')}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{a.approval_type}</span>
              </div>
              {a.action_summary && <p className="text-white/60 text-xs">{a.action_summary}</p>}
              <p className="text-white/30 text-xs mt-1">{timeAgo(a.created_at)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => onDecide(a.id, 'denied')}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition">✗ Deny</button>
              <button onClick={() => onDecide(a.id, 'approved')}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition">✓ Approve</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Activity Stream ──────────────────────────────────────────────────────────
function ActivityStream({ logs, loading, onRefresh }: {
  logs: ActivityRow[]; loading: boolean; onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="bg-[#0D1B35] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-white font-black">Live Activity Stream</h2>
          <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{logs.length}</span>
        </div>
        <button onClick={onRefresh} disabled={loading}
          className="text-xs text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition">
          {loading ? '↻ Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🤖</div>
          <p className="text-white/40">Awaiting first successful run</p>
          <p className="text-white/25 text-xs mt-1">Trigger an agent above — every run writes a permanent record here.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {logs.map(log => {
            const cfg = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.info;
            const hasDetails = log.meta && Object.keys(log.meta).length > 0;
            const isOpen = expanded === log.id;
            return (
              <div key={log.id} className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
                <button className="w-full flex items-start gap-3 p-3 text-left"
                  onClick={() => hasDetails && setExpanded(isOpen ? null : log.id)}>
                  <span className="text-sm shrink-0 mt-0.5">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white/80 text-xs font-semibold">{log.agent_key.replace(/-/g, ' ')}</span>
                      {log.task_type && <span className="text-white/30 text-xs">· {log.task_type.replace(/_/g, ' ')}</span>}
                      <span className={`text-xs font-bold ml-auto ${OUTCOME_COLOR[log.outcome] || 'text-white/40'}`}>{log.outcome}</span>
                    </div>
                    <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{log.action_summary}</p>
                    {log.requires_attention && (
                      <span className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full mt-1 inline-block">needs attention</span>
                    )}
                  </div>
                  <div className="shrink-0 text-right ml-3">
                    <div className="text-white/25 text-xs whitespace-nowrap">{timeAgo(log.created_at)}</div>
                    {hasDetails && <div className="text-white/20 text-xs mt-0.5">{isOpen ? '▲' : '▼'}</div>}
                  </div>
                </button>
                {isOpen && hasDetails && (
                  <div className="border-t border-white/10 p-3">
                    <pre className="text-xs text-white/40 font-mono whitespace-pre-wrap overflow-x-auto max-h-48">
                      {JSON.stringify(log.meta, null, 2)}
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AgentTeamPage() {
  const [agents,      setAgents]      = useState<Agent[]>([]);
  const [stats,       setStats]       = useState<RunStats>({ total: 0, success_runs: 0, failed_runs: 0, pending_approvals: 0 });
  const [logs,        setLogs]        = useState<ActivityRow[]>([]);
  const [tasks,       setTasks]       = useState<Record<string, TaskRow[]>>({});
  const [approvals,   setApprovals]   = useState<Approval[]>([]);
  const [triggerStates, setTriggerStates] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});
  const [outputPanel, setOutputPanel] = useState<{ agentKey: string; agentName: string; result: TriggerResult } | null>(null);
  const [loading,     setLoading]     = useState({ agents: true, logs: true });
  const [filterTier,  setFilterTier]  = useState('all');
  const [activeTab,   setActiveTab]   = useState<'stream' | 'tasks' | 'approvals'>('stream');

  const fetchAgents = useCallback(async () => {
    try {
      const data = await fetch('/api/admin/agents').then(r => r.json());
      if (data.agents) { setAgents(data.agents); setStats(data.stats); }
    } catch { /**/ }
    setLoading(l => ({ ...l, agents: false }));
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await fetch('/api/admin/agent-activity?limit=100').then(r => r.json());
      if (data.logs) setLogs(data.logs);
    } catch { /**/ }
    setLoading(l => ({ ...l, logs: false }));
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const [td, ad] = await Promise.all([
        fetch('/api/admin/agent-tasks').then(r => r.json()),
        fetch('/api/admin/approvals').then(r => r.json()),
      ]);
      if (td.board) setTasks(td.board);
      if (ad.approvals) setApprovals(ad.approvals);
    } catch { /**/ }
  }, []);

  useEffect(() => {
    fetchAgents(); fetchLogs(); fetchTasks();
    const interval = setInterval(() => { fetchLogs(); fetchTasks(); fetchAgents(); }, 20_000);
    return () => clearInterval(interval);
  }, [fetchAgents, fetchLogs, fetchTasks]);

  const triggerAgent = async (key: string) => {
    const agent = agents.find(a => a.key === key);
    if (!agent) return;
    setTriggerStates(s => ({ ...s, [key]: 'loading' }));
    try {
      const res  = await fetch(`/api/admin/agents/${key}/trigger`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params: {} }),
      });
      const data: TriggerResult = await res.json();

      setTriggerStates(s => ({ ...s, [key]: data.success ? 'success' : 'error' }));

      // Open output panel immediately to show what happened
      setOutputPanel({ agentKey: key, agentName: agent.name, result: data });

      // Refresh data
      setTimeout(() => { fetchLogs(); fetchTasks(); fetchAgents(); }, 1500);
    } catch (err) {
      setTriggerStates(s => ({ ...s, [key]: 'error' }));
      setOutputPanel({ agentKey: key, agentName: agent.name, result: { success: false, error: (err as Error).message } });
    }
    setTimeout(() => setTriggerStates(s => ({ ...s, [key]: 'idle' })), 5000);
  };

  const decideApproval = async (id: string, decision: 'approved' | 'denied') => {
    try {
      await fetch(`/api/admin/approvals/${id}/${decision}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      fetchTasks(); fetchAgents();
    } catch { /**/ }
  };

  const tiers = TIER_ORDER.filter(t => agents.some(a => a.tier === t));
  const filteredAgents = filterTier === 'all' ? agents : agents.filter(a => a.tier === filterTier);

  return (
    <div className="min-h-screen bg-[#060D1F] text-white">

      {/* Output Panel */}
      {outputPanel && (
        <OutputPanel
          agentKey={outputPanel.agentKey}
          agentName={outputPanel.agentName}
          result={outputPanel.result}
          onClose={() => setOutputPanel(null)}
        />
      )}

      {/* Header */}
      <div className="border-b border-white/10 bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <a href="/admin/overview" className="text-white/40 hover:text-white text-sm transition">← Admin</a>
                <span className="text-white/20">/</span>
                <span className="text-white/60 text-sm">Agent OS</span>
              </div>
              <h1 className="text-3xl font-black text-white">🤖 Agent Operating System</h1>
              <p className="text-white/40 mt-1 text-sm">All runs recorded to Supabase — no fake data</p>
            </div>
            <div className="flex items-center gap-5 flex-wrap">
              {[
                { label: 'Total Runs',  value: stats.total,             color: 'text-white' },
                { label: 'Succeeded',   value: stats.success_runs,      color: 'text-emerald-400' },
                { label: 'Failed',      value: stats.failed_runs,       color: 'text-red-400' },
                { label: 'Pending',     value: stats.pending_approvals, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className={`text-2xl font-black tabular-nums ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-white/30">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {approvals.length > 0 && <ApprovalCenter approvals={approvals} onDecide={decideApproval} />}

        {/* Tier Filter + Grid */}
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {['all', ...TIER_ORDER].map(tier => (
              <button key={tier} onClick={() => setFilterTier(tier)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filterTier === tier ? 'bg-white text-[#060D1F]' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                {tier === 'all' ? '🌐 All' : TIER_META[tier]?.label || tier}
              </button>
            ))}
          </div>

          {loading.agents ? (
            <div className="text-center py-16 text-white/30">Loading agents...</div>
          ) : (
            (filterTier === 'all' ? tiers : [filterTier]).map(tierKey => {
              const tierAgents = filteredAgents.filter(a => a.tier === tierKey);
              if (tierAgents.length === 0) return null;
              return (
                <div key={tierKey}>
                  <h2 className="text-sm font-bold mb-3" style={{ color: TIER_META[tierKey]?.color }}>
                    {TIER_META[tierKey]?.label || tierKey}
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {tierAgents.map(agent => (
                      <AgentCard key={agent.key} agent={agent}
                        triggerState={triggerStates[agent.key] || 'idle'}
                        onTrigger={triggerAgent} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10">
          {([
            { key: 'stream',    label: `Activity (${logs.length})` },
            { key: 'tasks',     label: `Tasks (${Object.values(tasks).flat().length})` },
            { key: 'approvals', label: `Approvals (${approvals.length})`, warn: approvals.length > 0 },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 ${
                activeTab === tab.key ? 'border-white text-white bg-white/5' : 'border-transparent text-white/40 hover:text-white/70'
              } ${'warn' in tab && tab.warn ? 'text-amber-300' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'stream'    && <ActivityStream logs={logs} loading={loading.logs} onRefresh={fetchLogs} />}
        {activeTab === 'tasks'     && <TaskBoard tasks={tasks} />}
        {activeTab === 'approvals' && (
          approvals.length > 0 ? <ApprovalCenter approvals={approvals} onDecide={decideApproval} />
            : <div className="text-center py-16 text-white/30 bg-[#0D1B35] border border-white/10 rounded-2xl">No pending approvals</div>
        )}

        {/* Setup status */}
        <div className="bg-[#0D1B35] border border-amber-500/15 rounded-2xl p-5">
          <h2 className="text-amber-300/80 font-bold text-sm mb-3">⚡ Integration Status</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { label: 'Supabase Agent OS',       done: true,  desc: `${stats.total} runs recorded` },
              { label: 'Social Media Agent',       done: true,  desc: 'Generating 7-day post schedules' },
              { label: 'Ad Copywriter',            done: true,  desc: 'Generating variants per character' },
              { label: 'IslandBrain (content)',    done: true,  desc: 'Scheduling weekly themes' },
              { label: 'Manus Webhook URL',        done: false, desc: 'Add to Vercel env vars' },
              { label: 'Meta Ads Access Token',    done: false, desc: 'Meta Business → System Users' },
              { label: 'Operations agents',        done: false, desc: 'Product Operator, SRE, Finance, Support — endpoints coming next' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2 bg-white/5 rounded-lg p-2.5">
                <span>{item.done ? '✅' : '🔴'}</span>
                <div>
                  <p className="text-white/70 text-xs font-semibold">{item.label}</p>
                  <p className="text-white/30 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
