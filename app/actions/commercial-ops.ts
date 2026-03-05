"use server";

import { verifyAdmin } from "@/app/actions/admin";

type HealthStatus = "healthy" | "warning" | "missing";

interface IntegrationHealth {
  key: string;
  label: string;
  status: HealthStatus;
  detail: string;
}

export interface CommercialOpsSnapshot {
  revenue: {
    activeSubscribers: number;
    estimatedMrr: number;
    pendingOrders: number;
  };
  growth: {
    totalLeads: number;
    newLeads7d: number;
    emailQueuePending: number;
    emailFailuresToday: number;
  };
  support: {
    openTickets: number;
    repliedTickets: number;
  };
  content: {
    songs: number;
    printables: number;
    games: number;
    storybooks: number;
  };
  integrations: IntegrationHealth[];
  recommendations: string[];
}

const TIER_PRICING: Record<string, number> = {
  starter_mailer: 9.99,
  digital_explorer: 4.99,
  digital_legends: 4.99,
  legends_plus: 19.99,
  family_legacy: 34.99,
};

function integrationStatus(
  key: string,
  label: string,
  isConfigured: boolean,
  detailConfigured: string,
  detailMissing: string,
): IntegrationHealth {
  return {
    key,
    label,
    status: isConfigured ? "healthy" : "missing",
    detail: isConfigured ? detailConfigured : detailMissing,
  };
}

export async function getCommercialOpsSnapshot(token: string): Promise<CommercialOpsSnapshot> {
  const admin = await verifyAdmin(token);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    paidProfilesRes,
    pendingOrdersRes,
    leadsRes,
    newLeadsRes,
    emailPendingRes,
    emailFailedTodayRes,
    supportNewRes,
    supportRepliedRes,
    songsRes,
    printablesRes,
    gamesRes,
    storiesRes,
  ] = await Promise.all([
    admin.from("profiles").select("subscription_tier", { count: "exact" }).neq("subscription_tier", "free"),
    admin.from("orders").select("id", { count: "exact", head: true }).eq("fulfillment_status", "pending"),
    admin.from("leads").select("id", { count: "exact", head: true }),
    admin.from("leads").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    admin.from("email_queue").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("email_queue").select("id", { count: "exact", head: true }).eq("status", "failed").gte("created_at", todayStart.toISOString()),
    admin.from("support_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
    admin.from("support_messages").select("id", { count: "exact", head: true }).eq("status", "replied"),
    admin.from("songs").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin.from("printables").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin.from("games").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin.from("storybooks").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const paidProfiles = paidProfilesRes.data || [];
  const estimatedMrr = paidProfiles.reduce((sum: number, profile: any) => {
    const tier = String(profile.subscription_tier || "free");
    return sum + (TIER_PRICING[tier] || 0);
  }, 0);

  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasTwilio = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  const hasMeta = Boolean(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || process.env.FACEBOOK_PIXEL_ID);
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  const integrations: IntegrationHealth[] = [
    integrationStatus("email", "Email (Resend)", hasResend, "Configured", "Missing RESEND_API_KEY"),
    integrationStatus("sms", "SMS / WhatsApp (Twilio)", hasTwilio, "Configured", "Missing Twilio credentials"),
    integrationStatus("social", "Social Tracking (Meta Pixel)", hasMeta, "Configured", "Pixel env keys not configured"),
    integrationStatus("database", "Database (Supabase)", hasSupabase, "Configured", "Supabase env config missing"),
  ];

  const recommendations: string[] = [];
  const emailPending = emailPendingRes.count || 0;
  const supportOpen = supportNewRes.count || 0;

  if (emailPending > 100) recommendations.push(`Email queue backlog is high (${emailPending}). Run queue processor now.`);
  if (supportOpen > 10) recommendations.push(`Support inbox has ${supportOpen} open tickets. Prioritize replies today.`);
  if (!hasTwilio) recommendations.push("Enable Twilio to unlock SMS/WhatsApp lifecycle automations.");
  if ((newLeadsRes.count || 0) < 10) recommendations.push("Lead flow is low this week. Launch a new lead magnet + social push.");
  if (recommendations.length === 0) recommendations.push("Core systems look healthy. Focus on weekly campaign cadence and conversion tests.");

  return {
    revenue: {
      activeSubscribers: paidProfilesRes.count || 0,
      estimatedMrr: Number(estimatedMrr.toFixed(2)),
      pendingOrders: pendingOrdersRes.count || 0,
    },
    growth: {
      totalLeads: leadsRes.count || 0,
      newLeads7d: newLeadsRes.count || 0,
      emailQueuePending: emailPending,
      emailFailuresToday: emailFailedTodayRes.count || 0,
    },
    support: {
      openTickets: supportOpen,
      repliedTickets: supportRepliedRes.count || 0,
    },
    content: {
      songs: songsRes.count || 0,
      printables: printablesRes.count || 0,
      games: gamesRes.count || 0,
      storybooks: storiesRes.count || 0,
    },
    integrations,
    recommendations,
  };
}
