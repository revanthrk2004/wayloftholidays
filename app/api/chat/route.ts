import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Resend } from "resend";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

type ChatMsg = { role: "user" | "assistant"; text: string };

type Captured = {
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  fromCity: string | null;
  destination: string | null;
  dates: string | null;
  nights: string | null;
  budget: string | null;
  travellers: string | null;
  style: string | null;
  priorities: string | null;
  notes: string | null; // includes extra details
};

type Meta = {
  stage?: "intake" | "refine" | "confirm_done" | "completed";
  captured?: Partial<Captured>;
  lastEmailHash?: string | null;
};

type Body = {
  sessionId?: string;
  messages?: ChatMsg[];
  meta?: Meta;
};

const TARGETS = ["Morocco", "Albania", "Montenegro", "Jordan", "Turkey"];

const EMPTY_CAPTURED: Captured = {
  name: null,
  email: null,
  whatsapp: null,
  fromCity: null,
  destination: null,
  dates: null,
  nights: null,
  budget: null,
  travellers: null,
  style: null,
  priorities: null,
  notes: null,
};

function buildSystemPrompt() {
  return `
You are "Wayloft Concierge" for Wayloft Holidays.

Brand + tone:
- Premium, warm, sharp, confident, not robotic.
- Ask only what is missing. NEVER repeat questions already answered.

Business rules:
- We currently focus on: ${TARGETS.join(", ")}.
- If user asks outside these, suggest the closest match or ask if open to target countries.

IMPORTANT flow (very important):
1) First understand what they want (destination / vibe / dates rough / budget rough / travellers).
2) Then say: "To proceed, I just need your contact details" and ask for:
   - Name, Email, WhatsApp (and optionally fromCity).
3) Then ask 1–2 smart refinement questions (style/priorities).
4) Then give "ideas" (not a full day-by-day plan):
   - 3 to 6 bullets: areas to stay, 2–3 must-do experiences, realistic notes.
5) Then ask: "Anything else you want to add?" and present YES/NO.
6) If user says NO (or equivalent), set stage="completed" and reply with a warm handoff:
   "Perfect. A Wayloft advisor will reach out shortly."
7) If user says YES or adds extra details, capture them into notes and continue briefly,
   then ask "Anything else?" again (stage="confirm_done").

Output format:
Return VALID JSON only:
{
  "stage": "intake" | "refine" | "confirm_done" | "completed",
  "reply": string,
  "captured": {
    "name": string|null,
    "email": string|null,
    "whatsapp": string|null,
    "fromCity": string|null,
    "destination": string|null,
    "dates": string|null,
    "nights": string|null,
    "budget": string|null,
    "travellers": string|null,
    "style": string|null,
    "priorities": string|null,
    "notes": string|null
  }
}

Rules:
- stage="intake" when key trip basics missing.
- stage="refine" when basics are there but style/priorities missing or need 1–2 clarifiers.
- stage="confirm_done" when you have enough + you have given ideas + now asking "Anything else?"
- stage="completed" ONLY when user clearly says "no / nothing else / that's all".
- notes: include any extra details user adds, especially after confirm_done.
`;
}

function safeStr(v: unknown) {
  if (typeof v !== "string") return "";
  return v.trim();
}

function normalizeCaptured(partial?: Partial<Captured>): Captured {
  return { ...EMPTY_CAPTURED, ...(partial || {}) };
}

function makeHash(input: string) {
  // simple stable hash (non-crypto) to avoid duplicate emails
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return `h_${h.toString(16)}`;
}

async function sendEmail(subject: string, text: string) {
  const to = process.env.LEADS_TO_EMAIL;
  if (!to) throw new Error("LEADS_TO_EMAIL missing");

  const from =
    process.env.LEADS_FROM_EMAIL || "Wayloft Holidays <info@wayloftholidays.com>";

  await resend.emails.send({ from, to, subject, text });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const sessionId = safeStr(body.sessionId) || `sess_${Date.now()}`;
    const history = Array.isArray(body.messages) ? body.messages : [];
    const prevMeta = body.meta || {};
    const prevStage = prevMeta.stage || "intake";
    const prevCaptured = normalizeCaptured(prevMeta.captured);
    const prevEmailHash = prevMeta.lastEmailHash || null;

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

    // Last user message (useful for summary)
    const lastUserMsg =
      [...history].reverse().find((m) => m.role === "user")?.text?.trim() || "";

    // Map history -> OpenAI format (system + user/assistant only)
    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: buildSystemPrompt() },
      ...history.map((m) => ({ role: m.role, content: m.text })),
      // Provide previous meta silently so the model doesn’t forget captured fields
      {
        role: "system",
        content: `Previous known details (do not repeat questions for these):
stage=${prevStage}
captured=${JSON.stringify(prevCaptured)}
`,
      },
    ];

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

    const stage: Meta["stage"] =
      parsed?.stage === "completed" ||
      parsed?.stage === "confirm_done" ||
      parsed?.stage === "refine" ||
      parsed?.stage === "intake"
        ? parsed.stage
        : "intake";

    const reply =
      typeof parsed?.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "Tell me where you want to go, your dates, budget, and how many travellers.";

    // Merge captured (new wins, but keep previous)
    const newCaptured = normalizeCaptured(parsed?.captured);
    const mergedCaptured: Captured = {
      ...prevCaptured,
      ...Object.fromEntries(
        Object.entries(newCaptured).map(([k, v]) => [k, v ?? (prevCaptured as any)[k]])
      ),
    } as Captured;

    // IMPORTANT:
    // If user adds extra details after confirm_done, they usually go into notes.
    // To make sure we never lose it, if we are past confirm_done and user writes something long,
    // append it to notes (unless it’s literally "no").
    const lower = lastUserMsg.toLowerCase().trim();
    const looksLikeNo =
      ["no", "nope", "nothing", "nothing else", "thats all", "that's all", "done"].includes(
        lower
      );

    if (!looksLikeNo && (prevStage === "confirm_done" || prevStage === "completed")) {
      const extra = lastUserMsg.trim();
      if (extra) {
        const existing = mergedCaptured.notes ? `${mergedCaptured.notes}\n\n` : "";
        // avoid duplicating same extra text
        if (!existing.includes(extra)) mergedCaptured.notes = `${existing}Extra details: ${extra}`;
      }
    }

    // Decide if we should email:
    // - ONLY when stage is completed (user said NO)
    // - AND the summary hash changed (prevents repeat emails)
    let didEmail = false;
    let nextEmailHash = prevEmailHash;

    if (stage === "completed") {
      const emailPayload = {
        sessionId,
        stage,
        captured: mergedCaptured,
      };
      const hash = makeHash(JSON.stringify(emailPayload));

      if (hash !== prevEmailHash) {
        const subject = `WAYLOFT CHAT LOG — ${sessionId.slice(0, 8)} — COMPLETED`;
        const text = `WAYLOFT CHAT LOG

Session: ${sessionId}
Stage: completed
Completed: YES

Captured:
Name: ${mergedCaptured.name ?? "-"}
Email: ${mergedCaptured.email ?? "-"}
WhatsApp: ${mergedCaptured.whatsapp ?? "-"}
From City: ${mergedCaptured.fromCity ?? "-"}
Destination: ${mergedCaptured.destination ?? "-"}
Dates: ${mergedCaptured.dates ?? "-"}
Nights: ${mergedCaptured.nights ?? "-"}
Budget: ${mergedCaptured.budget ?? "-"}
Travellers: ${mergedCaptured.travellers ?? "-"}
Style: ${mergedCaptured.style ?? "-"}
Priorities: ${mergedCaptured.priorities ?? "-"}
Notes: ${mergedCaptured.notes ?? "-"}

Last user message:
${lastUserMsg || "-"}

--- Recent history (last 14) ---
${history
  .slice(-14)
  .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
  .join("\n\n")}
`;

        await sendEmail(subject, text);
        didEmail = true;
        nextEmailHash = hash;
      }
    }

    // Return reply + meta so frontend can show buttons, optional add more details, etc.
    return NextResponse.json({
      reply,
      meta: {
        stage,
        captured: mergedCaptured,
        lastEmailHash: nextEmailHash,
        didEmail,
      },
    });
  } catch {
    return NextResponse.json(
      { reply: "Something went wrong. Try again in a moment." },
      { status: 500 }
    );
  }
}
