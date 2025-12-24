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

FLOW (STRICT):
A) Trip basics first: destination + dates/rough window + travellers + budget (rough is fine).
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
- If the conversation is completed and the user comes back with extra details, be warm:
  Ask: "Sure, what would you like to add?" then capture it in notes.
  After capturing, ask "Anything else you want to add?" again.

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

Stage rules:
- intake: missing key trip basics
- refine: ask ONE missing detail (including contact fields)
- confirm_done: only when asking "Anything else you want to add?"
- completed: ONLY when user says no/nothing else/that's all
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

function isProbablyYes(msg: string) {
  const lower = msg.toLowerCase().trim();
  return ["yes", "yep", "yeah", "yup", "sure", "ok", "okay"].includes(lower);
}

// ---------- Auto-capture helpers (fixes phone/email repeating) ----------
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
// ----------------------------------------------------------------------

function replyMentionsAnythingElse(reply: string) {
  return /anything else you want to add\?/i.test(reply);
}

function replyMentionsAdvisor(reply: string) {
  return /advisor will reach out/i.test(reply);
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

    const lastUserMsg =
      [...history].reverse().find((m) => m.role === "user")?.text?.trim() || "";

    const looksLikeNo = isProbablyNo(lastUserMsg);
    const looksLikeYes = isProbablyYes(lastUserMsg);

    // If user says YES while we're not at the "anything else" question,
    // treat it as normal text (don't flip stages / don't end).
    // We'll just pass to the model, but we will NOT mark completed.
    // Also: if they come back after completed, we reopen properly.
    let effectiveStage: Meta["stage"] = prevStage;
    let effectiveCaptured: Captured = { ...prevCaptured };

    // If user typed after "completed" and it’s NOT a “no”, treat as extra details and reopen.
    if (prevStage === "completed" && !looksLikeNo && lastUserMsg.trim()) {
      effectiveStage = "confirm_done";
      effectiveCaptured.notes = appendNotes(effectiveCaptured.notes, lastUserMsg);
    }

    // Auto-capture from raw user message BEFORE model (fixes WhatsApp repetition)
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

    // Merge captured (prev + model + auto-capture safety)
    let mergedCaptured = mergeCaptured(effectiveCaptured, modelCaptured);

    // Auto-capture again (final safety)
    if (!mergedCaptured.email) {
      const em = extractEmail(lastUserMsg);
      if (em) mergedCaptured.email = em;
    }
    if (!mergedCaptured.whatsapp) {
      const ph = extractPhone(lastUserMsg);
      if (ph) mergedCaptured.whatsapp = ph;
    }

    // If user is adding extra details (not "no") after confirm_done/completed, store in notes
    if (!looksLikeNo && (effectiveStage === "confirm_done" || effectiveStage === "completed")) {
      mergedCaptured.notes = appendNotes(mergedCaptured.notes, lastUserMsg);
    }

    // ----------------- SERVER-SIDE GUARDS (fix wrong YES/NO place + early completion) -----------------

    // Guard 1: confirm_done must ONLY be used when asking the "anything else" question
    if (stage === "confirm_done" && !replyMentionsAnythingElse(reply)) {
      stage = "refine";
    }

    // Guard 2: completed must ONLY happen when the USER said "no/nothing else"
    // Also: it's safest if they were previously at confirm_done (they saw the anything else question).
    // If model tries to complete early, we force it back to confirm_done and ask properly.
    if (stage === "completed" && !looksLikeNo) {
      stage = "confirm_done";

      // If model already said advisor line too early, rewrite gently into the correct flow.
      // Keep it short + premium.
      reply = `Perfect. I’ve noted that.\n\nAnything else you want to add?`;
    }

    // Guard 3: if user typed "Yes" at random times, do NOT treat as completion signal.
    // (This mainly stops weird loops if model gets confused.)
    if (looksLikeYes && stage === "completed") {
      stage = "refine";
    }

    // Guard 4: ensure the flow asks fromCity after WhatsApp (if missing)
    // If WhatsApp is present and fromCity missing, and the model is moving on, we redirect.
    const hasWhatsapp = !!mergedCaptured.whatsapp;
    const missingFromCity = !mergedCaptured.fromCity;

    if (hasWhatsapp && missingFromCity) {
      const alreadyAskingFromCity =
        /depart|departure|from which city|leaving from|which city are you flying from/i.test(reply);

      // Only force this if we are not in intake (they already gave enough to reach contact stage)
      // and the assistant is not currently asking for fromCity.
      if (!alreadyAskingFromCity && stage !== "intake") {
        stage = "refine";
        reply = `Perfect, thank you. Which city will you be departing from?`;
      }
    }

    // Guard 5: when truly completed, always include the advisor handoff line
    if (stage === "completed" && looksLikeNo && !replyMentionsAdvisor(reply)) {
      reply = `${reply}\n\nPerfect. A Wayloft advisor will reach out shortly.`;
    }

    // -----------------------------------------------------------------------------------------------

    // Email rules:
    // - Email ONLY when stage is completed AND user said NO (conversation truly finished)
    // - If user later adds extra details and completes again, hash changes -> email again (UPDATED)
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
        const isUpdate = prevStage === "completed"; // if they had previously completed, this is an update

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
Budget: ${mergedCaptured.budget ?? "-"}
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
