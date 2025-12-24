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

  // client meta to prevent email spam
  meta?: {
    emailed?: boolean; // if true, server will not email again for this session
  };
};

const TARGETS = ["Morocco", "Albania", "Montenegro", "Jordan", "Turkey"];

function buildSystemPrompt() {
  return `
You are "Wayloft Concierge" for Wayloft Holidays.

Brand + tone:
- Premium, warm, sharp, confident, human.
- Never repeat questions that the user already answered.
- Ask ONLY what's missing.
- Ask 1 to 2 questions max at a time.
- Be efficient.

Business:
- We currently focus on: ${TARGETS.join(", ")}.
- If user asks outside these, suggest closest match OR ask if they’re open to one of the target countries.

Conversation flow (VERY IMPORTANT):
1) First understand what they want (destination idea / vibe / type of trip).
2) Then say: "To proceed, I just need your contact details" and collect: name, email, WhatsApp.
3) Then collect trip essentials: dates or month window, nights, travellers, budget, departure city.
4) Then ask 1-2 preference questions only if missing: style (relax/food/adventure/luxury), priorities (beach, culture, desert, shopping, nightlife), any notes.
5) Then give "next-step ideas" (not a full itinerary unless user explicitly asks "make a full plan").
6) Before ending: ALWAYS ask: "Anything else you need help with?"
   - If user says "no / that's all / done" then mark conversation as CLOSED and provide a handoff message:
     "A Wayloft advisor will reach out shortly."
   - If user says yes, continue normally.

Do not “lock” the chat. Do not be rude.

Output format:
Return VALID JSON ONLY, exactly matching this schema:

{
  "type": "question" | "ideas" | "handoff",
  "status": "open" | "ready_to_close" | "closed",
  "reply": string,
  "captured": {
    "name": string | null,
    "email": string | null,
    "whatsapp": string | null,
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

Rules:
- status="open": still collecting essential info.
- status="ready_to_close": you have enough to handoff, but must ask "Anything else you need help with?"
- status="closed": user confirmed they are done (no/done/that’s all).
- type:
  - "question" when asking for missing info
  - "ideas" when giving suggestions + still open or ready_to_close
  - "handoff" only when status="closed"
`;
}

function safeStr(v: unknown) {
  if (typeof v !== "string") return "";
  return v.trim();
}

function isDoneMessage(text: string) {
  const t = text.toLowerCase().trim();
  return (
    t === "no" ||
    t === "nope" ||
    t === "done" ||
    t === "finished" ||
    t === "that’s all" ||
    t === "thats all" ||
    t === "nothing else" ||
    t === "no thanks" ||
    t === "no thank you" ||
    t.includes("that's all") ||
    t.includes("thats all") ||
    t.includes("nothing else") ||
    t.includes("all good")
  );
}

async function sendFinalSummaryEmail(sessionId: string, captured: any, lastUserMsg: string, assistantReply: string) {
  const to = process.env.LEADS_TO_EMAIL;
  if (!to) throw new Error("LEADS_TO_EMAIL missing");

  const from =
    process.env.LEADS_FROM_EMAIL || "Wayloft Holidays <info@wayloftholidays.com>";

  const subject = `WAYLOFT CHAT LOG — ${sessionId.slice(0, 8)} — COMPLETED`;

  const text = `WAYLOFT CHAT LOG

Session: ${sessionId}
Type: completed
Completed: YES

Captured:
Name: ${captured?.name ?? "-"}
Email: ${captured?.email ?? "-"}
WhatsApp: ${captured?.whatsapp ?? "-"}
From City: ${captured?.fromCity ?? "-"}
Destination: ${captured?.destination ?? "-"}
Dates: ${captured?.dates ?? "-"}
Nights: ${captured?.nights ?? "-"}
Budget: ${captured?.budget ?? "-"}
Travellers: ${captured?.travellers ?? "-"}
Style: ${captured?.style ?? "-"}
Priorities: ${captured?.priorities ?? "-"}
Notes: ${captured?.notes ?? "-"}

Last user message:
${lastUserMsg || "-"}

Assistant reply:
${assistantReply || "-"}
`;

  await resend.emails.send({ from, to, subject, text });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const sessionId = safeStr(body.sessionId) || `sess_${Date.now()}`;
    const history = Array.isArray(body.messages) ? body.messages : [];
    const emailedAlready = Boolean(body.meta?.emailed);

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

    const lastUserMsg =
      [...history].reverse().find((m) => m.role === "user")?.text?.trim() || "";

    // If user explicitly says done, we strongly push model toward closing
    const userSaysDone = lastUserMsg ? isDoneMessage(lastUserMsg) : false;

    const system = buildSystemPrompt() + (userSaysDone ? `\n\nUser just said they are done. Set status="closed" and type="handoff".` : "");

    const chatMessages = [
      { role: "system", content: system },
      ...history.map((m) =>
        m.role === "user"
          ? ({ role: "user", content: m.text } as const)
          : ({ role: "assistant", content: m.text } as const)
      ),
    ] satisfies OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
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

    const status =
      parsed?.status === "closed"
        ? "closed"
        : parsed?.status === "ready_to_close"
          ? "ready_to_close"
          : "open";

    const type =
      parsed?.type === "handoff"
        ? "handoff"
        : parsed?.type === "ideas"
          ? "ideas"
          : "question";

    const reply =
      typeof parsed?.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "Tell me what kind of trip you want and where you’re thinking. I’ll guide you.";

    const captured = parsed?.captured || {};

    // Only email once, and ONLY when closed
    let emailedNow = false;
    if (status === "closed" && !emailedAlready) {
      await sendFinalSummaryEmail(sessionId, captured, lastUserMsg, reply);
      emailedNow = true;
    }

    return NextResponse.json({
      reply,
      status,
      type,
      captured,
      emailed: emailedNow,
    });
  } catch {
    return NextResponse.json(
      { reply: "Something went wrong. Try again in a moment." },
      { status: 500 }
    );
  }
}
