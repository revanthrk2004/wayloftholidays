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
- Premium, warm, calm, human. Never sound like a coded robot.
- If user greets ("hey", "how are you"), respond warmly in 1 line, then continue.
- Ask only what is missing. NEVER repeat questions already answered.

Business rules:
- We currently focus on: ${TARGETS.join(", ")}.
- If user asks outside these, suggest the closest match or ask if open to target countries.

IMPORTANT flow:
1) First understand what they want (destination / vibe / dates rough / budget rough / travellers).
2) Then say: "To proceed, I just need your contact details" and ask for ONLY ONE at a time:
   - Name → then Email → then WhatsApp → then optionally From City.
   (Do not ask multiple contact questions in one message.)
3) Then ask 1 smart refinement question (style OR priorities), one at a time.
4) Then give "ideas" (not full day-by-day):
   - 3 to 6 bullets: areas to stay, 2–3 must-do experiences, realistic notes.
5) Then ask: "Anything else you want to add?" (YES/NO).
6) stage="completed" ONLY when user clearly says "no / nothing else / that's all".

Critical anti-repetition:
- If captured.whatsapp is present, NEVER ask for WhatsApp again.
- If captured.email is present, NEVER ask for email again.
- If captured.name is present, NEVER ask for name again.

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

Stage rules:
- "intake" when key trip basics missing.
- "refine" when basics are there but need 1 missing detail (ask ONE question).
- "confirm_done" when you have enough + you have given ideas + now asking "Anything else?"
- "completed" ONLY when user clearly says "no / nothing else / that's all".
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

function isProbablyNo(msg: string) {
  const lower = msg.toLowerCase().trim();
  return [
    "no",
    "nope",
    "nothing",
    "nothing else",
    "thats all",
    "that's all",
    "done",
    "all good",
    "no thanks",
    "no thank you",
  ].includes(lower);
}

// ---------- Auto-capture helpers (THIS FIXES WHATSAPP REPEATING) ----------
function extractEmail(text: string): string | null {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0].trim() : null;
}

function normalizePhone(raw: string): string {
  // keep + and digits
  let v = raw.replace(/[^\d+]/g, "");
  // convert 00xx -> +xx
  if (v.startsWith("00")) v = "+" + v.slice(2);
  // UK local 07... -> +44...
  if (v.startsWith("07") && v.length >= 10) v = "+44" + v.slice(1);
  // If no + and long number, leave as-is
  return v;
}

function extractPhone(text: string): string | null {
  // catches: 07..., +44..., 0044..., spaced numbers
  const m = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
  if (!m) return null;
  const cleaned = normalizePhone(m[0]);
  // basic sanity: at least 10 digits
  const digits = cleaned.replace(/[^\d]/g, "");
  if (digits.length < 10) return null;
  return cleaned;
}

function mergeCaptured(prev: Captured, incoming: Captured): Captured {
  const out: Captured = { ...prev };
  (Object.keys(out) as (keyof Captured)[]).forEach((k) => {
    const next = incoming[k];
    if (typeof next === "string" && next.trim()) out[k] = next.trim();
    // allow explicit null to NOT wipe previous
  });
  return out;
}

function appendNotes(existing: string | null, extra: string) {
  const e = (existing || "").trim();
  const x = extra.trim();
  if (!x) return existing;
  if (e.includes(x)) return existing;
  return e ? `${e}\n\nExtra details: ${x}` : `Extra details: ${x}`;
}
// ------------------------------------------------------------------------

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

    const lastUserMsg =
      [...history].reverse().find((m) => m.role === "user")?.text?.trim() || "";

    const looksLikeNo = isProbablyNo(lastUserMsg);

    // If user typed after "completed" and it's NOT a "no", treat as extra details
    // and reopen into confirm_done so we can capture properly and then ask anything else again.
    let effectiveStage: Meta["stage"] = prevStage;
    let effectiveCaptured: Captured = { ...prevCaptured };

    if (prevStage === "completed" && !looksLikeNo && lastUserMsg.trim()) {
      effectiveStage = "confirm_done";
      effectiveCaptured.notes = appendNotes(effectiveCaptured.notes, lastUserMsg);
    }

    // Auto-capture from raw text BEFORE calling model (fixes phone/email repetition)
    if (!effectiveCaptured.email) {
      const em = extractEmail(lastUserMsg);
      if (em) effectiveCaptured.email = em;
    }
    if (!effectiveCaptured.whatsapp) {
      const ph = extractPhone(lastUserMsg);
      if (ph) effectiveCaptured.whatsapp = ph;
    }

    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: buildSystemPrompt() },
      {
        role: "system",
        content: `Previous known details (do not repeat questions for these):
stage=${effectiveStage}
captured=${JSON.stringify(effectiveCaptured)}
`,
      },
      ...history.map((m) => ({ role: m.role, content: m.text })),
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
        : "Tell me where you want to go and roughly when, and I’ll guide you.";

    const modelCaptured = normalizeCaptured(parsed?.captured);

    // Merge: keep previous, apply model, plus our auto-capture again (final safety)
    let mergedCaptured = mergeCaptured(effectiveCaptured, modelCaptured);

    // Auto-capture again after model in case model reply missed it
    if (!mergedCaptured.email) {
      const em = extractEmail(lastUserMsg);
      if (em) mergedCaptured.email = em;
    }
    if (!mergedCaptured.whatsapp) {
      const ph = extractPhone(lastUserMsg);
      if (ph) mergedCaptured.whatsapp = ph;
    }

    // If we are in confirm_done/completed and user typed extra (not "no"), store in notes
    if (!looksLikeNo && (effectiveStage === "confirm_done" || effectiveStage === "completed")) {
      mergedCaptured.notes = appendNotes(mergedCaptured.notes, lastUserMsg);
    }

    // Email only when conversation is truly finished (stage completed AND user said no)
    let didEmail = false;
    let nextEmailHash = prevEmailHash;

    const shouldEmail = stage === "completed" && looksLikeNo;

    if (shouldEmail) {
      const emailPayload = { sessionId, stage: "completed", captured: mergedCaptured };
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
