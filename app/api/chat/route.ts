import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Resend } from "resend";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

type ChatMsg = { role: "user" | "assistant"; text: string };

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

type Body = {
  sessionId?: string;
  messages?: ChatMsg[];
  state?: {
    phase?: Phase;
    captured?: Partial<Captured>;
    lastSentHash?: string | null;
    awaitingMoreDetails?: boolean;
  };
};

type Phase =
  | "collect_destination"
  | "collect_dates"
  | "collect_nights"
  | "collect_budget"
  | "collect_travellers"
  | "collect_fromCity"
  | "collect_name"
  | "collect_email"
  | "collect_whatsapp"
  | "collect_style"
  | "collect_priorities"
  | "collect_notes"
  | "confirm_anything_else"
  | "await_more_details"
  | "completed";

const TARGETS = ["Morocco", "Albania", "Montenegro", "Jordan", "Turkey"];

function safeStr(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function normalizeSpaces(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function isEmail(v: string) {
  const s = v.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function normalizePhone(v: string) {
  // Keep + and digits only
  let s = v.trim();
  s = s.replace(/[^\d+]/g, "");
  // Convert 07xxxxxxxxx -> +447xxxxxxxxx
  if (/^07\d{9}$/.test(s)) return `+44${s.slice(1)}`;
  // Already +44...
  if (/^\+44\d{10}$/.test(s)) return s;
  // Generic international +...
  if (/^\+\d{8,15}$/.test(s)) return s;
  // UK without +
  if (/^44\d{10}$/.test(s)) return `+${s}`;
  return "";
}

function looksLikeGreeting(text: string) {
  const t = text.toLowerCase();
  return (
    t === "hi" ||
    t === "hey" ||
    t === "hello" ||
    t.includes("how are you") ||
    t.includes("how r u") ||
    t.includes("hey buddy") ||
    t.includes("bro") ||
    t.includes("buddy")
  );
}

function buildExtractionPrompt() {
  return `
Extract travel + contact details from the user message ONLY if clearly present.
Return VALID JSON ONLY with this shape:

{
  "destination": string|null,
  "dates": string|null,
  "nights": string|null,
  "budget": string|null,
  "travellers": string|null,
  "fromCity": string|null,
  "name": string|null,
  "email": string|null,
  "whatsapp": string|null,
  "style": string|null,
  "priorities": string|null,
  "notes": string|null
}

Rules:
- Do not invent.
- If user says "2 people" => travellers="2"
- If message has phone number, put it in whatsapp as provided (no formatting), we'll normalize later.
- If user adds extra info like "we want luxury, halal food, shopping", that can go into notes if no better field fits.
`;
}

async function extractFromMessage(userText: string): Promise<Partial<Captured>> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildExtractionPrompt() },
      { role: "user", content: userText },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content?.trim() || "{}";
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Partial<Captured>) : {};
  } catch {
    return {};
  }
}

function mergeCaptured(base: Captured, patch: Partial<Captured>): Captured {
  const out: Captured = { ...base };

  const setIf = (k: keyof Captured, v: unknown) => {
    const s = typeof v === "string" ? normalizeSpaces(v) : "";
    if (!s) return;
    (out[k] as any) = s;
  };

  setIf("destination", patch.destination);
  setIf("dates", patch.dates);
  setIf("nights", patch.nights);
  setIf("budget", patch.budget);
  setIf("travellers", patch.travellers);
  setIf("fromCity", patch.fromCity);

  setIf("name", patch.name);
  setIf("email", patch.email);
  setIf("whatsapp", patch.whatsapp);

  setIf("style", patch.style);
  setIf("priorities", patch.priorities);
  setIf("notes", patch.notes);

  // Normalize whatsapp if present
  if (out.whatsapp) {
    const n = normalizePhone(out.whatsapp);
    if (n) out.whatsapp = n;
  }

  return out;
}

function initialCaptured(): Captured {
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

function nextPhaseFromCaptured(c: Captured, current: Phase): Phase {
  // Strict one-by-one order
  if (!c.destination) return "collect_destination";
  if (!c.dates) return "collect_dates";
  if (!c.nights) return "collect_nights";
  if (!c.budget) return "collect_budget";
  if (!c.travellers) return "collect_travellers";
  if (!c.fromCity) return "collect_fromCity";

  if (!c.name) return "collect_name";
  if (!c.email) return "collect_email";
  if (!c.whatsapp) return "collect_whatsapp";

  // Preferences are optional but we ask briefly
  if (!c.style) return "collect_style";
  if (!c.priorities) return "collect_priorities";
  if (!c.notes) return "collect_notes";

  // If we already asked "Anything else?" and user said yes, we wait for extra details
  if (current === "await_more_details") return "await_more_details";

  return "confirm_anything_else";
}

function destinationAllowed(destination: string | null) {
  if (!destination) return true;
  const d = destination.toLowerCase();
  return TARGETS.some((t) => t.toLowerCase() === d);
}

function suggestClosest(destination: string) {
  // simple: just suggest the list (premium tone)
  return `We currently plan trips in ${TARGETS.join(
    ", "
  )}. If you're open to it, tell me which of these feels closest to your vibe.`;
}

function questionForPhase(phase: Phase, c: Captured) {
  switch (phase) {
    case "collect_destination":
      return `Where would you like to go? We currently plan trips in ${TARGETS.join(
        ", "
      )}.`;
    case "collect_dates":
      return `Nice. What dates are you thinking for ${c.destination}?`;
    case "collect_nights":
      return `How many nights would you like to stay?`;
    case "collect_budget":
      return `What’s your total budget for the trip (roughly)?`;
    case "collect_travellers":
      return `How many travellers will be going?`;
    case "collect_fromCity":
      return `Which city will you be departing from?`;
    case "collect_name":
      return `Perfect. What’s your name?`;
    case "collect_email":
      return `And your best email address (so we can send options and confirm details)?`;
    case "collect_whatsapp":
      return `Finally, what’s your WhatsApp number (with country code if possible)?`;
    case "collect_style":
      return `What’s your travel style for this one? For example: luxury, mid-range, adventure, calm, shopping, honeymoon.`;
    case "collect_priorities":
      return `What are your top priorities? For example: food, culture, beaches, desert, nightlife, shopping.`;
    case "collect_notes":
      return `Anything important to note? Dietary needs, hotel preferences, must-do activities, celebration, anything like that.`;
    case "confirm_anything_else":
      return `Amazing. I’ve got everything I need. Do you want to add anything else before I hand this to a Wayloft advisor?`;
    case "await_more_details":
      return `Sure. Tell me what you'd like to add, and I’ll update your request.`;
    default:
      return `Tell me a bit more about your trip.`;
  }
}

function buildSummary(c: Captured, sessionId: string) {
  return `WAYLOFT CHAT SUMMARY

Session: ${sessionId}

Captured:
Name: ${c.name ?? "-"}
Email: ${c.email ?? "-"}
WhatsApp: ${c.whatsapp ?? "-"}
From City: ${c.fromCity ?? "-"}
Destination: ${c.destination ?? "-"}
Dates: ${c.dates ?? "-"}
Nights: ${c.nights ?? "-"}
Budget: ${c.budget ?? "-"}
Travellers: ${c.travellers ?? "-"}
Style: ${c.style ?? "-"}
Priorities: ${c.priorities ?? "-"}
Notes: ${c.notes ?? "-"}
`;
}

function hashString(s: string) {
  // lightweight deterministic hash
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
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

    const prevPhase = (body.state?.phase as Phase) || "collect_destination";
    const prevCaptured = body.state?.captured || {};
    const lastSentHash = body.state?.lastSentHash || null;
    const awaitingMoreDetails = !!body.state?.awaitingMoreDetails;

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

    // Friendly small-talk handling (prevents “robot”)
    if (looksLikeGreeting(lastUserMsg) && prevPhase === "collect_destination") {
      const reply =
        "Hey! I’m good, thanks. Quick one so I can plan this properly. Where would you like to go?";
      return NextResponse.json({
        reply,
        ui: { quickReplies: TARGETS },
        state: {
          phase: "collect_destination",
          captured: prevCaptured,
          lastSentHash,
          awaitingMoreDetails: false,
        },
      });
    }

    // Extract + merge info from the user message
    const extracted = await extractFromMessage(lastUserMsg);

    const base = mergeCaptured(initialCaptured(), prevCaptured);
    let captured = mergeCaptured(base, extracted);

    // Validate email if captured
    if (captured.email && !isEmail(captured.email)) {
      captured.email = null;
    }

    // If destination not in targets, politely redirect
    if (captured.destination && !destinationAllowed(captured.destination)) {
      const reply = `We can definitely help. ${suggestClosest(captured.destination)}`;
      return NextResponse.json({
        reply,
        ui: { quickReplies: TARGETS },
        state: {
          phase: "collect_destination",
          captured: { ...captured, destination: null },
          lastSentHash,
          awaitingMoreDetails: false,
        },
      });
    }

    // If we were waiting for extra details, and user typed something meaningful, put it into notes (append)
    let phase: Phase = prevPhase;

    if (awaitingMoreDetails || prevPhase === "await_more_details") {
      // If user says "no" here, treat as completion
      const t = lastUserMsg.toLowerCase().trim();
      if (t === "no" || t === "nope" || t === "nothing" || t === "nothing else") {
        phase = "confirm_anything_else";
      } else {
        // Append to notes so it will be in final email
        const extra = normalizeSpaces(lastUserMsg);
        if (extra) {
          captured.notes = captured.notes ? `${captured.notes}\nExtra: ${extra}` : `Extra: ${extra}`;
        }
        phase = "confirm_anything_else";
      }
    } else {
      phase = nextPhaseFromCaptured(captured, prevPhase);
    }

    // Confirm step: yes/no controls
    if (phase === "confirm_anything_else") {
      const t = lastUserMsg.toLowerCase().trim();

      // If user just arrived here (not answering yes/no yet), ask the confirm question
      const justReachedConfirm =
        prevPhase !== "confirm_anything_else" && prevPhase !== "await_more_details";

      if (justReachedConfirm) {
        const reply = questionForPhase("confirm_anything_else", captured);
        return NextResponse.json({
          reply,
          ui: { quickReplies: ["Yes", "No"], placeholder: "Type here (optional)" },
          state: {
            phase: "confirm_anything_else",
            captured,
            lastSentHash,
            awaitingMoreDetails: false,
          },
        });
      }

      // User answered NO -> complete + email once (no spam)
      if (t === "no" || t === "nope") {
        const summary = buildSummary(captured, sessionId);
        const newHash = hashString(summary);

        if (newHash !== lastSentHash) {
          const subject = `Wayloft Chat — Completed — ${captured.destination ?? "Trip"} — ${sessionId.slice(
            0,
            8
          )}`;
          await sendEmail(subject, summary);
        }

        return NextResponse.json({
          reply:
            "Perfect. A Wayloft advisor will reach out shortly. If you remember anything later, you can message here and I’ll update your request.",
          ui: { quickReplies: [] },
          state: {
            phase: "completed",
            captured,
            lastSentHash: newHash,
            awaitingMoreDetails: false,
          },
        });
      }

      // User answered YES -> wait for extra details
      if (t === "yes" || t === "y" || t === "yeah") {
        const reply = questionForPhase("await_more_details", captured);
        return NextResponse.json({
          reply,
          ui: { quickReplies: [] },
          state: {
            phase: "await_more_details",
            captured,
            lastSentHash,
            awaitingMoreDetails: true,
          },
        });
      }

      // If they typed something else at confirm step, treat it like extra info
      if (t && t !== "yes" && t !== "no") {
        const extra = normalizeSpaces(lastUserMsg);
        if (extra) {
          captured.notes = captured.notes ? `${captured.notes}\nExtra: ${extra}` : `Extra: ${extra}`;
        }
        const reply = "Got it. Anything else you want to add?";
        return NextResponse.json({
          reply,
          ui: { quickReplies: ["Yes", "No"] },
          state: {
            phase: "confirm_anything_else",
            captured,
            lastSentHash,
            awaitingMoreDetails: false,
          },
        });
      }
    }

    // Normal question flow
    const reply = questionForPhase(phase, captured);

    // Quick replies for destination + confirm only
    const ui =
      phase === "collect_destination"
        ? { quickReplies: TARGETS }
        : phase === "confirm_anything_else"
        ? { quickReplies: ["Yes", "No"] }
        : undefined;

    return NextResponse.json({
      reply,
      ui,
      state: {
        phase,
        captured,
        lastSentHash,
        awaitingMoreDetails: false,
      },
    });
  } catch {
    return NextResponse.json(
      { reply: "Something went wrong. Try again in a moment." },
      { status: 500 }
    );
  }
}
