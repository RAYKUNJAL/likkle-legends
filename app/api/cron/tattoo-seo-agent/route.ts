export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { runDailyTattooSeoAgent } from "@/lib/services/tattoo-seo-agent";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (process.env.NODE_ENV === "production" && process.env.CRON_SECRET && !isCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runDailyTattooSeoAgent();

    return NextResponse.json({
      success: true,
      researchedTopic: result.idea.topic,
      keywords: result.idea.keywords,
      saved: Boolean(result.savedPost),
      post: result.savedPost
        ? {
            id: result.savedPost.id,
            title: result.savedPost.title,
            slug: result.savedPost.slug,
          }
        : {
            title: result.post.title,
            slug: null,
          },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Tattoo SEO agent failed.",
      },
      { status: 500 }
    );
  }
}
