import { NextRequest, NextResponse } from "next/server";
import { getTattooOpenAI } from "@/lib/tattoo-ai";

function buildFallback(topic: string) {
  return {
    title: `SEO Content Angle: ${topic}`,
    metaDescription:
      "A tattoo-focused content brief built to target local search, educate first-time clients, and support offer-based conversion pages.",
    outline: [
      `Why "${topic}" matters to local tattoo search intent`,
      "How to tie the topic to trust, pricing clarity, and aftercare confidence",
      "Offer CTA placement for half-sleeve consults and flash specials",
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const openai = getTattooOpenAI();
    if (!openai) {
      return NextResponse.json(buildFallback(String(topic)));
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content:
            "You create SEO content briefs for tattoo studios. Return a JSON object with title, metaDescription, and outline as an array of 4 short bullet strings. Focus on local intent, trust, and booking conversion.",
        },
        {
          role: "user",
          content: `Create a content brief for this topic: ${String(topic)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(buildFallback(String(topic)));
    }

    const parsed = JSON.parse(raw) as {
      title?: string;
      metaDescription?: string;
      outline?: string[];
    };

    return NextResponse.json({
      title: parsed.title || `SEO Content Angle: ${topic}`,
      metaDescription:
        parsed.metaDescription ||
        "Local tattoo SEO brief with trust-building and conversion-focused structure.",
      outline:
        Array.isArray(parsed.outline) && parsed.outline.length > 0
          ? parsed.outline
          : buildFallback(String(topic)).outline,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "SEO generation failed.",
      },
      { status: 500 }
    );
  }
}
