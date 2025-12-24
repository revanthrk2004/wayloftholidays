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
  lastEmailHash?: string | null;      // for final completed email
  lastUpdateHash?: string | null;     // for post-completion update emails
  didEmail?: boolean;                 // whether completed email was sent
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
- If the user greets ("hey", "hi", "how are you"), reply warmly in ONE line, then continue.
- Ask only what is missing. NEVER repeat questions already answered.

Business rules:
- We currently focus on: ${TARGETS.join(", ")}.
- If user asks outside these, suggest the closest match or ask if open to target countries.

IMPORTANT flow:
1) First understand what they want (destination / vibe / dates rough / budget rough / travellers).
2) Then say: "To proceed, I just need your contact details" and ask for ONLY ONE at a time:
   - Name → Email → WhatsApp → From City (departure city).
3) Then ask 1 smart refinement question (style OR priorities), one at a time.
4) Then give "ideas" (not full day-by-day):
   - 3 to 6 bullets: areas to stay, 2–3 must-do experiences, realistic notes.
5) Then ask: "Anything else you want to add?" (YES/NO).
6) stage="completed" ONLY when user clearly says "no / nothing else / that's all".
7) When stage becomes completed, reply MUST include: "Perfect. A Wayloft advisor will reach out shortly."

Critical anti-repetition:
- If captured.whatsapp is present, NEVER ask for WhatsApp again.
- If captured.email is present, NEVER ask for email again.
- If captured.name is present, NEVER ask for name again.
- If captured.fromCity is present, NEVER ask for departure city again.

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

function looksLikeAddMoreIntent(msg: string) {
  const t = msg.toLowerCase();
  return (
    t.includes("add") ||
    t.includes("more detail") ||
    t.includes("extra") ||
    t.includes("one more") ||
    t.includes("update")
  );
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

function hasTripBasics(c: Captured) {
  return !!(c.destination && c.dates && c.budget && c.travellers);
}

function nextMissingContact(c: Captured): "name" | "email" | "whatsapp" | "fromCity" | null {
  if (!c.name) return "name";
  if (!c.email) return "email";
  if (!c.whatsapp) return "whatsapp";
  if (!c.fromCity) return "fromCity";
  return null;
}

function contactQuestion(field: "name" | "email" | "whatsapp" | "fromCity") {
  if (field === "name") return "Lovely. What’s your name?";
  if (field === "email") return "Perfect. What’s the best email to reach you on?";
  if (field === "whatsapp") return "Great. What’s your WhatsApp number (with country code if possible)?";
  return "And which city are you departing from?";
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
    const prevUpdateHash = prevMeta.lastUpdateHash || null;
    const prevDidEmail = !!prevMeta.didEmail;

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

    const looksNo = isProbablyNo(lastUserMsg);

    // Start from previous captured
    let effectiveStage: Meta["stage"] = prevStage;
    let effectiveCaptured: Captured = { ...prevCaptured };

    // If user types after completed:
    // - If it's "add more" intent -> ask what to add (don’t generate random trip stuff)
    // - If it's actual content -> save to notes + email update + ask anything else
    const userIsAfterCompletion = prevStage === "completed";

    // Auto-capture email/phone early (stops repetition)
    if (!effectiveCaptured.email) {
      const em = extractEmail(lastUserMsg);
      if (em) effectiveCaptured.email = em;
    }
    if (!effectiveCaptured.whatsapp) {
      const ph = extractPhone(lastUserMsg);
      if (ph) effectiveCaptured.whatsapp = ph;
    }

    // If completed and user wants to add more, handle WITHOUT calling model
    if (userIsAfterCompletion && !looksNo) {
      // If they are saying “I want to add extra” but not giving details yet
      if (looksLikeAddMoreIntent(lastUserMsg) && lastUserMsg.length < 60) {
        return NextResponse.json({
          reply: "Of course. What would you like to add or change? Just type it here.",
          meta: {
            stage: "confirm_done",
            captured: effectiveCaptured,
            lastEmailHash: prevEmailHash,
            lastUpdateHash: prevUpdateHash,
            didEmail: prevDidEmail,
          },
        });
      }

      // They actually provided extra details
      const updatedCaptured = { ...effectiveCaptured };
      updatedCaptured.notes = appendNotes(updatedCaptured.notes, lastUserMsg);

      // Send UPDATE email (only if completion email already sent earlier)
      let didUpdateEmail = false;
      let nextUpdateHash = prevUpdateHash;

      if (prevDidEmail) {
        const updatePayload = { sessionId, notes: updatedCaptured.notes };
        const uhash = makeHash(JSON.stringify(updatePayload));
        if (uhash !== prevUpdateHash) {
          const subject = `WAYLOFT CHAT UPDATE — ${sessionId.slice(0, 8)} — EXTRA DETAILS`;
          const text = `WAYLOFT CHAT UPDATE

Session: ${sessionId}

Extra details added:
${lastUserMsg || "-"}

Updated Notes:
${updatedCaptured.notes || "-"}

Captured (current):
Name: ${updatedCaptured.name ?? "-"}
Email: ${updatedCaptured.email ?? "-"}
WhatsApp: ${updatedCaptured.whatsapp ?? "-"}
From City: ${updatedCaptured.fromCity ?? "-"}
Destination: ${updatedCaptured.destination ?? "-"}
Dates: ${updatedCaptured.dates ?? "-"}
Nights: ${updatedCaptured.nights ?? "-"}
Budget: ${updatedCaptured.budget ?? "-"}
Travellers: ${updatedCaptured.travellers ?? "-"}
Style: ${updatedCaptured.style ?? "-"}
Priorities: ${updatedCaptured.priorities ?? "-"}
`;

          await sendEmail(subject, text);
          didUpdateEmail = true;
          nextUpdateHash = uhash;
        }
      }

      return NextResponse.json({
        reply: `Got it, I’ve added that. Anything else you’d like to include?`,
        meta: {
          stage: "confirm_done",
          captured: updatedCaptured,
          lastEmailHash: prevEmailHash,
          lastUpdateHash: nextUpdateHash,
          didEmail: prevDidEmail,
          didUpdateEmail,
        },
      });
    }

    // Normal flow (call model)
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

    let stage: Meta["stage"] =
      parsed?.stage === "completed" ||
      parsed?.stage === "confirm_done" ||
      parsed?.stage === "refine" ||
      parsed?.stage === "intake"
        ? parsed.stage
        : "intake";

    let reply: string =
      typeof parsed?.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "Tell me where you want to go and roughly when, and I’ll guide you.";

    const modelCaptured = normalizeCaptured(parsed?.captured);

    // Merge captured
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

    // HARD GUARD: enforce one-by-one contact questions in correct order
    // When trip basics exist, collect contacts cleanly (name -> email -> whatsapp -> fromCity)
    if (hasTripBasics(mergedCaptured)) {
      const missing = nextMissingContact(mergedCaptured);
      if (missing) {
        stage = "refine";
        reply = contactQuestion(missing);
      }
    }

    // If stage becomes completed, enforce the advisor handoff line
    if (stage === "completed") {
      // only allow completed if user clearly said no
      if (!looksNo) {
        stage = "confirm_done";
      } else {
        // ensure the exact line exists
        const handoff = "Perfect. A Wayloft advisor will reach out shortly.";
        if (!reply.toLowerCase().includes("advisor will")) {
          reply = `${handoff}`;
        } else if (!reply.includes("Perfect.")) {
          reply = `${handoff}`;
        }
      }
    }

    // Email only when truly finished (stage completed AND user said no)
    let didEmail = prevDidEmail;
    let nextEmailHash = prevEmailHash;

    const shouldEmail = stage === "completed" && looksNo;

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
        lastUpdateHash: prevUpdateHash || null,
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
