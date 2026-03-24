import { NextRequest, NextResponse } from "next/server";
import { getTattooOpenAI } from "@/lib/tattoo-ai";

function fallbackReply(message: string) {
  const text = message.toLowerCase();

  if (text.includes("half sleeve")) {
    return "The $500 half-sleeve offer is best for clients ready to commit to a larger concept. Bring your reference ideas, preferred placement, and timeline so the consult can move straight toward booking.";
  }

  if (text.includes("2 for $100") || text.includes("flash")) {
    return "The 2 for $100 special is positioned for simple flash or micro tattoos that fit inside a business-card-size area. It works best for small symbols, script, or quick matching ideas.";
  }

  return "Start with your tattoo size, placement, and style direction. If it is a larger custom piece, the half-sleeve consult is the better path. If it is a quick micro design, the flash special is usually the better fit.";
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const openai = getTattooOpenAI();
    if (!openai) {
      return NextResponse.json({ reply: fallbackReply(message) });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are a tattoo studio booking assistant for Island City Tattoos. Keep replies concise, friendly, and focused on qualifying the client for the half-sleeve offer, the 2 for $100 flash deal, or a general consult. Never invent medical advice. Encourage final artistic decisions during the studio consult.",
        },
        {
          role: "user",
          content: String(message),
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim() || fallbackReply(String(message));
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Chat failed.",
      },
      { status: 500 }
    );
  }
}
