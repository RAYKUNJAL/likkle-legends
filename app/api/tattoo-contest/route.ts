import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin";

function makeCode(email: string) {
  const prefix = email.split("@")[0].replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}${suffix}`;
}

async function notifyManyChatContestLead(payload: {
  name: string;
  email: string;
  phone?: string;
  instagramHandle?: string;
  tattooArea?: string;
  coverupDetails?: string;
  referralCode: string;
  referrerCode?: string;
  referralUrl: string;
}) {
  const webhookUrl = process.env.MANYCHAT_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "tattoo_contest_entry",
        source: "island_city_tattoos_site",
        timestamp: new Date().toISOString(),
        ...payload,
      }),
    });
  } catch {
    // Best effort only. Contest submission should not fail because webhook is unavailable.
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, instagramHandle, tattooArea, coverupDetails, referrerCode } = body ?? {};

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase();
    const referralCode = makeCode(normalizedEmail);
    const appBase = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
    const referralUrl = `${appBase}/?ref=${referralCode}`;

    try {
      const admin = createAdminClient();

      const { data: existingLead } = await admin
        .from("leads")
        .select("id, email")
        .eq("email", normalizedEmail)
        .single();

      if (!existingLead) {
        await admin.from("leads").insert({
          email: normalizedEmail,
          first_name: String(name),
          source: "tattoo_viral_contest_2026",
          interests: [
            "lead_magnet:free_coverup_consultation_design_layout",
            `instagram:${instagramHandle || ""}`,
            `phone:${phone || ""}`,
            `tattoo_area:${tattooArea || ""}`,
            `coverup_details:${coverupDetails || ""}`,
            `contest_referral_code:${referralCode}`,
            `contest_referrer_code:${referrerCode || ""}`,
          ],
          email_consent: true,
          marketing_consent: true,
        });
      }

      const now = Date.now();
      const day2 = new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString();
      const day4 = new Date(now + 4 * 24 * 60 * 60 * 1000).toISOString();

      await admin.from("email_queue").insert([
        {
          recipient_email: normalizedEmail,
          template_id: "TATTOO_CONTEST_WELCOME",
          template_data: {
            name,
            referralUrl,
            prize: "Free cover-up consultation + custom design layout",
          },
          status: "pending",
          send_at: new Date().toISOString(),
          campaign_type: "tattoo_contest",
        },
        {
          recipient_email: normalizedEmail,
          template_id: "TATTOO_CONTEST_DAY_2",
          template_data: { name, referralUrl },
          status: "pending",
          send_at: day2,
          campaign_type: "tattoo_contest",
        },
        {
          recipient_email: normalizedEmail,
          template_id: "TATTOO_CONTEST_DAY_4",
          template_data: { name },
          status: "pending",
          send_at: day4,
          campaign_type: "tattoo_contest",
        },
      ]);
    } catch {
      // Keep the contest UX working even when database config is unavailable.
    }

    await notifyManyChatContestLead({
      name: String(name),
      email: normalizedEmail,
      phone: phone ? String(phone) : undefined,
      instagramHandle: instagramHandle ? String(instagramHandle) : undefined,
      tattooArea: tattooArea ? String(tattooArea) : undefined,
      coverupDetails: coverupDetails ? String(coverupDetails) : undefined,
      referralCode,
      referrerCode: referrerCode ? String(referrerCode) : undefined,
      referralUrl,
    });

    return NextResponse.json({
      success: true,
      message: "You are entered. Share your link to increase your chances.",
      referralCode,
      referralUrl,
      prize: "Free cover-up consultation with custom design layout",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Contest submission failed.",
      },
      { status: 500 }
    );
  }
}
