import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Resend } from "resend";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

type ChatMsg = { role: "user" | "assistant"; text: string };
type Body = { sessionId?: string; messages?: ChatMsg[] };

const TARGETS = ["Morocco", "Albania", "Montenegro", "Jordan", "Turkey"];

function buildSystemPrompt() {
  return `
You are "Wayloft Concierge" for Wayloft Holidays.

Brand + tone:
- Premium, warm, sharp, confident, not robotic.
- No repeating the same questions once the user already answered.
- Ask only the missing info. If you have enough info, stop asking and produce a plan.

Business rules:
- We currently focus on these destinations: ${TARGETS.join(", ")}.
- If the user asks for something outside these, politely suggest the closest match or ask if they’re open to one of the target countries.

Conversation behaviour (IMPORTANT):
- Maintain memory using the chat history provided.
- Do NOT ask for information that already exists in the history.
- Ask 1 to 3 questions max at a time.
- When you have enough details, generate a "final plan" with day-by-day outline + hotel area suggestions + vibe activities + safety notes.

Output format:
Return VALID JSON only, matching this schema:
{
  "type": "question" | "plan",
  "reply": string,
  "captured": {
    "destination": string | null,
    "dates": string | null,
    "nights": string | null,
    "budget": string | null,
    "travellers": string | null,
    "fromCity": string | null,
    "style": string | null,
    "priorities": string | null,
    "notes": string | null
  }
}

Rules for choosing type:
- type="question" if you still need key info to build a proper itinerary.
- type="plan" if destination + rough dates/nights + budget + travellers are known OR the user explicitly says "make a plan".
`;
}

function safeStr(v: unknown) {
  if (typeof v !== "string") return "";
  return v.trim();
}

async function sendEmail(subject: string, text: string) {
  const to = process.env.LEADS_TO_EMAIL;
  if (!to) throw new Error("LEADS_TO_EMAIL missing");

  const from =
    process.env.LEADS_FROM_EMAIL || "Wayloft Holidays <info@wayloftholidays.com>";

  await resend.emails.send({
    from,
    to,
    subject,
    text,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const sessionId = safeStr(body.sessionId) || `sess_${Date.now()}`;
    const history = Array.isArray(body.messages) ? body.messages : [];

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { reply: "Missing OPENAI_API_KEY. Add it in .env.local + Vercel env vars." },
        { status: 500 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { reply: "Missing RESEND_API_KEY. Add it in .env.local + Vercel env vars." },
        { status: 500 }
      );
    }

    // Last user message (for emailing)
    const lastUserMsg = [...history].reverse().find((m) => m.role === "user")?.text?.trim() || "";

    // Map history -> OpenAI format
const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  { role: "system", content: buildSystemPrompt() } as OpenAI.Chat.Completions.ChatCompletionSystemMessageParam,
  ...history.map(
    (m) =>
      ({
        role: m.role,
        content: m.text,
      } as OpenAI.Chat.Completions.ChatCompletionUserMessageParam |
         OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam)
  ),
];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      messages: chatMessages,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || "{}";

    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    const type = parsed?.type === "plan" ? "plan" : "question";
    const reply =
      typeof parsed?.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "Tell me your destination, dates, budget, and travellers and I’ll plan it.";

    const captured = parsed?.captured || {};

    // EMAIL 1: every message (log style)
    const logSubject = `Wayloft Chat — ${sessionId.slice(0, 8)} — Message`;
    const logText = `WAYLOFT CHAT MESSAGE

Session: ${sessionId}
Destination (captured): ${captured?.destination ?? "-"}
Type: ${type}

User:
${lastUserMsg || "-"}

Assistant:
${reply}

--- Recent history (last 12) ---
${history
  .slice(-12)
  .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
  .join("\n\n")}
`;

    await sendEmail(logSubject, logText);

    // EMAIL 2: final plan as separate heading
    if (type === "plan") {
      const dest = (captured?.destination || "").toString().trim();
      const planSubject = `Wayloft Chat — FINAL PLAN${dest ? ` — ${dest}` : ""}`;
      const planText = `WAYLOFT FINAL PLAN (AI)

Session: ${sessionId}

Captured details:
Destination: ${captured?.destination ?? "-"}
Dates: ${captured?.dates ?? "-"}
Nights: ${captured?.nights ?? "-"}
Budget: ${captured?.budget ?? "-"}
Travellers: ${captured?.travellers ?? "-"}
From: ${captured?.fromCity ?? "-"}
Style: ${captured?.style ?? "-"}
Priorities: ${captured?.priorities ?? "-"}
Notes: ${captured?.notes ?? "-"}

--- PLAN ---
${reply}
`;
      await sendEmail(planSubject, planText);
    }

    return NextResponse.json({ reply });
  } catch (err) {
    // keep error hidden from customer
    return NextResponse.json(
      { reply: "Something went wrong. Try again in a moment." },
      { status: 500 }
    );
  }
}
