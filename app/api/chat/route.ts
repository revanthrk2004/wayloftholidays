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
  notes: string | null;
};

type Stage =
  | "intake"
  | "contact_name"
  | "contact_email"
  | "contact_whatsapp"
  | "contact_fromCity"
  | "refine_style"
  | "refine_priorities"
  | "confirm_done"
  | "completed"
  | "add_more";

type Meta = {
  stage?: Stage;
  captured?: Partial<Captured>;
  lastEmailHash?: string | null; // last completion/update email hash
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

TONE:
- Premium, calm, warm, human. Never sound like a coded robot.
- If the user greets, reply warmly in 1 line, then continue normally.
- Ask ONE question at a time.
- NEVER repeat a question if the answer already exists in captured or history.

BUSINESS:
- We currently focus on: ${TARGETS.join(", ")}.
- If user asks outside these, politely suggest one of them and ask if open.

FLOW (STRICT):
A) Trip basics (intake):
   - destination, dates (or window), travellers, budget (rough) and optionally vibe.
   - Ask only missing fields, ONE at a time.
B) Contact details (ONE at a time, in this exact order):
   1) Name
   2) Email
   3) WhatsApp number
   4) Departure city (fromCity)
C) Refinement (ONE at a time):
   - style (luxury/culture/adventure/relax)
   - priorities (top 1-2)
D) Give ideas (NOT full plan):
   - 3 to 6 bullets (areas to stay + must-do + practical note).
E) Ask: "Anything else you want to add?" and show YES/NO.
F) If user says NO:
   - stage must be "completed"
   - reply must include: "Perfect. A Wayloft advisor will reach out shortly."
G) If user says YES:
   - stage becomes "add_more"
   - ask: "What would you like to add or change?"
H) If user adds extra details after completion:
   - stage becomes "add_more" (do NOT restart the whole intake)
   - capture it into notes or correct field
   - then ask "Anything else you want to add? (Yes/No)" again

IMPORTANT:
- Only ask Yes/No when you are at the end (confirm_done).
- If stage is "completed" and user types anything other than "no", treat as extra details.
- Do not send rude/short replies.

OUTPUT:
Return VALID JSON only:
{
  "stage": "${[
    "intake",
    "contact_name",
    "contact_email",
    "contact_whatsapp",
    "contact_fromCity",
    "refine_style",
    "refine_priorities",
    "confirm_done",
    "completed",
    "add_more",
  ].join('" | "')}",
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
    "nah",
  ].includes(lower);
}

function looksLikeAddMore(msg: string) {
  const lower = msg.toLowerCase().trim();
  return (
    lower.includes("add more") ||
    lower.includes("need add") ||
    lower.includes("add extra") ||
    lower.includes("update") ||
    lower.includes("change") ||
    lower === "yes"
  );
}

// -------- Auto capture helpers --------
function extractEmail(text: string): string | null {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0].trim() : null;
}

function normalizePhone(raw: string): string {
  let v = raw.replace(/[^\d+]/g, "");
  if (v.startsWith("00")) v = "+" + v.slice(2);
  if (v.startsWith("07") && v.length >= 10) v = "+44" + v.slice(1);
  return v;
}

function extractPhone(text: string): string | null {
  const m = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
  if (!m) return null;
  const cleaned = normalizePhone(m[0]);
  const digits = cleaned.replace(/[^\d]/g, "");
  if (digits.length < 10) return null;
  return cleaned;
}

function extractBudget(text: string): string | null {
  const t = text.replace(/,/g, "").trim();
  // catches: "budget 5000", "£5000", "5000"
  const m = t.match(/(?:£\s*)?(\d{3,})(?:\s*(?:gbp|pounds|£))?/i);
  if (!m) return null;
  return m[1] ? `£${m[1]}` : null;
}

function mergeCaptured(prev: Captured, incoming: Captured): Captured {
  const out: Captured = { ...prev };
  (Object.keys(out) as (keyof Captured)[]).forEach((k) => {
    const next = incoming[k];
    if (typeof next === "string" && next.trim()) out[k] = next.trim();
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

function computeStageFromCaptured(c: Captured): Stage {
  // trip basics
  if (!c.destination || !c.dates || !c.travellers || !c.budget) return "intake";

  // contact
  if (!c.name) return "contact_name";
  if (!c.email) return "contact_email";
  if (!c.whatsapp) return "contact_whatsapp";
  if (!c.fromCity) return "contact_fromCity";

  // refine
  if (!c.style) return "refine_style";
  if (!c.priorities) return "refine_priorities";

  return "confirm_done";
}
// --------------------------------------

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const sessionId = safeStr(body.sessionId) || `sess_${Date.now()}`;
    const history = Array.isArray(body.messages) ? body.messages : [];

    const prevMeta = body.meta || {};
    const prevCaptured = normalizeCaptured(prevMeta.captured);
    const prevStage: Stage = (prevMeta.stage as Stage) || computeStageFromCaptured(prevCaptured);
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

    const userSaidNo = isProbablyNo(lastUserMsg);

    // Start with previous captured
    let effectiveCaptured: Captured = { ...prevCaptured };
    let effectiveStage: Stage = prevStage;

    // Auto-capture email/phone early to prevent repetition
    if (!effectiveCaptured.email) {
      const em = extractEmail(lastUserMsg);
      if (em) effectiveCaptured.email = em;
    }
    if (!effectiveCaptured.whatsapp) {
      const ph = extractPhone(lastUserMsg);
      if (ph) effectiveCaptured.whatsapp = ph;
    }

    // Post-completion behaviour:
    // If conversation completed but user types anything (not "no"), treat as add_more.
    if (prevStage === "completed" && lastUserMsg.trim() && !userSaidNo) {
      effectiveStage = "add_more";

      const b = extractBudget(lastUserMsg);
      if (b) {
        effectiveCaptured.budget = b;
      } else {
        effectiveCaptured.notes = appendNotes(effectiveCaptured.notes, lastUserMsg);
      }
    }

    // If user pressed YES at confirm_done, go to add_more (ask what to add)
    if (prevStage === "confirm_done" && looksLikeAddMore(lastUserMsg)) {
      effectiveStage = "add_more";
    }

    // If user is in add_more and typed something meaningful, store it
    if (effectiveStage === "add_more" && lastUserMsg.trim() && !looksLikeAddMore(lastUserMsg)) {
      const b = extractBudget(lastUserMsg);
      if (b) effectiveCaptured.budget = b;
      else effectiveCaptured.notes = appendNotes(effectiveCaptured.notes, lastUserMsg);
    }

    // IMPORTANT: we do NOT let the model randomly decide the stage.
    // We compute stage from captured, unless we are explicitly in add_more or completed.
    const computed = computeStageFromCaptured(effectiveCaptured);
    if (effectiveStage !== "add_more" && effectiveStage !== "completed") {
      effectiveStage = computed;
    }

    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: buildSystemPrompt() },
      {
        role: "system",
        content: `Current internal state:
stage=${effectiveStage}
captured=${JSON.stringify(effectiveCaptured)}
Rules:
- Ask ONE question only.
- Never ask for a field that already exists in captured.
- If stage=confirm_done, ask "Anything else you want to add? (Yes/No)".
- If stage=completed, reply with "Perfect. A Wayloft advisor will reach out shortly." (warm).
- If stage=add_more, ask "What would you like to add or change?" unless user already provided the extra.`,
      },
      ...history.map((m) => ({ role: m.role, content: m.text })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.35,
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

    const modelReply =
      typeof parsed?.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "Tell me where you want to go and roughly when, and I’ll guide you.";

    const modelCaptured = normalizeCaptured(parsed?.captured);

    // Merge model + our captured (ours wins if already captured)
    let mergedCaptured = mergeCaptured(modelCaptured, effectiveCaptured);

    // auto-capture again just in case
    if (!mergedCaptured.email) {
      const em = extractEmail(lastUserMsg);
      if (em) mergedCaptured.email = em;
    }
    if (!mergedCaptured.whatsapp) {
      const ph = extractPhone(lastUserMsg);
      if (ph) mergedCaptured.whatsapp = ph;
    }

    // Determine NEXT stage (server-truth)
    let nextStage: Stage = effectiveStage;

    // If user said NO at confirm_done => completed
    if (effectiveStage === "confirm_done" && userSaidNo) {
      nextStage = "completed";
    }

    // If we were add_more and user just added something, go back to confirm_done
    if (effectiveStage === "add_more" && lastUserMsg.trim() && !looksLikeAddMore(lastUserMsg)) {
      nextStage = "confirm_done";
    }

    // If we’re not add_more/completed, keep computed stage from fields
    if (nextStage !== "add_more" && nextStage !== "completed") {
      nextStage = computeStageFromCaptured(mergedCaptured);
    }

    // Force the correct “advisor” line when completed (avoid missing it)
    let reply = modelReply;
    if (nextStage === "completed") {
      // keep it warm + professional, not double paragraphs
      reply = "Perfect. A Wayloft advisor will reach out shortly.";
    }

    // ---------- EMAIL RULES ----------
    // 1) Send one email on completion (user said No at confirm_done)
    // 2) If user later adds extra details, send an UPDATE email only when they finish again (say No)
    let didEmail = false;
    let nextEmailHash = prevEmailHash;

    const shouldEmailNow =
      nextStage === "completed" &&
      (userSaidNo || prevStage === "confirm_done" || prevStage === "add_more" || prevStage === "completed");

    if (shouldEmailNow) {
      const emailPayload = { sessionId, stage: "completed", captured: mergedCaptured };
      const hash = makeHash(JSON.stringify(emailPayload));

      if (hash !== prevEmailHash) {
        const isUpdate = prevEmailHash !== null; // if already emailed once before, this is an update
        const subject = isUpdate
          ? `WAYLOFT CHAT UPDATE — ${sessionId.slice(0, 8)}`
          : `WAYLOFT CHAT LOG — ${sessionId.slice(0, 8)} — COMPLETED`;

        const text = `WAYLOFT ${isUpdate ? "UPDATE" : "CHAT LOG"}

Session: ${sessionId}
Stage: completed
${isUpdate ? "Update: YES" : "Completed: YES"}

Captured:
Name: ${mergedCaptured.name ?? "-"}
Email: ${mergedCaptured.email ?? "-"}
WhatsApp: ${mergedCaptured.whatsapp ?? "-"}
Departure City: ${mergedCaptured.fromCity ?? "-"}
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

    // UI helper: only show Yes/No buttons when we are truly asking “Anything else?”
    const ui = {
      showAnythingElse: nextStage === "confirm_done",
      showAddMoreHint: nextStage === "completed",
    };

    return NextResponse.json({
      reply,
      meta: {
        stage: nextStage,
        captured: mergedCaptured,
        lastEmailHash: nextEmailHash,
        didEmail,
        ui,
      },
    });
  } catch {
    return NextResponse.json(
      { reply: "Something went wrong. Try again in a moment." },
      { status: 500 }
    );
  }
}
