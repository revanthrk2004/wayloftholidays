import Container from "@/components/ui/Container";
import Link from "next/link";
import { getTripBySlug, trips } from "@/app/lib/trips-data";

export function generateStaticParams() {
  return trips.map((t) => ({ slug: t.slug }));
}

function normalizeSlug(input: string) {
  return decodeURIComponent(String(input || "")).trim().toLowerCase();
}

export default async function TripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const trip = getTripBySlug(slug);

  if (!trip) {
    return (
      <section className="py-20">
        <Container>
          <div className="rounded-3xl bg-white p-6 ring-1 ring-black/10">
            <div className="text-lg font-semibold text-(--primary)">
              That destination doesn’t exist yet.
            </div>
            <p className="mt-2 text-(--muted)">
              Try going back and selecting another trip.
            </p>
            <div className="mt-5">
              <Link
                href="/#trips"
                className="rounded-2xl bg-(--primary) px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
              >
                Back to trips
              </Link>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <Container>
        {/* top actions only */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/#trips"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-(--primary) ring-1 ring-black/10 hover:bg-black/2"
          >
            ← Back
          </Link>

          <Link
            href={`/plan?destination=${encodeURIComponent(trip.title)}`}
            className="rounded-2xl bg-(--primary) px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            Start planning
          </Link>
        </div>

        {/* hero header card */}
        <div className="relative overflow-hidden rounded-[32px] ring-1 ring-black/10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${trip.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 [bg-gradient-to-b] from-black/25 via-black/15 to-black/60" />
          <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-size-[56px_56px]" />

          <div className="relative p-6 md:p-10">
            <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur-xl">
              DESTINATION
            </div>

            <h1 className="font-heading mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
              {trip.title}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
              {trip.about}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90 ring-1 ring-white/15 backdrop-blur-xl">
                <span className="text-xs font-semibold tracking-wide text-white/70">
                  VIBE
                </span>
                <div className="mt-1 font-semibold">{trip.subtitle}</div>
              </div>

              <div
                className="h-20 w-20 rounded-2xl ring-1 ring-white/20"
                style={{
                  backgroundImage: `url(${trip.thumb})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                aria-label={`${trip.title} snapshot`}
              />
            </div>
          </div>
        </div>

{/* highlights */}
<div className="mt-10">
  <div className="max-w-2xl">
    <h2 className="font-heading text-3xl font-semibold tracking-tight text-(--primary)">
      Highlights Of {trip.title}
    </h2>
    <p className="mt-2 text-(--muted)">
      The main spots we can build your days around.
    </p>
  </div>

  <div className="mt-6 grid gap-4">
    {trip.highlights?.map((h) => (
      <div
        key={h.name}
        className="grid gap-4 rounded-[28px] bg-white p-4 ring-1 ring-black/10 md:grid-cols-[240px_1fr] md:items-start md:p-5"
      >
        {/* LEFT: image + name */}
        <div className="flex gap-4 md:flex-col md:gap-3">
          <div
            className="h-24 w-24 shrink-0 rounded-2xl ring-1 ring-black/10 md:h-[200px] md:w-full"
            style={{
              backgroundImage: `url(${h.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-[0.18em] text-(--muted)">
              HIGHLIGHT
            </div>
            <div className="mt-1 font-heading text-xl font-semibold text-(--primary) md:text-2xl">
              {h.name}
            </div>
          </div>
        </div>

        {/* RIGHT: description hugging content */}
        <div className="self-start">
          <div className="inline-block w-full rounded-2xl bg-(--light) p-4 ring-1 ring-black/5 md:p-5">
            <p className="text-sm leading-relaxed text-(--muted)">
              {h.description}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

      </Container>
    </section>
  );
}
