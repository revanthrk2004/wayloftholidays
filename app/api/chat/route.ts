import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Body = { message: string };

function buildSystemPrompt() {
  return `
You are Wayloft Concierge, a premium travel planner for Wayloft Holidays.
Be warm, confident, and concise.
Ask 2-4 smart follow-up questions if needed.
When the user provides destination/dates/budget/travellers, summarise it nicely and suggest a next step.
Never mention internal policies or code.
`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const message = (body?.message || "").trim();

    if (!message) {
      return NextResponse.json({
        reply: "Tell me your destination, dates, budget, and travellers and I’ll plan it.",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { reply: "Missing OPENAI_API_KEY. Add it in .env.local + Vercel env vars." },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: message },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Where are you going, when, and what’s your budget?";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: "Something went wrong. Try again in a moment." },
      { status: 500 }
    );
  }
}
