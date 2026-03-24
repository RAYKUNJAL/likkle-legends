import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin";

function mapOffer(serviceGoal: string, budget: string) {
  if (serviceGoal === "half_sleeve" || budget === "$500+" || budget === "$800+") {
    return {
      recommendedOffer: "$500 Half Sleeve Offer",
      nextStep:
        "Recommend a concept consult with reference images, placement notes, and a targeted booking deposit prompt.",
    };
  }

  if (serviceGoal === "flash_special" || budget === "$100") {
    return {
      recommendedOffer: "2 for $100 Flash Special",
      nextStep:
        "Recommend sending available flash options, business-card sizing rules, and the earliest walk-in or booking slot.",
    };
  }

  return {
    recommendedOffer: "Custom Tattoo Consult",
    nextStep:
      "Recommend a general consultation with style references, body placement, and estimated session scope.",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, serviceGoal, placement, style, timeline, budget, details } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const offer = mapOffer(serviceGoal, budget);

    try {
      const admin = createAdminClient();
      await admin.from("leads").insert({
        email: String(email).toLowerCase(),
        first_name: name,
        source: "tattoo_consult_funnel",
        interests: [
          `service:${serviceGoal}`,
          `placement:${placement}`,
          `style:${style}`,
          `timeline:${timeline}`,
          `budget:${budget}`,
          `phone:${phone || ""}`,
          `details:${details || ""}`,
        ],
        email_consent: true,
        marketing_consent: true,
      });
    } catch {
      // Best effort only. The funnel should still work even when admin DB env is not configured.
    }

    return NextResponse.json({
      success: true,
      message: `${name}, your best-fit path is the ${offer.recommendedOffer}.`,
      recommendedOffer: offer.recommendedOffer,
      nextStep: offer.nextStep,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to process consult.",
      },
      { status: 500 }
    );
  }
}
