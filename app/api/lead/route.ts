import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const to = process.env.LEADS_TO_EMAIL;
    if (!to) throw new Error("LEADS_TO_EMAIL missing");

    const subject = `New Wayloft Trip Request${body.destination ? ` — ${body.destination}` : ""}`;

    const text =
      body.summary ||
      `New Wayloft Trip Request

Name: ${body.name || "-"}
Email: ${body.email || "-"}
WhatsApp: ${body.whatsapp || "-"}
From: ${body.fromCity || "-"}
Destination: ${body.destination || "-"}
Dates: ${body.dates || "-"}
Duration: ${body.duration || "-"}
Budget: ${body.budget || "-"}
Travellers: ${body.travelers || "-"}
Style: ${(body.style || []).join(", ") || "-"}
Priorities: ${(body.priorities || []).join(", ") || "-"}
Notes: ${body.notes || "-"}

#travelwithWayloft`;

    await resend.emails.send({
      from: "Wayloft Holidays <onboarding@resend.dev>", // works immediately
      to,
      replyTo: body.email || to,
      subject,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
