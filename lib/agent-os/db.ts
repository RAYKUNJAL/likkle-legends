/**
 * Agent OS — typed Supabase helpers
 * All queries go through the admin client (service role).
 * Never returns invented/fake data — if table is empty returns [].
 */
import { createAdminClient } from '@/lib/admin';

export type AgentStatus = 'active' | 'standby' | 'needs_setup' | 'error';
export type TaskStatus   = 'queued' | 'running' | 'blocked' | 'awaiting_approval' | 'done' | 'failed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type ApprovalType = 'publish' | 'refund' | 'deploy' | 'pricing' | 'ad_budget' | 'data_delete' | 'code_merge';
export type Severity     = 'info' | 'warning' | 'error' | 'critical';

export interface Agent {
  id: string; key: string; name: string; role: string;
  model: string | null; status: AgentStatus; tier: string | null;
  description: string | null; capabilities: string[];
  auto_trigger: boolean; approval_policy: Record<string,boolean> | null;
  config: Record<string,unknown>; created_at: string; updated_at: string;
}

export interface AgentTask {
  id: string; type: string; priority: TaskPriority; status: TaskStatus;
  created_by: string; assigned_to: string;
  subject_type: string | null; subject_id: string | null;
  depends_on: string[]; input: Record<string,unknown>;
  output: Record<string,unknown> | null; artifact_ids: string[];
  approval_required: boolean; approval_type: string | null;
  approval_status: string | null; run_id: string | null;
  error: Record<string,unknown> | null;
  created_at: string; updated_at: string;
}

export interface AgentRun {
  id: string; agent_key: string; task_id: string | null;
  trigger_type: string; trigger_source: string | null; status: string;
  input_payload: Record<string,unknown>; tool_calls: unknown[];
  output_payload: Record<string,unknown> | null;
  token_usage: Record<string,unknown> | null; cost_estimate: number | null;
  error: Record<string,unknown> | null;
  started_at: string; completed_at: string | null;
}

export interface ActivityLogRow {
  id: string; created_at: string; agent_key: string;
  task_type: string | null; subject: string | null;
  action_summary: string; outcome: string; severity: Severity;
  requires_attention: boolean;
  linked_task_id: string | null; linked_run_id: string | null;
  linked_artifact_id: string | null; linked_user_id: string | null;
  linked_campaign_id: string | null; meta: Record<string,unknown>;
}

export interface Approval {
  id: string; task_id: string; approval_type: string; status: string;
  requested_by: string; decided_by: string | null; rationale: string | null;
  action_summary: string | null; risk_level: string;
  created_at: string; decided_at: string | null;
}

const db = () => createAdminClient();

// ── Agents ────────────────────────────────────────────────────────────────────
export async function getAgents(): Promise<Agent[]> {
  const { data, error } = await db().from('agents').select('*').order('tier').order('name');
  if (error) throw error;
  return (data || []) as Agent[];
}

export async function getAgentByKey(key: string): Promise<Agent | null> {
  const { data } = await db().from('agents').select('*').eq('key', key).maybeSingle();
  return data as Agent | null;
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export async function createTask(task: Omit<AgentTask,'id'|'created_at'|'updated_at'>): Promise<AgentTask> {
  const { data, error } = await db().from('agent_tasks').insert(task).select().single();
  if (error) throw error;
  return data as AgentTask;
}

export async function updateTask(id: string, patch: Partial<AgentTask>): Promise<void> {
  const { error } = await db().from('agent_tasks').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function getTasksByStatus(statuses: TaskStatus[]): Promise<AgentTask[]> {
  const { data, error } = await db().from('agent_tasks').select('*')
    .in('status', statuses).order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return (data || []) as AgentTask[];
}

// ── Runs ──────────────────────────────────────────────────────────────────────
export async function startRun(agentKey: string, taskId: string | null, triggerType: string, triggerSource: string, inputPayload: Record<string,unknown>): Promise<AgentRun> {
  const { data, error } = await db().from('agent_runs').insert({
    agent_key: agentKey, task_id: taskId, trigger_type: triggerType,
    trigger_source: triggerSource, status: 'running', input_payload: inputPayload,
  }).select().single();
  if (error) throw error;
  return data as AgentRun;
}

export async function completeRun(runId: string, output: Record<string,unknown>, tokenUsage?: Record<string,unknown>): Promise<void> {
  await db().from('agent_runs').update({
    status: 'success', output_payload: output,
    token_usage: tokenUsage || null, completed_at: new Date().toISOString(),
  }).eq('id', runId);
}

export async function failRun(runId: string, errorMsg: string, details?: unknown): Promise<void> {
  await db().from('agent_runs').update({
    status: 'failed', error: { message: errorMsg, details },
    completed_at: new Date().toISOString(),
  }).eq('id', runId);
}

export async function getRecentRuns(limit = 50): Promise<AgentRun[]> {
  const { data, error } = await db().from('agent_runs').select('*')
    .order('started_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []) as AgentRun[];
}

export async function getRunStats(): Promise<{ total: number; success: number; failed: number; by_agent: Record<string,number> }> {
  const { data } = await db().from('agent_runs').select('agent_key, status');
  const rows = data || [];
  const by_agent: Record<string,number> = {};
  let success = 0, failed = 0;
  for (const r of rows) {
    if (r.status === 'success') success++;
    if (r.status === 'failed')  failed++;
    by_agent[r.agent_key] = (by_agent[r.agent_key] || 0) + 1;
  }
  return { total: rows.length, success, failed, by_agent };
}

// ── Activity Log ──────────────────────────────────────────────────────────────
export async function logActivity(row: Omit<ActivityLogRow,'id'|'created_at'>): Promise<void> {
  await db().from('agent_activity_log').insert(row).then(({ error }) => {
    if (error) console.error('[agent_activity_log] write failed:', error.message);
  });
}

export async function getActivityLog(limit = 100, agentKey?: string): Promise<ActivityLogRow[]> {
  let q = db().from('agent_activity_log').select('*').order('created_at', { ascending: false }).limit(limit);
  if (agentKey) q = q.eq('agent_key', agentKey);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as ActivityLogRow[];
}

// ── Approvals ─────────────────────────────────────────────────────────────────
export async function createApproval(approval: Omit<Approval,'id'|'created_at'|'decided_at'|'decided_by'>): Promise<Approval> {
  const { data, error } = await db().from('approvals').insert(approval).select().single();
  if (error) throw error;
  return data as Approval;
}

export async function getPendingApprovals(): Promise<Approval[]> {
  const { data, error } = await db().from('approvals').select('*')
    .eq('status', 'pending').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Approval[];
}

export async function decideApproval(id: string, decision: 'approved' | 'denied', decidedBy: string, rationale?: string): Promise<void> {
  const { error } = await db().from('approvals').update({
    status: decision, decided_by: decidedBy,
    rationale: rationale || null, decided_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) throw error;
}

// ── Artifacts ─────────────────────────────────────────────────────────────────
export async function recordArtifact(artifact: { run_id?: string; task_id?: string; agent_key: string; artifact_type: string; title: string; storage_path?: string; metadata?: Record<string,unknown> }): Promise<string> {
  const { data, error } = await db().from('artifacts').insert(artifact).select('id').single();
  if (error) throw error;
  return (data as {id: string}).id;
}

// ── Convenience: create task + run + activity in one call ─────────────────────
export async function executeAgentAction(opts: {
  agentKey: string;
  agentName: string;
  taskType: string;
  subject?: string;
  priority?: TaskPriority;
  approvalRequired?: boolean;
  approvalType?: ApprovalType;
  triggerSource?: string;
  input: Record<string,unknown>;
  execute: (runId: string, taskId: string) => Promise<{ summary: string; output: Record<string,unknown> }>;
}): Promise<{ success: boolean; runId: string; taskId: string; result?: Record<string,unknown>; error?: string }> {
  const { agentKey, agentName, taskType, subject, priority = 'medium', approvalRequired = false, approvalType, triggerSource = 'manual', input, execute } = opts;

  // 1) Create task
  const task = await createTask({
    type: taskType, priority, status: approvalRequired ? 'awaiting_approval' : 'queued',
    created_by: 'admin', assigned_to: agentKey,
    subject_type: subject ? 'general' : null, subject_id: subject || null,
    depends_on: [], input, output: null, artifact_ids: [],
    approval_required: approvalRequired, approval_type: approvalType || null,
    approval_status: approvalRequired ? 'pending' : null, run_id: null, error: null,
  });

  if (approvalRequired) {
    await createApproval({
      task_id: task.id, approval_type: approvalType || 'publish',
      status: 'pending', requested_by: agentKey,
      action_summary: `${agentName} requests approval for: ${taskType}`,
      risk_level: 'medium',
    });
    await logActivity({
      agent_key: agentKey, task_type: taskType, subject: subject || null,
      action_summary: `${agentName} submitted ${taskType} for approval`,
      outcome: 'awaiting_approval', severity: 'info', requires_attention: true,
      linked_task_id: task.id, linked_run_id: null, linked_artifact_id: null,
      linked_user_id: null, linked_campaign_id: null, meta: { input },
    });
    return { success: true, runId: '', taskId: task.id };
  }

  // 2) Start run
  await updateTask(task.id, { status: 'running' });
  const run = await startRun(agentKey, task.id, 'manual', triggerSource, input);
  await updateTask(task.id, { run_id: run.id });

  try {
    const { summary, output } = await execute(run.id, task.id);
    await completeRun(run.id, output);
    await updateTask(task.id, { status: 'done', output });
    await logActivity({
      agent_key: agentKey, task_type: taskType, subject: subject || null,
      action_summary: summary, outcome: 'success', severity: 'info',
      requires_attention: false, linked_task_id: task.id, linked_run_id: run.id,
      linked_artifact_id: null, linked_user_id: null, linked_campaign_id: null,
      meta: { output },
    });
    return { success: true, runId: run.id, taskId: task.id, result: output };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    await failRun(run.id, msg, err);
    await updateTask(task.id, { status: 'failed', error: { message: msg } });
    await logActivity({
      agent_key: agentKey, task_type: taskType, subject: subject || null,
      action_summary: `${agentName} failed: ${msg}`, outcome: 'error', severity: 'error',
      requires_attention: true, linked_task_id: task.id, linked_run_id: run.id,
      linked_artifact_id: null, linked_user_id: null, linked_campaign_id: null,
      meta: { error: msg },
    });
    return { success: false, runId: run.id, taskId: task.id, error: msg };
  }
}
