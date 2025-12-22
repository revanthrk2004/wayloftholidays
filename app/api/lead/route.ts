import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type Body = {
  subject?: string;
  content?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const subject = (body.subject || "New Wayloft Lead").trim();
    const content = (body.content || "").trim();

    if (!content) {
      return NextResponse.json({ ok: false, error: "Missing content" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.LEADS_TO_EMAIL;

    if (!apiKey || !toEmail) {
      return NextResponse.json(
        { ok: false, error: "Missing RESEND_API_KEY or LEADS_TO_EMAIL" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: "Wayloft Holidays <onboarding@resend.dev>",
      to: [toEmail],
      subject,
      text: content,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
