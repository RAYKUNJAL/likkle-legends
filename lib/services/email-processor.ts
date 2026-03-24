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

      const result = await sendEmail({
        to: email.recipient_email,
        subject,
        html,
      });

      if (result.success) {
        await admin
          .from("email_queue")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", email.id);
        processed++;
      } else {
        await admin
          .from("email_queue")
          .update({ status: "failed", error_message: String(result.error) })
          .eq("id", email.id);
        errors++;
      }
    } catch (err) {
      await admin
        .from("email_queue")
        .update({ status: "failed", error_message: String(err) })
        .eq("id", email.id);
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
    case "TATTOO_CONTEST_WELCOME":
      return tattooContestWelcomeTemplate(
        data.name || "Friend",
        data.referralUrl || "",
        data.prize || "Free cover-up consultation + custom design layout"
      );
    case "TATTOO_CONTEST_DAY_2":
      return tattooContestDay2Template(data.name || "Friend", data.referralUrl || "");
    case "TATTOO_CONTEST_DAY_4":
      return tattooContestDay4Template(data.name || "Friend");
    case "ONBOARDING_DAY_2":
      return ONBOARDING_DAY_2_TEMPLATE(data.name || "Legend", data.childName || "");
    case "ONBOARDING_DAY_7":
      return ONBOARDING_DAY_7_TEMPLATE(data.name || "Legend");
    case "ABANDONED_CHECKOUT":
      return ABANDONED_CHECKOUT_TEMPLATE(data.name || "Friend", data.planName || "Legends Plus");
    case "SUBSCRIPTION_CONFIRMATION":
      return SUBSCRIPTION_CONFIRMATION_TEMPLATE(data.name || "Legend", data.tier || "Legends Plus", data.childName || "");
    case "SUPPORT_REPLY":
      return SUPPORT_REPLY_TEMPLATE(data.parentName || "Friend", data.subject || "", data.replyText || "");
    case "WIN_BACK":
      return WIN_BACK_TEMPLATE(data.name || "Legend");
    default:
      return `<p>${data.message || "Hello from Island City Tattoos."}</p>`;
  }
}

function getSubjectForTemplate(templateId: string, data: any): string {
  switch (templateId) {
    case "WELCOME":
      return "Welcome to Likkle Legends";
    case "TATTOO_CONTEST_WELCOME":
      return "You are in: Free cover-up consultation giveaway";
    case "TATTOO_CONTEST_DAY_2":
      return "Share your link to boost your contest entry";
    case "TATTOO_CONTEST_DAY_4":
      return "Cover-up consultation spots are filling up";
    case "ONBOARDING_DAY_2":
      return `Pro tip for ${data.childName || "your kid"} (Day 2)`;
    case "ONBOARDING_DAY_7":
      return "7 days in: check your progress";
    case "ABANDONED_CHECKOUT":
      return "Complete your checkout";
    case "SUBSCRIPTION_CONFIRMATION":
      return `Subscription confirmed for ${data.name || "Legend"}`;
    case "SUPPORT_REPLY":
      return `Re: ${data.subject || "Your Support Request"}`;
    case "WIN_BACK":
      return "We miss you";
    default:
      return "Hello from Island City Tattoos";
  }
}

function tattooContestWelcomeTemplate(name: string, referralUrl: string, prize: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1f2937">
      <h2 style="margin:0 0 12px 0;">You are entered, ${name}.</h2>
      <p style="line-height:1.6;">Thanks for entering: <b>${prize}</b>.</p>
      <p style="line-height:1.6;">Share your referral link to improve your chances:</p>
      <p style="background:#111827;color:#f9fafb;padding:12px;border-radius:8px;word-break:break-all;">${referralUrl}</p>
      <p style="line-height:1.6;">Questions? DM <b>@ray_tattoos</b> on Instagram.</p>
      <p style="font-size:12px;color:#6b7280;">No purchase necessary. Winner details posted on social channels.</p>
    </div>
  `;
}

function tattooContestDay2Template(name: string, referralUrl: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1f2937">
      <h2 style="margin:0 0 12px 0;">Quick reminder, ${name}</h2>
      <p style="line-height:1.6;">Your entry is active. Share your link today:</p>
      <p style="background:#111827;color:#f9fafb;padding:12px;border-radius:8px;word-break:break-all;">${referralUrl}</p>
      <p style="line-height:1.6;">Need immediate help with a cover-up? Book now and mention your contest entry.</p>
    </div>
  `;
}

function tattooContestDay4Template(name: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1f2937">
      <h2 style="margin:0 0 12px 0;">${name}, consultation spots are filling up</h2>
      <p style="line-height:1.6;">If you want design direction for a cover-up, this is the best time to schedule.</p>
      <p style="line-height:1.6;">DM <b>@ray_tattoos</b> for artist details.</p>
    </div>
  `;
}
