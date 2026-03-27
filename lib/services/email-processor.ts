"use server";

import { createAdminClient } from "@/lib/admin";
import {
  sendEmail,
  WELCOME_EMAIL_TEMPLATE,
  ONBOARDING_DAY_2_TEMPLATE,
  ONBOARDING_DAY_7_TEMPLATE,
  ABANDONED_CHECKOUT_TEMPLATE,
  SUBSCRIPTION_CONFIRMATION_TEMPLATE,
  SUPPORT_REPLY_TEMPLATE,
  WIN_BACK_TEMPLATE,
} from "@/lib/email";

interface QueuedEmail {
  id: string;
  recipient_email: string;
  template_id: string;
  template_data: any;
  status: string;
  send_at: string;
}

export async function processEmailQueue() {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: pendingEmails, error } = await admin
    .from("email_queue")
    .select("*")
    .eq("status", "pending")
    .lte("send_at", now)
    .limit(50);

  if (error) {
    console.error("Failed to fetch email queue:", error);
    return { processed: 0, errors: 1 };
  }

  if (!pendingEmails || pendingEmails.length === 0) {
    return { processed: 0, errors: 0 };
  }

  let processed = 0;
  let errors = 0;

  for (const email of pendingEmails as QueuedEmail[]) {
    try {
      const html = renderTemplate(email.template_id, email.template_data);
      const subject = getSubjectForTemplate(email.template_id, email.template_data);
      const result = await sendEmail({ to: email.recipient_email, subject, html });
      if (result.success) {
        await admin.from("email_queue").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", email.id);
        processed++;
      } else {
        await admin.from("email_queue").update({ status: "failed", error_message: String(result.error) }).eq("id", email.id);
        errors++;
      }
    } catch (err) {
      await admin.from("email_queue").update({ status: "failed", error_message: String(err) }).eq("id", email.id);
      errors++;
    }
  }

  await admin.from("system_logs").insert({
    action_type: "email_queue_processed",
    description: `Processed ${processed} emails, ${errors} failed`,
    metadata: { processed, errors, timestamp: now },
  });

  return { processed, errors };
}

function renderTemplate(templateId: string, data: any): string {
  switch (templateId) {
    case "WELCOME":
      return WELCOME_EMAIL_TEMPLATE(data.name || "Legend");
    case "ONBOARDING_DAY_2":
      return ONBOARDING_DAY_2_TEMPLATE(data.name || "Legend", data.childName || "");
    case "ONBOARDING_DAY_7":
      return ONBOARDING_DAY_7_TEMPLATE(data.name || "Legend");
    case "ABANDONED_CHECKOUT":
      return ABANDONED_CHECKOUT_TEMPLATE(data.name || "Friend", data.planName || "Legends Plus");
    case "SUBSCRIPTION_CONFIRMATION":
      return SUBSCRIPTION_CONFIRMATION_TEMPLATE(
        data.name || "Legend",
        data.tier || "Legends Plus",
        data.childName || "",
        data.hasUpsell,
        data.hasHeritageStory
      );
    case "SUPPORT_REPLY":
      return SUPPORT_REPLY_TEMPLATE(data.parentName || "Friend", data.subject || "", data.replyText || "");
    case "WIN_BACK":
      return WIN_BACK_TEMPLATE(data.name || "Legend");
    default:
      return `<p>${data.message || "Hello from Likkle Legends."}</p>`;
  }
}

function getSubjectForTemplate(templateId: string, data: any): string {
  switch (templateId) {
    case "WELCOME":
      return "Welcome to Likkle Legends";
    case "ONBOARDING_DAY_2":
      return `Pro tip for ${data.childName || "your kid"} (Day 2)`;
    case "ONBOARDING_DAY_7":
      return "7 days in — check your progress";
    case "ABANDONED_CHECKOUT":
      return "Complete your checkout";
    case "SUBSCRIPTION_CONFIRMATION":
      return `Subscription confirmed — welcome to Likkle Legends, ${data.name || "Legend"}!`;
    case "SUPPORT_REPLY":
      return `Re: ${data.subject || "Your Support Request"}`;
    case "WIN_BACK":
      return "We miss you — come back to the islands";
    default:
      return "Hello from Likkle Legends";
  }
}
