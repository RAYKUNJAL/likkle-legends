import { NextResponse } from "next/server";
import { runDailyTattooSeoAgent } from "@/lib/services/tattoo-seo-agent";

export async function POST() {
  try {
    const result = await runDailyTattooSeoAgent();

    return NextResponse.json({
      success: true,
      researchedTopic: result.idea.topic,
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
        error: error instanceof Error ? error.message : "Unable to run tattoo SEO agent.",
      },
      { status: 500 }
    );
  }
}
