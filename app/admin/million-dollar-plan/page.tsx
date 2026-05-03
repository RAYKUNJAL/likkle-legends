'use client';

import { useEffect, useRef, useState } from 'react';

const G = {
  bg: '#070910',
  s1: '#0C1220',
  s2: '#111A2E',
  border: 'rgba(255,255,255,0.07)',
  text: '#EEF2FF',
  muted: '#5E738A',
  accent: '#FFD23F',
};

type Gap = {
  id: string;
  icon: string;
  label: string;
  priority: string;
  status: string;
  color: string;
  impact: string;
  detail: string;
};

type PipelineStage = {
  stage: number;
  agent: string;
  color: string;
  time: string;
  desc: string;
  output: string;
  tool: string;
};

type RevenueStream = {
  stream: string;
  q2: string;
  q3: string;
  q4: string;
  annual: string;
  color: string;
  how: string;
};

type AdminSection = {
  section: string;
  icon: string;
  color: string;
  features: string[];
};

type AgentBriefing = {
  name: string;
  role: string;
  color: string;
  avatar: string;
  system: string;
  starter: string;
};

type Message = { role: 'user' | 'assistant'; content: string };

async function askAgent(system: string, message: string) {
  const response = await fetch('/api/admin/million-dollar-plan/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, message }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Agent request failed.');
  return data.text || 'No response.';
}

const GAPS: Gap[] = [
  { id: 'youtube', icon: '📺', label: 'YouTube Growth Engine', priority: 'P0', status: 'NOT BUILT', color: '#FF4444', impact: '$80K-$300K/yr at scale', detail: 'The biggest missing piece. Caribbean kids content on YouTube is an untapped niche. Authentic IP, characters, and cultural content make this the brand amplifier and revenue engine.' },
  { id: 'heritage', icon: '📦', label: 'Heritage Box (Physical)', priority: 'P0', status: 'DB LIVE', color: '#FF6B35', impact: '$50K-$200K/yr', detail: 'Quarterly physical box: island artifacts, activity sheets, recipe cards, character plush, and local snacks guide. Premium gift-ready offer for diaspora parents and grandparents.' },
  { id: 'schools', icon: '🏫', label: 'School Licensing (B2B)', priority: 'P1', status: 'DB LIVE', color: '#FFD23F', impact: '$100K-$400K/yr', detail: 'Caribbean schools, diaspora community centers, Saturday schools, and charter programs need culturally relevant curriculum. This is recurring, low-churn B2B revenue.' },
  { id: 'merch', icon: '👕', label: 'Merchandise (Print-on-Demand)', priority: 'P1', status: 'DB LIVE', color: '#2EC4B6', impact: '$20K-$80K/yr', detail: 'Printful integration for character shirts, tote bags, posters, and sticker packs. Zero inventory risk, promoted through YouTube and email.' },
  { id: 'creator', icon: '🤝', label: 'Creator Affiliate Program', priority: 'P1', status: 'NOT BUILT', color: '#9B59B6', impact: '$30K-$100K/yr acquired', detail: 'Partner with Caribbean mom bloggers, diaspora influencers, and Saturday school teachers. Referral codes exist; the landing page and dashboard need to ship.' },
  { id: 'elevenlabs', icon: '🎤', label: 'Voice + Audio Library', priority: 'P2', status: 'NOT BUILT', color: '#E67E22', impact: 'Platform quality 10x', detail: 'Consistent character voices for videos, story read-alongs, and games. Tanty Spice should sound like Tanty Spice every time.' },
  { id: 'ada', icon: '⚖️', label: 'ADA Compliance Fixes', priority: 'P0', status: 'URGENT', color: '#FF4444', impact: 'Legal protection', detail: 'Alt text, form labels, keyboard navigation, and contrast. This protects the business and supports school sales.' },
  { id: 'appstore', icon: '📱', label: 'Mobile App (iOS/Android)', priority: 'P2', status: 'NOT BUILT', color: '#00D4AA', impact: '3x engagement', detail: 'Web-to-app wrapper first with Capacitor or Expo. Kids learn on tablets; App Store presence increases legitimacy and reduces repeat friction.' },
];

const YOUTUBE_PIPELINE: PipelineStage[] = [
  { stage: 1, agent: 'Research Agent', color: '#9B59B6', time: '5 min', desc: 'Pulls Caribbean kids topics: island animals, Carnival history, patois phrases, counting with doubles, flag colors. Stores briefs with citations.', output: 'topic_brief.json', tool: 'Gemini + Supabase' },
  { stage: 2, agent: 'Curriculum Agent', color: '#2EC4B6', time: '3 min', desc: 'Converts each topic into age-banded lesson goals and maps them to island learning paths.', output: 'lesson_goal.json', tool: 'Gemini' },
  { stage: 3, agent: 'Script Agent', color: '#FFD23F', time: '8 min', desc: 'Writes 15-60 second scripts with hook, scene beats, voiceover, captions, CTA, and character voice rules.', output: 'script.txt + captions.srt', tool: 'Gemini + character assets' },
  { stage: 4, agent: 'Character Agent', color: '#FF6B35', time: '2 min', desc: 'Enforces character bible: name, catchphrase, palette, forbidden drift, expression, and island fit.', output: 'character_brief.json', tool: 'Gemini + characters DB' },
  { stage: 5, agent: 'Voice Agent', color: '#E67E22', time: '10 min', desc: 'Sends narration to ElevenLabs. Stores voiceover URLs and avoids real-child voice cloning.', output: 'voiceover.mp3', tool: 'ElevenLabs API' },
  { stage: 6, agent: 'Scene Builder', color: '#00D4AA', time: '15 min', desc: 'Creates scene prompts, backgrounds, poses, and character layers from approved reference sheets.', output: 'scenes/frame_001.png...', tool: 'Imagen + Gemini prompts + assets' },
  { stage: 7, agent: 'Assembly Agent', color: '#2EC4B6', time: '20 min', desc: 'FFmpeg assembles 1080x1920 video with timing, captions, transitions, and copyright-safe Caribbean music.', output: 'final.mp4 + preview.mp4', tool: 'FFmpeg + GitHub Actions' },
  { stage: 8, agent: 'Approval Gate', color: '#FF4444', time: 'Human', desc: 'Queues final video, script, captions, metadata, and thumbnail. Safety, character, and fact checks gate publish.', output: 'Approval decision', tool: 'Gemini + Supabase' },
  { stage: 9, agent: 'Publish Agent', color: '#00C853', time: '3 min', desc: 'Uploads through YouTube Data API v3, sets education category, thumbnail, tags, and made-for-kids flag.', output: 'Live on YouTube', tool: 'YouTube Data API v3' },
];

const REVENUE_MODEL: RevenueStream[] = [
  { stream: 'Monthly Subscriptions', q2: '$5,000', q3: '$25,000', q4: '$75,000', annual: '$150,000', color: '#2EC4B6', how: 'Core SaaS at $9.99/mo. Fix checkout, run Meta ads, convert trials.' },
  { stream: 'YouTube AdSense', q2: '$500', q3: '$3,000', q4: '$10,000', annual: '$25,000', color: '#FF6B35', how: 'Build now; revenue follows once channel reaches monetization thresholds.' },
  { stream: 'YouTube Sponsorships', q2: '$0', q3: '$2,000', q4: '$10,000', annual: '$20,000', color: '#FFD23F', how: 'Approach Caribbean food, diaspora, and educational toy brands.' },
  { stream: 'Heritage Box', q2: '$0', q3: '$5,000', q4: '$20,000', annual: '$40,000', color: '#9B59B6', how: '$49.99/quarter. Launch Trinidad and Jamaica boxes first.' },
  { stream: 'School Licenses', q2: '$0', q3: '$5,000', q4: '$15,000', annual: '$50,000', color: '#E67E22', how: '$5/student/year. Target Saturday schools and diaspora centers.' },
  { stream: 'Merchandise', q2: '$0', q3: '$2,000', q4: '$8,000', annual: '$20,000', color: '#00D4AA', how: 'Printful products promoted through YouTube and email.' },
  { stream: 'Affiliate Revenue', q2: '$0', q3: '$1,000', q4: '$5,000', annual: '$15,000', color: '#FF4444', how: '20% commissions for creators and educators.' },
  { stream: 'Digital Downloads', q2: '$500', q3: '$2,000', q4: '$5,000', annual: '$10,000', color: '#00C853', how: 'Premium printable bundles, story collections, and island activity packs.' },
];

const ADMIN_FEATURES: AdminSection[] = [
  { section: 'Revenue Dashboard', icon: '💰', color: '#FFD23F', features: ['Live MRR, ARR, churn, and trend graphs', 'Revenue by stream', 'PayPal transaction feed', 'Revenue target progress bars', 'Projected end-of-year revenue'] },
  { section: 'YouTube Pipeline', icon: '📺', color: '#FF4444', features: ['Pipeline board from research to published', 'Safety and character scores', 'One-click approve to schedule', 'Channel stats', 'Content calendar'] },
  { section: 'Island Portal Monitor', icon: '🏝️', color: '#2EC4B6', features: ['Families by island', 'Portal generation success rate', 'Content freshness', 'Daily refresh status', 'Per-island engagement'] },
  { section: 'Email & Churn', icon: '📧', color: '#00D4AA', features: ['Campaign performance', 'Churn risk heatmap', 'Rescue campaign status', 'Revenue attribution', 'Sequence health'] },
  { section: 'Content Library', icon: '📚', color: '#FF6B35', features: ['Approval queue', 'Play counts and ratings', 'AI generation triggers', 'Character usage stats', 'COPPA review flag'] },
  { section: 'Heritage Box & Merch', icon: '📦', color: '#9B59B6', features: ['Box order pipeline', 'Printful/manual fulfillment', 'Inventory levels', 'Product revenue', 'Quarterly box calendar'] },
  { section: 'Customer Success', icon: '🤝', color: '#E67E22', features: ['Conversation inbox', 'CSAT trends', 'Top complaints', 'Unresolved escalations', 'Affiliate dashboard', 'School license pipeline'] },
  { section: 'Bug & Health Monitor', icon: '🔍', color: '#FF4444', features: ['Vercel and Supabase error feed', 'Open bugs by severity', 'Endpoint health', 'Accessibility audit scores', 'Payment success rate', 'Trial funnel'] },
];

const COMMAND_LINKS = [
  { label: 'Run Agent OS', href: '/admin/agent-team', detail: 'Codex execution board', color: '#9B59B6' },
  { label: 'YouTube Planner', href: '/api/admin/youtube/plan', detail: 'Gemini + Remotion pipeline', color: '#FF6B35' },
  { label: 'Approval Queue', href: '/api/admin/youtube/approval-queue', detail: 'Review before publish', color: '#00C853' },
  { label: 'Check AI Spend', href: '/admin/ai-costs', detail: 'Gemini cost guardrails', color: '#00D4AA' },
  { label: 'Launch Verification', href: '/admin/verify', detail: 'Go/no-go checks', color: '#FF4444' },
  { label: 'Commercial Ops', href: '/admin/commercial', detail: 'Revenue workbench', color: '#FFD23F' },
];

const OPERATING_STACK = [
  { label: 'Gemini', detail: 'Agent chat and planning model', color: '#00D4AA' },
  { label: 'Codex', detail: 'Repo edits, tests, fixes', color: '#9B59B6' },
  { label: 'Paperclip', detail: 'Boards, budgets, approvals', color: '#FFD23F' },
];

const AGENT_BRIEFINGS: AgentBriefing[] = [
  { name: 'Zara Sunshine', role: 'CEO', color: '#FFD23F', avatar: '👑', system: 'You are Zara Sunshine, CEO of Likkle Legends. Prioritize the 8 gaps, resource the AI agent team, and give direct 30-day execution plans with real numbers.', starter: 'Give me the 30-day priority plan to $10K MRR' },
  { name: 'Reef Kingsford', role: 'Tech Lead', color: '#2EC4B6', avatar: '⚙️', system: 'You are Reef Kingsford, Tech Lead. Stack: Next.js, Supabase, Vercel, TypeScript. Build YouTube pipeline, ADA fixes, admin sections, FFmpeg, ElevenLabs, and YouTube upload. Give specific implementation steps.', starter: "What's the technical build order for the YouTube pipeline?" },
  { name: 'Nova Hibiscus', role: 'Content + YouTube', color: '#FF69B4', avatar: '✨', system: 'You are Nova Hibiscus, Content Director. Plan Caribbean educational YouTube Shorts for ages 4-8 with COPPA compliance, character consistency, and content calendar coverage.', starter: 'Plan my first 10 YouTube Shorts: topics, scripts, characters, islands' },
  { name: 'Kai Tradewind', role: 'Paid Ads', color: '#FF6B35', avatar: '🎯', system: 'You are Kai Tradewind, Paid Ads Specialist. Target parents only, ages 25-45, Caribbean diaspora interests. Budget starts at $15/day. Design conversion campaigns.', starter: 'Design the first Meta ad campaign to get 50 paying subscribers' },
  { name: 'Irie Goldsworth', role: 'Email + Revenue', color: '#00D4AA', avatar: '📧', system: 'You are Irie Goldsworth, Email Revenue Lead. Write warm Caribbean email sequences tied to subscriptions, heritage box, school licenses, affiliates, and YouTube conversion.', starter: 'Write the heritage box launch email sequence: 3 emails, send in week 1' },
  { name: 'Juno Cays', role: 'Analytics', color: '#9B59B6', avatar: '📊', system: 'You are Juno Cays, Analytics Lead. Build KPI tracking for $1M across subscriptions, YouTube, heritage boxes, school licenses, merch, affiliates, and downloads.', starter: 'Build the KPI tracking framework to get to $1M: what do we measure weekly?' },
  { name: 'Cayo Driftwood', role: 'Finance', color: '#E67E22', avatar: '💰', system: 'You are Cayo Driftwood, Finance Lead. Build unit economics, break-even analysis, and cash flow for a bootstrapped Likkle Legends operation.', starter: 'Build the financial model: what does it cost to get to $10K MRR?' },
  { name: 'Bayo Wavelength', role: 'Customer Success', color: '#00C853', avatar: '🤝', system: 'You are Bayo Wavelength, Customer Success Lead. Re-engage broken-onboarding users, protect retention, and build school license customer success playbooks.', starter: 'Write the re-engagement email to our 7 existing users who had broken onboarding' },
];

function Tab({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color: string }) {
  return (
    <button onClick={onClick} style={{ padding: '14px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${active ? color : 'transparent'}`, color: active ? color : G.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {label}
    </button>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 3, background: `${color}18`, color, border: `1px solid ${color}33`, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</span>;
}

function AgentChat({ agents }: { agents: AgentBriefing[] }) {
  const [activeAgent, setActive] = useState(agents[0].name);
  const [msgs, setMsgs] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const ag = agents.find((a) => a.name === activeAgent) || agents[0];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, loading]);

  async function send(text?: string) {
    const m = text || input.trim();
    if (!m || loading) return;
    setInput('');
    const prev = msgs[ag.name] || [];
    const updated: Message[] = [...prev, { role: 'user', content: m }];
    setMsgs((p) => ({ ...p, [ag.name]: updated }));
    setLoading(true);
    try {
      const reply = await askAgent(ag.system, m);
      setMsgs((p) => ({ ...p, [ag.name]: [...updated, { role: 'assistant', content: reply }] }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Agent chat failed.';
      setMsgs((p) => ({ ...p, [ag.name]: [...updated, { role: 'assistant', content: message }] }));
    }
    setLoading(false);
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ width: 190, borderRight: `1px solid ${G.border}`, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', background: G.s1, flexShrink: 0 }}>
        {agents.map((a) => (
          <button key={a.name} onClick={() => setActive(a.name)} style={{ padding: '9px 10px', borderRadius: 7, border: `1px solid ${activeAgent === a.name ? `${a.color}44` : G.border}`, background: activeAgent === a.name ? `${a.color}10` : 'transparent', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 14 }}>{a.avatar}</span>
            <div><div style={{ fontSize: 11, fontWeight: 700, color: G.text }}>{a.name.split(' ')[0]}</div><div style={{ fontSize: 9, color: a.color, fontWeight: 600 }}>{a.role}</div></div>
          </button>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>{ag.avatar}</span>
          <div><div style={{ fontSize: 13, fontWeight: 700, color: G.text }}>{ag.name}</div><div style={{ fontSize: 10, color: ag.color }}>{ag.role}</div></div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: ag.color, boxShadow: `0 0 5px ${ag.color}` }} />
            <span style={{ fontSize: 10, color: ag.color, fontWeight: 600 }}>FULLY BRIEFED</span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!(msgs[ag.name]?.length) ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
              <span style={{ fontSize: 32 }}>{ag.avatar}</span>
              <div style={{ color: G.muted, fontSize: 12 }}>{ag.name} knows the full plan. Start here:</div>
              <button onClick={() => send(ag.starter)} style={{ padding: '9px 14px', background: G.s2, border: `1px solid ${G.border}`, borderRadius: 7, fontSize: 12, color: G.muted, cursor: 'pointer', maxWidth: 420, textAlign: 'left' }}>{ag.starter}</button>
            </div>
          ) : (
            <>
              {(msgs[ag.name] || []).map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '85%', background: m.role === 'user' ? 'rgba(255,255,255,0.06)' : `${ag.color}0C`, border: `1px solid ${m.role === 'user' ? G.border : `${ag.color}33`}`, borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px', padding: '10px 14px', fontSize: 12, color: G.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {m.role === 'assistant' && <div style={{ fontSize: 9, fontWeight: 700, color: ag.color, letterSpacing: 1.5, marginBottom: 6, textTransform: 'uppercase' }}>{ag.name}</div>}
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <div style={{ color: ag.color, fontSize: 12 }}>Thinking...</div>}
              <div ref={bottomRef} />
            </>
          )}
        </div>
        <div style={{ padding: '10px 14px', borderTop: `1px solid ${G.border}`, flexShrink: 0, display: 'flex', gap: 8 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()} placeholder={`Message ${ag.name.split(' ')[0]}...`} style={{ flex: 1, background: G.s2, border: `1px solid ${G.border}`, borderRadius: 7, padding: '8px 12px', color: G.text, fontSize: 12, outline: 'none' }} />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{ padding: '8px 14px', background: loading || !input.trim() ? G.s2 : ag.color, border: 'none', borderRadius: 7, color: loading || !input.trim() ? G.muted : '#000', fontSize: 12, fontWeight: 700, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer' }}>{loading ? '...' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
}

export default function MillionDollarPlanPage() {
  const [tab, setTab] = useState('gaps');
  const [expandedPipe, setExpandedPipe] = useState<number | null>(null);
  const [expandedAdmin, setExpandedAdmin] = useState<number | null>(null);

  const tabs = [
    { id: 'gaps', label: '🔍 Gap Analysis', color: '#FF4444' },
    { id: 'youtube', label: '📺 YouTube Engine', color: '#FF6B35' },
    { id: 'revenue', label: '💰 Revenue 10x', color: '#FFD23F' },
    { id: 'admin', label: '🖥️ Admin Expansion', color: '#2EC4B6' },
    { id: 'team', label: '👥 Codex AI Team', color: '#9B59B6' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        .million-plan *{box-sizing:border-box}
        .million-plan{background:${G.bg};font-family:'Inter',sans-serif;color:${G.text};min-height:100vh}
        .million-plan button,.million-plan input{font-family:inherit}
        .million-plan ::-webkit-scrollbar{width:3px}
        .million-plan ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px}
      `}</style>
      <div className="million-plan" style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
        <div style={{ borderBottom: `1px solid ${G.border}`, background: 'rgba(7,9,16,.98)', padding: '0 20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', marginRight: 24 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#FFD23F22,#FF6B3522)', border: '1px solid rgba(255,210,63,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌴</div>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 13, color: G.text }}>Likkle Legends</div>
              <div style={{ fontSize: 9, color: G.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>$1M Platform Blueprint</div>
            </div>
          </div>
          <div style={{ display: 'flex', overflowX: 'auto' }}>
            {tabs.map((t) => <Tab key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} color={t.color} />)}
          </div>
          <div style={{ marginLeft: 'auto', padding: '0 8px', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            <a href="/admin/agent-team" style={{ fontSize: 10, padding: '7px 10px', borderRadius: 6, background: '#9B59B618', color: '#C4A3FF', border: '1px solid #9B59B644', fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}>Open Agent OS</a>
            <Badge label="17 Tables Live" color="#00C853" />
            <Badge label="$0 to $1M Plan" color="#FFD23F" />
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {tab === 'gaps' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>What We&apos;re Missing: Full Gap Analysis</h1>
                <p style={{ fontSize: 13, color: G.muted, marginBottom: 24 }}>8 gaps between current state and best Caribbean kids platform. Sorted by impact on reaching $1M.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginBottom: 18 }}>
                  {COMMAND_LINKS.map((link) => (
                    <a key={link.href} href={link.href} style={{ background: G.s1, border: `1px solid ${link.color}33`, borderRadius: 10, padding: '12px 14px', textDecoration: 'none', display: 'block' }}>
                      <div style={{ fontSize: 12, color: link.color, fontWeight: 800 }}>{link.label}</div>
                      <div style={{ fontSize: 10, color: G.muted, marginTop: 4 }}>{link.detail}</div>
                    </a>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginBottom: 24 }}>
                  {OPERATING_STACK.map((tool) => (
                    <div key={tool.label} style={{ background: `${tool.color}08`, border: `1px solid ${tool.color}2A`, borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: 11, color: tool.color, fontWeight: 800 }}>{tool.label}</div>
                      <div style={{ fontSize: 10, color: G.muted, marginTop: 4 }}>{tool.detail}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {GAPS.map((g) => (
                    <div key={g.id} style={{ background: G.s1, border: `1px solid ${G.border}`, borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${g.color}12`, border: `1px solid ${g.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{g.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>{g.label}</span>
                          <Badge label={g.priority} color={g.priority === 'P0' ? '#FF4444' : g.priority === 'P1' ? '#FF6B35' : '#FFD23F'} />
                          <Badge label={g.status} color={g.status.includes('LIVE') ? '#00C853' : g.status.includes('NOT') ? '#FF4444' : '#FFD23F'} />
                        </div>
                        <div style={{ fontSize: 12, lineHeight: 1.7, marginBottom: 8 }}>{g.detail}</div>
                        <div style={{ fontSize: 11, padding: '4px 10px', background: `${g.color}10`, color: g.color, borderRadius: 5, border: `1px solid ${g.color}30`, display: 'inline-block', fontWeight: 600 }}>📈 {g.impact}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'youtube' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>YouTube Growth Engine</h1>
                <p style={{ fontSize: 13, color: G.muted, marginBottom: 20 }}>9-stage autonomous video pipeline. Research to published YouTube Short in under 60 minutes, with every stage logged to Supabase.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {YOUTUBE_PIPELINE.map((p) => (
                    <div key={p.stage} style={{ background: G.s1, border: `1px solid ${expandedPipe === p.stage ? `${p.color}44` : G.border}`, borderRadius: 10, overflow: 'hidden' }}>
                      <div onClick={() => setExpandedPipe(expandedPipe === p.stage ? null : p.stage)} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: expandedPipe === p.stage ? `${p.color}08` : 'transparent' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${p.color}18`, border: `1px solid ${p.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: p.color, flexShrink: 0 }}>{p.stage}</div>
                        <div style={{ flex: 1 }}><span style={{ fontSize: 13, fontWeight: 700 }}>{p.agent}</span><span style={{ fontSize: 11, color: G.muted, marginLeft: 10 }}>{p.tool}</span></div>
                        <span style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(255,255,255,.04)', color: G.muted, borderRadius: 4 }}>{p.time}</span>
                      </div>
                      {expandedPipe === p.stage && (
                        <div style={{ padding: '12px 16px', borderTop: `1px solid ${G.border}`, display: 'grid', gridTemplateColumns: '1fr 180px', gap: 16 }}>
                          <div style={{ fontSize: 12, color: G.muted, lineHeight: 1.75 }}>{p.desc}</div>
                          <div style={{ background: `${p.color}08`, border: `1px solid ${p.color}25`, borderRadius: 7, padding: '10px 12px' }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: p.color, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Output</div>
                            <div style={{ fontSize: 11, fontFamily: 'monospace' }}>{p.output}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'revenue' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <div style={{ maxWidth: 920, margin: '0 auto' }}>
                <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Revenue 10x Model: $0 to $1M</h1>
                <p style={{ fontSize: 13, color: G.muted, marginBottom: 20 }}>8 revenue streams. Real sequence, real math.</p>
                <div style={{ background: G.s1, border: `1px solid ${G.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', borderBottom: `1px solid ${G.border}`, display: 'grid', gridTemplateColumns: '160px 70px 70px 70px 90px 1fr', gap: 10, fontSize: 9, fontWeight: 700, color: G.muted, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                    <span>Stream</span><span>Q2</span><span>Q3</span><span>Q4</span><span>Annual</span><span>How</span>
                  </div>
                  {REVENUE_MODEL.map((r, i) => (
                    <div key={r.stream} style={{ padding: '12px 16px', borderBottom: i < REVENUE_MODEL.length - 1 ? `1px solid ${G.border}` : 'none', display: 'grid', gridTemplateColumns: '160px 70px 70px 70px 90px 1fr', gap: 10, alignItems: 'start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} /><span style={{ fontSize: 11, fontWeight: 700 }}>{r.stream}</span></div>
                      {[r.q2, r.q3, r.q4, r.annual].map((v) => <div key={v} style={{ fontSize: 11, color: v === '$0' ? G.muted : r.color, fontWeight: v === '$0' ? 400 : 700 }}>{v}</div>)}
                      <div style={{ fontSize: 10, color: G.muted, lineHeight: 1.6 }}>{r.how}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'admin' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Admin Dashboard Expansion</h1>
                <p style={{ fontSize: 13, color: G.muted, marginBottom: 20 }}>8 new sections to add to /admin, each tied to real business operations.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ADMIN_FEATURES.map((section, i) => (
                    <div key={section.section} style={{ background: G.s1, border: `1px solid ${expandedAdmin === i ? `${section.color}44` : G.border}`, borderRadius: 12, overflow: 'hidden' }}>
                      <div onClick={() => setExpandedAdmin(expandedAdmin === i ? null : i)} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                        <span style={{ fontSize: 20 }}>{section.icon}</span>
                        <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>{section.section}</span>
                        <span style={{ fontSize: 10, padding: '2px 8px', background: `${section.color}10`, color: section.color, border: `1px solid ${section.color}30`, borderRadius: 3, fontWeight: 600 }}>{section.features.length} features</span>
                      </div>
                      {expandedAdmin === i && <div style={{ padding: '12px 18px 16px', borderTop: `1px solid ${G.border}` }}>{section.features.map((f) => <div key={f} style={{ fontSize: 12, color: G.muted, marginBottom: 8, display: 'flex', gap: 8 }}><span style={{ color: section.color }}>→</span>{f}</div>)}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'team' && <div style={{ flex: 1, overflow: 'hidden' }}><AgentChat agents={AGENT_BRIEFINGS} /></div>}
        </div>
      </div>
    </>
  );
}
