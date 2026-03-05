"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout, RefreshCw } from "@/components/admin/AdminComponents";
import {
  Brain,
  Mail,
  MessageSquare,
  BarChart,
  Database,
  ShoppingCart,
  Users,
  Rocket,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCommercialOpsSnapshot, type CommercialOpsSnapshot } from "@/app/actions/commercial-ops";

const EMPTY_SNAPSHOT: CommercialOpsSnapshot = {
  revenue: { activeSubscribers: 0, estimatedMrr: 0, pendingOrders: 0 },
  growth: { totalLeads: 0, newLeads7d: 0, emailQueuePending: 0, emailFailuresToday: 0 },
  support: { openTickets: 0, repliedTickets: 0 },
  content: { songs: 0, printables: 0, games: 0, storybooks: 0 },
  integrations: [],
  recommendations: [],
};

export default function AdminCommercialPage() {
  const [snapshot, setSnapshot] = useState<CommercialOpsSnapshot>(EMPTY_SNAPSHOT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunningQueue, setIsRunningQueue] = useState(false);

  const loadSnapshot = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Admin session not found.");
        return;
      }
      const data = await getCommercialOpsSnapshot(session.access_token);
      setSnapshot(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load commercial snapshot.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSnapshot();
  }, []);

  const runEmailQueue = async () => {
    setIsRunningQueue(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Missing admin session");

      const res = await fetch("/api/cron/process-emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || "Queue run failed");
      }

      await loadSnapshot();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to run queue";
      setError(message);
    } finally {
      setIsRunningQueue(false);
    }
  };

  return (
    <AdminLayout activeSection="commercial">
      <header className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Rocket className="text-primary" />
              Commercial Ops Command
            </h1>
            <p className="text-gray-500">Revenue, lifecycle, support, and growth execution in one place.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={runEmailQueue}
              disabled={isRunningQueue || isLoading}
              className="px-5 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {isRunningQueue ? <RefreshCw className="animate-spin" size={18} /> : <Mail size={18} />}
              Run Email Queue
            </button>
            <button
              onClick={loadSnapshot}
              disabled={isLoading}
              className="px-5 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={isLoading ? "animate-spin" : ""} size={18} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        <section className="grid md:grid-cols-3 gap-6">
          <MetricCard icon={Users} label="Active Subscribers" value={snapshot.revenue.activeSubscribers.toLocaleString()} />
          <MetricCard icon={BarChart} label="Estimated MRR" value={`$${snapshot.revenue.estimatedMrr.toLocaleString()}`} />
          <MetricCard icon={ShoppingCart} label="Pending Orders" value={snapshot.revenue.pendingOrders.toLocaleString()} />
        </section>

        <section className="grid md:grid-cols-4 gap-6">
          <MetricCard icon={Brain} label="Leads (Total)" value={snapshot.growth.totalLeads.toLocaleString()} />
          <MetricCard icon={Rocket} label="Leads (7d)" value={snapshot.growth.newLeads7d.toLocaleString()} />
          <MetricCard icon={Mail} label="Email Queue Pending" value={snapshot.growth.emailQueuePending.toLocaleString()} />
          <MetricCard icon={MessageSquare} label="Open Support Tickets" value={snapshot.support.openTickets.toLocaleString()} />
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Database size={20} className="text-primary" />
            Integration Health
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {snapshot.integrations.map((integration) => (
              <div key={integration.key} className="border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{integration.label}</p>
                  <p className="text-xs text-gray-500">{integration.detail}</p>
                </div>
                {integration.status === "healthy" ? (
                  <CheckCircle2 className="text-green-500" size={18} />
                ) : (
                  <AlertTriangle className="text-amber-500" size={18} />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4">AI Agent Workflows</h2>
          <div className="grid lg:grid-cols-3 gap-4">
            <AgentCard
              title="Lifecycle Agent"
              description="Runs onboarding, retention, and reactivation campaigns."
              primaryCta={{ label: "Open Growth Agent", href: "/admin/email-engine" }}
              secondaryCta={{ label: "Review Leads", href: "/admin/leads" }}
            />
            <AgentCard
              title="Support Copilot"
              description="Prioritizes parent messages and queues replies."
              primaryCta={{ label: "Open Support Hub", href: "/admin/messages" }}
              secondaryCta={{ label: "Customer Accounts", href: "/admin/customers" }}
            />
            <AgentCard
              title="Acquisition Agent"
              description="Monitors tracking pixels and conversion attribution."
              primaryCta={{ label: "Open Tracking", href: "/admin/pixels" }}
              secondaryCta={{ label: "Store Analytics", href: "/admin/store-analytics" }}
            />
          </div>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4">Operator Recommendations</h2>
          <ul className="space-y-3">
            {snapshot.recommendations.map((item, idx) => (
              <li key={`${item}-${idx}`} className="text-sm font-medium text-gray-700 bg-gray-50 rounded-xl px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminLayout>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest font-black text-gray-400">{label}</span>
        <Icon className="text-primary" size={18} />
      </div>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </div>
  );
}

function AgentCard({
  title,
  description,
  primaryCta,
  secondaryCta,
}: {
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-5">
      <h3 className="font-black text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="flex gap-2">
        <Link href={primaryCta.href} className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-bold">
          {primaryCta.label}
        </Link>
        <Link href={secondaryCta.href} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold">
          {secondaryCta.label}
        </Link>
      </div>
    </div>
  );
}
