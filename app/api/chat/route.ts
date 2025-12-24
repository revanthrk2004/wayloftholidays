import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Resend } from "resend";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

type ChatMsg = { role: "user" | "assistant"; text: string };

type SessionState = {
  completed?: boolean; // user said "No" to anything else
  emailed?: boolean; // we already sent final email
  awaitingAnythingElse?: boolean; // we asked "Anything else?"
  awaitingMoreDetails?: boolean; // user said "Yes" and we are waiting for extra details
};

type Body = {
  sessionId?: string;
  messages?: ChatMsg[];
  session?: SessionState;
};

const TARGETS = ["Morocco", "Albania", "Montenegro", "Jordan", "Turkey"];

/** ----------------------------- small helpers ----------------------------- */
function safeStr(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function isEmail(v: unknown) {
  if (typeof v !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function normalizePhone(v: string) {
  // keep + and digits only
  const cleaned = v.replace(/[^\d+]/g, "");
  return cleaned;
}

function looksLikePhone(v: string) {
  const cleaned = normalizePhone(v);
  // allow +44..., 07..., etc
  return /^[+]?[\d]{8,16}$/.test(cleaned);
}

function findLatestEmail(text: string) {
  const match = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/g);
  return match?.length ? match[match.length - 1].trim() : "";
}

function findLatestPhone(text: string) {
  // supports: +44 7..., 07..., 073..., etc
  const matches = text.match(/(\+?\d[\d\s().-]{7,}\d)/g);
  if (!matches?.length) return "";
  const last = matches[matches.length - 1];
  const cleaned = normalizePhone(last);
  return looksLikePhone(cleaned) ? cleaned : "";
}

function findDestinationFromTargets(text: string) {
  const lower = text.toLowerCase();
  for (const t of TARGETS) {
    if (lower.includes(t.toLowerCase())) return t;
  }
  return "";
}

function findTravellers(text: string) {
  // "2 people" "2 travellers" "for 2" etc
  const m =
    text.match(/(\d{1,2})\s*(people|persons|travellers|travelers|pax)/i) ||
    text.match(/\bfor\s+(\d{1,2})\b/i);
  return m?.[1] ? m[1] : "";
}

function findBudget(text: string) {
  // "£2000" "2000 pounds" "2000 gbp"
  const m =
    text.match(/£\s?(\d[\d,]*)/i) ||
    text.match(/(\d[\d,]*)\s*(pounds|gbp)/i);
  if (!m?.[1]) return "";
  return m[1].replace(/,/g, "");
}

function findDates(text: string) {
  // keep it simple: capture common patterns like "12 jan - 16 jan" or "14 jan till 20 jan"
  const m =
    text.match(
      /\b(\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*)\s*(to|till|until|-|–|—)\s*(\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*)\b/i
    ) || text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s*(to|till|until|-)\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/i);

  return m ? m[0].trim() : "";
}

function findNights(text: string) {
  const m = text.match(/(\d{1,2})\s*nights?/i);
  return m?.[1] ? m[1] : "";
}

function looksLikeName(text: string) {
  const t = text.trim();
  if (!t) return false;
  if (t.length > 30) return false;
  if (isEmail(t)) return false;
  if (looksLikePhone(t)) return false;
  // letters + spaces only
  return /^[a-zA-Z][a-zA-Z\s.'-]*$/.test(t);
}

function isYes(text: string) {
  const t = text.trim().toLowerCase();
  return ["yes", "yeah", "yep", "sure", "ok", "okay", "of course"].includes(t);
}

function isNo(text: string) {
  const t = text.trim().toLowerCase();
  return ["no", "nope", "nah", "nothing", "nothing else", "all good", "that's all"].includes(t);
}

/** ------------------------- captured state from history ------------------------- */
type Captured = {
  destination: string | null;
  dates: string | null;
  nights: string | null;
  budget: string | null;
  travellers: string | null;
  fromCity: string | null;
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  style: string | null;
  priorities: string | null;
  notes: string | null;
};

function emptyCaptured(): Captured {
  return {
    destination: null,
    dates: null,
    nights: null,
    budget: null,
    travellers: null,
    fromCity: null,
    name: null,
    email: null,
    whatsapp: null,
    style: null,
    priorities: null,
    notes: null,
  };
}

/**
 * Build a best-effort captured object from the entire chat history.
 * This is the key fix for:
 * - WhatsApp repeating
 * - Extra details not appearing in the final email
 */
function captureFromHistory(history: ChatMsg[], session: SessionState): Captured {
  const cap = emptyCaptured();

  for (const msg of history) {
    if (msg.role !== "user") continue;
    const t = msg.text;

    // destination
    const d = findDestinationFromTargets(t);
    if (d) cap.destination = d;

    // dates / nights
    const dates = findDates(t);
    if (dates) cap.dates = dates;

    const nights = findNights(t);
    if (nights) cap.nights = nights;

    // travellers & budget
    const trav = findTravellers(t);
    if (trav) cap.travellers = trav;

    const bud = findBudget(t);
    if (bud) cap.budget = bud;

    // contact
    const email = findLatestEmail(t);
    if (email) cap.email = email;

    const phone = findLatestPhone(t);
    if (phone) cap.whatsapp = phone;

    // name (only if it looks like a clean name AND we were likely asking it)
    if (!cap.name && looksLikeName(t)) {
      cap.name = t.trim();
    }

    // from city (simple: if user says "from london" or single word after being asked)
    const fromMatch = t.match(/\bfrom\s+([a-zA-Z\s]{2,30})\b/i);
    if (fromMatch?.[1]) cap.fromCity = fromMatch[1].trim();

    // notes (when user is adding extra details)
    if (session.awaitingMoreDetails) {
      cap.notes = cap.notes ? `${cap.notes}\n${t.trim()}` : t.trim();
    }
  }

  return cap;
}

function missingField(cap: Captured) {
  // We keep it simple and premium:
  // Get trip basics first, then contact.
  const order: (keyof Captured)[] = [
    "destination",
    "dates",
    "nights",
    "travellers",
    "budget",
    "name",
    "email",
    "whatsapp",
  ];

  for (const k of order) {
    if (k === "dates" && cap.dates) continue;
    if (k === "nights" && (cap.nights || cap.dates)) continue; // nights optional if dates exist
    if (!cap[k]) return k;
  }
  return null;
}

function fieldQuestion(field: keyof Captured) {
  switch (field) {
    case "destination":
      return `Where would you like to go? We currently do ${TARGETS.join(", ")}.`;
    case "dates":
      return `What dates are you looking at? (Example: 12 Jan to 16 Jan)`;
    case "nights":
      return `How many nights would you like for this trip?`;
    case "travellers":
      return `How many travellers will be joining?`;
    case "budget":
      return `What’s your approximate total budget? (Example: £2000)`;
    case "name":
      return `Lovely. What name should we put on the enquiry?`;
    case "email":
      return `What email should we use to contact you?`;
    case "whatsapp":
      return `And what’s your WhatsApp number (with country code if possible)?`;
    default:
      return `Tell me one more detail and I’ll tailor it perfectly.`;
  }
}

/** ------------------------------- email ---------------------------------- */
async function sendFinalEmail(sessionId: string, cap: Captured, lastUserMsg: string, assistantReply: string) {
  const to = process.env.LEADS_TO_EMAIL;
  if (!to) throw new Error("LEADS_TO_EMAIL missing");

  const from =
    process.env.LEADS_FROM_EMAIL || "Wayloft Holidays <info@wayloftholidays.com>";

  const subject = `WAYLOFT CHAT COMPLETED — ${cap.destination ?? "Trip"} — ${sessionId.slice(0, 8)}`;

  const text = `WAYLOFT CHAT LOG

Session: ${sessionId}
Type: completed
Completed: YES

Captured:
Name: ${cap.name ?? "-"}
Email: ${cap.email ?? "-"}
WhatsApp: ${cap.whatsapp ?? "-"}
From City: ${cap.fromCity ?? "-"}
Destination: ${cap.destination ?? "-"}
Dates: ${cap.dates ?? "-"}
Nights: ${cap.nights ?? "-"}
Budget: ${cap.budget ?? "-"}
Travellers: ${cap.travellers ?? "-"}
Style: ${cap.style ?? "-"}
Priorities: ${cap.priorities ?? "-"}
Notes: ${cap.notes ?? "-"}

Last user message:
${lastUserMsg || "-"}

Assistant last reply:
${assistantReply || "-"}

`;

  await resend.emails.send({ from, to, subject, text });
}

/** --------------------------- system prompt (LLM) -------------------------- */
function buildSystemPrompt(cap: Captured, nextMissing: keyof Captured | null, session: SessionState) {
  const missing = nextMissing ? [nextMissing] : [];

  return `
You are "Wayloft Concierge" for Wayloft Holidays.

Brand + tone:
- Premium, warm, polite, confident, natural.
- Never rude. Never "locks" the user out.
- Ask only ONE question at a time.
- Never repeat a question if it is already captured.

We only support these destinations:
${TARGETS.join(", ")}

CURRENT CAPTURED (truth):
${JSON.stringify(cap)}

NEXT MISSING FIELD:
${missing.length ? missing[0] : "none"}

Conversation rules:
- If NEXT MISSING FIELD is not "none": Ask ONLY the single question to collect that field.
- If there are no missing fields:
  - Give a short premium suggestion (not a full day-by-day plan).
  - Then ask: "Anything else you want us to tailor?" and keep it polite.

Important:
- Return VALID JSON only with this schema:
{
  "reply": string,
  "askAnythingElse": boolean
}

Set "askAnythingElse": true ONLY when no missing fields remain and you are asking if they need anything else.
`;
}

/** ------------------------------- handler --------------------------------- */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const sessionId = safeStr(body.sessionId) || `sess_${Date.now()}`;
    const history = Array.isArray(body.messages) ? body.messages : [];

    const session: SessionState = body.session || {};
    const lastUserMsg =
      [...history].reverse().find((m) => m.role === "user")?.text?.trim() || "";

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

    // rebuild captured from entire history (main fix)
    let cap = captureFromHistory(history, session);

    // --- polite end flow logic ---
    // If we asked "Anything else?" and user says no -> completed
    if (session.awaitingAnythingElse && isNo(lastUserMsg)) {
      session.completed = true;
      session.awaitingAnythingElse = false;
      session.awaitingMoreDetails = false;
    }

    // If we asked "Anything else?" and user says yes -> ask for extra details
    if (session.awaitingAnythingElse && isYes(lastUserMsg)) {
      session.awaitingAnythingElse = false;
      session.awaitingMoreDetails = true;
    }

    // If we were waiting extra details, treat last user msg as notes and then go back to "anything else?"
    if (session.awaitingMoreDetails) {
      // notes already appended inside captureFromHistory via session.awaitingMoreDetails
      session.awaitingMoreDetails = false;
      session.awaitingAnythingElse = true;
    }

    // Decide what we need next
    const nextMissing = missingField(cap);

    // If completed and not emailed, send final email once
    if (session.completed && !session.emailed) {
      const finalAssistantReply =
        "Perfect. A Wayloft advisor will reach out shortly. If you want to add anything later, just message here.";
      await sendFinalEmail(sessionId, cap, lastUserMsg, finalAssistantReply);
      session.emailed = true;

      return NextResponse.json({
        reply: finalAssistantReply,
        meta: {
          completed: true,
          askAnythingElse: false,
          session,
          captured: cap,
        },
      });
    }

    // If missing fields exist, we can skip the LLM and ask the exact next question ourselves (zero repetition)
    if (nextMissing) {
      // If the model caused repetition earlier, this hard-control prevents it.
      const reply = fieldQuestion(nextMissing);

      return NextResponse.json({
        reply,
        meta: {
          completed: false,
          askAnythingElse: false,
          session: {
            ...session,
            awaitingAnythingElse: false,
            awaitingMoreDetails: false,
          },
          captured: cap,
        },
      });
    }

    // If no missing fields, we use LLM for a short premium suggestion + ask "Anything else?"
    const systemPrompt = buildSystemPrompt(
      cap,
      nextMissing,
      session
    );

    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.map((m) =>
        m.role === "user"
          ? ({ role: "user", content: m.text } as const)
          : ({ role: "assistant", content: m.text } as const)
      ),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: chatMessages,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    const reply =
      typeof parsed?.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : `Perfect. I’ve got the key details. Anything else you want us to tailor?`;

    const askAnythingElse = !!parsed?.askAnythingElse;

    // if assistant is asking anything else, set session flag so buttons appear
    const nextSession: SessionState = {
      ...session,
      awaitingAnythingElse: askAnythingElse ? true : false,
      awaitingMoreDetails: false,
      completed: false,
    };

    return NextResponse.json({
      reply,
      meta: {
        completed: false,
        askAnythingElse,
        session: nextSession,
        captured: cap,
      },
    });
  } catch {
    return NextResponse.json(
      { reply: "Something went wrong. Try again in a moment." },
      { status: 500 }
    );
  }
}
