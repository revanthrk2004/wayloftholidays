"use client";

import Container from "@/components/ui/Container";
import Link from "next/link";

import type { HomeData } from "@/sanity/lib/queries";

export default function Contact({ cms }: { cms?: HomeData }) {
  const heading = cms?.contactHeading?.trim() || "Contact";

  const email = cms?.contactEmail?.trim() || "hello@WayLoftholidays.com";

  const whatsappText =
    cms?.contactWhatsapp?.trim() ||
    "The fastest way is the AI concierge (bottom right). Or go straight to the plan form.";

  return (
    <section id="contact" className="py-20 bg-white">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight text-(--primary)">
            {heading}
          </h2>

          <p className="mt-3 text-(--muted)">
            {whatsappText}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/plan"
              className="rounded-2xl bg-(--primary) px-6 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Plan my trip
            </Link>

            <a
              href={`mailto:${email}`}
              className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-(--primary) ring-1 ring-black/10 hover:bg-black/2"
            >
              Email us
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
