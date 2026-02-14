"use client";

import Container from "@/components/ui/Container";
import type { HomeData } from "@/sanity/lib/queries";
import { PortableText } from "@portabletext/react";

export default function About({ cms }: { cms?: HomeData }) {
  const heading = cms?.aboutHeading?.trim() || "About WayLoft";

  return (
    <section id="about" className="py-20">
      <Container>
        <div className="max-w-3xl">
          {/* Heading */}
          <h2 className="text-3xl font-black tracking-tight text-(--primary)">
            {heading}
          </h2>

          {/* Body (Sanity rich text) */}
          <div className="mt-3 text-(--muted) leading-relaxed">
            {cms?.aboutBody?.length ? (
              <PortableText value={cms.aboutBody} />
            ) : (
              <p>
                WayLoft is built for people who want premium trips without the
                stress. We plan like a friend with taste and a spreadsheet.
              </p>
            )}
          </div>

          {/* Feature cards (static for now – premium look) */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { k: "Personal", v: "Designed around you" },
              { k: "Premium", v: "Stays, routes, details" },
              { k: "Fast", v: "45 seconds to request" },
            ].map((x) => (
              <div
                key={x.k}
                className="rounded-3xl bg-white p-5 ring-1 ring-black/10"
              >
                <div className="text-xs font-semibold text-(--muted)">
                  {x.k}
                </div>
                <div className="mt-1 text-sm font-semibold text-(--primary)">
                  {x.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
