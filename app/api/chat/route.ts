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
  budget: string | null; // TOTAL budget only
  travellers: string | null;
  style: string | null;
  priorities: string | null;
  notes: string | null;
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

Tone:
- Premium, warm, calm, human.
- Never sound like a coded robot.
- Ask only what is missing. NEVER repeat answered questions.
- Ask ONE question per message.

Destinations:
- We currently focus on: ${TARGETS.join(", ")}.
- If user asks outside these, politely ask if open to one of these.

BUDGET RULE (IMPORTANT):
- Budget MUST ALWAYS be the TOTAL budget for the whole trip (NOT per person).
- NEVER say "per person", "pp", "each" in your confirmations.
- If the user writes a per-person style budget, ask a quick clarification:
  "Just to confirm, is that £X total for the whole trip?"

FLOW (STRICT):
A) Trip basics first: destination + dates/rough window + travellers + TOTAL budget (rough is fine).
B) Then: "To proceed, I just need a few contact details" and ask ONE by ONE:
   1) Name
   2) Email
   3) WhatsApp number
   4) Departure city (fromCity)  <-- MUST ASK THIS after WhatsApp if missing
C) Then ask ONE smart refine question at a time (style OR priorities).
D) Then give "ideas" (not a full day-by-day plan):
   - 3 to 6 bullets: where to stay (areas), 2–3 experiences, quick practical notes.
E) Then ask exactly: "Anything else you want to add?" and present YES/NO.
F) stage="completed" ONLY when the USER clearly says: "no / nothing else / that's all".

EXTRA DETAILS AFTER COMPLETION:
- If completed and the user wants to add info, politely ask what they want to add.
- Capture it into notes (and update other fields if obvious).
- After capturing, ask: "Anything else you want to add?" again.

ANTI-REPETITION HARD RULES:
- If captured.whatsapp is present, NEVER ask for WhatsApp again.
- If captured.email is present, NEVER ask for email again.
- If captured.name is present, NEVER ask for name again.
- If captured.fromCity is present, NEVER ask for fromCity again.

Output JSON ONLY:
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

function isAddMoreIntent(msg: string) {
  const lower = msg.toLowerCase().trim();
  return (
    /(add|update|change|edit|modify).*(more|details|info)?/.test(lower) ||
    ["add more", "need add", "i need add", "add", "update", "change", "want to add"].includes(lower)
  );
}

function replyMentionsAnythingElse(reply: string) {
  return /anything else you want to add\?/i.test(reply);
}

function replyMentionsAdvisor(reply: string) {
  return /advisor will reach out/i.test(reply);
}

// ---------- Auto-capture helpers ----------
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

function mentionsPerPerson(text: string) {
  const t = text.toLowerCase();
  return /\b(per person|pp|each|per head)\b/.test(t);
}

function extractBudgetNumber(text: string): number | null {
  // accepts: £2000, 2000 pounds, 2,000, etc.
  const m = text
    .replace(/,/g, "")
    .match(/(?:£\s*)?(\d{2,})(?:\s*(?:pounds|gbp))?/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
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

function stripPerPersonPhrases(reply: string) {
  // remove "per person" language if model sneaks it in
  return reply
    .replace(/\bper person\b/gi, "in total")
    .replace(/\bpp\b/gi, "in total")
    .replace(/\bper head\b/gi, "in total")
    .replace(/\beach\b/gi, "in total");
}
// ----------------------------------------

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
    const wantsAddMore = isAddMoreIntent(lastUserMsg);

    // 1) If already completed and user says "add more", ask what to add (no model call)
    if (prevStage === "completed" && wantsAddMore) {
      return NextResponse.json({
        reply: "Of course. What would you like to add or change? Just type it here.",
        meta: {
          stage: "refine",
          captured: prevCaptured,
          lastEmailHash: prevEmailHash,
          didEmail: false,
        },
      });
    }

    // 2) If completed and user typed extra details, capture + ask Anything else again
    let effectiveStage: Meta["stage"] = prevStage;
    let effectiveCaptured: Captured = { ...prevCaptured };

    if (prevStage === "completed" && !looksLikeNo && !wantsAddMore && lastUserMsg.trim()) {
      effectiveStage = "confirm_done";
      effectiveCaptured.notes = appendNotes(effectiveCaptured.notes, lastUserMsg);
    }

    // Auto-capture email/whatsapp from message
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

    let stage: Meta["stage"] =
      parsed?.stage === "completed" ||
      parsed?.stage === "confirm_done" ||
      parsed?.stage === "refine" ||
      parsed?.stage === "intake"
        ? parsed.stage
        : "intake";

    let reply =
      typeof parsed?.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "Tell me what kind of trip you want and where you’re thinking, and I’ll guide you.";

    const modelCaptured = normalizeCaptured(parsed?.captured);

    // Merge captured: previous -> model -> auto-capture final safety
    let mergedCaptured = mergeCaptured(effectiveCaptured, modelCaptured);

    if (!mergedCaptured.email) {
      const em = extractEmail(lastUserMsg);
      if (em) mergedCaptured.email = em;
    }
    if (!mergedCaptured.whatsapp) {
      const ph = extractPhone(lastUserMsg);
      if (ph) mergedCaptured.whatsapp = ph;
    }

    // If extra detail message happened (not "no") while in confirm_done/completed, store in notes
    if (!looksLikeNo && (effectiveStage === "confirm_done" || effectiveStage === "completed")) {
      mergedCaptured.notes = appendNotes(mergedCaptured.notes, lastUserMsg);
    }

    // ----------------- BUDGET HARD ENFORCEMENT (TOTAL ONLY) -----------------
    // If the user message looks like per-person budget, do NOT accept it as final.
    // Ask a single clarification for TOTAL budget.
    const userUsedPerPerson = mentionsPerPerson(lastUserMsg);
    const num = extractBudgetNumber(lastUserMsg);

    if (userUsedPerPerson && num !== null) {
      // Force a clean clarification and prevent "per person" language.
      stage = "refine";
      reply = `Just to confirm, is that £${num} total for the whole trip?`;
      // Don’t lock a per-person value into captured.budget
      // (we keep previous budget if it existed, but we do NOT overwrite with this)
    }

    // Also: if the model reply contains "per person", kill it.
    reply = stripPerPersonPhrases(reply);
    // ----------------------------------------------------------------------

    // confirm_done ONLY when asking Anything else
    if (stage === "confirm_done" && !replyMentionsAnythingElse(reply)) {
      if (prevStage === "completed") {
        stage = "confirm_done";
        reply = "Perfect, I’ve noted that. Anything else you want to add?";
      } else {
        stage = "refine";
      }
    }

    // completed ONLY if user actually said "No"
    if (stage === "completed" && !looksLikeNo) {
      stage = "confirm_done";
      reply = "Perfect, I’ve noted that. Anything else you want to add?";
    }

    // Ensure fromCity asked after WhatsApp if missing (and we’re not in intake)
    const hasWhatsapp = !!mergedCaptured.whatsapp;
    const missingFromCity = !mergedCaptured.fromCity;

    if (hasWhatsapp && missingFromCity && stage !== "intake") {
      const alreadyAskingFromCity =
        /depart|departure|from which city|leaving from|which city are you flying from/i.test(reply);

      if (!alreadyAskingFromCity) {
        stage = "refine";
        reply = "Perfect, thank you. Which city will you be departing from?";
      }
    }

    // When completed, ALWAYS include advisor handoff
    if (stage === "completed" && looksLikeNo && !replyMentionsAdvisor(reply)) {
      reply = `${reply}\n\nPerfect. A Wayloft advisor will reach out shortly.`;
    }

    // If user just added extra details after completion, end with Anything else again
    if (prevStage === "completed" && !looksLikeNo && !wantsAddMore && lastUserMsg.trim()) {
      stage = "confirm_done";
      reply = "Perfect, I’ve noted that. Anything else you want to add?";
    }

    // ----------------- Email behaviour -----------------
    // Email only when stage completed AND user said no.
    // If they completed earlier and now completed again with new notes, hash changes -> sends UPDATE email.
    let didEmail = false;
    let nextEmailHash = prevEmailHash;

    const shouldEmail = stage === "completed" && looksLikeNo;

    if (shouldEmail) {
      const emailPayload = {
        sessionId,
        stage: "completed",
        captured: mergedCaptured,
      };
      const hash = makeHash(JSON.stringify(emailPayload));

      if (hash !== prevEmailHash) {
        const isUpdate = prevStage === "completed";

        const subject = isUpdate
          ? `WAYLOFT CHAT UPDATE — ${sessionId.slice(0, 8)} — UPDATED DETAILS`
          : `WAYLOFT CHAT LOG — ${sessionId.slice(0, 8)} — COMPLETED`;

        const text = `WAYLOFT ${isUpdate ? "UPDATED DETAILS" : "CHAT LOG"}

Session: ${sessionId}
Stage: completed
Completed: YES
${isUpdate ? "Update: YES (customer added extra details after completion)" : ""}

Captured:
Name: ${mergedCaptured.name ?? "-"}
Email: ${mergedCaptured.email ?? "-"}
WhatsApp: ${mergedCaptured.whatsapp ?? "-"}
From City: ${mergedCaptured.fromCity ?? "-"}
Destination: ${mergedCaptured.destination ?? "-"}
Dates: ${mergedCaptured.dates ?? "-"}
Nights: ${mergedCaptured.nights ?? "-"}
Budget (TOTAL): ${mergedCaptured.budget ?? "-"}
Travellers: ${mergedCaptured.travellers ?? "-"}
Style: ${mergedCaptured.style ?? "-"}
Priorities: ${mergedCaptured.priorities ?? "-"}
Notes: ${mergedCaptured.notes ?? "-"}

Last user message:
${lastUserMsg || "-"}

--- Recent history (last 16) ---
${history
  .slice(-16)
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
