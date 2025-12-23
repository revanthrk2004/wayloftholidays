import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

function isEmail(v: unknown) {
  if (typeof v !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const to = process.env.LEADS_TO_EMAIL;
    if (!to) throw new Error("LEADS_TO_EMAIL missing");

    // IMPORTANT: must be your verified domain email (NOT onboarding@resend.dev)
    const from =
      process.env.LEADS_FROM_EMAIL || "Wayloft Holidays <info@wayloftholidays.com>";

    const destination = (body?.destination || "").toString().trim();
    const subject =
      `New Wayloft Trip Request` + (destination ? ` — ${destination}` : "");

    const text =
      body?.summary ||
      `Plan request for Wayloft Holidays:
Name: ${body?.name || "-"}
Email: ${body?.email || "-"}
WhatsApp: ${body?.whatsapp || "-"}
From: ${body?.fromCity || "-"}
Destination: ${destination || "-"}
Dates: ${body?.dates || "-"}
Duration: ${body?.duration || "-"}
Budget: ${body?.budget || "-"}
Travellers: ${body?.travelers || "-"}
Style: ${(body?.style || []).join(", ") || "-"}
Priorities: ${(body?.priorities || []).join(", ") || "-"}
Notes: ${body?.notes || "-"}

#travelwithWayloft`;

    const replyTo = isEmail(body?.email) ? body.email.trim() : undefined;

    await resend.emails.send({
      from,
      to,
      subject,
      text,
      ...(replyTo ? { replyTo } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
