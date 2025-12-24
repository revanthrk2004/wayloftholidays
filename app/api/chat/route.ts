import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Resend } from "resend";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

type ChatMsg = { role: "user" | "assistant"; text: string };

type Body = {
  sessionId?: string;
  messages?: ChatMsg[];
  targets?: string[];
};

function buildSystemPrompt(targets: string[]) {
  const targetLine = targets?.length
    ? `Target destinations we currently sell most: ${targets.join(", ")}.`
    : "We have multiple destinations.";

  return `
You are "Wayloft Concierge", a premium travel planner for Wayloft Holidays.

Goals:
- Be warm, confident, and efficient. No repetitive questions.
- Do NOT ask for a detail if the user already provided it earlier in the chat.
- Ask only the missing details needed to create a premium plan.

You must gather these fields (only ask what is missing):
1) Destination (or shortlist)
2) Dates OR month + flexibility
3) Duration (nights)
4) Budget (currency + total or per person)
5) Travellers (count + who: couple/friends/family)
6) Departure city
7) Travel style (luxury, romantic, adventure, relaxation, foodie, city, nature)
8) Priorities (views, 5-star, hidden gems, safety, instagram spots, fast/slow itinerary)
9) Constraints (diet, mobility, no early mornings, safety concerns)
10) Contact details if offered (email/WhatsApp) - never force it

Behaviour rules:
- If user greets ("hi"), reply friendly and ask 2-3 high-signal questions.
- If user gives a destination shortlist, help them pick by asking 2 questions max (budget + vibe) then proceed.
- Summarise what you know so far before asking missing details.

When you have enough info, produce a complete plan.
Output format:
- Start with "SUMMARY:" (bullets)
- Then "PLAN:" (day-by-day or structured itinerary)
- Then "NEXT:" (one clear next step)
- If it is a full plan, include this exact marker on its own line: <<<FINAL_PLAN>>>

Never mention internal policies or code.
${targetLine}
`.trim();
}

function safeText(s: unknown) {
  return typeof s === "string" ? s : "";
}

async function sendChatEmail({
  kind,
  to,
  from,
  sessionId,
  userMsg,
  assistantMsg,
}: {
  kind: "CHAT_UPDATE" | "FINAL_PLAN";
  to: string;
  from: string;
  sessionId: string;
  userMsg: string;
  assistantMsg: string;
}) {
  const subject =
    kind === "FINAL_PLAN"
      ? `Wayloft Chat FINAL PLAN — ${sessionId}`
      : `Wayloft Chat Update — ${sessionId}`;

  const text = `
${kind === "FINAL_PLAN" ? "FINAL PLAN" : "CHAT UPDATE"}
Session: ${sessionId}
Time: ${new Date().toISOString()}

USER:
${userMsg}

ASSISTANT:
${assistantMsg}
`.trim();

  await resend.emails.send({
    from: `Wayloft Holidays <${from}>`,
    to,
    subject,
    text,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const sessionId = (body.sessionId || "unknown").slice(0, 80);
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const targets = Array.isArray(body.targets) ? body.targets : [];

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { reply: "Missing OPENAI_API_KEY. Add it in .env.local + Vercel env vars." },
        { status: 500 }
      );
    }

    const to = process.env.LEADS_TO_EMAIL;
    const fromEmail = process.env.LEADS_FROM_EMAIL;
    if (!to) {
      return NextResponse.json(
        { reply: "Missing LEADS_TO_EMAIL env var." },
        { status: 500 }
      );
    }
    if (!fromEmail) {
      return NextResponse.json(
        { reply: "Missing LEADS_FROM_EMAIL env var (must be your verified domain email)." },
        { status: 500 }
      );
    }

    // last user message for the email log
    const lastUser = [...messages].reverse().find((m) => m?.role === "user");
    const lastUserText = safeText(lastUser?.text).trim();

    // build OpenAI messages
    const oaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: buildSystemPrompt(targets) },
      ...messages.map((m) => ({
        role: m.role,
        content: m.text,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: oaiMessages,
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Tell me your destination, dates, budget, and travellers and I’ll plan it.";

    // Email after every message
    // (This emails the last user message + the assistant reply)
    if (lastUserText) {
      await sendChatEmail({
        kind: "CHAT_UPDATE",
        to,
        from: fromEmail,
        sessionId,
        userMsg: lastUserText,
        assistantMsg: reply,
      });
    }

    // If final plan marker appears, send a separate FINAL PLAN email too
    if (reply.includes("<<<FINAL_PLAN>>>")) {
      await sendChatEmail({
        kind: "FINAL_PLAN",
        to,
        from: fromEmail,
        sessionId,
        userMsg: lastUserText || "(no user text captured)",
        assistantMsg: reply,
      });
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: "Something went wrong. Try again in a moment." },
      { status: 500 }
    );
  }
}
