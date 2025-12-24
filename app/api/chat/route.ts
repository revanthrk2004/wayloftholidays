import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Resend } from "resend";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

type ChatMsg = { role: "user" | "assistant"; text: string };
type Body = { sessionId?: string; messages?: ChatMsg[] };

const TARGETS = ["Morocco", "Albania", "Montenegro", "Jordan", "Turkey"];

function safeStr(v: unknown) {
  if (typeof v !== "string") return "";
  return v.trim();
}

function isEmail(v: unknown) {
  if (typeof v !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function buildSystemPrompt() {
  return `
You are "Wayloft Concierge" for Wayloft Holidays.

Brand + tone:
- Premium, warm, sharp, confident, not robotic.
- No repetition: do NOT ask something again if it already exists in chat history.
- Ask only missing information.
- Ask 1 to 3 questions max at a time.

Business rules:
- We currently focus on these destinations: ${TARGETS.join(", ")}.
- If the user asks outside these, politely suggest the closest match OR ask if they’re open to one of the target countries.

Conversation flow (IMPORTANT):
1) First: understand what they want (their vibe + where they’re thinking).
2) Then: say to proceed you need their contact details (name + email + WhatsApp).
3) Then: collect trip details (dates or month, nights/duration, budget, travellers, departure city).
4) Suggest ideas, NOT a full plan yet, until enough details exist.
5) Conversation completed detector:
   - If you have: destination + (dates OR month) + nights/duration + budget + travellers + contact (name + email OR whatsapp)
   - Then set type="completed" with a short summary + handoff message.
   - Do NOT ask more questions after completed.

Output format:
Return VALID JSON only, matching this schema:

{
  "type": "question" | "ideas" | "completed",
  "reply": string,
  "completed": boolean,
  "handoff": string | null,
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
- type="question": you still need key info (ask only missing).
- type="ideas": you can suggest 3 to 6 premium ideas (hotel areas + vibe activities) but still missing key info.
- type="completed": you have enough info. Provide a short summary + set completed=true + include handoff message:
  "Perfect. A Wayloft advisor will reach out shortly to confirm and book everything."
`;
}

async function sendEmail(subject: string, text: string) {
  const to = process.env.LEADS_TO_EMAIL;
  if (!to) throw new Error("LEADS_TO_EMAIL missing");

  // Must be a verified sender in Resend
  const from =
    process.env.LEADS_FROM_EMAIL ||
    "Wayloft Holidays <info@wayloftholidays.com>";

  await resend.emails.send({ from, to, subject, text });
}

function pickLastUserMessage(history: ChatMsg[]) {
  return [...history].reverse().find((m) => m.role === "user")?.text?.trim() || "";
}

function lastN(history: ChatMsg[], n: number) {
  return history.slice(Math.max(0, history.length - n));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const sessionId = safeStr(body.sessionId) || `sess_${Date.now()}`;
    const history = Array.isArray(body.messages) ? body.messages : [];

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { reply: "Missing OPENAI_API_KEY. Add it in Vercel env vars." },
        { status: 500 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { reply: "Missing RESEND_API_KEY. Add it in Vercel env vars." },
        { status: 500 }
      );
    }

    // ✅ FIX: avoid OpenAI types widening to "string"
    const messages = [
      { role: "system", content: buildSystemPrompt() },
      ...history.map((m) => ({
        role: m.role,
        content: m.text,
      })),
    ] satisfies OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      messages,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || "{}";

    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    const type =
      parsed?.type === "completed"
        ? "completed"
        : parsed?.type === "ideas"
          ? "ideas"
          : "question";

    const reply =
      typeof parsed?.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "Tell me what kind of trip you want, and I’ll guide you from there.";

    const completed = type === "completed" || parsed?.completed === true;
    const handoff =
      completed
        ? (typeof parsed?.handoff === "string" && parsed.handoff.trim()
            ? parsed.handoff.trim()
            : "Perfect. A Wayloft advisor will reach out shortly to confirm and book everything.")
        : null;

    const captured = parsed?.captured || {};

    // Email content
    const lastUserMsg = pickLastUserMessage(history);

    const logSubject = `Wayloft Chat — ${sessionId.slice(0, 8)} — ${type.toUpperCase()}`;
    const logText = `WAYLOFT CHAT LOG

Session: ${sessionId}
Type: ${type}
Completed: ${completed ? "YES" : "NO"}

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
${reply}

--- Recent history (last 12) ---
${lastN(history, 12).map((m) => `${m.role.toUpperCase()}: ${m.text}`).join("\n\n")}
`;

    // ✅ Don’t break chat if email fails
    try {
      await sendEmail(logSubject, logText);
    } catch (e) {
      console.error("Resend log email failed:", e);
    }

    if (completed) {
      const planSubject = `Wayloft Chat — HANDOFF${captured?.destination ? ` — ${captured.destination}` : ""}`;
      const planText = `WAYLOFT HANDOFF (AI)

Session: ${sessionId}

Customer:
Name: ${captured?.name ?? "-"}
Email: ${captured?.email ?? "-"}
WhatsApp: ${captured?.whatsapp ?? "-"}

Trip:
From: ${captured?.fromCity ?? "-"}
Destination: ${captured?.destination ?? "-"}
Dates: ${captured?.dates ?? "-"}
Nights: ${captured?.nights ?? "-"}
Budget: ${captured?.budget ?? "-"}
Travellers: ${captured?.travellers ?? "-"}
Style: ${captured?.style ?? "-"}
Priorities: ${captured?.priorities ?? "-"}
Notes: ${captured?.notes ?? "-"}

--- Assistant final message ---
${reply}

--- Handoff ---
${handoff}
`;
      try {
        await sendEmail(planSubject, planText);
      } catch (e) {
        console.error("Resend handoff email failed:", e);
      }
    }

    // Frontend needs these
    return NextResponse.json({ reply, completed, handoff });
  } catch (err) {
    console.error("API /chat error:", err);
    return NextResponse.json(
      { reply: "Something went wrong. Try again in a moment." },
      { status: 500 }
    );
  }
}
