"use client";

import Container from "@/components/ui/Container";

type Item = { title: string; description?: string };

export default function ExperiencesBlock({
  title = "Experiences",
  subtitle = "Aesthetic cafés, iconic spots, hidden gems, and experiences that feel personal.",
  items = [],
}: {
  title?: string;
  subtitle?: string;
  items?: Item[];
}) {
  return (
    <section id="experiences" className="py-20 bg-white">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight text-(--primary)">
            {title}
          </h2>
          <p className="mt-3 text-(--muted)">{subtitle}</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {(items?.length ? items : []).map((t) => (
            <div
              key={t.title}
              className="rounded-3xl bg-(--light) p-5 ring-1 ring-black/5"
            >
              <div className="text-sm font-semibold text-(--primary)">
                {t.title}
              </div>
              {t.description ? (
                <div className="mt-2 text-sm text-(--muted)">{t.description}</div>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
