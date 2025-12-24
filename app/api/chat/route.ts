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

type Stage = "intake" | "contact" | "refine" | "confirm_done" | "completed" | "extra_collect";

type Meta = {
  stage?: Stage;
  captured?: Partial<Captured>;
  lastEmailHash?: string | null;
  expecting?: "name" | "email" | "whatsapp" | "fromCity" | "style" | "priorities" | "extra";
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

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function normalizePhone(raw: string) {
  const s = raw.trim();
  const digits = s.replace(/[^\d+]/g, "");
  // allow +44..., 07..., 7..., etc. store as user typed but cleaned
  return digits.length >= 8 ? digits : null;
}

function extractEmail(text: string) {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0].trim() : null;
}

function extractPhone(text: string) {
  // catches: 07..., +44..., 7...
  const m = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
  return m ? normalizePhone(m[0]) : null;
}

function looksLikeNo(text: string) {
  const t = text.toLowerCase().trim();
  return ["no", "nope", "nothing", "nothing else", "thats all", "that's all", "done", "all good"].includes(t);
}

function looksLikeAddMore(text: string) {
  const t = text.toLowerCase().trim();
  return (
    t.includes("add more") ||
    t.includes("add extra") ||
    t.includes("more details") ||
    t.includes("extra details") ||
    t.includes("i want to add") ||
    t === "yes"
  );
}

function buildSystemPrompt() {
  return `
You are "Wayloft Concierge" for Wayloft Holidays.

Tone:
- Premium, warm, human, professional.
- Do NOT sound like a coded bot.
- If the user says "hi/how are you", respond warmly in 1 short line, then continue the flow.

Business:
- We focus on: ${TARGETS.join(", ")}.
- If outside these, politely suggest the closest match from the list.

Strict rules:
- NEVER repeat a question if the detail is already captured.
- Ask ONE question at a time.
- Keep answers short and helpful.

Flow:
1) Intake basics (destination, dates or nights, budget, travellers)
2) Contact details (Name -> Email -> WhatsApp -> From city)
3) 1-2 refinement questions (style, priorities) one-by-one
4) Give "ideas" (3-6 bullets). Not a full itinerary.
5) Ask: "Anything else you'd like to add?" (YES/NO)
6) If user says NO: confirm politely + handoff line.
7) If user later wants to add extra: ask what to add, capture it into notes, confirm saved, then offer YES/NO again.

Output:
Return VALID JSON only:
{
  "reply": string,
  "captured": {
    "destination": string|null,
    "dates": string|null,
    "nights": string|null,
    "budget": string|null,
    "travellers": string|null,
    "style": string|null,
    "priorities": string|null
  }
}

Only fill captured fields you are confident about from the conversation.
Do not invent.
`.trim();
}

async function sendEmail(subject: string, text: string) {
  const to = process.env.LEADS_TO_EMAIL;
  if (!to) throw new Error("LEADS_TO_EMAIL missing");

  const from =
    process.env.LEADS_FROM_EMAIL || "Wayloft Holidays <info@wayloftholidays.com>";

  await resend.emails.send({ from, to, subject, text });
}

function nextMissingContact(c: Captured): Meta["expecting"] | null {
  if (!c.name) return "name";
  if (!c.email) return "email";
  if (!c.whatsapp) return "whatsapp";
  if (!c.fromCity) return "fromCity";
  return null;
}

function nextMissingRefine(c: Captured): Meta["expecting"] | null {
  if (!c.style) return "style";
  if (!c.priorities) return "priorities";
  return null;
}

function hasIntakeBasics(c: Captured) {
  return !!(c.destination && (c.dates || c.nights) && c.budget && c.travellers);
}

function buildCompletionEmail(sessionId: string, captured: Captured, history: ChatMsg[], lastUserMsg: string) {
  return {
    subject: `WAYLOFT CHAT LOG — ${sessionId.slice(0, 8)} — COMPLETED`,
    text: `WAYLOFT CHAT LOG

Session: ${sessionId}
Stage: completed
Completed: YES

Captured:
Name: ${captured.name ?? "-"}
Email: ${captured.email ?? "-"}
WhatsApp: ${captured.whatsapp ?? "-"}
From City: ${captured.fromCity ?? "-"}
Destination: ${captured.destination ?? "-"}
Dates: ${captured.dates ?? "-"}
Nights: ${captured.nights ?? "-"}
Budget: ${captured.budget ?? "-"}
Travellers: ${captured.travellers ?? "-"}
Style: ${captured.style ?? "-"}
Priorities: ${captured.priorities ?? "-"}
Notes: ${captured.notes ?? "-"}

Last user message:
${lastUserMsg || "-"}

--- Recent history (last 14) ---
${history
  .slice(-14)
  .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
  .join("\n\n")}
`,
  };
}

function buildUpdateEmail(sessionId: string, captured: Captured, extra: string) {
  return {
    subject: `WAYLOFT CHAT UPDATE — ${sessionId.slice(0, 8)} — EXTRA DETAILS`,
    text: `WAYLOFT CHAT UPDATE

Session: ${sessionId}

New extra details added:
${extra}

Updated captured:
Name: ${captured.name ?? "-"}
Email: ${captured.email ?? "-"}
WhatsApp: ${captured.whatsapp ?? "-"}
From City: ${captured.fromCity ?? "-"}
Destination: ${captured.destination ?? "-"}
Dates: ${captured.dates ?? "-"}
Nights: ${captured.nights ?? "-"}
Budget: ${captured.budget ?? "-"}
Travellers: ${captured.travellers ?? "-"}
Style: ${captured.style ?? "-"}
Priorities: ${captured.priorities ?? "-"}
Notes: ${captured.notes ?? "-"}
`,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const sessionId = safeStr(body.sessionId) || `sess_${Date.now()}`;
    const history = Array.isArray(body.messages) ? body.messages : [];
    const prevMeta = body.meta || {};
    const prevCaptured = normalizeCaptured(prevMeta.captured);
    const prevStage: Stage = prevMeta.stage || "intake";
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

    // ----- If already completed: allow ONLY extra-details flow -----
    if (prevStage === "completed") {
      const wantsAdd = looksLikeAddMore(lastUserMsg);
      const isNo = looksLikeNo(lastUserMsg);

      if (isNo) {
        return NextResponse.json({
          reply: "Perfect. A Wayloft advisor will reach out shortly.",
          meta: { stage: "completed", captured: prevCaptured, lastEmailHash: prevEmailHash },
        });
      }

      if (wantsAdd) {
        return NextResponse.json({
          reply: "Of course. What would you like to add?",
          meta: { stage: "extra_collect", captured: prevCaptured, lastEmailHash: prevEmailHash, expecting: "extra" },
        });
      }

      // If they just type random stuff after completion, keep it calm + guide
      return NextResponse.json({
        reply: "If you’d like to add anything else for the advisor, just tell me what to add.",
        meta: { stage: "completed", captured: prevCaptured, lastEmailHash: prevEmailHash },
      });
    }

    // ----- Extra collect stage -----
    if (prevStage === "extra_collect") {
      const extra = lastUserMsg.trim();
      if (extra) {
        const existing = prevCaptured.notes ? `${prevCaptured.notes}\n\n` : "";
        const updatedCaptured: Captured = {
          ...prevCaptured,
          notes: existing.includes(extra) ? prevCaptured.notes : `${existing}Extra details: ${extra}`,
        };

        const emailPayload = { sessionId, kind: "update", captured: updatedCaptured, extra };
        const hash = makeHash(JSON.stringify(emailPayload));

        if (hash !== prevEmailHash) {
          const mail = buildUpdateEmail(sessionId, updatedCaptured, extra);
          await sendEmail(mail.subject, mail.text);
        }

        return NextResponse.json({
          reply: "Got it. I’ve saved that and shared it with the advisor. Anything else you’d like to add?",
          meta: {
            stage: "confirm_done",
            captured: updatedCaptured,
            lastEmailHash: hash,
          },
        });
      }

      return NextResponse.json({
        reply: "No worries. What would you like to add?",
        meta: { stage: "extra_collect", captured: prevCaptured, lastEmailHash: prevEmailHash, expecting: "extra" },
      });
    }

    // ----- If we're in contact collection, parse the user message ourselves -----
    let captured = { ...prevCaptured };

    const expectingContact = prevMeta.expecting || nextMissingContact(captured);

    if (prevStage === "contact" || expectingContact) {
      if (expectingContact === "email") {
        const em = extractEmail(lastUserMsg);
        if (em && isEmail(em)) captured.email = em;
      } else if (expectingContact === "whatsapp") {
        const ph = extractPhone(lastUserMsg);
        if (ph) captured.whatsapp = ph;
      } else if (expectingContact === "name") {
        // keep it simple; take the whole message as name if short
        const maybeName = lastUserMsg.trim();
        if (maybeName && maybeName.length <= 50) captured.name = maybeName;
      } else if (expectingContact === "fromCity") {
        const city = lastUserMsg.trim();
        if (city && city.length <= 60) captured.fromCity = city;
      }
    }

    // Decide current stage based on captured (backend controls stage)
    let stage: Stage = prevStage;

    if (!hasIntakeBasics(captured)) stage = "intake";
    else if (nextMissingContact(captured)) stage = "contact";
    else if (nextMissingRefine(captured)) stage = "refine";
    else if (prevStage === "confirm_done") stage = "confirm_done";
    else stage = "confirm_done";

    // If we are at confirm_done and user says NO -> complete + email
    if (stage === "confirm_done" && looksLikeNo(lastUserMsg)) {
      stage = "completed";

      const emailPayload = { sessionId, kind: "completed", captured };
      const hash = makeHash(JSON.stringify(emailPayload));

      if (hash !== prevEmailHash) {
        const mail = buildCompletionEmail(sessionId, captured, history, lastUserMsg);
        await sendEmail(mail.subject, mail.text);
      }

      return NextResponse.json({
        reply: "Perfect. A Wayloft advisor will reach out shortly.",
        meta: {
          stage: "completed",
          captured,
          lastEmailHash: hash,
        },
      });
    }

    // If confirm_done and user says YES -> go to extra_collect
    if (stage === "confirm_done" && looksLikeAddMore(lastUserMsg)) {
      return NextResponse.json({
        reply: "Of course. What would you like to add?",
        meta: {
          stage: "extra_collect",
          captured,
          lastEmailHash: prevEmailHash,
          expecting: "extra",
        },
      });
    }

    // ----- If backend needs to ask a direct question (one-by-one) -----
    if (stage === "contact") {
      const miss = nextMissingContact(captured);

      if (miss === "name") {
        return NextResponse.json({
          reply: "Lovely. What name should we put the booking under?",
          meta: { stage: "contact", captured, lastEmailHash: prevEmailHash, expecting: "name" },
        });
      }
      if (miss === "email") {
        return NextResponse.json({
          reply: "Perfect. What’s the best email address to reach you on?",
          meta: { stage: "contact", captured, lastEmailHash: prevEmailHash, expecting: "email" },
        });
      }
      if (miss === "whatsapp") {
        return NextResponse.json({
          reply: "Great. What’s your WhatsApp number (include country code if you can)?",
          meta: { stage: "contact", captured, lastEmailHash: prevEmailHash, expecting: "whatsapp" },
        });
      }
      if (miss === "fromCity") {
        return NextResponse.json({
          reply: "And which city are you departing from?",
          meta: { stage: "contact", captured, lastEmailHash: prevEmailHash, expecting: "fromCity" },
        });
      }
    }

    if (stage === "refine") {
      const miss = nextMissingRefine(captured);
      if (miss === "style") {
        return NextResponse.json({
          reply: "What vibe are you after for this trip? (Relaxed, adventure, luxury, culture, mix)",
          meta: { stage: "refine", captured, lastEmailHash: prevEmailHash, expecting: "style" },
        });
      }
      if (miss === "priorities") {
        return NextResponse.json({
          reply: "What matters most to you? (Food, views, shopping, beaches, history, nightlife, safety, etc.)",
          meta: { stage: "refine", captured, lastEmailHash: prevEmailHash, expecting: "priorities" },
        });
      }
    }

    // ----- Otherwise, let the model do intake/ideas politely (but backend still keeps control) -----
    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: buildSystemPrompt() },
      ...history.map((m) => ({ role: m.role, content: m.text })),
      {
        role: "system",
        content: `Known details (never ask these again if present):
${JSON.stringify(captured)}
Current stage=${stage}
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

    const modelReply =
      typeof parsed?.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "Tell me where you’re thinking of going and your rough dates. I’ll guide you from there.";

    // Merge ONLY allowed intake-ish fields from model (never overwrite contact fields here)
    const pc = parsed?.captured || {};
    const merged: Captured = {
      ...captured,
      destination: pc.destination ?? captured.destination,
      dates: pc.dates ?? captured.dates,
      nights: pc.nights ?? captured.nights,
      budget: pc.budget ?? captured.budget,
      travellers: pc.travellers ?? captured.travellers,
      style: pc.style ?? captured.style,
      priorities: pc.priorities ?? captured.priorities,
    };

    // Recompute stage after merge
    let nextStage: Stage = stage;
    if (!hasIntakeBasics(merged)) nextStage = "intake";
    else if (nextMissingContact(merged)) nextStage = "contact";
    else if (nextMissingRefine(merged)) nextStage = "refine";
    else nextStage = "confirm_done";

    // If we just moved to confirm_done, ensure the reply ends with the "Anything else?" line
    let finalReply = modelReply;
    if (nextStage === "confirm_done") {
      // keep it clean, not spammy
      if (!/anything else/i.test(finalReply)) {
        finalReply = `${finalReply}\n\nAnything else you’d like to add?`;
      }
    }

    return NextResponse.json({
      reply: finalReply,
      meta: {
        stage: nextStage,
        captured: merged,
        lastEmailHash: prevEmailHash,
        expecting: nextStage === "contact" ? nextMissingContact(merged) ?? undefined
          : nextStage === "refine" ? nextMissingRefine(merged) ?? undefined
          : undefined,
      },
    });
  } catch {
    return NextResponse.json(
      { reply: "Something went wrong. Try again in a moment." },
      { status: 500 }
    );
  }
}
